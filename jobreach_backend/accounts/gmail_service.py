from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.core.cache import cache
import os
import json
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

class GmailService:
    """Gmail API service for sending emails through user's Gmail account."""
    
    # Gmail API scopes
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']
    
    def __init__(self):
        self.credentials_file = getattr(settings, 'GMAIL_CREDENTIALS_FILE', None)
        self.redirect_uri = getattr(settings, 'GMAIL_REDIRECT_URI', 'http://localhost:8000/api/accounts/gmail/callback/')
        
    def get_authorization_url(self, user_id):
        """Generate Gmail OAuth authorization URL."""
        try:
            if not self.credentials_file or not os.path.exists(self.credentials_file):
                raise Exception("Gmail credentials file not found. Please configure GMAIL_CREDENTIALS_FILE in settings.")
            
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=self.SCOPES,
                redirect_uri=self.redirect_uri
            )
            
            # Generate state parameter for security
            state = f"user_{user_id}"
            
            authorization_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=state
            )
            
            # Store flow in cache for later use
            cache.set(f"gmail_flow_{user_id}", flow, timeout=300)  # 5 minutes
            
            return authorization_url
            
        except Exception as e:
            logger.error(f"Error generating Gmail authorization URL: {str(e)}")
            raise
    
    def handle_authorization_callback(self, user_id, code, state):
        """Handle Gmail OAuth callback and store credentials."""
        try:
            # Verify state parameter
            expected_state = f"user_{user_id}"
            if state != expected_state:
                raise Exception("Invalid state parameter")
            
            # Retrieve flow from cache
            flow = cache.get(f"gmail_flow_{user_id}")
            if not flow:
                raise Exception("Authorization flow not found or expired")
            
            # Exchange code for credentials
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Store credentials for user
            self._store_user_credentials(user_id, credentials)
            
            return True
            
        except Exception as e:
            logger.error(f"Error handling Gmail authorization callback: {str(e)}")
            raise
    
    def _store_user_credentials(self, user_id, credentials):
        """Store user's Gmail credentials securely."""
        credentials_dict = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        # Store in cache (in production, use database or secure storage)
        cache.set(f"gmail_credentials_{user_id}", credentials_dict, timeout=3600*24*30)  # 30 days
    
    def _get_user_credentials(self, user_id):
        """Retrieve user's Gmail credentials."""
        credentials_dict = cache.get(f"gmail_credentials_{user_id}")
        if not credentials_dict:
            return None
        
        credentials = Credentials(
            token=credentials_dict['token'],
            refresh_token=credentials_dict['refresh_token'],
            token_uri=credentials_dict['token_uri'],
            client_id=credentials_dict['client_id'],
            client_secret=credentials_dict['client_secret'],
            scopes=credentials_dict['scopes']
        )
        
        # Refresh if expired
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            self._store_user_credentials(user_id, credentials)
        
        return credentials
    
    def is_user_authorized(self, user_id):
        """Check if user has authorized Gmail access."""
        credentials = self._get_user_credentials(user_id)
        return credentials is not None and credentials.valid
    
    def send_email(self, user_id, to_email, subject, body, from_name=None):
        """Send email through user's Gmail account."""
        try:
            credentials = self._get_user_credentials(user_id)
            if not credentials:
                raise Exception("User not authorized. Please authorize Gmail access first.")
            
            # Build Gmail service
            service = build('gmail', 'v1', credentials=credentials)
            
            # Create message
            message = MIMEMultipart()
            message['to'] = to_email
            message['subject'] = subject
            
            if from_name:
                message['from'] = from_name
            
            # Add body
            message.attach(MIMEText(body, 'plain'))
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send email
            result = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            logger.info(f"Email sent successfully to {to_email}. Message ID: {result['id']}")
            return result
            
        except HttpError as error:
            logger.error(f"Gmail API error: {error}")
            raise Exception(f"Failed to send email: {error}")
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            raise
    
    def get_user_profile(self, user_id):
        """Get user's Gmail profile information."""
        try:
            credentials = self._get_user_credentials(user_id)
            if not credentials:
                return None
            
            service = build('gmail', 'v1', credentials=credentials)
            profile = service.users().getProfile(userId='me').execute()
            
            return {
                'email': profile.get('emailAddress'),
                'messages_total': profile.get('messagesTotal', 0),
                'threads_total': profile.get('threadsTotal', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting Gmail profile: {str(e)}")
            return None
    
    def revoke_authorization(self, user_id):
        """Revoke user's Gmail authorization."""
        try:
            # Remove stored credentials
            cache.delete(f"gmail_credentials_{user_id}")
            return True
        except Exception as e:
            logger.error(f"Error revoking Gmail authorization: {str(e)}")
            return False
