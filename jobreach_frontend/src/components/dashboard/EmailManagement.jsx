import React, { useState, useEffect } from 'react';
import { emailService } from '../../utils/emailService';
import EmailViewModal from './EmailViewModal';
import EmailEditModal from './EmailEditModal';

const EmailManagement = ({ onDataChange }) => {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, sent, draft, pending
    const [viewingEmail, setViewingEmail] = useState(null);
    const [editingEmail, setEditingEmail] = useState(null);
    const [isVerifying, setIsVerifying] = useState({});
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [isGmailAuthorized, setIsGmailAuthorized] = useState(false);

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        try {
            const emailData = await emailService.getGeneratedEmails();
            setEmails(emailData);
            
            // Check Gmail authorization status
            const authStatus = await emailService.getGmailAuthStatus();
            setIsGmailAuthorized(authStatus.authorized);
        } catch (error) {
            console.error('Failed to load emails:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGmailAuthorize = async () => {
        setIsAuthorizing(true);
        try {
            // Get Gmail OAuth URL from backend
            const response = await emailService.getGmailAuthUrl();
            const authUrl = response.authorization_url;
            
            // Open Gmail OAuth in a new window
            const authWindow = window.open(
                authUrl,
                'gmail_auth',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );
            
            // Listen for OAuth completion
            const checkClosed = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(checkClosed);
                    // Check if authorization was successful
                    checkGmailAuthStatus();
                    setIsAuthorizing(false);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Failed to start Gmail authorization:', error);
            alert('Failed to start Gmail authorization: ' + error.message);
            setIsAuthorizing(false);
        }
    };

    const checkGmailAuthStatus = async () => {
        try {
            const status = await emailService.getGmailAuthStatus();
            if (status.authorized) {
                alert('Gmail authorization successful! You can now send emails.');
                await loadEmails();
                if (onDataChange) onDataChange();
            }
        } catch (error) {
            console.error('Failed to check Gmail auth status:', error);
        }
    };

    const handleGmailRevoke = async () => {
        if (!window.confirm('Are you sure you want to disconnect your Gmail account?')) {
            return;
        }
        
        try {
            await emailService.revokeGmailAuth();
            setIsGmailAuthorized(false);
            alert('Gmail account disconnected successfully.');
            if (onDataChange) onDataChange();
        } catch (error) {
            console.error('Failed to revoke Gmail authorization:', error);
            alert('Failed to disconnect Gmail: ' + error.message);
        }
    };

    const handleSendSingleEmail = async (emailId) => {
        try {
            await emailService.sendEmails([emailId]);
            await loadEmails();
            if (onDataChange) onDataChange(); // Trigger dashboard refresh
            alert('Email sent successfully');
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email: ' + error.message);
        }
    };

    const handleDeleteEmail = async (emailId) => {
        if (!window.confirm('Are you sure you want to delete this email?')) {
            return;
        }

        try {
            await emailService.deleteEmail(emailId);
            await loadEmails();
            if (onDataChange) onDataChange(); // Trigger dashboard refresh
        } catch (error) {
            console.error('Failed to delete email:', error);
            alert('Failed to delete email: ' + error.message);
        }
    };

    const handleVerifyEmail = async (emailId) => {
        setIsVerifying(prev => ({ ...prev, [emailId]: true }));
        try {
            await emailService.verifyEmail(emailId);
            await loadEmails();
            if (onDataChange) onDataChange(); // Trigger dashboard refresh
            alert('Email verified successfully');
        } catch (error) {
            console.error('Failed to verify email:', error);
            alert('Failed to verify email: ' + error.message);
        } finally {
            setIsVerifying(prev => ({ ...prev, [emailId]: false }));
        }
    };

    const handleEditSave = async (emailId, updatedData) => {
        try {
            await emailService.updateEmail(emailId, updatedData);
            await loadEmails();
            setEditingEmail(null);
            if (onDataChange) onDataChange(); // Trigger dashboard refresh
        } catch (error) {
            console.error('Failed to update email:', error);
            alert('Failed to update email: ' + error.message);
        }
    };

    const getFilteredEmails = () => {
        return emails.filter(email => {
            if (filter === 'all') return true;
            return email.status === filter;
        });
    };

    const getStatusBadge = (email) => {
        const status = email.status || 'draft';
        
        const statusConfig = {
            'draft': {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: 'Draft'
            },
            'verified': {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                label: 'Verified'
            },
            'authorized': {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: 'Authorized'
            },
            'sent': {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Sent'
            },
            'pending': {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: 'Pending'
            }
        };

        const config = statusConfig[status] || statusConfig['draft'];
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
                    <p className="text-gray-600 mt-1">Manage your email campaigns and responses</p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading emails...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
                    <p className="text-gray-600 mt-1">Manage your email campaigns and responses</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                    {isGmailAuthorized ? (
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-default"
                                disabled
                            >
                                ✓ Gmail Authorized
                            </button>
                            <button
                                onClick={handleGmailRevoke}
                                className="px-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Disconnect Gmail"
                            >
                                🔓
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGmailAuthorize}
                            disabled={isAuthorizing}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isAuthorizing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isAuthorizing ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Authorizing Gmail...
                                </div>
                            ) : (
                                '🔒 Authorize Gmail'
                            )}
                        </button>
                    )}
                    <button
                        onClick={loadEmails}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
                {['all', 'draft', 'authorized', 'sent', 'pending'].map((filterOption) => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                            filter === filterOption
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </button>
                ))}
            </div>

            {/* Emails List */}
            <div className="bg-white rounded-lg border border-gray-200">
                {getFilteredEmails().length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="text-6xl mb-4 block">📧</span>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {emails.length === 0 ? 'No emails generated yet' : `No ${filter === 'all' ? '' : filter} emails found`}
                        </h2>
                        <p className="text-gray-600">
                            {emails.length === 0 ? 'Generate your first email campaign to see them here' : 'Try adjusting your filter or generate more emails'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Header */}
                        <div className="p-4 bg-gray-50">
                            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-700">
                                <div className="col-span-2">Contact</div>
                                <div className="col-span-2">Company</div>
                                <div className="col-span-3">Subject</div>
                                <div className="col-span-1">Generated</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-3">Actions</div>
                            </div>
                        </div>

                        {/* Email rows */}
                        {getFilteredEmails().map((email) => (
                            <div key={email.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-2">
                                        <div className="font-medium text-gray-900">{email.recipient_name}</div>
                                        <div className="text-sm text-gray-600">{email.recipient_email}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-sm text-gray-900">{email.recipient_company}</div>
                                        {email.recipient_position && (
                                            <div className="text-xs text-gray-600">{email.recipient_position}</div>
                                        )}
                                    </div>
                                    <div className="col-span-3">
                                        <div className="text-sm text-gray-900 truncate">{email.email_subject}</div>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="text-sm text-gray-600">
                                            {new Date(email.generated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        {getStatusBadge(email)}
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setViewingEmail(email)}
                                                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                                title="View Email"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => setEditingEmail(email)}
                                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded border border-green-200 hover:bg-green-50 transition-colors"
                                                title="Edit Email"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleVerifyEmail(email.id)}
                                                disabled={isVerifying[email.id]}
                                                className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                    isVerifying[email.id]
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : 'text-purple-600 hover:text-purple-800 border-purple-200 hover:bg-purple-50'
                                                }`}
                                                title="Verify Email"
                                            >
                                                {isVerifying[email.id] ? '...' : 'Verify'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmail(email.id)}
                                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                                title="Delete Email"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => handleSendSingleEmail(email.id)}
                                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded border border-green-200 hover:bg-green-50 transition-colors"
                                                title="Send Email"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {viewingEmail && (
                <EmailViewModal
                    email={viewingEmail}
                    onClose={() => setViewingEmail(null)}
                    onEdit={(email) => {
                        setViewingEmail(null);
                        setEditingEmail(email);
                    }}
                />
            )}

            {editingEmail && (
                <EmailEditModal
                    email={editingEmail}
                    onSave={handleEditSave}
                    onClose={() => setEditingEmail(null)}
                />
            )}
        </div>
    );
};

export default EmailManagement;
