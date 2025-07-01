import csv
import io
import os
from typing import List, Dict, Tuple
import PyPDF2
import docx
import openai
from django.conf import settings
from django.core.files.storage import default_storage


class DocumentParser:
    """Utility class for parsing different document types."""
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file."""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            raise ValueError(f"Error extracting text from PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Error extracting text from DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_doc(file_path: str) -> str:
        """Extract text from DOC file - basic fallback."""
        # For .doc files, we'll provide a message to convert to .docx
        raise ValueError("DOC files are not supported. Please convert to DOCX format.")
    
    @staticmethod
    def extract_resume_text(file_path: str) -> str:
        """Extract text from resume file based on extension."""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return DocumentParser.extract_text_from_pdf(file_path)
        elif file_extension == '.docx':
            return DocumentParser.extract_text_from_docx(file_path)
        elif file_extension == '.doc':
            return DocumentParser.extract_text_from_doc(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")


class CSVParser:
    """Utility class for parsing CSV contact files."""
    
    @staticmethod
    def parse_csv_contacts(file_path: str) -> List[Dict[str, str]]:
        """Parse CSV file and return list of contact dictionaries."""
        contacts = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                # Try to detect delimiter
                sample = csvfile.read(1024)
                csvfile.seek(0)
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                
                reader = csv.DictReader(csvfile, delimiter=delimiter)
                
                for row_num, row in enumerate(reader, start=2):  # Start at 2 since header is row 1
                    # Clean up the row data
                    contact = {}
                    for key, value in row.items():
                        if key:  # Skip empty column names
                            contact[key.strip().lower()] = value.strip() if value else ""
                    
                    # Validate required fields
                    if not contact.get('name') and not contact.get('full_name'):
                        continue  # Skip rows without name
                    
                    if not contact.get('email'):
                        continue  # Skip rows without email
                    
                    # Standardize field names
                    standardized_contact = {
                        'name': contact.get('name') or contact.get('full_name', ''),
                        'email': contact.get('email', ''),
                        'company': contact.get('company') or contact.get('organization', ''),
                        'position': contact.get('position') or contact.get('title') or contact.get('job_title', ''),
                        'row_number': row_num
                    }
                    
                    contacts.append(standardized_contact)
                    
        except Exception as e:
            raise ValueError(f"Error parsing CSV file: {str(e)}")
        
        return contacts


class EmailGenerator:
    """Utility class for generating personalized emails using OpenAI."""
    
    def __init__(self):
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        
        # Check if we should use test mode
        self.test_mode = (
            not api_key or 
            api_key == 'sk-your-openai-api-key-here' or
            api_key.startswith('test-') or
            getattr(settings, 'DEBUG', False) and not api_key.startswith('sk-')
        )
        
        if self.test_mode:
            print("🧪 EmailGenerator running in TEST MODE - using mock responses")
            return
        
        # Real OpenAI setup using legacy API
        try:
            import openai
            openai.api_key = api_key
            self.client = openai
            self._use_legacy_api = True
            print("✅ OpenAI client initialized successfully")
        except Exception as e:
            print(f"⚠️ OpenAI initialization failed: {e}")
            print("🧪 Falling back to TEST MODE")
            self.test_mode = True
    
    def generate_personalized_email(self, resume_text: str, contact: Dict[str, str]) -> Tuple[str, str]:
        """
        Generate a personalized email for a contact using resume text.
        Returns tuple of (subject, body).
        """
        # Test mode - return mock emails
        if self.test_mode:
            return self._generate_mock_email(resume_text, contact)
        
        try:
            # Create the prompt for OpenAI
            prompt = self._create_email_prompt(resume_text, contact)
            
            # Call OpenAI API using legacy API
            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional email writer helping job seekers create personalized outreach emails. Generate professional, concise emails that highlight relevant skills and express genuine interest in opportunities."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )
            email_content = response.choices[0].message.content.strip()
            
            # Parse the response
            subject, body = self._parse_email_response(email_content, contact)
            
            return subject, body
            
        except Exception as e:
            # Fallback to mock email if OpenAI fails
            print(f"⚠️ OpenAI failed ({str(e)}), using mock email")
            return self._generate_mock_email(resume_text, contact)
    
    def _generate_mock_email(self, resume_text: str, contact: Dict[str, str]) -> Tuple[str, str]:
        """Generate a mock professional email for testing purposes."""
        
        name = contact.get('name', 'Hiring Manager')
        company = contact.get('company', 'your company')
        position = contact.get('position', 'available positions')
        
        # Extract some skills from resume for personalization
        skills = []
        resume_lower = resume_text.lower()
        if 'python' in resume_lower:
            skills.append('Python')
        if 'javascript' in resume_lower or 'react' in resume_lower:
            skills.append('JavaScript/React')
        if 'django' in resume_lower:
            skills.append('Django')
        if 'aws' in resume_lower or 'cloud' in resume_lower:
            skills.append('cloud technologies')
        if not skills:
            skills = ['software development', 'full-stack development']
        
        subject = f"Software Engineer Opportunity - Interest in {company}"
        
        body = f"""Dear {name},

