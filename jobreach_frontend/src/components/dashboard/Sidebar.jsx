import React from 'react';

const Sidebar = ({ activeSection, setActiveSection, user, onLogout }) => {
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            isActive: activeSection === 'dashboard'
        },
        {
            id: 'email-management',
            label: 'Email Management',
            icon: '✉️',
            isActive: activeSection === 'email-management'
        },
        {
            id: 'generate-emails',
            label: 'Generate Emails',
            icon: '➕',
            isActive: activeSection === 'generate-emails'
        },
        {
            id: 'file-management',
            label: 'File Management',
            icon: '📁',
            isActive: activeSection === 'file-management'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: '📈',
            isActive: activeSection === 'analytics'
        }
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="text-xl font-bold text-gray-800">
                    <div>JOB</div>
                    <div>REACH</div>
                </div>
                {user && (
                    <div className="mt-3 text-sm text-gray-600">
                        Welcome, {user.full_name || user.username}
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                                    item.isActive
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-lg mr-3">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <span className="text-lg mr-3">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
