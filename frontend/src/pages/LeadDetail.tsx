import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    MapPinIcon,
    // StarIcon,
    FireIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    TrashIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import type { UpdateLeadData } from '@/types';

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateLeadData>({});

    // Fetch lead details
    const { data: lead, isLoading } = useQuery({
        queryKey: ['lead', id],
        queryFn: () => api.getLead(Number(id)),
        enabled: !!id,
    });

    // Update lead mutation
    const updateMutation = useMutation({
        mutationFn: (data: UpdateLeadData) => api.updateLead(Number(id!), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead', id] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead updated successfully');
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update lead');
        },
    });

    // Delete lead mutation
    const deleteMutation = useMutation({
        mutationFn: () => api.deleteLead(Number(id!)),
        onSuccess: () => {
            toast.success('Lead deleted successfully');
            navigate('/leads');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete lead');
        },
    });

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        setFormData({});
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
            deleteMutation.mutate();
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'A':
                return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'B':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'C':
                return 'bg-green-500/20 text-green-400 border-green-500/50';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-500/20 text-blue-400';
            case 'contacted':
                return 'bg-purple-500/20 text-purple-400';
            case 'qualified':
                return 'bg-indigo-500/20 text-indigo-400';
            case 'won':
                return 'bg-green-500/20 text-green-400';
            case 'lost':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPriorityLabel = (priority?: string) => {
        switch (priority) {
            case 'A': return '🔥 Hot Lead';
            case 'B': return '⚡ Warm Lead';
            case 'C': return '❄️ Cold Lead';
            default: return '📋 Lead';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 sm:p-12 text-center border border-gray-700">
                    <BuildingOfficeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Lead Not Found</h2>
                    <p className="text-gray-400 mb-6">The lead you're looking for doesn't exist or has been deleted.</p>
                    <button
                        onClick={() => navigate('/leads')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/leads')}
                        className="p-2 sm:p-2.5 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all flex-shrink-0"
                    >
                        <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white break-words">
                                    {lead.business_name}
                                </h1>
                                {lead.category && (
                                    <p className="text-sm sm:text-base text-gray-400 truncate">{lead.category}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {!isEditing ? (
                    <div className="flex gap-2 sm:gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDelete}
                            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 bg-red-600/20 border border-red-500/50 text-red-400 rounded-xl font-semibold hover:bg-red-600/30 transition-all flex items-center justify-center text-sm sm:text-base"
                        >
                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            <span className="hidden sm:inline">Delete</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(true)}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-sm sm:text-base"
                        >
                            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Edit
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center justify-center text-sm sm:text-base"
                        >
                            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 text-sm sm:text-base"
                        >
                            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Save
                        </motion.button>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Business Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Business Information</h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone ?? lead.phone ?? ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-white flex items-center">
                                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{lead.phone || 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email ?? lead.email ?? ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="email@example.com"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-white flex items-center">
                                            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{lead.email || 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Website</label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={formData.website ?? lead.website ?? ''}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="https://example.com"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-white flex items-center min-w-0">
                                            <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                            {lead.website ? (
                                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 truncate">
                                                    {lead.website}
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Address</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.address ?? lead.address ?? ''}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="123 Main St, City, State"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-white flex items-center">
                                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{lead.address || 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {lead.maps_url && !isEditing && (
                                <div className="pt-2">
                                    <a
                                        href={lead.maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 text-xs sm:text-sm flex items-center"
                                    >
                                        <MapPinIcon className="w-4 h-4 mr-2" />
                                        View on Google Maps
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Notes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Notes</h2>
                        {isEditing ? (
                            <textarea
                                value={formData.notes ?? lead.notes ?? ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={6}
                                className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Add notes about this lead..."
                            />
                        ) : (
                            <div className="text-sm sm:text-base text-gray-300 whitespace-pre-wrap break-words">
                                {lead.notes || 'No notes added yet.'}
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Actions - Mobile Only */}
                    <div className="lg:hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 shadow-xl border border-gray-700"
                        >
                            <h2 className="text-lg font-bold text-white mb-3">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {lead.phone && (
                                    <a
                                        href={`tel:${lead.phone}`}
                                        className="px-4 py-3 bg-green-600/20 border border-green-500/50 text-green-400 rounded-xl font-semibold hover:bg-green-600/30 transition-all flex items-center justify-center text-sm"
                                    >
                                        <PhoneIcon className="w-4 h-4 mr-2" />
                                        Call
                                    </a>
                                )}
                                {lead.email && (
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="px-4 py-3 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-xl font-semibold hover:bg-blue-600/30 transition-all flex items-center justify-center text-sm"
                                    >
                                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                                        Email
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sm:space-y-6">
                    {/* AI Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                            <FireIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2" />
                            <span className="truncate">AI Insights</span>
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">AI Score</label>
                                <div className="flex items-center">
                                    <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${lead.ai_score || 0}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xl sm:text-2xl font-bold text-white">{lead.ai_score || 0}</span>
                                        <span className="text-sm text-gray-400 ml-1">/100</span>
                                    </div>
                                </div>
                            </div>
                            {lead.priority && (
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Priority</label>
                                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 inline-flex text-xs sm:text-sm font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}>
                                        {getPriorityLabel(lead.priority)}
                                    </span>
                                </div>
                            )}
                            {lead.conversion_probability !== undefined && (
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Conversion Probability</label>
                                    <div className="text-sm sm:text-base text-white font-medium">{lead.conversion_probability}%</div>
                                </div>
                            )}
                            {lead.revenue_potential && (
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Revenue Potential</label>
                                    <div className="text-sm sm:text-base text-white font-medium break-words">{lead.revenue_potential}</div>
                                </div>
                            )}
                            {lead.recommended_action && (
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Recommended Action</label>
                                    <div className="text-xs sm:text-sm text-white break-words">{lead.recommended_action}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Status & Metadata */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                            <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 mr-2" />
                            <span className="truncate">Status & Metadata</span>
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Status</label>
                                {isEditing ? (
                                    <select
                                        value={formData.status ?? lead.status ?? 'new'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                ) : (
                                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 inline-flex text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                        {lead.status || 'new'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Data Quality</label>
                                <div className="flex items-center">
                                    <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all"
                                            style={{ width: `${lead.data_quality_score || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm sm:text-base text-white font-medium">{lead.data_quality_score || 0}%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Created</label>
                                <div className="text-xs sm:text-sm text-white">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            {lead.last_contacted_at && (
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Last Contacted</label>
                                    <div className="text-xs sm:text-sm text-white">
                                        {new Date(lead.last_contacted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Actions - Desktop Only */}
                    <div className="hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                {lead.phone && (
                                    <a
                                        href={`tel:${lead.phone}`}
                                        className="block w-full px-4 py-3 bg-green-600/20 border border-green-500/50 text-green-400 rounded-xl font-semibold hover:bg-green-600/30 transition-all text-center"
                                    >
                                        <PhoneIcon className="w-5 h-5 inline mr-2" />
                                        Call Now
                                    </a>
                                )}
                                {lead.email && (
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="block w-full px-4 py-3 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-xl font-semibold hover:bg-blue-600/30 transition-all text-center"
                                    >
                                        <EnvelopeIcon className="w-5 h-5 inline mr-2" />
                                        Send Email
                                    </a>
                                )}
                                {lead.website && (
                                    <a
                                        href={lead.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full px-4 py-3 bg-purple-600/20 border border-purple-500/50 text-purple-400 rounded-xl font-semibold hover:bg-purple-600/30 transition-all text-center"
                                    >
                                        <GlobeAltIcon className="w-5 h-5 inline mr-2" />
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;
