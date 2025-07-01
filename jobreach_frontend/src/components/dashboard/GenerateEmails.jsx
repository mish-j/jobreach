import React, { useState, useEffect } from 'react';
import { fileService } from '../../utils/fileService';
import { emailService } from '../../utils/emailService';

const GenerateEmails = ({ setActiveSection }) => {
    const [resumes, setResumes] = useState([]);
    const [csvFiles, setCsvFiles] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [selectedCsv, setSelectedCsv] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationResult, setGenerationResult] = useState(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setIsLoading(true);
        try {
            const [resumeData, csvData] = await Promise.all([
                fileService.getResumes(),
                fileService.getCsvFiles()
            ]);
            setResumes(resumeData);
            setCsvFiles(csvData.filter(csv => csv.is_validated)); // Only show validated CSVs
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateEmails = async () => {
        if (!selectedResume || !selectedCsv) {
            alert('Please select both a resume and a contact list.');
            return;
        }

        setIsGenerating(true);
        setGenerationResult(null);

        try {
            const result = await emailService.generateEmails(
                parseInt(selectedResume),
                parseInt(selectedCsv)
            );
            setGenerationResult(result);
        } catch (error) {
            console.error('Failed to generate emails:', error);
            alert(`Failed to generate emails: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const goToFileManagement = () => {
        if (setActiveSection) {
            setActiveSection('file-management');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Generate AI Emails</h1>
                <p className="text-gray-600 mt-1">Select your resume and contact list to generate personalized emails</p>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <span className="text-2xl">➕</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Email Campaign</h2>
                    <p className="text-gray-600">Select your resume and contact list to generate personalized emails</p>
                </div>

                {/* Form Fields */}
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Resume Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Resume
                        </label>
                        <select
                            value={selectedResume}
                            onChange={(e) => setSelectedResume(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading || isGenerating}
                        >
                            <option value="">Choose a resume...</option>
                            {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>
                                    {resume.name || `Resume ${resume.id}`}
                                </option>
                            ))}
                        </select>
                        {resumes.length === 0 && !isLoading && (
                            <p className="text-sm text-gray-500 mt-1">
                                No resumes uploaded. Go to File Management to upload resumes.
                            </p>
                        )}
                    </div>

                    {/* Contact List Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Contact List (CSV)
                        </label>
                        <select
                            value={selectedCsv}
                            onChange={(e) => setSelectedCsv(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading || isGenerating}
                        >
                            <option value="">Choose a CSV file...</option>
                            {csvFiles.map((csv) => (
                                <option key={csv.id} value={csv.id}>
                                    {csv.name || `Contact List ${csv.id}`}
                                </option>
                            ))}
                        </select>
                        {csvFiles.length === 0 && !isLoading && (
                            <p className="text-sm text-gray-500 mt-1">
                                No CSV files uploaded. Go to File Management to upload contact lists.
                            </p>
                        )}
                    </div>

                    {/* Generate Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleGenerateEmails}
                            disabled={isGenerating || !selectedResume || !selectedCsv}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                                isGenerating || !selectedResume || !selectedCsv
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Generating AI Emails...
                                </div>
                            ) : (
                                '➕ Generate AI Emails'
                            )}
                        </button>
                    </div>
                </div>

                {/* Need to upload files section */}
                {(resumes.length === 0 || csvFiles.length === 0) && !isLoading && (
                    <div className="text-center mt-8 pt-8 border-t border-gray-200">
                        <p className="text-gray-600 mb-4">Need to upload files?</p>
                        <button
                            onClick={goToFileManagement}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Go to File Management →
                        </button>
                    </div>
                )}
            </div>

            {/* Generation Result */}
            {generationResult && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Complete!</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <span className="text-green-600 text-xl mr-3">✅</span>
                            <div>
                                <p className="font-medium text-green-900">{generationResult.message}</p>
                                <div className="text-sm text-green-700 mt-1">
                                    <p>Total contacts: {generationResult.total_contacts}</p>
                                    <p>Successful generations: {generationResult.successful_generations}</p>
                                    {generationResult.failed_generations > 0 && (
                                        <p>Failed generations: {generationResult.failed_generations}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveSection && setActiveSection('email-management')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            View Generated Emails
                        </button>
                        <button
                            onClick={() => setGenerationResult(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Generate More
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateEmails;
