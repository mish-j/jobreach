import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import EmailManagement from '../components/dashboard/EmailManagement';
import GenerateEmails from '../components/dashboard/GenerateEmails';
import FileManagement from '../components/dashboard/FileManagement';
import Analytics from '../components/dashboard/Analytics';

const Dashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('dashboard');

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'email-management':
                return <EmailManagement />;
            case 'generate-emails':
                return <GenerateEmails setActiveSection={setActiveSection} />;
            case 'file-management':
                return <FileManagement />;
            case 'analytics':
                return <Analytics />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                user={user}
                onLogout={onLogout}
            />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
