import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    RocketLaunchIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/services/api';

interface CampaignScraperProps {
    campaignId: number;
    campaignName: string;
    onComplete?: () => void;
}

interface ScrapeStatus {
    status: 'not_started' | 'running' | 'completed' | 'failed' | 'stopped';
    progress: number;
    leads_found: number;
    leads_created: number;
    duplicates: number;
    error?: string;
}

const CampaignScraper: React.FC<CampaignScraperProps> = ({
    campaignId,
    campaignName,
    onComplete,
}) => {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [maxResults, setMaxResults] = useState(20);
    const [status, setStatus] = useState<ScrapeStatus>({
        status: 'not_started',
        progress: 0,
        leads_found: 0,
        leads_created: 0,
        duplicates: 0,
    });
    const [polling, setPolling] = useState(false);

    // Start scraping mutation
    const startScrapeMutation = useMutation({
        mutationFn: (data: { query: string; location: string; max_results: number }) =>
            api.startCampaignScrape(campaignId, data),
        onSuccess: () => {
            toast.success('Scraping started!');
            setPolling(true);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to start scraping');
        },
    });

    // Poll for status updates
    useEffect(() => {
        if (!polling) return;

        const interval = setInterval(async () => {
            try {
                const statusData = await api.getCampaignScrapeStatus(campaignId);
                setStatus(statusData);

                if (statusData.status === 'completed') {
                    setPolling(false);
                    toast.success(`Scraping complete! Created ${statusData.leads_created} leads`);
                    if (onComplete) onComplete();
                } else if (statusData.status === 'failed') {
                    setPolling(false);
                    toast.error(`Scraping failed: ${statusData.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [polling, campaignId, onComplete]);

    const handleStartScrape = () => {
        if (!query.trim()) {
            toast.error('Please enter a search query');
            return;
        }

        startScrapeMutation.mutate({
            query,
            location,
            max_results: maxResults,
        });
    };

    const handleStopScrape = async () => {
        try {
            await api.stopCampaignScrape(campaignId);
            setPolling(false);
            toast.success('Scraping stopped');
        } catch (error: any) {
            toast.error('Failed to stop scraping');
        }
    };

    const isScraping = status.status === 'running';

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700">
            <div className="flex items-center mb-4 sm:mb-6">
                <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 mr-2" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Scrape Google Maps</h2>
            </div>

            {!isScraping && status.status !== 'completed' ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                            Search Query <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., restaurants, dentists, gyms"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                            Location
                        </label>
                        <div className="relative">
                            <MapPinIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., New York, Los Angeles"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                            Number of Results
                        </label>
                        <select
                            value={maxResults}
                            onChange={(e) => setMaxResults(Number(e.target.value))}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={10}>10 leads</option>
                            <option value={20}>20 leads</option>
                            <option value={50}>50 leads</option>
                            <option value={100}>100 leads</option>
                            <option value={200}>200 leads</option>
                            <option value={500}>500 leads (max)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Larger numbers take longer to scrape (approx. 3-5 seconds per lead)
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStartScrape}
                        disabled={startScrapeMutation.isPending}
                        className="w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
                    >
                        {startScrapeMutation.isPending ? 'Starting...' : 'Start Scraping'}
                    </motion.button>
                </div>
            ) : isScraping ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm sm:text-base text-gray-400">Scraping in progress...</span>
                        <span className="text-sm sm:text-base text-indigo-400 font-medium">{status.progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${status.progress}%` }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 sm:h-4 rounded-full"
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                        <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
                            <p className="text-xs text-gray-400 mb-1">Found</p>
                            <p className="text-lg sm:text-xl font-bold text-white">{status.leads_found}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
                            <p className="text-xs text-gray-400 mb-1">Created</p>
                            <p className="text-lg sm:text-xl font-bold text-green-400">{status.leads_created}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-400 mb-1">Duplicates</p>
                            <p className="text-lg sm:text-xl font-bold text-yellow-400">{status.duplicates}</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStopScrape}
                        className="w-full px-4 sm:px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all text-sm sm:text-base"
                    >
                        Stop Scraping
                    </motion.button>
                </div>
            ) : status.status === 'completed' ? (
                <div className="text-center py-6 sm:py-8">
                    <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Scraping Complete!</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">
                        Created {status.leads_created} new leads
                        {status.duplicates > 0 && ` (${status.duplicates} duplicates skipped)`}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setStatus({
                                status: 'not_started',
                                progress: 0,
                                leads_found: 0,
                                leads_created: 0,
                                duplicates: 0,
                            });
                            setQuery('');
                            setLocation('');
                        }}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm sm:text-base"
                    >
                        Scrape Again
                    </motion.button>
                </div>
            ) : status.status === 'failed' ? (
                <div className="text-center py-6 sm:py-8">
                    <XCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Scraping Failed</h3>
                    <p className="text-sm sm:text-base text-red-400 mb-4">{status.error || 'Unknown error'}</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setStatus({
                                status: 'not_started',
                                progress: 0,
                                leads_found: 0,
                                leads_created: 0,
                                duplicates: 0,
                            });
                        }}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm sm:text-base"
                        >
                        Try Again
                    </motion.button>
                </div>
            ) : null}
        </div>
    );
};

export default CampaignScraper;
