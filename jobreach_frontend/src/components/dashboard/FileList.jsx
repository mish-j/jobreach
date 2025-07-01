import React from 'react';
import { fileUploadUtils } from '../../utils/fileUtils';

const FileList = ({ files, onDelete, type, isLoading = false }) => {
    const getStatusBadge = (file) => {
        if (type === 'csv') {
            if (file.is_validated) {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Validated
                    </span>
                );
            } else {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ Invalid
                    </span>
                );
            }
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📁</span>
                <p>No files uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <span className="text-2xl">
                                {fileUploadUtils.getFileIcon(file.original_filename)}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{file.original_filename}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>Uploaded: {fileUploadUtils.formatDate(file.uploaded_at)}</span>
                                {getStatusBadge(file)}
                            </div>
                            {type === 'csv' && file.validation_errors && (
                                <div className="mt-1 text-sm text-red-600">
                                    {file.validation_errors}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => window.open(file.file, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View file"
                        >
                            <span className="text-lg">👁️</span>
                        </button>
                        <button
                            onClick={() => onDelete(file.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete file"
                        >
                            <span className="text-lg">🗑️</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FileList;
