import { API_BASE_URL } from './fileService';
import { tokenUtils } from './api';

class EmailService {
    async generateEmails(resumeId, contactListId) {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/generate-emails/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                resume_id: resumeId,
                contact_list_id: contactListId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async getGeneratedEmails() {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/generated-emails/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async authorizeEmails(emailIds) {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/authorize-emails/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email_ids: emailIds
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async sendEmails(emailIds) {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/send-emails/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email_ids: emailIds
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async deleteEmail(emailId) {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/generated-emails/${emailId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.ok;
    }

    async verifyEmail(emailId) {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/verify-email/${emailId}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async updateEmail(emailId, updatedData) {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/generated-emails/${emailId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async getGmailAuthUrl() {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/gmail/auth-url/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async getGmailAuthStatus() {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/gmail/status/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async revokeGmailAuth() {
        const token = tokenUtils.getAccessToken();
        
        const response = await fetch(`${API_BASE_URL}/gmail/revoke/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }
}

export const emailService = new EmailService();
