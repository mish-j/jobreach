import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import StatsCard from './StatsCard';
import FileStatsCard from './FileStatsCard';
import RecentActivity from './RecentActivity';
import { fileService } from '../../utils/fileService';
import { emailService } from '../../utils/emailService';

const DashboardOverview = forwardRef((props, ref) => {
    const [stats, setStats] = useState({
        totalEmails: 0,
        sentEmails: 0,
        responseRate: '0%',
        pendingAuth: 0,
        resumeFiles: 0,
        csvFiles: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [resumes, csvs, emails] = await Promise.all([
                fileService.getResumes(),
                fileService.getCsvFiles(),
                emailService.getGeneratedEmails()
            ]);

            // Calculate email statistics
            const totalEmails = emails.length;
            const sentEmails = emails.filter(email => email.status === 'sent').length;
            const authorizedEmails = emails.filter(email => email.status === 'authorized').length;
            const verifiedEmails = emails.filter(email => email.status === 'verified').length;
            const pendingAuth = emails.filter(email => email.status === 'draft').length;

            setStats(prevStats => ({
                ...prevStats,
                resumeFiles: resumes.length,
                csvFiles: csvs.length,
                totalEmails,
                sentEmails,
                pendingAuth,
                responseRate: sentEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) + '%' : '0%'
            }));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Expose refresh method to parent component
    useImperativeHandle(ref, () => ({
        refreshData: loadDashboardData
    }));

    const statsCards = [
        {
            title: 'Total Emails',
            value: stats.totalEmails.toString(),
            icon: '📧',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Sent Emails',
            value: stats.sentEmails.toString(),
            icon: '✈️',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Response Rate',
            value: stats.responseRate,
            icon: '📊',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Pending Auth',
            value: stats.pendingAuth.toString(),
            icon: '⏰',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
        }
    ];

    const fileStats = [
        {
            title: 'Resume Files',
            value: stats.resumeFiles.toString(),
            description: 'Total uploaded resumes',
            icon: '📄',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'CSV Files',
            value: stats.csvFiles.toString(),
            description: 'Total contact lists',
            icon: '📊',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 mt-1">Last updated: 7/1/2025</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                                </div>
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    statsCards.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))
                )}
            </div>

            {/* File Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    fileStats.map((stat, index) => (
                        <FileStatsCard key={index} {...stat} />
                    ))
                )}
            </div>

            {/* Recent Activity */}
            <RecentActivity />
        </div>
    );
});

export default DashboardOverview;
