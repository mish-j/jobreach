import React from 'react';

const EmailViewModal = ({ email, onClose }) => {
    if (!email) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Email Preview</h2>
                            <p className="text-gray-600 mt-1">Generated on {new Date(email.generated_at).toLocaleDateString()}</p>
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
                    {/* Email Details */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                                <p className="text-gray-900">{email.recipient_name}</p>
                                <p className="text-sm text-gray-600">{email.recipient_email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company:</label>
                                <p className="text-gray-900">{email.recipient_company}</p>
                                {email.recipient_position && (
                                    <p className="text-sm text-gray-600">{email.recipient_position}</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                            <p className="text-gray-900 font-medium">{email.email_subject}</p>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                                {email.email_body}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit email', email.id);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Edit Email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailViewModal;
