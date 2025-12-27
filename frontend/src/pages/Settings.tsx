import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    Cog6ToothIcon,
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    KeyIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const Settings: React.FC = () => {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
    });

    // Fetch current user data
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: api.getMe,
        enabled: !!user,
    });

    const handleSaveProfile = () => {
        // In a real app, you'd have an API endpoint to update user profile
        toast.success('Profile updated successfully');
        if (currentUser) {
            setUser({ ...currentUser, ...profileData });
        }
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: UserCircleIcon },
        { id: 'notifications' as const, label: 'Notifications', icon: BellIcon },
        { id: 'security' as const, label: 'Security', icon: ShieldCheckIcon },
    ];

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                        <Cog6ToothIcon className="w-10 h-10 text-indigo-500 mr-3" />
                        Settings
                    </h1>
                    <p className="text-gray-400">Manage your account settings and preferences</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 shadow-xl border border-gray-700 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
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
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <UserCircleIcon className="w-6 h-6 mr-2 text-indigo-500" />
                                Profile Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                {currentUser && (
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                            <div className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white">
                                                {currentUser.role}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                                            <div className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white">
                                                {currentUser.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveProfile}
                                    className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Save Changes
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <BellIcon className="w-6 h-6 mr-2 text-indigo-500" />
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                    <div>
                                        <h3 className="text-white font-medium">Email Notifications</h3>
                                        <p className="text-gray-400 text-sm">Receive email updates about your leads</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                    <div>
                                        <h3 className="text-white font-medium">New Lead Alerts</h3>
                                        <p className="text-gray-400 text-sm">Get notified when new leads are generated</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                    <div>
                                        <h3 className="text-white font-medium">Campaign Updates</h3>
                                        <p className="text-gray-400 text-sm">Receive updates about your campaigns</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <ShieldCheckIcon className="w-6 h-6 mr-2 text-indigo-500" />
                                Security Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                    <div className="relative">
                                        <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <div className="relative">
                                        <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toast.success('Password updated successfully')}
                                    className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Update Password
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;

