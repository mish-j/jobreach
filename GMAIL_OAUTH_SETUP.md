# Gmail API OAuth 2.0 Setup Guide

## 🔐 Setting up Google Cloud Project for Gmail Integration

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "JobReach Email App")
3. Make sure the project is selected

### Step 2: Enable Gmail API
1. Go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" for user type
3. Fill in required fields:
   - App name: "JobReach Email App"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (during development)

### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://127.0.0.1:8000/api/accounts/gmail/callback/`
   - `http://localhost:8000/api/accounts/gmail/callback/`
5. Download the JSON file

### Step 5: Configure Django Settings
Add to your Django `settings.py`:

```python
# Gmail OAuth Settings
GOOGLE_OAUTH2_CLIENT_ID = 'your-client-id-here'
GOOGLE_OAUTH2_CLIENT_SECRET = 'your-client-secret-here'
GOOGLE_OAUTH2_REDIRECT_URI = 'http://127.0.0.1:8000/api/accounts/gmail/callback/'

# Scopes for Gmail API
GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]
```

### Step 6: Install Required Packages
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## 🔄 How OAuth Flow Works

1. **Frontend**: User clicks "Authorize Gmail" button
2. **Backend**: Returns Google OAuth URL
3. **Frontend**: Opens OAuth URL in popup window
4. **Google**: User authorizes the app
5. **Backend**: Receives authorization code at callback URL
6. **Backend**: Exchanges code for access & refresh tokens
7. **Backend**: Stores tokens in database
8. **Frontend**: Popup closes, checks authorization status
9. **Backend**: Uses stored tokens to send emails via Gmail API

## 🔧 Backend Implementation

The backend already includes:
- `GmailService` class for OAuth flow management
- Views for authorization URL, callback, status, and sending
- Token storage and refresh logic
- Error handling and logging

## 🎯 Frontend Integration

The frontend includes:
- Gmail authorization button in Email Management
- Popup window for OAuth flow
- Authorization status checking
- Visual indicators for connection status
- Revoke/disconnect functionality

## 🚀 Testing

1. Start Django backend: `python manage.py runserver`
2. Start React frontend: `npm start`
3. Login to your app
4. Navigate to Email Management
5. Click "Authorize Gmail"
6. Complete OAuth flow in popup
7. Test sending emails through Gmail API

## 🔒 Security Notes

- Refresh tokens are stored securely in the database
- Access tokens are obtained fresh for each API call
- Users can revoke access at any time
- OAuth scopes are minimal (only send emails)
- All API calls are authenticated and authorized

## 📧 Email Sending

Once authorized, emails will be sent using:
- User's Gmail account as sender
- Gmail API for reliable delivery
- Professional email formatting
- Proper error handling and logging
