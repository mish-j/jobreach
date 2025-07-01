from rest_framework import serializers
from .email_models import HRContact, ColdEmail, EmailTemplate, UserProfile

class HRContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = HRContact
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'

class ColdEmailSerializer(serializers.ModelSerializer):
    hr_contact = HRContactSerializer(read_only=True)
    template = EmailTemplateSerializer(read_only=True)
    
    class Meta:
        model = ColdEmail
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'sent_at', 'gmail_message_id']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user']
