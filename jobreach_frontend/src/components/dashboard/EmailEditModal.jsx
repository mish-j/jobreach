import React, { useState } from 'react';

const EmailEditModal = ({ email, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        recipient_name: email.recipient_name || '',
        recipient_email: email.recipient_email || '',
        recipient_company: email.recipient_company || '',
        recipient_position: email.recipient_position || '',
        email_subject: email.email_subject || '',
        email_body: email.email_body || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(email.id, formData);
        } catch (error) {
            console.error('Failed to save email:', error);
            alert('Failed to save email: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!email) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Email</h2>
                            <p className="text-gray-600 mt-1">Make changes to your generated email</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-4">
                        {/* Recipient Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.recipient_name}
                                    onChange={(e) => handleChange('recipient_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.recipient_email}
                                    onChange={(e) => handleChange('recipient_email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.recipient_company}
                                    onChange={(e) => handleChange('recipient_company', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Position
                                </label>
                                <input
                                    type="text"
                                    value={formData.recipient_position}
                                    onChange={(e) => handleChange('recipient_position', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Email Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={formData.email_subject}
                                onChange={(e) => handleChange('email_subject', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Email Body */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Body
                            </label>
                            <textarea
                                value={formData.email_body}
                                onChange={(e) => handleChange('email_body', e.target.value)}
                                rows={12}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Enter your email content here..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailEditModal;
