# Add these to your existing models.py
from django.db import models
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    hr_contacts_file = models.FileField(upload_to='hr_contacts/', null=True, blank=True)
    daily_email_limit = models.IntegerField(default=50)  # Safety compliance
    emails_sent_today = models.IntegerField(default=0)
    last_email_date = models.DateField(null=True, blank=True)
    gmail_refresh_token = models.TextField(null=True, blank=True)
    
    def can_send_emails(self, count):
        """Check if user can send specified number of emails today"""
        today = date.today()
        if self.last_email_date != today:
            self.emails_sent_today = 0
            self.last_email_date = today
            self.save()
        return self.emails_sent_today + count <= self.daily_email_limit
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class HRContact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hr_contacts')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255, blank=True)
    linkedin_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'email']
    
    def __str__(self):
        return f"{self.name} - {self.company}"

class EmailTemplate(models.Model):
    TEMPLATE_TYPES = [
        ('software', 'Software Development'),
        ('marketing', 'Marketing'),
        ('sales', 'Sales'),
        ('design', 'Design'),
        ('general', 'General'),
    ]
    
    name = models.CharField(max_length=255)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    subject_template = models.CharField(max_length=255)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.template_type})"

class ColdEmail(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('deleted', 'Deleted'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cold_emails')
    hr_contact = models.ForeignKey(HRContact, on_delete=models.CASCADE)
    template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    subject = models.CharField(max_length=255)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # AI Generation tracking
    ai_generated = models.BooleanField(default=False)
    generation_prompt = models.TextField(blank=True)
    
    # Sending tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    gmail_message_id = models.CharField(max_length=255, blank=True)
    
    # Response tracking
    opened = models.BooleanField(default=False)
    replied = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Email to {self.hr_contact.name} - {self.status}"
