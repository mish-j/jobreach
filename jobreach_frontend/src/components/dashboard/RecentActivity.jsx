import React from 'react';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            name: 'John Smith',
            company: 'TechCorp Inc.',
            position: 'Senior Software Engineer',
            status: 'draft',
            date: '2025-01-27',
            icon: '📧'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            company: 'Innovate Solutions',
            position: 'Frontend Developer',
            status: 'authorized',
            date: '2025-01-26',
            icon: '📧'
        },
        {
            id: 3,
            name: 'Mike Chen',
            company: 'StartupIO',
            position: 'Full Stack Developer',
            status: 'sent',
            date: '2025-01-25',
            icon: '📧'
        }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'draft': {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: 'draft'
            },
            'authorized': {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: 'authorized'
            },
            'sent': {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'sent'
            }
        };

        const config = statusConfig[status] || statusConfig['draft'];
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-full">
                                <span className="text-blue-600">{activity.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{activity.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {activity.company} - {activity.position}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {getStatusBadge(activity.status)}
                            <span className="text-sm text-gray-500">{activity.date}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">📭</span>
                    <p>No recent activity</p>
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
