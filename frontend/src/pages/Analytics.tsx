import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    FireIcon,
    SparklesIcon,
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
    // Fetch analytics data
    const { data: priorityData } = useQuery({
        queryKey: ['leadsByPriority'],
        queryFn: api.getLeadsByPriority,
    });

    const { data: timelineData } = useQuery({
        queryKey: ['leadsTimeline'],
        queryFn: () => api.getLeadsTimeline(30),
    });

    const { data: qualityData } = useQuery({
        queryKey: ['qualityDistribution'],
        queryFn: api.getQualityDistribution,
    });

    const { data: stats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: api.getDashboardStats,
    });

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
        labels: timelineData?.map((d: any) => new Date(d.date).toLocaleDateString()) || [],
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
                },
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
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
                    padding: 20,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
            },
        },
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                        <ChartBarIcon className="w-10 h-10 text-indigo-500 mr-3" />
                        Analytics
                    </h1>
                    <p className="text-gray-400">Deep insights into your lead generation performance</p>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Leads</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.total_leads?.toLocaleString() || '0'}</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                            <UserGroupIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Hot Leads</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.hot_leads?.toLocaleString() || '0'}</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                            <FireIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Conversion Rate</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.conversion_rate || 0}%</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                            <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Avg Quality</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.avg_quality_score || 0}</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Charts Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Timeline Chart */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <ChartBarIcon className="w-6 h-6 text-indigo-500 mr-2" />
                            Lead Generation Timeline
                        </h2>
                        <span className="text-sm text-gray-400">Last 30 days</span>
                    </div>
                    <div className="h-64">
                        <Line data={timelineChartData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Priority Distribution */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" />
                            Lead Priority Distribution
                        </h2>
                    </div>
                    <div className="h-64">
                        <Doughnut data={priorityChartData} options={doughnutOptions} />
                    </div>
                </motion.div>

                {/* Quality Distribution */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500 mr-2" />
                            Data Quality Distribution
                        </h2>
                        <span className="text-sm text-gray-400">
                            Avg Score: {stats?.avg_quality_score}/100
                        </span>
                    </div>
                    <div className="h-64">
                        <Bar data={qualityChartData} options={chartOptions} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Analytics;

