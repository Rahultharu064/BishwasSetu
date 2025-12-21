import  { useState } from 'react';
import { Save, Mail, Shield, Database, Bell } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
const Settings = () => {
    const [settings, setSettings] = useState({
        // Email Settings
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@bishwasSetu.com',
        fromName: 'BishwasSetu',

        // Security Settings
        sessionTimeout: '24',
        maxLoginAttempts: '5',
        passwordMinLength: '8',
        requireSpecialChars: true,
        requireNumbers: true,
        twoFactorAuth: false,

        // Platform Settings
        platformName: 'BishwasSetu',
        platformUrl: 'https://bishwassetu.com',
        supportEmail: 'support@bishwassetu.com',
        maintenanceMode: false,

        // Notification Settings
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        bookingReminders: true,
        providerAlerts: true,
        adminAlerts: true
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleInputChange = (field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Implement save logic
        console.log('Saving settings:', settings);
        // Show success message
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Database },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-gray-600 mt-1">Configure platform-wide settings and preferences</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Platform Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={settings.platformName}
                                        onChange={(e) => handleInputChange('platformName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Platform URL
                                    </label>
                                    <Input
                                        type="url"
                                        value={settings.platformUrl}
                                        onChange={(e) => handleInputChange('platformUrl', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Support Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <Input
                                        type="checkbox"
                                        id="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                                        Maintenance Mode
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Email Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SMTP Host
                                    </label>
                                    <Input
                                        type="text"
                                        value={settings.smtpHost}
                                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SMTP Port
                                    </label>
                                    <Input
                                        type="number"
                                        value={settings.smtpPort}
                                        onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SMTP Username
                                    </label>
                                    <Input
                                        type="text"
                                        value={settings.smtpUser}
                                        onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SMTP Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={settings.smtpPassword}
                                        onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={settings.fromEmail}
                                        onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={settings.fromName}
                                        onChange={(e) => handleInputChange('fromName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Timeout (hours)
                                    </label>
                                    <Input
                                        type="number"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Login Attempts
                                    </label>
                                    <Input
                                        type="number"
                                        value={settings.maxLoginAttempts}
                                        onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Password Length
                                    </label>
                                    <Input
                                        type="number"
                                        value={settings.passwordMinLength}
                                        onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Input
                                            type="checkbox"
                                            id="requireSpecialChars"
                                            checked={settings.requireSpecialChars}
                                            onChange={(e) => handleInputChange('requireSpecialChars', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-900">
                                            Require special characters
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <Input
                                            type="checkbox"
                                            id="requireNumbers"
                                            checked={settings.requireNumbers}
                                            onChange={(e) => handleInputChange('requireNumbers', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-900">
                                            Require numbers
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <Input
                                            type="checkbox"
                                            id="twoFactorAuth"
                                            checked={settings.twoFactorAuth}
                                            onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-900">
                                            Enable two-factor authentication
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                                        <p className="text-sm text-gray-500">Send notifications via email</p>
                                    </div>
                                    <Input
                                        type="checkbox"
                                        checked={settings.emailNotifications}
                                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                                        <p className="text-sm text-gray-500">Send push notifications to users</p>
                                    </div>
                                    <Input
                                        type="checkbox"
                                        checked={settings.pushNotifications}
                                        onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                                        <p className="text-sm text-gray-500">Send notifications via SMS</p>
                                    </div>
                                    <Input
                                        type="checkbox"
                                        checked={settings.smsNotifications}
                                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Booking Reminders</h3>
                                        <p className="text-sm text-gray-500">Send booking reminders to customers</p>
                                    </div>
                                    <Input
                                        type="checkbox"
                                        checked={settings.bookingReminders}
                                        onChange={(e) => handleInputChange('bookingReminders', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Provider Alerts</h3>
                                        <p className="text-sm text-gray-500">Send alerts to service providers</p>
                                    </div>
                                    <Input
                                        type="checkbox"
                                        checked={settings.providerAlerts}
                                        onChange={(e) => handleInputChange('providerAlerts', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Admin Alerts</h3>
                                        <p className="text-sm text-gray-500">Send critical alerts to administrators</p>
                                    </div>
                                    <Input
                                        type="checkbox"
                                        checked={settings.adminAlerts}
                                        onChange={(e) => handleInputChange('adminAlerts', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save size={16} />
                            Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
