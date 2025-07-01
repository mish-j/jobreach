from django.urls import path
from .views import (
    RegisterView, CurrentUserView, ResumeUploadView, ContactListUploadView,
    EmailGenerationView, GeneratedEmailListView, GeneratedEmailDetailView,
    EmailVerifyView, EmailAuthorizeView, EmailSendView
)
from .gmail_views import (
    GmailAuthURLView, GmailAuthCallbackView, GmailAuthStatusView,
    GmailSendEmailView, GmailRevokeAuthView, MockGmailAuthView, MockGmailStatusView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
    
    # JWT Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # File Upload endpoints
    path('upload/resume/', ResumeUploadView.as_view(), name='upload-resume'),
    path('upload/resume/<int:resume_id>/', ResumeUploadView.as_view(), name='delete-resume'),
    path('upload/csv/', ContactListUploadView.as_view(), name='upload-csv'),
    path('upload/csv/<int:csv_id>/', ContactListUploadView.as_view(), name='delete-csv'),
    
    # Email Generation endpoints
    path('generate-emails/', EmailGenerationView.as_view(), name='generate-emails'),
    path('generated-emails/', GeneratedEmailListView.as_view(), name='generated-emails'),
    path('generated-emails/<int:email_id>/', GeneratedEmailDetailView.as_view(), name='generated-email-detail'),
    
    # Email operations
    path('verify-email/<int:email_id>/', EmailVerifyView.as_view(), name='verify-email'),
    path('authorize-emails/', EmailAuthorizeView.as_view(), name='authorize-emails'),
    path('send-emails/', EmailSendView.as_view(), name='send-emails'),
    
    # Gmail Integration endpoints
    path('gmail/auth-url/', GmailAuthURLView.as_view(), name='gmail-auth-url'),
    path('gmail/callback/', GmailAuthCallbackView.as_view(), name='gmail-callback'),
    path('gmail/status/', GmailAuthStatusView.as_view(), name='gmail-status'),
    path('gmail/send/', GmailSendEmailView.as_view(), name='gmail-send'),
    path('gmail/revoke/', GmailRevokeAuthView.as_view(), name='gmail-revoke'),
    
    # Mock Gmail endpoints for development
    path('gmail/mock-auth/', MockGmailAuthView.as_view(), name='mock-gmail-auth'),
    path('gmail/mock-status/', MockGmailStatusView.as_view(), name='mock-gmail-status'),
]
