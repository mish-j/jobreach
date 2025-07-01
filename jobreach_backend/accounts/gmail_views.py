from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponseRedirect
from django.conf import settings
from .gmail_service import GmailService
import logging

logger = logging.getLogger(__name__)


class GmailAuthURLView(APIView):
    """Generate Gmail OAuth authorization URL."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            gmail_service = GmailService()
            auth_url = gmail_service.get_authorization_url(request.user.id)
            
            return Response({
                'authorization_url': auth_url
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate authorization URL: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GmailAuthCallbackView(APIView):
    """Handle Gmail OAuth callback."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Handle OAuth callback from Gmail."""
        try:
            code = request.GET.get('code')
            state = request.GET.get('state')
            error = request.GET.get('error')
            
            if error:
                return HttpResponseRedirect(f"{settings.FRONTEND_URL}?gmail_auth=error&message={error}")
            
            if not code or not state:
                return HttpResponseRedirect(f"{settings.FRONTEND_URL}?gmail_auth=error&message=Missing parameters")
            
            # Extract user_id from state
            if not state.startswith('user_'):
                return HttpResponseRedirect(f"{settings.FRONTEND_URL}?gmail_auth=error&message=Invalid state")
            
            user_id = int(state.split('_')[1])
            
            # Note: Since this is AllowAny, we can't verify against request.user
            # The state parameter contains the user_id and serves as verification
            
            gmail_service = GmailService()
            gmail_service.handle_authorization_callback(user_id, code, state)
            
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}?gmail_auth=success")
            
        except Exception as e:
            logger.error(f"Gmail auth callback error: {str(e)}")
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}?gmail_auth=error&message={str(e)}")


class GmailAuthStatusView(APIView):
    """Check Gmail authorization status."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            gmail_service = GmailService()
            is_authorized = gmail_service.is_user_authorized(request.user.id)
            
            profile = None
            if is_authorized:
                profile = gmail_service.get_user_profile(request.user.id)
            
            return Response({
                'authorized': is_authorized,
                'profile': profile
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'authorized': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GmailSendEmailView(APIView):
    """Send email through Gmail."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data
            to_email = data.get('to_email')
            subject = data.get('subject')
            body = data.get('body')
            from_name = data.get('from_name')
            
            if not all([to_email, subject, body]):
                return Response({
                    'error': 'Missing required fields: to_email, subject, body'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            gmail_service = GmailService()
            
            if not gmail_service.is_user_authorized(request.user.id):
                return Response({
                    'error': 'Gmail not authorized. Please authorize first.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            result = gmail_service.send_email(
                user_id=request.user.id,
                to_email=to_email,
                subject=subject,
                body=body,
                from_name=from_name
            )
            
            return Response({
                'message': 'Email sent successfully',
                'message_id': result.get('id')
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GmailRevokeAuthView(APIView):
    """Revoke Gmail authorization."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            gmail_service = GmailService()
            success = gmail_service.revoke_authorization(request.user.id)
            
            if success:
                return Response({
                    'message': 'Gmail authorization revoked successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to revoke authorization'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': f'Failed to revoke authorization: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Mock views for development
class MockGmailAuthView(APIView):
    """Mock Gmail authorization for development."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Mock Gmail authorization."""
        try:
            # Store mock authorization in cache
            from django.core.cache import cache
            cache.set(f"gmail_credentials_{request.user.id}", {
                'mock': True,
                'email': request.user.email,
                'authorized': True
            }, timeout=3600*24)  # 1 day
            
            return Response({
                'message': 'Mock Gmail authorization successful',
                'authorized': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Mock authorization failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MockGmailStatusView(APIView):
    """Mock Gmail status check for development."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            from django.core.cache import cache
            mock_auth = cache.get(f"gmail_credentials_{request.user.id}")
            
            is_authorized = bool(mock_auth and mock_auth.get('authorized'))
            
            profile = None
            if is_authorized:
                profile = {
                    'email': request.user.email,
                    'messages_total': 1000,
                    'threads_total': 500
                }
            
            return Response({
                'authorized': is_authorized,
                'profile': profile,
                'mock': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'authorized': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
