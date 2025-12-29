import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    Squares2X2Icon,
    TableCellsIcon,
    ArrowPathIcon,
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
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Fetch leads
    const { data: leads, isLoading, refetch } = useQuery({
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

    const handleDelete = (id: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (window.confirm('Are you sure you want to delete this lead?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            priority: undefined,
            status: undefined,
        });
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
                        <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="truncate">Leads</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-400">
                        {leads?.length || 0} total leads
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/leads/create')}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-sm sm:text-base"
                >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    New Lead
                </motion.button>
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
                            placeholder="Search leads..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
                            className="mt-4 pt-4 border-t border-gray-700 space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Priority</label>
                                    <select
                                        value={filters.priority || ''}
                                        onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="A">🔥 Priority A (Hot)</option>
                                        <option value="B">⚡ Priority B (Warm)</option>
                                        <option value="C">❄️ Priority C (Cold)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Status</label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-gray-300 hover:bg-gray-700 transition-all"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Mode Toggle */}
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-400">
                        Showing <span className="text-white font-medium">{leads?.length || 0}</span> leads
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'table'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                            }`}
                            title="Table View"
                        >
                            <TableCellsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                            }`}
                            title="Grid View"
                        >
                            <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                    />
                </div>
            )}

            {/* Table View */}
            {!isLoading && viewMode === 'table' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business</th>
                                    <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">AI Score</th>
                                    <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
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
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center">
                                                    <div className="hidden sm:flex flex-shrink-0 h-10 w-10 bg-indigo-500/20 rounded-lg items-center justify-center mr-3">
                                                        <BuildingOfficeIcon className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs sm:text-sm font-medium text-white truncate">{lead.business_name}</div>
                                                        {lead.category && (
                                                            <div className="text-xs text-gray-400 truncate">{lead.category}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <div className="text-sm text-white truncate">{lead.email || lead.phone || 'N/A'}</div>
                                                {lead.website && (
                                                    <div className="text-sm text-gray-400 truncate">{lead.website}</div>
                                                )}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                {lead.priority && (
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(lead.priority)}`}>
                                                        {lead.priority}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                                    <span className="text-sm font-medium text-white">{lead.ai_score || 0}</span>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                                    {lead.status || 'new'}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                                        className="text-indigo-400 hover:text-indigo-300 p-1"
                                                        title="View"
                                                    >
                                                        <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => handleDelete(lead.id, e)}
                                                        className="text-red-400 hover:text-red-300 p-1"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <BuildingOfficeIcon className="w-12 h-12 text-gray-600 mb-4" />
                                                <div className="text-gray-400 text-lg mb-2">No leads found</div>
                                                <p className="text-gray-500 text-sm mb-4">
                                                    {filters.search || filters.priority || filters.status
                                                        ? 'Try adjusting your filters'
                                                        : 'Get started by creating your first lead'}
                                                </p>
                                                <button
                                                    onClick={() => navigate('/leads/create')}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Create First Lead
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Grid View */}
            {!isLoading && viewMode === 'grid' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                    {leads && leads.length > 0 ? (
                        leads.map((lead: Lead, index: number) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => navigate(`/leads/${lead.id}`)}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700 hover:border-indigo-500 cursor-pointer transition-all"
                            >
                                {/* Priority Badge */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority)}`}>
                                        {getPriorityLabel(lead.priority)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-medium text-white">{lead.ai_score || 0}</span>
                                    </div>
                                </div>

                                {/* Business Info */}
                                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
                                    {lead.business_name}
                                </h3>
                                {lead.category && (
                                    <p className="text-xs sm:text-sm text-gray-400 mb-3 truncate">{lead.category}</p>
                                )}

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    {lead.phone && (
                                        <div className="flex items-center text-xs sm:text-sm text-gray-300">
                                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">{lead.phone}</span>
                                        </div>
                                    )}
                                    {lead.email && (
                                        <div className="flex items-center text-xs sm:text-sm text-gray-300">
                                            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">{lead.email}</span>
                                        </div>
                                    )}
                                    {lead.website && (
                                        <div className="flex items-center text-xs sm:text-sm text-gray-300">
                                            <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">{lead.website}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-700">
                                    <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                        {lead.status || 'new'}
                                    </span>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => navigate(`/leads/${lead.id}`)}
                                            className="text-indigo-400 hover:text-indigo-300"
                                            title="View"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleDelete(lead.id, e)}
                                            className="text-red-400 hover:text-red-300"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12">
                            <BuildingOfficeIcon className="w-16 h-16 text-gray-600 mb-4" />
                            <div className="text-gray-400 text-lg mb-2">No leads found</div>
                            <p className="text-gray-500 text-sm mb-4 text-center px-4">
                                {filters.search || filters.priority || filters.status
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first lead'}
                            </p>
                            <button
                                onClick={() => navigate('/leads/create')}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Create First Lead
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Leads;
