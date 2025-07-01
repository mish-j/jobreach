import React from 'react';

const FileStatsCard = ({ title, value, description, icon, bgColor, iconColor }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${bgColor}`}>
                    <span className={`text-xl ${iconColor}`}>{icon}</span>
                </div>
                <div className={`p-2 rounded-full ${bgColor}`}>
                    <span className={`text-xl ${iconColor}`}>📊</span>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
};

export default FileStatsCard;
