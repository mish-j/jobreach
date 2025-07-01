from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.username


class Resume(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to='resumes/')
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.original_filename}"


class ContactList(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to='csv_files/')
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_validated = models.BooleanField(default=False)
    validation_errors = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.original_filename}"


class GeneratedEmail(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    contact_list = models.ForeignKey(ContactList, on_delete=models.CASCADE)
    recipient_name = models.CharField(max_length=255)
    recipient_email = models.EmailField()
    recipient_company = models.CharField(max_length=255, blank=True, null=True)
    recipient_position = models.CharField(max_length=255, blank=True, null=True)
    email_subject = models.CharField(max_length=255)
    email_body = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)
    
    # Status fields
    is_verified = models.BooleanField(default=False)
    is_authorized = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'resume', 'contact_list', 'recipient_email']
    
    def __str__(self):
        return f"Email to {self.recipient_name} ({self.recipient_email})"
