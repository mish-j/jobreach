import React, { useState, useRef } from 'react';

const FileUploadZone = ({ 
    onFileSelect, 
    accept, 
    multiple = false, 
    children,
    className = "",
    disabled = false 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            if (multiple) {
                onFileSelect(files);
            } else {
                onFileSelect(files[0]);
            }
        }
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (multiple) {
                onFileSelect(files);
            } else {
                onFileSelect(files[0]);
            }
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div
            className={`
                border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200 hover:border-blue-400 hover:bg-blue-50
                ${isDragging ? 'border-blue-500 bg-blue-100' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled}
            />
            {children}
        </div>
    );
};

export default FileUploadZone;
