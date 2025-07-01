from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
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
import urllib.parse
import secrets

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
            logger.info(f"Starting Gmail authorization for user {user_id}")
            
            if not self.credentials_file or not os.path.exists(self.credentials_file):
                logger.error(f"Gmail credentials file not found: {self.credentials_file}")
                raise Exception("Gmail credentials file not found. Please configure GMAIL_CREDENTIALS_FILE in settings.")
            
            logger.info(f"Reading credentials from: {self.credentials_file}")
            
            # Read credentials from file
            with open(self.credentials_file, 'r') as f:
                credentials_data = json.load(f)
            
            client_config = credentials_data['web']
            client_id = client_config['client_id']
            
            logger.info(f"Redirect URI: {self.redirect_uri}")
            logger.info(f"Scopes: {self.SCOPES}")
            
            # Generate state parameter for security
            state = f"user_{user_id}_{secrets.token_urlsafe(16)}"
            
            # Store client config and state for callback
            cache.set(f"gmail_state_{user_id}", {
                'state': state,
                'client_config': client_config
            }, timeout=300)  # 5 minutes
            
            # Build OAuth URL manually
            params = {
                'client_id': client_id,
                'redirect_uri': self.redirect_uri,
                'scope': ' '.join(self.SCOPES),
                'response_type': 'code',
                'access_type': 'offline',
                'include_granted_scopes': 'true',
                'state': state,
                'prompt': 'consent'
            }
            
            authorization_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
            
            logger.info(f"Authorization URL generated: {authorization_url}")
            
            return authorization_url
            
        except Exception as e:
            logger.error(f"Error generating Gmail authorization URL: {str(e)}")
            raise
    
    def handle_authorization_callback(self, user_id, code, state):
        """Handle Gmail OAuth callback and store credentials."""
        try:
            # Retrieve state and client config from cache
            stored_data = cache.get(f"gmail_state_{user_id}")
            if not stored_data:
                raise Exception("Authorization state not found or expired")
            
            # Verify state parameter
            if state != stored_data['state']:
                raise Exception("Invalid state parameter")
            
            client_config = stored_data['client_config']
            
            # Exchange code for token
            token_data = self._exchange_code_for_token(code, client_config)
            
            # Create credentials object
            credentials = Credentials(
                token=token_data['access_token'],
                refresh_token=token_data.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=client_config['client_id'],
                client_secret=client_config['client_secret'],
                scopes=self.SCOPES
            )
            
            # Store credentials for user
            self._store_user_credentials(user_id, credentials)
            
            # Clean up cache
            cache.delete(f"gmail_state_{user_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error handling Gmail authorization callback: {str(e)}")
            raise
    
    def _exchange_code_for_token(self, code, client_config):
        """Exchange authorization code for access token."""
        import requests
        
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'client_id': client_config['client_id'],
            'client_secret': client_config['client_secret'],
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri
        }
        
        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            raise Exception(f"Token exchange failed: {response.text}")
        
        return response.json()
    
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
