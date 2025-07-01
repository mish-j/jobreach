import React, { useState, useEffect } from 'react';
import { emailService } from '../../utils/emailService';

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRecentEmails();
    }, []);

    const loadRecentEmails = async () => {
        try {
            const emails = await emailService.getGeneratedEmails();
            // Get the 5 most recent emails with their actual status
            const recentEmails = emails.slice(0, 5).map(email => ({
                id: email.id,
                name: email.recipient_name,
                company: email.recipient_company,
                position: email.recipient_position || 'N/A',
                status: email.status || 'draft', // Use actual status from backend
                date: new Date(email.generated_at).toLocaleDateString(),
                icon: getActivityIcon(email.status || 'draft')
            }));
            setActivities(recentEmails);
        } catch (error) {
            console.error('Failed to load recent emails:', error);
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getActivityIcon = (status) => {
        const iconMap = {
            'draft': '📝',
            'verified': '✅',
            'authorized': '🔒',
            'sent': '📤',
            'pending': '⏳'
        };
        return iconMap[status] || '📧';
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'draft': {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: 'draft'
            },
            'verified': {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                label: 'verified'
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
            },
            'pending': {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: 'pending'
            }
        };

        const config = statusConfig[status] || statusConfig['draft'];
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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
