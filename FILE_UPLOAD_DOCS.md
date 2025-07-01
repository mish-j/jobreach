# File Upload Feature Documentation

## 🎯 Overview
The file upload feature enables users to upload resumes (PDF/DOC/DOCX) and CSV contact lists with automatic validation.

## 📊 Database Models

### Resume Model
```python
class Resume(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to='resumes/')
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

### ContactList Model
```python
class ContactList(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to='csv_files/')
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_validated = models.BooleanField(default=False)
    validation_errors = models.TextField(blank=True, null=True)
```

## 🔗 API Endpoints

### Resume Upload
- **POST** `/api/accounts/upload/resume/`
- **GET** `/api/accounts/upload/resume/`

**Request (POST):**
```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

file: [resume file - PDF/DOC/DOCX]
```

**Response (POST):**
```json
{
    "message": "Resume uploaded successfully",
    "resume": {
        "id": 1,
        "file": "/media/resumes/resume.pdf",
        "original_filename": "my_resume.pdf",
        "uploaded_at": "2025-07-01T17:30:00Z"
    }
}
```

### CSV Upload
- **POST** `/api/accounts/upload/csv/`
- **GET** `/api/accounts/upload/csv/`

**Request (POST):**
```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

file: [CSV file]
```

**Response (POST):**
```json
{
    "message": "CSV file uploaded successfully",
    "contact_list": {
        "id": 1,
        "file": "/media/csv_files/contacts.csv",
        "original_filename": "hr_contacts.csv",
        "uploaded_at": "2025-07-01T17:30:00Z",
        "is_validated": true,
        "validation_errors": null
    },
    "validation_result": {
        "is_valid": true,
        "valid_rows": 10,
        "message": "CSV validation successful. 10 valid contacts found."
    }
}
```

## ✅ Validation Rules

### Resume Files
- **Allowed formats:** PDF, DOC, DOCX
- **Maximum size:** 5MB
- **Upload path:** `media/resumes/`

### CSV Files
- **Allowed format:** CSV only
- **Maximum size:** 2MB
- **Upload path:** `media/csv_files/`

### CSV Structure Validation
**Required columns:**
- `name` - Contact's full name
- `email` - Valid email address
- `company` - Company name

**Optional columns:**
- `position` - Job title/position
- `phone` - Phone number

**Validation checks:**
1. Required columns present (case-insensitive)
2. Valid email format (@domain.com)
3. Non-empty name and company fields
4. Row-by-row validation with error reporting

## 📁 File Structure
```
jobreach_backend/
├── media/                     # Created automatically
│   ├── resumes/              # Resume files
│   └── csv_files/            # CSV contact lists
├── accounts/
│   ├── models.py             # Resume & ContactList models
│   ├── serializers.py        # File upload serializers
│   ├── views.py              # Upload views with validation
│   ├── urls.py               # Upload endpoints
│   └── admin.py              # Admin interface
└── jobreach_backend/
    ├── settings.py           # Media configuration
    └── urls.py               # Main URL routing
```

## 🧪 Testing

### Using the Test Script
```bash
# Make sure Django server is running
python manage.py runserver

# Run the test script
python test_file_upload.py
```

### Manual Testing with curl

**Resume Upload:**
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/upload/resume/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/resume.pdf"
```

**CSV Upload:**
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/upload/csv/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sample_hr_contacts.csv"
```

**Get Uploaded Files:**
```bash
curl -X GET http://127.0.0.1:8000/api/accounts/upload/resume/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET http://127.0.0.1:8000/api/accounts/upload/csv/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Authentication
- All upload endpoints require JWT authentication
- Users can only access their own uploaded files
- Token obtained via `/api/accounts/token/` endpoint

## 📋 Sample CSV Format
See `sample_hr_contacts.csv` for a properly formatted example:
```csv
name,email,company,position,phone
John Doe,john.doe@techcorp.com,Tech Corp,Software Engineer,+1-555-123-4567
Jane Smith,jane.smith@datainc.com,Data Inc,Data Analyst,+1-555-234-5678
```

**Important:** Column headers must be lowercase for proper validation.

## 🚀 Next Steps
1. **File Processing:** Add resume parsing capabilities
2. **Contact Management:** Create endpoints to manage parsed contacts
3. **Email Integration:** Connect with email sending functionality
4. **File Validation:** Add virus scanning and additional security checks
5. **Frontend Integration:** Create React components for file upload UI

## 🛠️ Admin Interface
Access uploaded files through Django admin at `/admin/`:
- View all uploaded resumes and CSV files
- Check validation status
- Monitor upload timestamps
- User management
