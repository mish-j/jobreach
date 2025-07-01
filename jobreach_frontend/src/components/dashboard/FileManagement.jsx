import React, { useState, useEffect } from 'react';
import FileUploadZone from './FileUploadZone';
import FileList from './FileList';
import { fileService } from '../../utils/fileService';
import { fileUploadUtils } from '../../utils/fileUtils';

const FileManagement = () => {
    const [resumeFiles, setResumeFiles] = useState([]);
    const [csvFiles, setCsvFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);
    const [isLoadingCsvs, setIsLoadingCsvs] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const [resumes, csvs] = await Promise.all([
                fileService.getResumes(),
                fileService.getCsvFiles()
            ]);
            setResumeFiles(resumes);
            setCsvFiles(csvs);
        } catch (error) {
            showNotification('Failed to load files', 'error');
        } finally {
            setIsLoadingResumes(false);
            setIsLoadingCsvs(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleResumeUpload = async (file) => {
        // Validate file
        const validation = fileUploadUtils.validateResumeFile(file);
        if (!validation.isValid) {
            showNotification(validation.error, 'error');
            return;
        }

        setIsUploading(true);
        setUploadProgress({ type: 'resume', filename: file.name });

        try {
            const response = await fileService.uploadResume(file);
            setResumeFiles(prev => [...prev, response.resume]);
            showNotification('Resume uploaded successfully!');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleCsvUpload = async (file) => {
        // Validate file
        const validation = fileUploadUtils.validateCsvFile(file);
        if (!validation.isValid) {
            showNotification(validation.error, 'error');
            return;
        }

        setIsUploading(true);
        setUploadProgress({ type: 'csv', filename: file.name });

        try {
            const response = await fileService.uploadCsv(file);
            setCsvFiles(prev => [...prev, response.contact_list]);
            
            if (response.validation_result && !response.validation_result.is_valid) {
                showNotification(
                    `CSV uploaded but has validation errors: ${response.validation_result.errors}`,
                    'warning'
                );
            } else {
                showNotification('CSV uploaded and validated successfully!');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleDeleteResume = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;

        try {
            await fileService.deleteResume(id);
            setResumeFiles(prev => prev.filter(file => file.id !== id));
            showNotification('Resume deleted successfully');
        } catch (error) {
            showNotification('Failed to delete resume', 'error');
        }
    };

    const handleDeleteCsv = async (id) => {
        if (!window.confirm('Are you sure you want to delete this CSV file?')) return;

        try {
            await fileService.deleteCsv(id);
            setCsvFiles(prev => prev.filter(file => file.id !== id));
            showNotification('CSV file deleted successfully');
        } catch (error) {
            showNotification('Failed to delete CSV file', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
                <p className="text-gray-600 mt-1">Upload and manage your resumes and contact lists</p>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`p-4 rounded-lg ${
                    notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                    notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                    'bg-green-50 text-green-800 border border-green-200'
                }`}>
                    <div className="flex justify-between items-center">
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-lg hover:opacity-70"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-blue-800">
                            Uploading {uploadProgress.type}: {uploadProgress.filename}...
                        </span>
                    </div>
                </div>
            )}

            {/* Resume Files Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <span className="text-2xl mr-2">📄</span>
                            Resume Files
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload your resume in PDF, DOC, or DOCX format (max 5MB)
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {resumeFiles.length} file{resumeFiles.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <FileUploadZone
                    onFileSelect={handleResumeUpload}
                    accept=".pdf,.doc,.docx"
                    disabled={isUploading}
                    className="mb-6"
                >
                    <div className="text-center">
                        <span className="text-4xl mb-3 block">�</span>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                            Drop your resume here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                            Supports PDF, DOC, DOCX files up to 5MB
                        </p>
                    </div>
                </FileUploadZone>

                <FileList
                    files={resumeFiles}
                    onDelete={handleDeleteResume}
                    type="resume"
                    isLoading={isLoadingResumes}
                />
            </div>

            {/* CSV Files Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <span className="text-2xl mr-2">📊</span>
                            CSV Contact Lists
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload contact lists in CSV format (max 2MB)
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {csvFiles.length} file{csvFiles.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <FileUploadZone
                    onFileSelect={handleCsvUpload}
                    accept=".csv"
                    disabled={isUploading}
                    className="mb-6"
                >
                    <div className="text-center">
                        <span className="text-4xl mb-3 block">📊</span>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                            Drop your CSV file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                            CSV files up to 2MB with required columns: Name, Email, Company
                        </p>
                    </div>
                </FileUploadZone>

                <FileList
                    files={csvFiles}
                    onDelete={handleDeleteCsv}
                    type="csv"
                    isLoading={isLoadingCsvs}
                />
            </div>

            {/* File Upload Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <span className="text-xl mr-2">💡</span>
                    File Upload Guidelines
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">Resume Files</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Supported formats: PDF, DOC, DOCX</li>
                            <li>• Maximum file size: 5MB</li>
                            <li>• Use clear, professional formatting</li>
                            <li>• Include contact information and work experience</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">CSV Contact Lists</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Required columns: Name, Email, Company</li>
                            <li>• Optional columns: Position, Phone</li>
                            <li>• Maximum file size: 2MB</li>
                            <li>• Ensure email addresses are valid</li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-100 rounded border">
                    <h5 className="font-medium text-blue-800 mb-1">CSV Format Example:</h5>
                    <code className="text-xs text-blue-700 block">
                        Name,Email,Company,Position<br/>
                        John Smith,john@company.com,TechCorp,Software Engineer<br/>
                        Jane Doe,jane@startup.io,StartupIO,Product Manager
                    </code>
                </div>
            </div>
        </div>
    );
};

export default FileManagement;
