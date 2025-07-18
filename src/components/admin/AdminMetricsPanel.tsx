import React from 'react';
import { Card } from '../ui/Card';
import { 
  Users, 
  Baby, 
  Bell, 
  Play, 
  Star, 
  TrendingUp, 
  Calendar,
  Activity
} from 'lucide-react';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';

export const AdminMetricsPanel: React.FC = () => {
  const { metrics, loading, error } = useAdminMetrics();

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="text-center py-4">
          <Activity className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400">Error loading metrics: {error}</p>
        </div>
      </Card>
    );
  }

  const metricCards = [
    {
      label: 'Total Parents',
      value: metrics.totalParents,
      icon: Users,
      color: 'blue',
      description: 'Registered parent accounts',
    },
    {
      label: 'Children Profiles',
      value: metrics.totalChildren,
      icon: Baby,
      color: 'green',
      description: 'Active child profiles',
    },
    {
      label: 'Active Reminders',
      value: metrics.activeReminders,
      icon: Bell,
      color: 'yellow',
      description: 'Currently active health reminders',
    },
    {
      label: 'Media Items',
      value: metrics.totalMediaItems,
      icon: Play,
      color: 'purple',
      description: 'Books, videos, and music',
    },
    {
      label: 'Featured Content',
      value: metrics.featuredMediaItems,
      icon: Star,
      color: 'orange',
      description: 'Featured media items',
    },
    {
      label: 'Growth Records',
      value: metrics.totalGrowthRecords,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Total growth measurements',
    },
    {
      label: 'New Users (30d)',
      value: metrics.recentRegistrations,
      icon: Calendar,
      color: 'pink',
      description: 'Recent registrations',
    },
    {
      label: 'Avg Children/Parent',
      value: metrics.totalParents > 0 ? (metrics.totalChildren / metrics.totalParents).toFixed(1) : '0',
      icon: Activity,
      color: 'cyan',
      description: 'Average children per parent',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          System Metrics
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Real-time data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-900/30 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {metric.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};