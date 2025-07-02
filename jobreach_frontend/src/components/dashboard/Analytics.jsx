import React, { useState, useEffect } from 'react';
import { emailService } from '../../utils/emailService';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        totalEmails: 0,
        emailsByStatus: {
            draft: 0,
            verified: 0,
            sent: 0,
            pending: 0
        },
        recentActivity: [],
        topCompanies: [],
        dailyStats: [],
        successRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setIsLoading(true);
            const emails = await emailService.getGeneratedEmails();
            
            // Calculate analytics from email data
            const calculatedAnalytics = calculateAnalytics(emails);
            setAnalytics(calculatedAnalytics);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateAnalytics = (emails) => {
        const now = new Date();
        const timeRangeMs = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000
        };

        // Filter emails by time range
        const cutoffDate = new Date(now.getTime() - timeRangeMs[timeRange]);
        const filteredEmails = emails.filter(email => 
            new Date(email.generated_at) >= cutoffDate
        );

        // Calculate status distribution
        const emailsByStatus = {
            draft: 0,
            verified: 0,
            sent: 0,
            pending: 0
        };

        filteredEmails.forEach(email => {
            const status = email.status || 'draft';
            emailsByStatus[status] = (emailsByStatus[status] || 0) + 1;
        });

        // Calculate top companies
        const companyCount = {};
        filteredEmails.forEach(email => {
            if (email.recipient_company) {
                companyCount[email.recipient_company] = (companyCount[email.recipient_company] || 0) + 1;
            }
        });

        const topCompanies = Object.entries(companyCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([company, count]) => ({ company, count }));

        // Calculate daily stats for the past 7 days
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const dayEmails = emails.filter(email => {
                const emailDate = new Date(email.generated_at);
                return emailDate >= dayStart && emailDate <= dayEnd;
            });

            dailyStats.push({
                date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                generated: dayEmails.length,
                sent: dayEmails.filter(email => email.status === 'sent').length
            });
        }

        // Calculate success rate
        const totalGenerated = filteredEmails.length;
        const totalSent = emailsByStatus.sent;
        const successRate = totalGenerated > 0 ? ((totalSent / totalGenerated) * 100).toFixed(1) : 0;

        // Recent activity (last 10 emails)
        const recentActivity = emails
            .sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at))
            .slice(0, 10);

        return {
            totalEmails: filteredEmails.length,
            emailsByStatus,
            topCompanies,
            dailyStats,
            successRate,
            recentActivity
        };
    };

    const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`text-3xl`}>{icon}</div>
            </div>
        </div>
    );

    const ProgressBar = ({ label, value, total, color = "blue" }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                            className={`bg-${color}-600 h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <span className="text-sm text-gray-600">{value}</span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">Loading analytics data...</p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">Track your outreach performance and insights</p>
                </div>
                
                {/* Time Range Selector */}
                <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                    {['7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Emails"
                    value={analytics.totalEmails}
                    subtitle="Generated"
                    icon="📧"
                    color="blue"
                />
                <StatCard
                    title="Emails Sent"
                    value={analytics.emailsByStatus.sent}
                    subtitle={`${analytics.successRate}% success rate`}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Verified Emails"
                    value={analytics.emailsByStatus.verified}
                    subtitle="Ready to send"
                    icon="🔍"
                    color="purple"
                />
                <StatCard
                    title="Draft Emails"
                    value={analytics.emailsByStatus.draft}
                    subtitle="Need review"
                    icon="📝"
                    color="gray"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Status Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Status Distribution</h3>
                    <div className="space-y-3">
                        <ProgressBar 
                            label="Draft" 
                            value={analytics.emailsByStatus.draft} 
                            total={analytics.totalEmails}
                            color="gray"
                        />
                        <ProgressBar 
                            label="Verified" 
                            value={analytics.emailsByStatus.verified} 
                            total={analytics.totalEmails}
                            color="purple"
                        />
                        <ProgressBar 
                            label="Sent" 
                            value={analytics.emailsByStatus.sent} 
                            total={analytics.totalEmails}
                            color="green"
                        />
                        <ProgressBar 
                            label="Pending" 
                            value={analytics.emailsByStatus.pending} 
                            total={analytics.totalEmails}
                            color="yellow"
                        />
                    </div>
                </div>

                {/* Top Companies */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Target Companies</h3>
                    <div className="space-y-3">
                        {analytics.topCompanies.length > 0 ? (
                            analytics.topCompanies.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 rounded-full bg-blue-${(index + 1) * 100} text-white text-xs flex items-center justify-center mr-3`}>
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{item.company}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{item.count} emails</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No company data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
                <div className="flex items-end space-x-2 h-40">
                    {analytics.dailyStats.map((day, index) => {
                        const maxValue = Math.max(...analytics.dailyStats.map(d => d.generated));
                        const heightGenerated = maxValue > 0 ? (day.generated / maxValue) * 120 : 0;
                        const heightSent = maxValue > 0 ? (day.sent / maxValue) * 120 : 0;
                        
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="flex items-end space-x-1 mb-2">
                                    <div 
                                        className="w-4 bg-blue-200 rounded-t"
                                        style={{ height: `${heightGenerated}px` }}
                                        title={`Generated: ${day.generated}`}
                                    ></div>
                                    <div 
                                        className="w-4 bg-green-500 rounded-t"
                                        style={{ height: `${heightSent}px` }}
                                        title={`Sent: ${day.sent}`}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-600">{day.date}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center mt-4 space-x-4 text-sm">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
                        <span className="text-gray-600">Generated</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-gray-600">Sent</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Email Activity</h3>
                <div className="space-y-3">
                    {analytics.recentActivity.length > 0 ? (
                        analytics.recentActivity.map((email, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-xs font-medium">
                                            {email.recipient_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{email.recipient_name}</p>
                                        <p className="text-xs text-gray-600">{email.recipient_company}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        email.status === 'sent' ? 'bg-green-100 text-green-800' :
                                        email.status === 'verified' ? 'bg-purple-100 text-purple-800' :
                                        email.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {email.status || 'draft'}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(email.generated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
