const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available and not explicitly disabled
    const token = localStorage.getItem('access_token');
    if (token && !options.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData (let browser set it)
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    console.log('API Request:', { url, method: config.method || 'GET', hasAuth: !!token });

    try {
        const response = await fetch(url, config);
        
        console.log('API Response:', { status: response.status, url });
        
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !options.skipAuth && !endpoint.includes('/token/')) {
            console.log('Token expired, attempting refresh...');
            const refreshSuccess = await attemptTokenRefresh();
            if (refreshSuccess) {
                // Retry the original request with new token
                const newToken = localStorage.getItem('access_token');
                config.headers.Authorization = `Bearer ${newToken}`;
                return await fetch(url, config).then(async (retryResponse) => {
                    const retryText = await retryResponse.text();
                    let retryData;
                    try {
                        retryData = JSON.parse(retryText);
                    } catch (e) {
                        retryData = { message: retryText };
                    }
                    if (!retryResponse.ok) {
                        throw new Error(retryData.message || `HTTP ${retryResponse.status}: ${retryText}`);
                    }
                    return { data: retryData, status: retryResponse.status };
                });
            } else {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                throw new Error('Session expired. Please log in again.');
            }
        }
        
        // Try to get response text first
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // If not JSON, use text as is
            data = { message: responseText };
        }
        
        if (!response.ok) {
            console.error('API Error:', { status: response.status, data });
            // Handle different types of errors
            if (data.detail) {
                throw new Error(data.detail);
            } else if (data.non_field_errors) {
                throw new Error(data.non_field_errors[0]);
            } else if (data.username) {
                throw new Error(`Username: ${data.username[0]}`);
            } else if (data.email) {
                throw new Error(`Email: ${data.email[0]}`);
            } else if (data.password) {
                throw new Error(`Password: ${data.password[0]}`);
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error(data.message || `HTTP ${response.status}: ${responseText}`);
            }
        }
        
        return { data, status: response.status };
    } catch (error) {
        console.error('Network/Request Error:', error);
        if (error.name === 'TypeError') {
            throw new Error('Network error. Please check if the server is running.');
        }
        throw error;
    }
};

// Helper function to attempt token refresh
const attemptTokenRefresh = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }
            console.log('Token refreshed successfully');
            return true;
        } else {
            console.log('Token refresh failed');
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        return false;
    }
};

// Auth API functions
export const authAPI = {
    register: async (userData) => {
        return apiRequest('/accounts/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true, // Don't send auth header for registration
        });
    },
    
    login: async (credentials) => {
        return apiRequest('/accounts/token/', {
            method: 'POST',
            body: JSON.stringify(credentials),
            skipAuth: true, // Don't send auth header for login
        });
    },
    
    refreshToken: async (refreshToken) => {
        return apiRequest('/accounts/token/refresh/', {
            method: 'POST',
            body: JSON.stringify({ refresh: refreshToken }),
            skipAuth: true, // Don't send auth header for refresh
        });
    },
    
    getCurrentUser: async () => {
        return apiRequest('/accounts/current-user/');
    },
};

// File management API functions
export const fileAPI = {
    uploadFiles: async (resumeFile, csvFile) => {
        const results = {};
        
        // Upload resume if provided
        if (resumeFile) {
            const resumeFormData = new FormData();
            resumeFormData.append('file', resumeFile);
            
            try {
                results.resume = await apiRequest('/accounts/upload/resume/', {
                    method: 'POST',
                    body: resumeFormData,
                });
            } catch (error) {
                results.resumeError = error.message;
            }
        }
        
        // Upload CSV if provided
        if (csvFile) {
            const csvFormData = new FormData();
            csvFormData.append('file', csvFile);
            
            try {
                results.csv = await apiRequest('/accounts/upload/csv/', {
                    method: 'POST',
                    body: csvFormData,
                });
            } catch (error) {
                results.csvError = error.message;
            }
        }
        
        return results;
    },
    
    getFiles: async () => {
        try {
            // Get both resumes and CSV files
            const [resumeResponse, csvResponse] = await Promise.all([
                apiRequest('/accounts/upload/resume/'),
                apiRequest('/accounts/upload/csv/')
            ]);
            
            console.log('Resume response:', resumeResponse);
            console.log('CSV response:', csvResponse);
            
            return {
                data: {
                    resumes: resumeResponse.data || [],
                    csvFiles: csvResponse.data || []
                }
            };
        } catch (error) {
            console.error('Error in getFiles:', error);
            return {
                data: {
                    resumes: [],
                    csvFiles: []
                }
            };
        }
    },
    
    deleteFile: async (fileId) => {
        // Note: Backend doesn't have individual file deletion endpoints
        // This would need to be implemented in the backend if needed
        throw new Error('Individual file deletion not implemented in backend');
    },
    
    generateEmails: async (resumeId, csvId) => {
        return apiRequest('/accounts/generate-emails/', {
            method: 'POST',
            body: JSON.stringify({
                resume_id: resumeId,
                contact_list_id: csvId,  // Backend expects contact_list_id, not csv_id
            }),
        });
    },
    
    getGeneratedEmails: async () => {
        return apiRequest('/accounts/generated-emails/');
    },
};

