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
import { Link } from 'react-router-dom';

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
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1 truncate">{title}</p>
          <motion.h3
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
            className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 truncate"
          >
            {value}
          </motion.h3>
          {change && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className="text-xs sm:text-sm text-green-400 flex items-center"
            >
              <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{change}</span>
            </motion.p>
          )}
        </div>
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: delay, type: 'spring' }}
          className={`p-3 sm:p-4 rounded-xl ${color} flex-shrink-0 ml-2`}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8">
            {icon}
          </div>
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
    labels: timelineData?.map((d: any) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
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
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
          maxRotation: 45,
          minRotation: 45,
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
          padding: window.innerWidth < 640 ? 10 : 20,
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
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
          className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center">
            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">Lead Intelligence</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Real-time insights powered by AI</p>
        </div>
        <Link to="/campaigns">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-sm sm:text-base"
          >
            <RocketLaunchIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            New Campaign
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard
          title="Total Leads"
          value={stats?.total_leads?.toLocaleString() || '0'}
          change="+12% from last month"
          icon={<UserGroupIcon className="w-full h-full text-white" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="New Today"
          value={stats?.new_today?.toLocaleString() || '0'}
          change="+23% from yesterday"
          icon={<ArrowTrendingUpIcon className="w-full h-full text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay={0.1}
        />
        <StatCard
          title="Hot Leads"
          value={stats?.hot_leads?.toLocaleString() || '0'}
          change={`${stats?.hot_leads && stats?.total_leads ? ((stats.hot_leads / stats.total_leads) * 100).toFixed(1) : '0'}% of total`}
          icon={<SparklesIcon className="w-full h-full text-white" />}
          color="bg-gradient-to-br from-red-500 to-red-600"
          delay={0.2}
        />
        <StatCard
          title="Revenue Potential"
          value={stats?.revenue_potential || '$0'}
          change={`${stats?.conversion_rate}% conversion`}
          icon={<CurrencyDollarIcon className="w-full h-full text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          delay={0.3}
        />
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Timeline Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white flex items-center">
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 mr-2 flex-shrink-0" />
              <span className="truncate">Lead Timeline</span>
            </h2>
            <span className="text-xs sm:text-sm text-gray-400">Last 30 days</span>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            <Line data={timelineChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white flex items-center">
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
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white flex items-center">
              <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 flex-shrink-0" />
              <span className="truncate">Data Quality</span>
            </h2>
            <span className="text-xs sm:text-sm text-gray-400">
              Avg: {stats?.avg_quality_score}/100
            </span>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            <Bar data={qualityChartData} options={chartOptions} />
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Recent Activity</h2>
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer"
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 text-sm sm:text-base flex-shrink-0">
                  {i}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base text-white font-medium truncate">New lead added</p>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Business Name #{i}</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-400 ml-2 flex-shrink-0">2m ago</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
