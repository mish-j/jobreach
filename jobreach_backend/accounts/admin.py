from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Resume, ContactList, GeneratedEmail

admin.site.register(CustomUser, UserAdmin)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_filename', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['user__username', 'original_filename']
    readonly_fields = ['uploaded_at']


@admin.register(ContactList)
class ContactListAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_filename', 'is_validated', 'uploaded_at']
    list_filter = ['is_validated', 'uploaded_at']
    search_fields = ['user__username', 'original_filename']
    readonly_fields = ['uploaded_at']
    
    def validation_status(self, obj):
        return "✓ Valid" if obj.is_validated else "✗ Invalid"
    validation_status.short_description = "Status"


@admin.register(GeneratedEmail)
class GeneratedEmailAdmin(admin.ModelAdmin):
    list_display = ['user', 'recipient_name', 'recipient_email', 'recipient_company', 'generated_at']
    list_filter = ['generated_at', 'recipient_company']
    search_fields = ['user__username', 'recipient_name', 'recipient_email', 'recipient_company']
    readonly_fields = ['generated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'resume', 'contact_list')