// Email management API functions
export const emailAPI = {
    generateEmails: async (data) => {
        // Ensure the data uses the correct field names expected by backend
        const requestData = {
            resume_id: data.resume_id || data.resumeId,
            contact_list_id: data.contact_list_id || data.csvId || data.csv_id
        };
        
        return apiRequest('/accounts/generate-emails/', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    },
    
    getEmails: async () => {
        return apiRequest('/accounts/generated-emails/');
    },
    
    approveEmail: async (emailId) => {
        // Note: Backend doesn't have individual email approval endpoint
        // This would need to be implemented in the backend if needed
        throw new Error('Individual email approval not implemented in backend');
    },
    
    sendEmail: async (emailId) => {
        // Note: Backend doesn't have individual email send endpoint
        // This would need to be implemented in the backend if needed
        throw new Error('Individual email send not implemented in backend');
    },
    
    deleteEmail: async (emailId) => {
        // Note: Backend doesn't have individual email deletion endpoint
        // This would need to be implemented in the backend if needed
        throw new Error('Individual email deletion not implemented in backend');
    },
    
    bulkAction: async (emailIds, action) => {
        // Note: Backend doesn't have bulk action endpoint
        // This would need to be implemented in the backend if needed
        throw new Error('Bulk email actions not implemented in backend');
    },
    
    deleteAllEmails: async (resumeId, contactListId) => {
        return apiRequest('/accounts/generated-emails/', {
            method: 'DELETE',
            body: JSON.stringify({
                resume_id: resumeId,
                contact_list_id: contactListId,  // Use contact_list_id consistently
            }),
        });
    },
};

// Gmail API functions
export const gmailAPI = {
    getAuthUrl: async () => {
        return apiRequest('/accounts/gmail/auth-url/');
    },
    
    getAuthStatus: async (useMock = true) => {
        // Use mock endpoint for development, real endpoint for production
        const endpoint = useMock ? '/accounts/gmail/mock-status/' : '/accounts/gmail/status/';
        return apiRequest(endpoint);
    },
    
    authorizeGmail: async () => {
        // Use mock auth for development
        return apiRequest('/accounts/gmail/mock-auth/', {
            method: 'POST',
        });
    },
    
    sendEmail: async (emailData) => {
        return apiRequest('/accounts/gmail/send/', {
            method: 'POST',
            body: JSON.stringify(emailData),
        });
    },
    
    revokeAuth: async () => {
        return apiRequest('/accounts/gmail/revoke/', {
            method: 'POST',
        });
    },
    
    // Keep the old mock method for backward compatibility
    mockAuth: async () => {
        return apiRequest('/accounts/gmail/mock-auth/', {
            method: 'POST',
        });
    },
};

// Helper functions for token management
export const tokenUtils = {
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    },
    
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),
    
    clearTokens: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    isLoggedIn: () => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        return !!(token && refreshToken);
    },

    // Check if token appears to be expired (basic check)
    isTokenExpired: () => {
        const token = localStorage.getItem('access_token');
        if (!token) return true;
        
        try {
            // JWT tokens have 3 parts separated by dots
            const parts = token.split('.');
            if (parts.length !== 3) return true;
            
            // Decode the payload (second part)
            const payload = JSON.parse(atob(parts[1]));
            const now = Date.now() / 1000;
            
            // Check if token is expired (with 30 second buffer)
            return payload.exp < (now + 30);
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }
};
