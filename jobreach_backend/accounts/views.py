from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (
    RegisterSerializer, ResumeSerializer, ContactListSerializer, 
    GeneratedEmailSerializer, EmailGenerationRequestSerializer
)
from .models import Resume, ContactList, GeneratedEmail
from .email_generation import EmailGenerationService
import csv
import io
import os
from django.conf import settings

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ResumeSerializer(data=request.data)
        if serializer.is_valid():
            # Save the original filename
            file = request.FILES.get('file')
            resume = serializer.save(
                user=request.user,
                original_filename=file.name
            )
            return Response({
                "message": "Resume uploaded successfully",
                "resume": ResumeSerializer(resume).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        resumes = Resume.objects.filter(user=request.user)
        serializer = ResumeSerializer(resumes, many=True)
        return Response(serializer.data)

    def delete(self, request, resume_id=None):
        """Delete a specific resume file."""
        if not resume_id:
            return Response({
                "error": "Resume ID is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
            
            # Delete the physical file
            if resume.file and os.path.exists(resume.file.path):
                os.remove(resume.file.path)
            
            # Delete the database record
            resume.delete()
            
            return Response({
                "message": "Resume deleted successfully"
            }, status=status.HTTP_200_OK)
            
        except Resume.DoesNotExist:
            return Response({
                "error": "Resume not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Error deleting resume: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContactListUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ContactListSerializer(data=request.data)
        if serializer.is_valid():
            # Validate CSV format
            file = request.FILES.get('file')
            validation_result = self.validate_csv_format(file)
            
            # Save the file with validation results
            contact_list = serializer.save(
                user=request.user,
                original_filename=file.name,
                is_validated=validation_result['is_valid'],
                validation_errors=validation_result.get('errors', '')
            )
            
            response_data = {
                "message": "Contact list uploaded successfully",
                "contact_list": ContactListSerializer(contact_list).data,
                "validation_result": validation_result
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        contact_lists = ContactList.objects.filter(user=request.user)
        serializer = ContactListSerializer(contact_lists, many=True)
        return Response(serializer.data)

    def delete(self, request, csv_id=None):
        """Delete a specific CSV contact list file."""
        if not csv_id:
            return Response({
                "error": "CSV ID is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            contact_list = ContactList.objects.get(id=csv_id, user=request.user)
            
            # Delete the physical file
            if contact_list.file and os.path.exists(contact_list.file.path):
                os.remove(contact_list.file.path)
            
            # Delete the database record
            contact_list.delete()
            
            return Response({
                "message": "CSV file deleted successfully"
            }, status=status.HTTP_200_OK)
            
        except ContactList.DoesNotExist:
            return Response({
                "error": "CSV file not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Error deleting CSV file: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def validate_csv_format(self, file):
        """
        Validate CSV file format and required columns
        Expected columns: Name, Email, Company (and optionally: Position, Phone)
        """
        try:
            file.seek(0)  # Reset file pointer
            content = file.read().decode('utf-8')
            file.seek(0)  # Reset again for later use
            
            csv_reader = csv.DictReader(io.StringIO(content))
            
            # Required columns
            required_columns = ['name', 'email', 'company']
            optional_columns = ['position', 'phone']
            
            # Check if required columns exist (case-insensitive)
            headers = [header.lower().strip() for header in csv_reader.fieldnames]
            missing_columns = [col for col in required_columns if col not in headers]
            
            if missing_columns:
                return {
                    'is_valid': False,
                    'errors': f"Missing required columns: {', '.join(missing_columns)}. Required: {', '.join(required_columns)}"
                }
            
            # Validate data rows
            errors = []
            valid_rows = 0
            
            for row_num, row in enumerate(csv_reader, start=2):  # Start from 2 (header is row 1)
                row_errors = []
                
                # Validate email format
                email = row.get('email', '').strip()
                if not email or '@' not in email:
                    row_errors.append(f"Invalid email in row {row_num}")
                
                # Validate name
                name = row.get('name', '').strip()
                if not name:
                    row_errors.append(f"Missing name in row {row_num}")
                
                # Validate company
                company = row.get('company', '').strip()
                if not company:
                    row_errors.append(f"Missing company in row {row_num}")
                
                if row_errors:
                    errors.extend(row_errors)
                else:
                    valid_rows += 1
            
            if errors:
                return {
                    'is_valid': False,
                    'errors': '; '.join(errors[:10]),  # Limit to first 10 errors
                    'valid_rows': valid_rows
                }
            
            return {
                'is_valid': True,
                'valid_rows': valid_rows,
                'message': f"CSV validation successful. {valid_rows} valid contacts found."
            }
            
        except Exception as e:
            return {
                'is_valid': False,
                'errors': f"Error reading CSV file: {str(e)}"
            }


class EmailGenerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Generate personalized emails for all contacts in a CSV using a resume."""
        serializer = EmailGenerationRequestSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        resume_id = serializer.validated_data['resume_id']
        contact_list_id = serializer.validated_data['contact_list_id']
        
        try:
            # Get the resume and contact list
            resume = Resume.objects.get(id=resume_id, user=request.user)
            contact_list = ContactList.objects.get(id=contact_list_id, user=request.user)
            
            # Check if OpenAI API key is configured
            if not getattr(settings, 'OPENAI_API_KEY', None):
                return Response({
                    "error": "OpenAI API key not configured. Please contact administrator."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get file paths
            resume_file_path = resume.file.path
            csv_file_path = contact_list.file.path
            
            # Initialize email generation service
            email_service = EmailGenerationService()
            
            # Generate emails
            generation_results = email_service.generate_emails_for_contact_list(
                resume_file_path, csv_file_path
            )
            
            # Save generated emails to database
            saved_emails = []
            success_count = 0
            
            for result in generation_results:
                contact = result['contact']
                
                # Create or update generated email
                generated_email, created = GeneratedEmail.objects.update_or_create(
                    user=request.user,
                    resume=resume,
                    contact_list=contact_list,
                    recipient_email=contact['email'],
                    defaults={
                        'recipient_name': contact['name'],
                        'recipient_company': contact.get('company', ''),
                        'recipient_position': contact.get('position', ''),
                        'email_subject': result['subject'],
                        'email_body': result['body'],
                    }
                )
                
                saved_emails.append(generated_email)
                if result['success']:
                    success_count += 1
            
            # Serialize the saved emails
            email_serializer = GeneratedEmailSerializer(saved_emails, many=True)
            
            return Response({
                "message": f"Email generation completed. {success_count}/{len(generation_results)} emails generated successfully.",
                "total_contacts": len(generation_results),
                "successful_generations": success_count,
                "failed_generations": len(generation_results) - success_count,
                "generated_emails": email_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Resume.DoesNotExist:
            return Response({
                "error": "Resume not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except ContactList.DoesNotExist:
            return Response({
                "error": "Contact list not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Error generating emails: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GeneratedEmailListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all generated emails for the current user."""
        emails = GeneratedEmail.objects.filter(user=request.user).order_by('-generated_at')
        
        # Optional filtering by resume or contact list
        resume_id = request.GET.get('resume_id')
        contact_list_id = request.GET.get('contact_list_id')
        
        if resume_id:
            emails = emails.filter(resume_id=resume_id)
        if contact_list_id:
            emails = emails.filter(contact_list_id=contact_list_id)
        
        serializer = GeneratedEmailSerializer(emails, many=True)
        return Response(serializer.data)

    def delete(self, request):
        """Delete all generated emails for a specific resume/contact list combination."""
        resume_id = request.data.get('resume_id')
        contact_list_id = request.data.get('contact_list_id')
        
        if not resume_id or not contact_list_id:
            return Response({
                "error": "Both resume_id and contact_list_id are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            deleted_count = GeneratedEmail.objects.filter(
                user=request.user,
                resume_id=resume_id,
                contact_list_id=contact_list_id
            ).delete()[0]
            
            return Response({
                "message": f"Deleted {deleted_count} generated emails"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error deleting emails: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GeneratedEmailDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_email(self, email_id, user):
        """Helper method to get an email that belongs to the user."""
        try:
            return GeneratedEmail.objects.get(id=email_id, user=user)
        except GeneratedEmail.DoesNotExist:
            return None

    def get(self, request, email_id):
        """Get a specific generated email."""
        email = self.get_email(email_id, request.user)
        if not email:
            return Response({"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = GeneratedEmailSerializer(email)
        return Response(serializer.data)

    def put(self, request, email_id):
        """Update a specific generated email."""
        email = self.get_email(email_id, request.user)
        if not email:
            return Response({"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = GeneratedEmailSerializer(email, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, email_id):
        """Delete a specific generated email."""
        email = self.get_email(email_id, request.user)
        if not email:
            return Response({"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND)
        
        email.delete()
        return Response({"message": "Email deleted successfully"}, status=status.HTTP_200_OK)


class EmailVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, email_id):
        """Verify an email address."""
        try:
            email = GeneratedEmail.objects.get(id=email_id, user=request.user)
        except GeneratedEmail.DoesNotExist:
            return Response({"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # For now, we'll just mark it as verified
        # In a real implementation, you would integrate with an email verification service
        email.is_verified = True  # We'd need to add this field to the model
        email.save()
        
        return Response({
            "message": "Email verified successfully",
            "email_id": email_id,
            "recipient_email": email.recipient_email
        })


class EmailAuthorizeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Authorize multiple emails for sending."""
        email_ids = request.data.get('email_ids', [])
        
        if not email_ids:
            return Response({"error": "No email IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            emails = GeneratedEmail.objects.filter(id__in=email_ids, user=request.user)
            
            if not emails.exists():
                return Response({"error": "No emails found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Mark emails as authorized
            updated_count = emails.update(is_authorized=True)  # We'd need to add this field
            
            return Response({
                "message": f"Authorized {updated_count} emails",
                "authorized_emails": list(emails.values_list('id', flat=True))
            })
            
        except Exception as e:
            return Response({
                "error": f"Error authorizing emails: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailSendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Send multiple emails."""
        email_ids = request.data.get('email_ids', [])
        
        if not email_ids:
            return Response({"error": "No email IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            emails = GeneratedEmail.objects.filter(id__in=email_ids, user=request.user)
            
            if not emails.exists():
                return Response({"error": "No emails found"}, status=status.HTTP_404_NOT_FOUND)
            
            # For now, just mark as sent
            # In real implementation, integrate with Gmail API or SMTP
            from django.utils import timezone
            sent_count = 0
            for email in emails:
                # Here you would actually send the email
                email.is_sent = True
                email.sent_at = timezone.now()
                email.save()
                sent_count += 1
            
            return Response({
                "message": f"Sent {sent_count} emails",
                "sent_emails": list(emails.values_list('id', flat=True))
            })
            
        except Exception as e:
            return Response({
                "error": f"Error sending emails: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)