I hope this email finds you well. I am writing to express my strong interest in {position} opportunities at {company}.

With my experience in {', '.join(skills[:2])}, I believe I would be a valuable addition to your team. I have a proven track record in software development and am particularly drawn to {company}'s innovative approach in the industry.

I would welcome the opportunity to discuss how my skills and experience align with your team's needs. I have attached my resume for your review and would be happy to provide any additional information.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
John Smith
john.smith@email.com
(555) 123-4567"""
        
        return subject, body
    
    def _create_email_prompt(self, resume_text: str, contact: Dict[str, str]) -> str:
        """Create the prompt for OpenAI based on resume and contact info."""
        
        # Truncate resume text if too long (keep first 2000 characters)
        if len(resume_text) > 2000:
            resume_text = resume_text[:2000] + "..."
        
        prompt = f"""
Based on the following resume and contact information, write a professional email reaching out for job opportunities.

RESUME INFORMATION:
{resume_text}

CONTACT INFORMATION:
- Name: {contact.get('name', 'Hiring Manager')}
- Email: {contact.get('email', '')}
- Company: {contact.get('company', 'your company')}
- Position: {contact.get('position', 'Hiring Manager')}

INSTRUCTIONS:
1. Write a professional email with a compelling subject line
2. Address the recipient by name
3. Briefly introduce yourself and highlight 2-3 most relevant skills/experiences from the resume
4. Express specific interest in the company/role
5. Keep it concise (under 200 words for the body)
6. Include a professional closing
7. Format the response as:
   SUBJECT: [subject line]
   BODY: [email body]

Make the email personal and engaging while maintaining professionalism.
"""
        return prompt
    
    def _parse_email_response(self, email_content: str, contact: Dict[str, str]) -> Tuple[str, str]:
        """Parse the OpenAI response to extract subject and body."""
        lines = email_content.split('\n')
        subject = ""
        body = ""
        
        subject_found = False
        body_lines = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('SUBJECT:'):
                subject = line.replace('SUBJECT:', '').strip()
                subject_found = True
            elif line.startswith('BODY:'):
                # Start collecting body content
                body_content = line.replace('BODY:', '').strip()
                if body_content:
                    body_lines.append(body_content)
            elif subject_found and line:
                # Collect remaining body content
                body_lines.append(line)
        
        # Join body lines
        body = '\n'.join(body_lines).strip()
        
        # Fallback subject if not found
        if not subject:
            company_name = contact.get('company', 'your company')
            subject = f"Interest in Opportunities at {company_name}"
        
        # Fallback body if not found
        if not body:
            body = "I hope this email finds you well. I am writing to express my interest in potential opportunities at your organization..."
        
        return subject, body


class EmailGenerationService:
    """Main service class for coordinating email generation process."""
    
    def __init__(self):
        self.document_parser = DocumentParser()
        self.csv_parser = CSVParser()
        self.email_generator = EmailGenerator()
    
    def generate_emails_for_contact_list(self, resume_file_path: str, csv_file_path: str) -> List[Dict]:
        """
        Generate personalized emails for all contacts in a CSV file using a resume.
        Returns list of generated email data.
        """
        results = []
        
        try:
            # Extract resume text
            resume_text = self.document_parser.extract_resume_text(resume_file_path)
            
            # Parse CSV contacts
            contacts = self.csv_parser.parse_csv_contacts(csv_file_path)
            
            if not contacts:
                raise ValueError("No valid contacts found in CSV file")
            
            # Generate email for each contact
            for contact in contacts:
                try:
                    subject, body = self.email_generator.generate_personalized_email(resume_text, contact)
                    
                    result = {
                        'contact': contact,
                        'subject': subject,
                        'body': body,
                        'success': True,
                        'error': None
                    }
                    
                except Exception as e:
                    result = {
                        'contact': contact,
                        'subject': f"Interest in Opportunities at {contact.get('company', 'your company')}",
                        'body': f"Dear {contact.get('name', 'Hiring Manager')},\n\nI hope this email finds you well...",
                        'success': False,
                        'error': str(e)
                    }
                
                results.append(result)
            
            return results
            
        except Exception as e:
            raise ValueError(f"Error in email generation process: {str(e)}")
