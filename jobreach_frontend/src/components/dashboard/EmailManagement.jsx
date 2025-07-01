import React, { useState, useEffect } from 'react';
import { emailService } from '../../utils/emailService';
import EmailViewModal from './EmailViewModal';
import EmailEditModal from './EmailEditModal';

const EmailManagement = () => {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, sent, draft, pending
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [viewingEmail, setViewingEmail] = useState(null);
    const [editingEmail, setEditingEmail] = useState(null);
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        try {
            const emailData = await emailService.getGeneratedEmails();
            setEmails(emailData);
        } catch (error) {
            console.error('Failed to load emails:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectEmail = (emailId) => {
        setSelectedEmails(prev => 
            prev.includes(emailId) 
                ? prev.filter(id => id !== emailId)
                : [...prev, emailId]
        );
    };

    const handleSelectAll = () => {
        const filteredEmails = getFilteredEmails();
        if (selectedEmails.length === filteredEmails.length) {
            setSelectedEmails([]);
        } else {
            setSelectedEmails(filteredEmails.map(email => email.id));
        }
    };

    const handleAuthorize = async () => {
        if (selectedEmails.length === 0) {
            alert('Please select emails to authorize');
            return;
        }

        setIsAuthorizing(true);
        try {
            // This would be implemented in the backend
            await emailService.authorizeEmails(selectedEmails);
            await loadEmails();
            setSelectedEmails([]);
            alert(`${selectedEmails.length} emails authorized successfully`);
        } catch (error) {
            console.error('Failed to authorize emails:', error);
            alert('Failed to authorize emails: ' + error.message);
        } finally {
            setIsAuthorizing(false);
        }
    };

    const handleSendEmails = async () => {
        if (selectedEmails.length === 0) {
            alert('Please select emails to send');
            return;
        }

        setIsSending(true);
        try {
            // This would be implemented in the backend
            await emailService.sendEmails(selectedEmails);
            await loadEmails();
            setSelectedEmails([]);
            alert(`${selectedEmails.length} emails sent successfully`);
        } catch (error) {
            console.error('Failed to send emails:', error);
            alert('Failed to send emails: ' + error.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteEmail = async (emailId) => {
        if (!window.confirm('Are you sure you want to delete this email?')) {
            return;
        }

        try {
            await emailService.deleteEmail(emailId);
            await loadEmails();
            setSelectedEmails(prev => prev.filter(id => id !== emailId));
        } catch (error) {
            console.error('Failed to delete email:', error);
            alert('Failed to delete email: ' + error.message);
        }
    };

    const handleVerifyEmail = async (emailId) => {
        try {
            await emailService.verifyEmail(emailId);
            await loadEmails();
        } catch (error) {
            console.error('Failed to verify email:', error);
            alert('Failed to verify email: ' + error.message);
        }
    };

    const handleEditSave = async (emailId, updatedData) => {
        try {
            await emailService.updateEmail(emailId, updatedData);
            await loadEmails();
            setEditingEmail(null);
        } catch (error) {
            console.error('Failed to update email:', error);
            alert('Failed to update email: ' + error.message);
        }
    };

    const getFilteredEmails = () => {
        return emails.filter(email => {
            if (filter === 'all') return true;
            // For now, we'll use a default status since the backend doesn't have status field
            const status = 'draft'; // This should come from the email object in real implementation
            return status === filter;
        });
    };

    const getStatusBadge = (email) => {
        // Default status for now - this should come from the email object
        const status = 'draft';
        
        const statusConfig = {
            'draft': {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: 'Draft'
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
                    <button
                        onClick={handleAuthorize}
                        disabled={selectedEmails.length === 0 || isAuthorizing}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedEmails.length === 0 || isAuthorizing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isAuthorizing ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Authorizing...
                            </div>
                        ) : (
                            `✓ Authorize (${selectedEmails.length})`
                        )}
                    </button>
                    
                    <button
                        onClick={handleSendEmails}
                        disabled={selectedEmails.length === 0 || isSending}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedEmails.length === 0 || isSending
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {isSending ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                            </div>
                        ) : (
                            `📧 Send (${selectedEmails.length})`
                        )}
                    </button>
                    
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
                {emails.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="text-6xl mb-4 block">�</span>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No emails generated yet</h2>
                        <p className="text-gray-600">Generate your first email campaign to see them here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Header */}
                        <div className="p-4 bg-gray-50">
                            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-700">
                                <div className="col-span-3">Contact</div>
                                <div className="col-span-2">Company</div>
                                <div className="col-span-3">Subject</div>
                                <div className="col-span-2">Generated</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1">Actions</div>
                            </div>
                        </div>

                        {/* Email rows */}
                        {emails.map((email) => (
                            <div key={email.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-3">
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
                                    <div className="col-span-2">
                                        <div className="text-sm text-gray-600">
                                            {new Date(email.generated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        {getStatusBadge(email)}
                                    </div>
                                    <div className="col-span-1">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailManagement;
