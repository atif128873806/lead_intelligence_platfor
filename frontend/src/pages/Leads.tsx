import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import type { Lead, LeadFilters } from '@/types';

const Leads: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<LeadFilters>({
        search: '',
        priority: undefined,
        status: undefined,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch leads
    const { data: leads, isLoading } = useQuery({
        queryKey: ['leads', filters],
        queryFn: () => api.getLeads(filters),
    });

    // Delete lead mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteLead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete lead');
        },
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            deleteMutation.mutate(id);
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
                        <BuildingOfficeIcon className="w-10 h-10 text-indigo-500 mr-3" />
                        Leads
                    </h1>
                    <p className="text-gray-400">
                        Manage and track your lead pipeline
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Lead
                </motion.button>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
            >
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, or phone..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-all flex items-center"
                    >
                        <FunnelIcon className="w-5 h-5 mr-2" />
                        Filters
                    </motion.button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                            <select
                                value={filters.priority || ''}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Priorities</option>
                                <option value="A">Priority A</option>
                                <option value="B">Priority B</option>
                                <option value="C">Priority C</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Leads Table */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">AI Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {leads && leads.length > 0 ? (
                                    leads.map((lead: Lead, index: number) => (
                                        <motion.tr
                                            key={lead.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                                            className="cursor-pointer"
                                            onClick={() => navigate(`/leads/${lead.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
                                                        <BuildingOfficeIcon className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{lead.business_name}</div>
                                                        {lead.category && (
                                                            <div className="text-sm text-gray-400">{lead.category}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white">{lead.email || lead.phone || 'N/A'}</div>
                                                {lead.website && (
                                                    <div className="text-sm text-gray-400">{lead.website}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {lead.priority && (
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}>
                                                        {lead.priority}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                                    <span className="text-sm font-medium text-white">{lead.ai_score || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                                    {lead.status || 'new'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                                        className="text-indigo-400 hover:text-indigo-300"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                                        className="text-yellow-400 hover:text-yellow-300"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(lead.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="text-gray-400">No leads found</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Leads;

