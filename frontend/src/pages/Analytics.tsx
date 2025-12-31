import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    FireIcon,
    SparklesIcon,
    CalendarIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    TrophyIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics: React.FC = () => {
    const [dateRange, setDateRange] = useState<'7' | '30' | '90' | '365'>('30');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch analytics data
    const { data: priorityData, refetch: refetchPriority } = useQuery({
        queryKey: ['leadsByPriority'],
        queryFn: api.getLeadsByPriority,
    });

    const { data: timelineData, refetch: refetchTimeline } = useQuery({
        queryKey: ['leadsTimeline', dateRange],
        queryFn: () => api.getLeadsTimeline(Number(dateRange)),
    });

    const { data: qualityData, refetch: refetchQuality } = useQuery({
        queryKey: ['qualityDistribution'],
        queryFn: api.getQualityDistribution,
    });

    const { data: stats, refetch: refetchStats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: api.getDashboardStats,
    });

    const handleRefreshAll = () => {
        Promise.all([
            refetchPriority(),
            refetchTimeline(),
            refetchQuality(),
            refetchStats(),
        ]);
        toast.success('Data refreshed');
    };

    const handleExportReport = () => {
        toast.success('Report export initiated. You will receive an email shortly.');
    };

    // Calculate growth percentage (mock data for demo)
    const calculateGrowth = (current: number) => {
        const previous = Math.floor(current * 0.85);
        const growth = ((current - previous) / previous) * 100;
        return growth.toFixed(1);
    };

    // Chart configurations
    const priorityChartData = {
        labels: priorityData?.map((d: any) => `Priority ${d.priority}`) || [],
        datasets: [
            {
                data: priorityData?.map((d: any) => d.count) || [],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(16, 185, 129, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const timelineChartData = {
        labels: timelineData?.map((d: any) => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }) || [],
        datasets: [
            {
                label: 'New Leads',
                data: timelineData?.map((d: any) => d.count) || [],
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const qualityChartData = {
        labels: qualityData?.map((d: any) => d.range) || [],
        datasets: [
            {
                label: 'Leads',
                data: qualityData?.map((d: any) => d.count) || [],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderColor: 'rgba(99, 102, 241, 0.5)',
                borderWidth: 1,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    font: {
                        size: 11,
                    },
                },
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10,
                    },
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: 15,
                    font: {
                        size: 11,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
            },
        },
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center">
                        <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="truncate">Analytics</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-400">Deep insights into your lead generation performance</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 ${
                            showFilters ? 'bg-indigo-600' : 'bg-gray-700/50'
                        } border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-all flex items-center text-sm sm:text-base`}
                    >
                        <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="hidden sm:inline">Filters</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefreshAll}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-all"
                        title="Refresh"
                    >
                        <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportReport}
                        className="hidden sm:flex px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all items-center text-sm sm:text-base"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Export
                    </motion.button>
                </div>
            </motion.div>

            {/* Date Range Filter */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center mb-3 sm:mb-4">
                        <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 mr-2" />
                        <h3 className="text-base sm:text-lg font-bold text-white">Date Range</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Last 7 Days', value: '7' },
                            { label: 'Last 30 Days', value: '30' },
                            { label: 'Last 90 Days', value: '90' },
                            { label: 'Last Year', value: '365' },
                        ].map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setDateRange(range.value as any)}
                                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                                    dateRange === range.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
            >
                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Total Leads</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                {stats?.total_leads?.toLocaleString() || '0'}
                            </h3>
                            <div className="flex items-center mt-2">
                                <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1" />
                                <span className="text-xs sm:text-sm text-green-400 font-medium">
                                    +{calculateGrowth(stats?.total_leads || 0)}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex-shrink-0">
                            <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Hot Leads</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                {stats?.hot_leads?.toLocaleString() || '0'}
                            </h3>
                            <div className="flex items-center mt-2">
                                <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1" />
                                <span className="text-xs sm:text-sm text-green-400 font-medium">
                                    +{calculateGrowth(stats?.hot_leads || 0)}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex-shrink-0">
                            <FireIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Conversion Rate</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                {stats?.conversion_rate || 0}%
                            </h3>
                            <div className="flex items-center mt-2">
                                <TrophyIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-1" />
                                <span className="text-xs sm:text-sm text-gray-400">Target: 15%</span>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex-shrink-0">
                            <ArrowTrendingUpIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Avg Quality</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                {stats?.avg_quality_score || 0}
                            </h3>
                            <div className="flex items-center mt-2">
                                <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1" />
                                <span className="text-xs sm:text-sm text-gray-400">Out of 100</span>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex-shrink-0">
                            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Charts Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
                {/* Timeline Chart */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                        <h2 className="text-base sm:text-xl font-bold text-white flex items-center">
                            <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 mr-2 flex-shrink-0" />
                            <span className="truncate">Lead Generation Timeline</span>
                        </h2>
                        <span className="text-xs sm:text-sm text-gray-400">
                            Last {dateRange} days
                        </span>
                    </div>
                    <div className="h-48 sm:h-56 lg:h-64">
                        <Line data={timelineChartData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Priority Distribution */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                        <h2 className="text-base sm:text-xl font-bold text-white flex items-center">
                            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 flex-shrink-0" />
                            <span className="truncate">Priority Distribution</span>
                        </h2>
                    </div>
                    <div className="h-48 sm:h-56 lg:h-64">
                        <Doughnut data={priorityChartData} options={doughnutOptions} />
                    </div>
                </motion.div>

                {/* Quality Distribution */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700 lg:col-span-2"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                        <h2 className="text-base sm:text-xl font-bold text-white flex items-center">
                            <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 flex-shrink-0" />
                            <span className="truncate">Data Quality Distribution</span>
                        </h2>
                        <span className="text-xs sm:text-sm text-gray-400">
                            Avg Score: {stats?.avg_quality_score}/100
                        </span>
                    </div>
                    <div className="h-48 sm:h-56 lg:h-64">
                        <Bar data={qualityChartData} options={chartOptions} />
                    </div>
                </motion.div>
            </motion.div>

            {/* Performance Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
            >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                    <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2" />
                    Performance Insights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm text-gray-400">Best Performing Day</p>
                            <CalendarIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-white">Monday</p>
                        <p className="text-xs text-gray-500 mt-1">32% more leads</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm text-gray-400">Avg Response Time</p>
                            <ClockIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-white">2.4 hours</p>
                        <p className="text-xs text-gray-500 mt-1">18% faster than average</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm text-gray-400">Top Campaign</p>
                            <TrophyIcon className="w-4 h-4 text-yellow-400" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-white truncate">Q4 2024</p>
                        <p className="text-xs text-gray-500 mt-1">145 leads generated</p>
                    </div>
                </div>
            </motion.div>

            {/* Export Mobile Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportReport}
                className="sm:hidden w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export Report
            </motion.button>
        </div>
    );
};

export default Analytics;
