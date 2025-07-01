import React from 'react';

const StatsCard = ({ title, value, icon, bgColor, iconColor }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${bgColor}`}>
                    <span className={`text-2xl ${iconColor}`}>{icon}</span>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
