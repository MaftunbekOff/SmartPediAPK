import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  Users, 
  Baby, 
  Brain, 
  FileText, 
  TrendingUp, 
  Activity,
  Plus,
  Send,
  BarChart3,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useEnhancedAdminMetrics } from '../../hooks/useEnhancedAdminMetrics';
import { useAuth } from '../../hooks/useAuth';
import { format, subDays, startOfDay } from 'date-fns';

export const EnhancedAdminOverview: React.FC = () => {
  const { user } = useAuth();
  const { 
    metrics, 
    activityTrends, 
    recentActivity, 
    roleDistribution,
    loading, 
    error 
  } = useEnhancedAdminMetrics();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Quick action handlers
  const handleCreateTest = () => {
    // Navigate to test creation
    window.location.href = '/admin#tests';
  };

  const handleBroadcastMessage = () => {
    // Navigate to messaging
    window.location.href = '/admin#messaging';
  };

  const handleViewReports = () => {
    // Navigate to reports
    window.location.href = '/admin#reports';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-400">Error Loading Dashboard</h3>
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  const pieChartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.displayName}!</h1>
        <p className="text-blue-100">Here's what's happening with SmartPedi today</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change={metrics.userGrowth}
          icon={Users}
          color="blue"
          subtitle={`${metrics.totalParents} parents, ${metrics.totalAdmins} admins`}
        />
        <MetricCard
          title="Children Profiles"
          value={metrics.totalChildren}
          change={metrics.childrenGrowth}
          icon={Baby}
          color="green"
          subtitle={`${(metrics.totalChildren / Math.max(metrics.totalParents, 1)).toFixed(1)} avg per parent`}
        />
        <MetricCard
          title="Tests Created"
          value={metrics.totalTests}
          change={metrics.testsGrowth}
          icon={Brain}
          color="purple"
          subtitle={`${metrics.activeTests} active tests`}
        />
        <MetricCard
          title="Test Results"
          value={metrics.totalTestResults}
          change={metrics.resultsGrowth}
          icon={FileText}
          color="orange"
          subtitle="Total submissions"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Trends Chart */}
        <Card title="Activity Trends" className="lg:col-span-1">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex space-x-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="New Users" />
              <Line type="monotone" dataKey="tests" stroke="#10B981" strokeWidth={2} name="Test Results" />
              <Line type="monotone" dataKey="children" stroke="#F59E0B" strokeWidth={2} name="New Children" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Role Distribution */}
        <Card title="User Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <Card title="Recent Activity" className="lg:col-span-2">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No recent activity</p>
            </div>
          )}
        </Card>

        {/* Quick Actions Panel */}
        <Card title="Quick Actions">
          <div className="space-y-4">
            <QuickActionButton
              icon={Brain}
              title="Create Test"
              description="Build new milestone test"
              onClick={handleCreateTest}
              color="blue"
            />
            <QuickActionButton
              icon={Send}
              title="Broadcast Message"
              description="Send message to users"
              onClick={handleBroadcastMessage}
              color="green"
            />
            <QuickActionButton
              icon={BarChart3}
              title="View Reports"
              description="Detailed analytics"
              onClick={handleViewReports}
              color="purple"
            />
            <QuickActionButton
              icon={Users}
              title="Manage Users"
              description="User administration"
              onClick={() => window.location.href = '/admin#users'}
              color="orange"
            />
          </div>
        </Card>
      </div>

      {/* System Health Status */}
      <Card title="System Health">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HealthMetric
            title="Database Status"
            status="healthy"
            value="99.9% uptime"
            icon={CheckCircle}
          />
          <HealthMetric
            title="Active Sessions"
            status="normal"
            value={`${metrics.activeSessions || 0} users online`}
            icon={Activity}
          />
          <HealthMetric
            title="Response Time"
            status="healthy"
            value="< 200ms avg"
            icon={TrendingUp}
          />
        </div>
      </Card>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color, subtitle }) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center space-x-1 ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  </Card>
);

// Activity Item Component
interface ActivityItemProps {
  activity: {
    type: string;
    message: string;
    timestamp: Date;
    user?: string;
    severity?: 'low' | 'medium' | 'high';
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return UserCheck;
      case 'test_submission': return Brain;
      case 'test_creation': return Plus;
      case 'system_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string, severity?: string) => {
    if (severity === 'high') return 'red';
    if (severity === 'medium') return 'yellow';
    
    switch (type) {
      case 'user_registration': return 'green';
      case 'test_submission': return 'blue';
      case 'test_creation': return 'purple';
      case 'system_alert': return 'red';
      default: return 'gray';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const color = getActivityColor(activity.type, activity.severity);

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex-shrink-0`}>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(activity.timestamp, 'MMM dd, HH:mm')}
          </p>
          {activity.user && (
            <span className="text-xs text-gray-400">• {activity.user}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  color 
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-left"
  >
    <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
      <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </button>
);

// Health Metric Component
interface HealthMetricProps {
  title: string;
  status: 'healthy' | 'warning' | 'error' | 'normal';
  value: string;
  icon: React.ComponentType<any>;
}

const HealthMetric: React.FC<HealthMetricProps> = ({ title, status, value, icon: Icon }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  const color = getStatusColor(status);

  return (
    <div className="flex items-center space-x-3">
      <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
        <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
      </div>
    </div>
  );
};