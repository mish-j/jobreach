// File upload utilities
export const fileUploadUtils = {
    // File type validation
    validateResumeFile: (file) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            return {
                isValid: false,
                error: 'Please upload a PDF, DOC, or DOCX file'
            };
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return {
                isValid: false,
                error: 'File size must be less than 5MB'
            };
        }
        
        return { isValid: true };
    },

    validateCsvFile: (file) => {
        if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
            return {
                isValid: false,
                error: 'Please upload a CSV file'
            };
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            return {
                isValid: false,
                error: 'CSV file size must be less than 2MB'
            };
        }
        
        return { isValid: true };
    },

    // Format file size for display
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Format date for display
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get file icon based on file type
    getFileIcon: (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'csv':
                return '📊';
            default:
                return '📁';
        }
    }
};
