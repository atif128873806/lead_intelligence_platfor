import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    RocketLaunchIcon,
    FireIcon,
    UserGroupIcon,
    ChartBarIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    PauseIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import type { Campaign, CreateCampaignData } from '@/types';

const Campaigns: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [newCampaign, setNewCampaign] = useState<CreateCampaignData>({
        name: '',
        search_query: '',
    });

    // Fetch campaigns
    const { data: campaigns, isLoading, refetch } = useQuery({
        queryKey: ['campaigns'],
        queryFn: api.getCampaigns,
    });

    // Create campaign mutation
const createMutation = useMutation({
  mutationFn: (data: CreateCampaignData) => api.createCampaign(data),
  onSuccess: async (newCampaign) => {
    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    
    // Wait 300ms then refetch
    setTimeout(async () => {
      await refetch();
    }, 300);
    
    toast.success('Campaign created successfully');
    setShowCreateModal(false);
    setNewCampaign({ name: '', search_query: '' });
  },
});

    // Update campaign mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Campaign> }) => 
            api.updateCampaign(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign updated successfully');
            setShowEditModal(false);
            setEditingCampaign(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update campaign');
        },
    });

    // Delete campaign mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete campaign');
        },
    });

    const handleCreate = () => {
        if (!newCampaign.name.trim()) {
            toast.error('Campaign name is required');
            return;
        }
        if (!newCampaign.search_query.trim()) {
            toast.error('Search query is required');
            return;
        }
        createMutation.mutate(newCampaign);
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        if (!editingCampaign) return;
        if (!editingCampaign.name.trim()) {
            toast.error('Campaign name is required');
            return;
        }
        updateMutation.mutate({
            id: editingCampaign.id,
            data: {
                name: editingCampaign.name,
                search_query: editingCampaign.search_query,
                status: editingCampaign.status,
            },
        });
    };

    const handleDelete = (campaign: Campaign) => {
        if (window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
            deleteMutation.mutate(campaign.id);
        }
    };

    const handleStatusChange = (campaign: Campaign, newStatus: Campaign['status']) => {
        updateMutation.mutate({
            id: campaign.id,
            data: { status: newStatus },
        });
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

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'active':
                return <PlayIcon className="w-4 h-4" />;
            case 'paused':
                return <PauseIcon className="w-4 h-4" />;
            case 'completed':
                return <CheckCircleIcon className="w-4 h-4" />;
            default:
                return <PlayIcon className="w-4 h-4" />;
        }
    };

    // Filter campaigns
    const filteredCampaigns = campaigns?.filter((campaign: Campaign) => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            campaign.search_query?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: campaigns?.length || 0,
        active: campaigns?.filter((c: Campaign) => c.status === 'active').length || 0,
        paused: campaigns?.filter((c: Campaign) => c.status === 'paused').length || 0,
        completed: campaigns?.filter((c: Campaign) => c.status === 'completed').length || 0,
        totalLeads: campaigns?.reduce((sum: number, c: Campaign) => sum + (c.total_leads || 0), 0) || 0,
        hotLeads: campaigns?.reduce((sum: number, c: Campaign) => sum + (c.hot_leads || 0), 0) || 0,
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center">
                        <RocketLaunchIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="truncate">Campaigns</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-400">{stats.total} total campaigns</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-sm sm:text-base"
                >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    New Campaign
                </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <p className="text-xs sm:text-sm text-gray-400">Active</p>
                        <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.active}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <p className="text-xs sm:text-sm text-gray-400">Paused</p>
                        <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.paused}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <p className="text-xs sm:text-sm text-gray-400">Total Leads</p>
                        <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalLeads}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <p className="text-xs sm:text-sm text-gray-400">Hot Leads</p>
                        <FireIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.hotLeads}</p>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
            >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 ${
                                showFilters ? 'bg-indigo-600' : 'bg-gray-700/50'
                            } border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-all flex items-center justify-center text-sm sm:text-base`}
                        >
                            <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            <span className="hidden sm:inline">Filters</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => refetch()}
                            className="px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-all"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-700"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        statusFilter === 'all'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    All ({stats.total})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('active')}
                                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        statusFilter === 'active'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    Active ({stats.active})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('paused')}
                                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        statusFilter === 'paused'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    Paused ({stats.paused})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('completed')}
                                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        statusFilter === 'completed'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    Completed ({stats.completed})
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-xs sm:text-sm text-gray-400">
                        Showing <span className="text-white font-medium">{filteredCampaigns?.length || 0}</span> campaigns
                    </p>
                </div>
            </motion.div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Campaign</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                        Campaign Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g., Q4 2024 - Tech Startups"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                        Search Query <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newCampaign.search_query}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, search_query: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g., tech startups in San Francisco"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Keywords to find leads for this campaign</p>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewCampaign({ name: '', search_query: '' });
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all text-sm sm:text-base"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCreate}
                                        disabled={createMutation.isPending}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && editingCampaign && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Campaign</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingCampaign(null);
                                    }}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Campaign Name</label>
                                    <input
                                        type="text"
                                        value={editingCampaign.name}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Search Query</label>
                                    <input
                                        type="text"
                                        value={editingCampaign.search_query || ''}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, search_query: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Status</label>
                                    <select
                                        value={editingCampaign.status || 'active'}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value as Campaign['status'] })}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingCampaign(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all text-sm sm:text-base"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleUpdate}
                                        disabled={updateMutation.isPending}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Campaigns Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredCampaigns && filteredCampaigns.length > 0 ? (
                        filteredCampaigns.map((campaign: Campaign, index: number) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700 hover:border-indigo-500 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">
                                            {campaign.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-400 truncate">{campaign.search_query}</p>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                        <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                                            {getStatusIcon(campaign.status)}
                                            <span className="hidden sm:inline">{campaign.status || 'active'}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">Total Leads</span>
                                        </div>
                                        <span className="text-sm sm:text-base text-white font-semibold">{campaign.total_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">New Leads</span>
                                        </div>
                                        <span className="text-sm sm:text-base text-white font-semibold">{campaign.new_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <FireIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">Hot Leads</span>
                                        </div>
                                        <span className="text-sm sm:text-base text-white font-semibold">{campaign.hot_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-400">
                                            <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">Duplicates</span>
                                        </div>
                                        <span className="text-sm sm:text-base text-white font-semibold">{campaign.duplicate_leads || 0}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-3 sm:pt-4 border-t border-gray-700 flex items-center justify-between">
                                    <div className="text-xs text-gray-400">
                                        {new Date(campaign.created_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => navigate(`/leads?campaign=${campaign.id}`)}
                                            className="p-1.5 sm:p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                                            title="View Leads"
                                        >
                                            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleEdit(campaign)}
                                            className="p-1.5 sm:p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(campaign)}
                                            className="p-1.5 sm:p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.button>
                                        {campaign.status === 'active' ? (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleStatusChange(campaign, 'paused')}
                                                className="p-1.5 sm:p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Pause"
                                            >
                                                <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleStatusChange(campaign, 'active')}
                                                className="p-1.5 sm:p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                                title="Activate"
                                            >
                                                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12">
                            <RocketLaunchIcon className="w-16 h-16 text-gray-600 mb-4" />
                            <div className="text-lg sm:text-xl text-gray-400 mb-2">
                                {searchQuery || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
                            </div>
                            <p className="text-sm text-gray-500 mb-6 text-center px-4">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Create your first campaign to start generating leads'}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (searchQuery || statusFilter !== 'all') {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                    } else {
                                        setShowCreateModal(true);
                                    }
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold"
                            >
                                {searchQuery || statusFilter !== 'all' ? 'Clear Filters' : 'Create Your First Campaign'}
                            </motion.button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Campaigns;
