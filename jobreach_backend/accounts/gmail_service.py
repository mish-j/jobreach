import os
import json
import base64
import logging
import secrets
import urllib.parse
import requests

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.core.cache import cache
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)


class GmailService:
    """Gmail API service for sending emails through user's Gmail account."""

    SCOPES = ['https://www.googleapis.com/auth/gmail.send']

    def __init__(self):
        self.client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        self.client_secret = getattr(settings, 'GOOGLE_CLIENT_SECRET', None)
        self.redirect_uri = getattr(settings, 'GMAIL_REDIRECT_URI', 'http://localhost:8000/api/accounts/gmail/callback/')
        
        if not self.client_id or not self.client_secret:
            raise Exception("Google OAuth credentials not configured in settings")

    def get_authorization_url(self, user_id):
        """Generate Gmail OAuth authorization URL."""
        try:
            state = f"user_{user_id}_{secrets.token_urlsafe(16)}"

            # Store state to validate later
            cache.set(f"gmail_state_{user_id}", state, timeout=300)

            params = {
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,
                'scope': ' '.join(self.SCOPES),
                'response_type': 'code',
                'access_type': 'offline',
                'include_granted_scopes': 'true',
                'state': state,
                'prompt': 'consent'
            }

            return 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)

        except Exception as e:
            logger.error(f"Error generating Gmail authorization URL: {str(e)}")
            raise

    def handle_authorization_callback(self, user_id, code, state):
        """Handle Gmail OAuth callback and store credentials."""
        try:
            stored_state = cache.get(f"gmail_state_{user_id}")
            if not stored_state or stored_state != state:
                raise Exception("Invalid or expired state parameter")

            token_data = self._exchange_code_for_token(code)

            credentials = Credentials(
                token=token_data['access_token'],
                refresh_token=token_data.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=self.client_id,
                client_secret=self.client_secret,
                scopes=self.SCOPES
            )

            self._store_user_credentials(user_id, credentials)
            cache.delete(f"gmail_state_{user_id}")
            return True

        except Exception as e:
            logger.error(f"Error handling Gmail authorization callback: {str(e)}")
            raise

    def _exchange_code_for_token(self, code):
        """Exchange auth code for access + refresh tokens."""
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri
        }

        response = requests.post('https://oauth2.googleapis.com/token', data=data)
        if response.status_code != 200:
            raise Exception(f"Token exchange failed: {response.text}")

        return response.json()

    def _store_user_credentials(self, user_id, credentials):
        """Store credentials in cache (or database)."""
        cache.set(f"gmail_credentials_{user_id}", {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }, timeout=3600 * 24 * 30)

    def _get_user_credentials(self, user_id):
        """Get stored credentials."""
        data = cache.get(f"gmail_credentials_{user_id}")
        if not data:
            return None

        creds = Credentials(
            token=data['token'],
            refresh_token=data['refresh_token'],
            token_uri=data['token_uri'],
            client_id=data['client_id'],
            client_secret=data['client_secret'],
            scopes=data['scopes']
        )

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            self._store_user_credentials(user_id, creds)

        return creds

    def is_user_authorized(self, user_id):
        """Check if user is authorized."""
        creds = self._get_user_credentials(user_id)
        return creds is not None and creds.valid

    def send_email(self, user_id, to_email, subject, body, from_name=None):
        """Send email using Gmail API."""
        try:
            creds = self._get_user_credentials(user_id)
            if not creds:
                raise Exception("User not authorized.")

            service = build('gmail', 'v1', credentials=creds)

            message = MIMEMultipart()
            message['to'] = to_email
            message['subject'] = subject
            if from_name:
                message['from'] = from_name

            message.attach(MIMEText(body, 'plain'))
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

            result = service.users().messages().send(userId='me', body={'raw': raw}).execute()
            logger.info(f"Email sent to {to_email} - ID: {result['id']}")
            return result

        except HttpError as e:
            logger.error(f"Gmail API error: {e}")
            raise Exception("Gmail API failed.")
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise

    def get_user_profile(self, user_id):
        """Get user Gmail profile."""
        try:
            creds = self._get_user_credentials(user_id)
            if not creds:
                return None

            service = build('gmail', 'v1', credentials=creds)
            profile = service.users().getProfile(userId='me').execute()

            return {
                'email': profile.get('emailAddress'),
                'messages_total': profile.get('messagesTotal', 0),
                'threads_total': profile.get('threadsTotal', 0)
            }

        except Exception as e:
            logger.error(f"Failed to get profile: {e}")
            return None

    def revoke_authorization(self, user_id):
        """Revoke Gmail access (delete credentials)."""
        try:
            cache.delete(f"gmail_credentials_{user_id}")
            return True
        except Exception as e:
            logger.error(f"Revoke failed: {e}")
            return False
