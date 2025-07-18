import React from 'react';
import { Card } from '../ui/Card';
import { User, Bell, Utensils, Heart, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChildren } from '../../contexts/ChildrenContext';

interface DashboardStatsProps {
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ className = '' }) => {
  const { children, selectedChild } = useChildren();

  // Calculate stats based on actual data
  const stats = [
    { 
      label: 'Child Profiles', 
      value: `${children.length} Active`, 
      icon: User, 
      color: 'blue', 
      link: '/profile',
      description: children.length === 1 ? '1 child profile' : `${children.length} child profiles`
    },
    { 
      label: 'Health Reminders', 
      value: '3 Active', 
      icon: Bell, 
      color: 'yellow', 
      link: '/health/reminders',
      description: 'Daily health reminders'
    },
    { 
      label: 'Growth Tracking', 
      value: selectedChild ? 'Up to date' : 'No data', 
      icon: TrendingUp, 
      color: 'green', 
      link: '/health/growth',
      description: 'Height and weight tracking'
    },
    { 
      label: 'Health Status', 
      value: 'Good', 
      icon: Heart, 
      color: 'red', 
      link: '/health/timeline',
      description: 'Overall health overview'
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link key={index} to={stat.link}>
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group h-full">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 mr-4 group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};