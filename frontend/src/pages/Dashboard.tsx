import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  RocketLaunchIcon,
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
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, delay = 0 }) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <motion.h3
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
            className="text-3xl font-bold text-white mb-2"
          >
            {value}
          </motion.h3>
          {change && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className="text-sm text-green-400 flex items-center"
            >
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {change}
            </motion.p>
          )}
        </div>
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: delay, type: 'spring' }}
          className={`p-4 rounded-xl ${color}`}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: api.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch chart data
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

  if (statsLoading) {
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
            <SparklesIcon className="w-10 h-10 text-indigo-500 mr-3" />
            Lead Intelligence Dashboard
          </h1>
          <p className="text-gray-400">Real-time insights powered by AI</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center"
        >
          <RocketLaunchIcon className="w-5 h-5 mr-2" />
          New Campaign
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Leads"
          value={stats?.total_leads?.toLocaleString() || '0'}
          change="+12% from last month"
          icon={<UserGroupIcon className="w-8 h-8 text-white" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="New Today"
          value={stats?.new_today?.toLocaleString() || '0'}
          change="+23% from yesterday"
          icon={<ArrowTrendingUpIcon className="w-8 h-8 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay={0.1}
        />
        <StatCard
          title="Hot Leads"
          value={stats?.hot_leads?.toLocaleString() || '0'}
          change={`${stats?.hot_leads && stats?.total_leads ? ((stats.hot_leads / stats.total_leads) * 100).toFixed(1) : '0'}% of total`}
          icon={<SparklesIcon className="w-8 h-8 text-white" />}
          color="bg-gradient-to-br from-red-500 to-red-600"
          delay={0.2}
        />
        <StatCard
          title="Revenue Potential"
          value={stats?.revenue_potential || '$0'}
          change={`${stats?.conversion_rate}% conversion rate`}
          icon={<CurrencyDollarIcon className="w-8 h-8 text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          delay={0.3}
        />
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Timeline Chart */}
        <motion.div
          variants={itemVariants}
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
          variants={itemVariants}
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
          variants={itemVariants}
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
      >
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {i}
                </div>
                <div>
                  <p className="text-white font-medium">New lead added</p>
                  <p className="text-gray-400 text-sm">Business Name #{i}</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">2 min ago</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
