import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    Cog6ToothIcon,
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    KeyIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface PreferencesType {
    theme: 'dark' | 'light';
    defaultView: 'grid' | 'table';
    itemsPerPage: number;
    timezone: string;
    language: string;
    emailNotifications: boolean;
    newLeadAlerts: boolean;
    campaignUpdates: boolean;
    weeklyReport: boolean;
}

const Settings: React.FC = () => {
    const { user, setUser } = useAuthStore();
    // const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences' | 'danger'>('profile');
    
    // Profile state
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
    });

    // Security state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Preferences state
    const [preferences, setPreferences] = useState<PreferencesType>({
        theme: 'dark',
        defaultView: 'grid',
        itemsPerPage: 20,
        timezone: 'UTC',
        language: 'en',
        emailNotifications: true,
        newLeadAlerts: true,
        campaignUpdates: false,
        weeklyReport: true,
    });

    // Load preferences from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
            setPreferences(JSON.parse(saved));
        }
    }, []);

    // Fetch current user data
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: api.getMe,
        enabled: !!user,
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (_data: typeof profileData) => {
            // Replace with actual API call when available
            return new Promise((resolve) => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            toast.success('Profile updated successfully');
            if (currentUser) {
                setUser({ ...currentUser, ...profileData });
            }
        },
        onError: () => {
            toast.error('Failed to update profile');
        },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (_data: typeof passwordData) => {
            // Replace with actual API call when available
            return new Promise((resolve) => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: () => {
            toast.error('Failed to update password');
        },
    });

    const handleSaveProfile = () => {
        if (!profileData.full_name.trim()) {
            toast.error('Full name is required');
            return;
        }
        if (!profileData.email.trim()) {
            toast.error('Email is required');
            return;
        }
        updateProfileMutation.mutate(profileData);
    };

    const handleChangePassword = () => {
        if (!passwordData.currentPassword) {
            toast.error('Current password is required');
            return;
        }
        if (!passwordData.newPassword) {
            toast.error('New password is required');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        toast.success('Preferences saved successfully');
    };

    const handleExportData = () => {
        toast.success('Your data export has been initiated. You will receive an email shortly.');
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            toast.error('Account deletion feature is not yet implemented');
        }
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: UserCircleIcon },
        { id: 'security' as const, label: 'Security', icon: ShieldCheckIcon },
        { id: 'preferences' as const, label: 'Preferences', icon: PaintBrushIcon },
        { id: 'notifications' as const, label: 'Notifications', icon: BellIcon },
        { id: 'danger' as const, label: 'Danger Zone', icon: TrashIcon },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center">
                        <Cog6ToothIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="truncate">Settings</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-400">Manage your account settings and preferences</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Sidebar - Tabs on mobile become horizontal scroll */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    {/* Mobile: Horizontal scroll */}
                    <div className="lg:hidden overflow-x-auto pb-2 mb-4">
                        <div className="flex gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        <span className="text-sm">{tab.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop: Vertical list */}
                    <div className="hidden lg:block bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 shadow-xl border border-gray-700 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                                            : 'text-gray-400 hover:bg-gray-700/50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {tab.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3"
                >
                    <AnimatePresence mode="wait">
                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                                    <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500" />
                                    Profile Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.full_name}
                                            onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {currentUser ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Role</label>
                                                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white capitalize">
                                                    {currentUser.role || 'User'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Status</label>
                                                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white flex items-center">
                                                    {currentUser.is_active ? (
                                                        <>
                                                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircleIcon className="w-4 h-4 text-red-400 mr-2" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveProfile}
                                        disabled={updateProfileMutation.isPending}
                                        className="w-full sm:w-auto mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                                    <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500" />
                                    Security Settings
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">New Password</label>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Enter new password (min 8 characters)"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500">
                                            Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                                        </p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleChangePassword}
                                        disabled={changePasswordMutation.isPending}
                                        className="w-full sm:w-auto mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* PREFERENCES TAB */}
                        {activeTab === 'preferences' && (
                            <motion.div
                                key="preferences"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                                    <PaintBrushIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500" />
                                    Preferences
                                </h2>
                                <div className="space-y-6">
                                    {/* Theme */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-3">Theme</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    preferences.theme === 'dark'
                                                        ? 'border-indigo-500 bg-indigo-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="w-full h-16 bg-gray-900 rounded-lg mb-2"></div>
                                                    <p className="text-sm text-white font-medium">Dark</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    preferences.theme === 'light'
                                                        ? 'border-indigo-500 bg-indigo-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="w-full h-16 bg-white rounded-lg mb-2"></div>
                                                    <p className="text-sm text-white font-medium">Light</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Default View */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-3">Default View</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setPreferences({ ...preferences, defaultView: 'grid' })}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    preferences.defaultView === 'grid'
                                                        ? 'border-indigo-500 bg-indigo-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="grid grid-cols-2 gap-1 mb-2">
                                                        <div className="w-full h-6 bg-gray-600 rounded"></div>
                                                        <div className="w-full h-6 bg-gray-600 rounded"></div>
                                                        <div className="w-full h-6 bg-gray-600 rounded"></div>
                                                        <div className="w-full h-6 bg-gray-600 rounded"></div>
                                                    </div>
                                                    <p className="text-sm text-white font-medium">Grid</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setPreferences({ ...preferences, defaultView: 'table' })}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    preferences.defaultView === 'table'
                                                        ? 'border-indigo-500 bg-indigo-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="space-y-1 mb-2">
                                                        <div className="w-full h-2 bg-gray-600 rounded"></div>
                                                        <div className="w-full h-2 bg-gray-600 rounded"></div>
                                                        <div className="w-full h-2 bg-gray-600 rounded"></div>
                                                        <div className="w-full h-2 bg-gray-600 rounded"></div>
                                                    </div>
                                                    <p className="text-sm text-white font-medium">Table</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items Per Page */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Items Per Page</label>
                                        <select
                                            value={preferences.itemsPerPage}
                                            onChange={(e) => setPreferences({ ...preferences, itemsPerPage: Number(e.target.value) })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value={10}>10 items</option>
                                            <option value={20}>20 items</option>
                                            <option value={50}>50 items</option>
                                            <option value={100}>100 items</option>
                                        </select>
                                    </div>

                                    {/* Timezone */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                            <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                                            Timezone
                                        </label>
                                        <select
                                            value={preferences.timezone}
                                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                                            <option value="America/New_York">EST (Eastern Standard Time)</option>
                                            <option value="America/Chicago">CST (Central Standard Time)</option>
                                            <option value="America/Denver">MST (Mountain Standard Time)</option>
                                            <option value="America/Los_Angeles">PST (Pacific Standard Time)</option>
                                            <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                                            <option value="Europe/Paris">CET (Central European Time)</option>
                                            <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
                                            <option value="Australia/Sydney">AEST (Australian Eastern Standard Time)</option>
                                        </select>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Language</label>
                                        <select
                                            value={preferences.language}
                                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español (Spanish)</option>
                                            <option value="fr">Français (French)</option>
                                            <option value="de">Deutsch (German)</option>
                                            <option value="zh">中文 (Chinese)</option>
                                            <option value="ja">日本語 (Japanese)</option>
                                        </select>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSavePreferences}
                                        className="w-full sm:w-auto mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                                    >
                                        Save Preferences
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                                    <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500" />
                                    Notification Preferences
                                </h2>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="text-sm sm:text-base text-white font-medium">Email Notifications</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Receive email updates about your leads</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.emailNotifications}
                                                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="text-sm sm:text-base text-white font-medium">New Lead Alerts</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Get notified when new leads are generated</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.newLeadAlerts}
                                                onChange={(e) => setPreferences({ ...preferences, newLeadAlerts: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="text-sm sm:text-base text-white font-medium">Campaign Updates</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Receive updates about your campaigns</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.campaignUpdates}
                                                onChange={(e) => setPreferences({ ...preferences, campaignUpdates: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="text-sm sm:text-base text-white font-medium">Weekly Report</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Get a weekly summary of your activity</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.weeklyReport}
                                                onChange={(e) => setPreferences({ ...preferences, weeklyReport: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSavePreferences}
                                        className="w-full sm:w-auto mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                                    >
                                        Save Notification Settings
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* DANGER ZONE TAB */}
                        {activeTab === 'danger' && (
                            <motion.div
                                key="danger"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-red-900/50"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                                    <TrashIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-500" />
                                    Danger Zone
                                </h2>
                                <div className="space-y-4">
                                    {/* Export Data */}
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg text-white font-semibold mb-2 flex items-center">
                                                    <ArrowDownTrayIcon className="w-5 h-5 mr-2 text-yellow-400" />
                                                    Export Your Data
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-400">
                                                    Download a copy of all your data including leads, campaigns, and settings.
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleExportData}
                                            className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-all text-sm sm:text-base"
                                        >
                                            Export Data
                                        </motion.button>
                                    </div>

                                    {/* Delete Account */}
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg text-white font-semibold mb-2 flex items-center">
                                                    <TrashIcon className="w-5 h-5 mr-2 text-red-400" />
                                                    Delete Account
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                                                    Permanently delete your account and all associated data. This action cannot be undone.
                                                </p>
                                                <p className="text-xs text-red-400 font-medium">
                                                    ⚠️ Warning: This will delete all your leads, campaigns, and settings permanently.
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDeleteAccount}
                                            className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all text-sm sm:text-base"
                                        >
                                            Delete My Account
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
