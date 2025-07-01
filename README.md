# JobReach - Automated Cold Email Dashboard

JobReach is a comprehensive job search automation platform that helps users automate cold emailing to HR contacts. The platform features AI-powered email generation, file management, email workflow management, and Gmail integration.

## Features

### 🎯 Core Functionality
- **User Authentication**: Secure login/signup system
- **File Management**: Upload and manage resume files (PDF) and HR contact lists (CSV)
- **AI Email Generation**: Automatically generate personalized cold emails using uploaded files
- **Email Management**: View, edit, approve, and send emails with full status tracking
- **Gmail Integration**: Connect Gmail account to send emails directly
- **Analytics Dashboard**: Track email performance and response rates

### 📧 Email Workflow
1. **Upload Files**: Upload your resume (PDF) and HR contacts (CSV)
2. **Generate Emails**: AI creates personalized emails for each HR contact
3. **Review & Edit**: View and modify generated emails as needed
4. **Approve**: Approve emails for sending
5. **Send**: Send approved emails via Gmail integration
6. **Track**: Monitor email status and responses

### 🗂️ File Management
- **Multiple Resumes**: Upload and manage multiple resume versions
- **HR Contact Lists**: Import contact lists in CSV format
- **File Selection**: Choose specific resume and contact list for email generation
- **File Deletion**: Remove unwanted files with confirmation

## Tech Stack

### Backend (Django)
- **Framework**: Django 5.2.3 + Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: JWT token-based authentication
- **File Upload**: Django file handling with validation
- **Gmail API**: Google OAuth2 integration

### Frontend (React)
- **Framework**: React 18 with Create React App
- **Styling**: Tailwind CSS
- **API Client**: Fetch API with custom utilities
- **State Management**: React Hooks (useState, useEffect)

## Project Structure

```
jobreach/
├── jobreach_backend/           # Django backend
│   ├── accounts/              # User authentication
│   ├── emails/                # Email management
│   ├── files/                 # File upload & Gmail integration
│   ├── ai_services/           # AI email generation
│   └── jobreach_backend/      # Main Django settings
├── jobreach_frontend/         # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   └── utils/            # API utilities
│   └── public/               # Static files
└── sample_hr_contacts.csv    # Sample CSV format
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup
1. **Navigate to backend directory**:
   ```bash
   cd jobreach_backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional)**:
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Django server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. **Navigate to frontend directory**:
   ```bash
   cd jobreach_frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start React development server**:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Usage Guide

### 1. User Registration & Login
- Visit http://localhost:3000
- Click "Sign Up" to create a new account
- Or "Login" if you already have an account

### 2. Dashboard Navigation
Once logged in, you'll see the dashboard with these sections:
- **Overview**: Statistics and quick actions
- **File Management**: Upload and manage files
- **Email Management**: View and manage generated emails
- **Analytics**: Email performance metrics

### 3. File Upload
1. Go to "File Management" tab
2. Click "Upload Files" button
3. Select your resume (PDF format)
4. Select HR contacts CSV file
5. Click "Upload"

### 4. HR Contacts CSV Format
Your CSV file should have these columns:
```csv
name,email,company,position,location
John Smith,john.smith@techcorp.com,TechCorp Inc,HR Manager,San Francisco
Sarah Johnson,sarah.j@innovate.com,Innovate Solutions,Recruiter,New York
```

**Required columns**: name, email, company
**Optional columns**: position, location

### 5. Generate Emails
1. Ensure you have uploaded both resume and HR contacts
2. Go to "File Management" and select your files
3. Click "Generate Emails with Selected Files"
4. Choose email template type (Professional, Casual, Direct)
5. Add custom message (optional)
6. Click "Generate Emails"

### 6. Email Management
1. Go to "Email Management" tab
2. Review generated emails in "Pending Approval" tab
3. Click "Edit" to modify email content
4. Click "Approve" to mark emails as ready to send
5. Connect Gmail account if not already connected
6. Click "Send All Authorized" to send approved emails

### 7. Gmail Integration
1. Click "Connect Gmail" when prompted
2. Authorize the application (uses mock OAuth for development)
3. Once connected, you can send emails through Gmail

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/token/` - Login
- `GET /api/accounts/current-user/` - Get current user info

### File Management
- `POST /api/files/upload/` - Upload files
- `GET /api/files/uploaded-files/` - List user's files
- `DELETE /api/files/uploaded-files/{id}/` - Delete file

### Email Management
- `GET /api/emails/` - List user's emails
- `POST /api/emails/generate/` - Generate emails
- `PUT /api/emails/{id}/` - Update email
- `POST /api/emails/{id}/approve/` - Approve email
- `POST /api/emails/{id}/send/` - Send email
- `DELETE /api/emails/{id}/` - Delete email

### Gmail Integration
- `GET /api/files/gmail/status/` - Check Gmail auth status
- `POST /api/files/gmail/mock-auth/` - Mock Gmail authorization

## Development Features

### Mock Data & Testing
- Sample HR contacts CSV provided
- Mock Gmail OAuth for development
- Debug endpoints for testing
- Comprehensive error handling and logging

### File Upload Guidelines
- **Resume Files**: PDF format, max 10MB
- **CSV Files**: UTF-8 encoding, max 1000 contacts
- Multiple files supported
- File validation and error messages

### Email Status Tracking
- **Draft**: Initial state
- **Pending Approval**: Awaiting user review
- **Approved**: Ready to send
- **Sent**: Successfully sent
- **Failed**: Send failed

## Troubleshooting

### Common Issues

1. **Backend Server Won't Start**:
   ```bash
   # Check if port 8000 is in use
   netstat -an | findstr :8000
   # Kill process if needed
   ```

2. **Frontend Build Errors**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **File Upload Errors**:
   - Check file format (PDF for resumes, CSV for contacts)
   - Ensure file size is within limits
   - Verify CSV has required columns

4. **Gmail Authorization Issues**:
   - Use mock authorization for development
   - Check network connectivity
   - Verify API credentials (for production)

### Debug Mode
Enable debug logging by setting `DEBUG=True` in Django settings.

## Future Enhancements

### Planned Features
- Real Gmail OAuth integration
- Advanced AI email templates
- Response tracking and analytics
- Email scheduling
- CRM integration
- A/B testing for email content
- Bulk import/export functionality

### Production Deployment
- Configure proper database (PostgreSQL)
- Set up real Gmail OAuth credentials
- Implement proper email templates
- Add comprehensive logging
- Configure static file serving
- Set up environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and personal use. Please ensure compliance with email marketing regulations and platform terms of service when using for business purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check Django/React logs for errors
4. Ensure all dependencies are installed correctly

---

**Note**: This is a development version with mock integrations. For production use, implement proper OAuth credentials and email service integration.
# jobreach
