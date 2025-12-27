import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    RocketLaunchIcon,
    FireIcon,
    UserGroupIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import type { Campaign, CreateCampaignData } from '@/types';

const Campaigns: React.FC = () => {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState<CreateCampaignData>({
        name: '',
        search_query: '',
    });

    // Fetch campaigns
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: api.getCampaigns,
    });

    // Create campaign mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateCampaignData) => api.createCampaign(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign created successfully');
            setShowCreateModal(false);
            setNewCampaign({ name: '', search_query: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create campaign');
        },
    });

    const handleCreate = () => {
        if (!newCampaign.name || !newCampaign.search_query) {
            toast.error('Please fill in all fields');
            return;
        }
        createMutation.mutate(newCampaign);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'paused':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'completed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

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
                        <RocketLaunchIcon className="w-10 h-10 text-indigo-500 mr-3" />
                        Campaigns
                    </h1>
                    <p className="text-gray-400">Manage your lead generation campaigns</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Campaign
                </motion.button>
            </motion.div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700 w-full max-w-md"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">Create New Campaign</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Name</label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., Restaurants in NYC"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Search Query</label>
                                <input
                                    type="text"
                                    value={newCampaign.search_query}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, search_query: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., restaurants near me"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewCampaign({ name: '', search_query: '' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreate}
                                    disabled={createMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Campaigns Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns && campaigns.length > 0 ? (
                        campaigns.map((campaign: Campaign, index: number) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-indigo-500 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3>
                                        <p className="text-sm text-gray-400">{campaign.search_query}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(campaign.status)}`}>
                                        {campaign.status || 'active'}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <UserGroupIcon className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Total Leads</span>
                                        </div>
                                        <span className="text-white font-semibold">{campaign.total_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            <span className="text-sm">New Leads</span>
                                        </div>
                                        <span className="text-white font-semibold">{campaign.new_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <FireIcon className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Hot Leads</span>
                                        </div>
                                        <span className="text-white font-semibold">{campaign.hot_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <ChartBarIcon className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Duplicates</span>
                                        </div>
                                        <span className="text-white font-semibold">{campaign.duplicate_leads || 0}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-700">
                                    <div className="text-xs text-gray-400">
                                        Created {new Date(campaign.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="text-gray-400 mb-4">No campaigns found</div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold"
                            >
                                Create Your First Campaign
                            </motion.button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Campaigns;

