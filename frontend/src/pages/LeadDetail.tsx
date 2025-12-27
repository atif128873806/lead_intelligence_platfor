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
    StarIcon,
    FireIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
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

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        setFormData({});
        setIsEditing(false);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-8">
                <div className="text-center text-gray-400">Lead not found</div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/leads')}
                        className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-white" />
                    </motion.button>
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                            <BuildingOfficeIcon className="w-10 h-10 text-indigo-500 mr-3" />
                            {lead.business_name}
                        </h1>
                        <p className="text-gray-400">Lead Details</p>
                    </div>
                </div>
                {!isEditing ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center"
                    >
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Edit Lead
                    </motion.button>
                ) : (
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center"
                        >
                            <XMarkIcon className="w-5 h-5 mr-2" />
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center disabled:opacity-50"
                        >
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Save
                        </motion.button>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Business Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Business Name</label>
                                <div className="text-white font-medium">{lead.business_name}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone ?? lead.phone ?? ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="text-white flex items-center">
                                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {lead.phone || 'N/A'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email ?? lead.email ?? ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="text-white flex items-center">
                                            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {lead.email || 'N/A'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={formData.website ?? lead.website ?? ''}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="text-white flex items-center">
                                            <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {lead.website ? (
                                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                                                    {lead.website}
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.address ?? lead.address ?? ''}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="text-white flex items-center">
                                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {lead.address || 'N/A'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {lead.maps_url && (
                                <div>
                                    <a
                                        href={lead.maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
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
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
                        {isEditing ? (
                            <textarea
                                value={formData.notes ?? lead.notes ?? ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Add notes about this lead..."
                            />
                        ) : (
                            <div className="text-gray-300 whitespace-pre-wrap">{lead.notes || 'No notes added yet.'}</div>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* AI Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FireIcon className="w-6 h-6 text-orange-500 mr-2" />
                            AI Insights
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">AI Score</label>
                                <div className="flex items-center">
                                    <StarIcon className="w-5 h-5 text-yellow-400 mr-2" />
                                    <span className="text-2xl font-bold text-white">{lead.ai_score || 0}</span>
                                    <span className="text-gray-400 ml-2">/100</span>
                                </div>
                            </div>
                            {lead.priority && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                                    <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}>
                                        Priority {lead.priority}
                                    </span>
                                </div>
                            )}
                            {lead.conversion_probability && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Conversion Probability</label>
                                    <div className="text-white font-medium">{lead.conversion_probability}%</div>
                                </div>
                            )}
                            {lead.revenue_potential && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Revenue Potential</label>
                                    <div className="text-white font-medium">{lead.revenue_potential}</div>
                                </div>
                            )}
                            {lead.recommended_action && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Recommended Action</label>
                                    <div className="text-white">{lead.recommended_action}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Status & Metadata */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Status & Metadata</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                                {isEditing ? (
                                    <select
                                        value={formData.status ?? lead.status ?? 'new'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                ) : (
                                    <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                        {lead.status || 'new'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Data Quality Score</label>
                                <div className="text-white font-medium">{lead.data_quality_score || 0}/100</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Created</label>
                                <div className="text-white text-sm">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            {lead.last_contacted_at && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Contacted</label>
                                    <div className="text-white text-sm">
                                        {new Date(lead.last_contacted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;

