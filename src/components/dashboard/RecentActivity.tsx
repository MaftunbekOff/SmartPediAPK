import React from 'react';
import { Card } from '../ui/Card';
import { Clock, Pill, Utensils, TrendingUp, Calendar } from 'lucide-react';
import { useChildren } from '../../contexts/ChildrenContext';

interface ActivityItem {
  id: string;
  time: string;
  activity: string;
  type: 'medicine' | 'meal' | 'measurement' | 'appointment';
  childName?: string;
}

export const RecentActivity: React.FC = () => {
  const { children, selectedChild } = useChildren();

  // Mock recent activity data - in real app, this would come from various sources
  const recentActivity: ActivityItem[] = [
    { 
      id: '1',
      time: '9:00 AM', 
      activity: 'Vitamin D reminder completed', 
      type: 'medicine',
      childName: selectedChild?.name
    },
    { 
      id: '2',
      time: '8:30 AM', 
      activity: 'Breakfast logged', 
      type: 'meal',
      childName: selectedChild?.name
    },
    { 
      id: '3',
      time: '7:00 AM', 
      activity: 'Morning weight recorded', 
      type: 'measurement',
      childName: selectedChild?.name
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'medicine': return Pill;
      case 'meal': return Utensils;
      case 'measurement': return TrendingUp;
      case 'appointment': return Calendar;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'medicine': return 'blue';
      case 'meal': return 'green';
      case 'measurement': return 'purple';
      case 'appointment': return 'red';
      default: return 'gray';
    }
  };

  if (!selectedChild) {
    return (
      <Card title="Recent Activity">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No child selected</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Select a child to view recent activity</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Activity">
      <div className="space-y-4">
        {recentActivity.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
              <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {activity.activity}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {activity.time}
                  </span>
                </div>
                {activity.childName && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.childName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View all activity →
        </button>
      </div>
    </Card>
  );
};