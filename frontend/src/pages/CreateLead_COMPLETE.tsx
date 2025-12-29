import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    MapPinIcon,
    PlusIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import type { CreateLeadData } from '@/types';

const CreateLead: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateLeadData>({
        business_name: '',
        phone: '',
        website: '',
        email: '',
        address: '',
        rating: undefined,
        reviews_count: undefined,
        maps_url: '',
        category: '',
        search_query: '',
    });

    // Create lead mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateLeadData) => api.createLead(data),
        onSuccess: (newLead) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead created successfully');
            navigate(`/leads/${newLead.id}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create lead');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.business_name.trim()) {
            toast.error('Business name is required');
            return;
        }
        if (!formData.maps_url.trim()) {
            toast.error('Maps URL is required (used as unique identifier)');
            return;
        }
        if (!formData.search_query.trim()) {
            toast.error('Search query is required');
            return;
        }

        createMutation.mutate(formData);
    };

    const handleCancel = () => {
        if (window.confirm('Discard changes and go back?')) {
            navigate('/leads');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="p-2 sm:p-2.5 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 flex items-center">
                            <PlusIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 mr-2 sm:mr-3" />
                            Create New Lead
                        </h1>
                        <p className="text-sm sm:text-base text-gray-400">Add a new lead to your pipeline</p>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-700 space-y-6"
            >
                {/* Business Information Section */}
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 mr-2" />
                        Business Information
                    </h2>

                    <div className="space-y-4">
                        {/* Business Name - Required */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                Business Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.business_name}
                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Tech Solutions Inc"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                value={formData.category || ''}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Software Development, Marketing Agency"
                            />
                        </div>

                        {/* Contact Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="contact@example.com"
                                />
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                    <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.website || ''}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://example.com"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                    <MapPinIcon className="w-4 h-4 inline mr-1" />
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="123 Main St, City, State"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details Section */}
                <div className="pt-6 border-t border-gray-700">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Additional Details</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Rating */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                    Rating (out of 5)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating || ''}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="4.5"
                                />
                            </div>

                            {/* Reviews Count */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                    Number of Reviews
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.reviews_count || ''}
                                    onChange={(e) => setFormData({ ...formData, reviews_count: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="125"
                                />
                            </div>
                        </div>

                        {/* Maps URL - Required */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                Google Maps URL <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.maps_url}
                                onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://maps.google.com/?cid=..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Used as unique identifier for this lead</p>
                        </div>

                        {/* Search Query - Required */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                Search Query <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.search_query}
                                onChange={(e) => setFormData({ ...formData, search_query: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., software companies in San Francisco"
                            />
                            <p className="text-xs text-gray-500 mt-1">Keywords used to find this lead</p>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all text-sm sm:text-base"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={createMutation.isPending}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                    >
                        {createMutation.isPending ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                                Creating...
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-5 h-5 mr-2" />
                                Create Lead
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Help Text */}
                <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                        <span className="text-red-400">*</span> Required fields
                    </p>
                    <p className="text-xs text-gray-600 text-center mt-2">
                        AI scoring will be calculated automatically based on the information provided
                    </p>
                </div>
            </motion.form>
        </div>
    );
};

export default CreateLead;
