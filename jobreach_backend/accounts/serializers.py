from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Resume, ContactList, GeneratedEmail

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'full_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Remove confirm_password from validated_data
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data.get('full_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'original_filename', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'original_filename']

    def validate_file(self, value):
        # Validate file extension
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_extension = value.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format. Allowed formats: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (5MB limit)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 5MB")
        
        return value


class ContactListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactList
        fields = ['id', 'file', 'original_filename', 'uploaded_at', 'is_validated', 'validation_errors']
        read_only_fields = ['id', 'uploaded_at', 'is_validated', 'validation_errors', 'original_filename']

    def validate_file(self, value):
        # Validate file extension
        if not value.name.lower().endswith('.csv'):
            raise serializers.ValidationError("Only CSV files are allowed")
        
        # Validate file size (2MB limit)
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("CSV file size cannot exceed 2MB")
        
        return value


class GeneratedEmailSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = GeneratedEmail
        fields = [
            'id', 'recipient_name', 'recipient_email', 'recipient_company', 
            'recipient_position', 'email_subject', 'email_body', 'generated_at',
            'is_verified', 'is_authorized', 'is_sent', 'sent_at', 'status'
        ]
        read_only_fields = ['id', 'generated_at', 'status']
    
    def get_status(self, obj):
        """Return the status of the email based on its state."""
        if obj.is_sent:
            return 'sent'
        elif obj.is_authorized:
            return 'authorized'
        elif obj.is_verified:
            return 'verified'
        else:
            return 'draft'


class EmailGenerationRequestSerializer(serializers.Serializer):
    resume_id = serializers.IntegerField()
    contact_list_id = serializers.IntegerField()

    def validate_resume_id(self, value):
        """Validate that the resume exists and belongs to the user."""
        user = self.context['request'].user
        try:
            resume = Resume.objects.get(id=value, user=user)
            return value
        except Resume.DoesNotExist:
            raise serializers.ValidationError("Resume not found or doesn't belong to user")

    def validate_contact_list_id(self, value):
        """Validate that the contact list exists and belongs to the user."""
        user = self.context['request'].user
        try:
            contact_list = ContactList.objects.get(id=value, user=user)
            if not contact_list.is_validated:
                raise serializers.ValidationError("Contact list must be validated before generating emails")
            return value
        except ContactList.DoesNotExist:
            raise serializers.ValidationError("Contact list not found or doesn't belong to user")
