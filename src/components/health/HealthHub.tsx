import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { 
  TrendingUp, 
  Bell, 
  Utensils, 
  Brain, 
  Clock, 
  Heart,
  Calendar,
  Activity,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChildren } from '../../contexts/ChildrenContext';
import { GrowthTracker } from '../growth/GrowthTracker';
import { HealthReminders } from '../reminders/HealthReminders';
import { NutritionMenu } from '../nutrition/NutritionMenu';
import { MilestoneTests } from '../milestones/MilestoneTests';
import { HealthTimeline } from './HealthTimeline';
import { IllnessInfo } from '../illness/IllnessInfo';
import { NotFound } from '../ui/NotFound';

type HealthSection = 'overview' | 'growth' | 'reminders' | 'nutrition' | 'milestones' | 'timeline' | 'illness';

export const HealthHub: React.FC = () => {
  const { selectedChild } = useChildren();
  const [activeSection, setActiveSection] = useState<HealthSection>('overview');
  
  // Get section from URL if present
  React.useEffect(() => {
    const path = window.location.pathname;
    const section = path.split('/health/')[1] as HealthSection;
    if (section && ['growth', 'reminders', 'nutrition', 'milestones', 'timeline', 'illness'].includes(section)) {
      setActiveSection(section);
    }
  }, []);

  const healthSections = [
    {
      id: 'growth' as const,
      title: 'Growth Tracking',
      description: 'Monitor height, weight, and development',
      icon: TrendingUp,
      color: 'blue',
      component: GrowthTracker,
    },
    {
      id: 'reminders' as const,
      title: 'Health Reminders',
      description: 'Medicine, meals, and appointments',
      icon: Bell,
      color: 'yellow',
      component: HealthReminders,
    },
    {
      id: 'nutrition' as const,
      title: 'Nutrition',
      description: 'Meal planning and tracking',
      icon: Utensils,
      color: 'green',
      component: NutritionMenu,
    },
    {
      id: 'milestones' as const,
      title: 'Milestones',
      description: 'Developmental assessments',
      icon: Brain,
      color: 'purple',
      component: MilestoneTests,
    },
    {
      id: 'timeline' as const,
      title: 'Health Timeline',
      description: 'Complete health history',
      icon: Clock,
      color: 'indigo',
      component: HealthTimeline,
    },
    {
      id: 'illness' as const,
      title: 'Illness Guide',
      description: 'Common childhood illnesses',
      icon: Heart,
      color: 'red',
      component: IllnessInfo,
    },
  ];
  
  // Update URL when section changes
  const handleSectionChange = (sectionId: HealthSection) => {
    setActiveSection(sectionId);
    if (sectionId !== 'overview') {
      window.history.pushState(null, '', `/health/${sectionId}`);
    } else {
      window.history.pushState(null, '', '/health');
    }
  };

  if (activeSection !== 'overview') {
    const section = healthSections.find(s => s.id === activeSection);
    if (section) {
      const Component = section.component;
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
             
            <button
              onClick={() => setActiveSection('overview')}
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Back to Health Hub</span>
            </button>
          </div>
          <Component />
        </div>
      );
    }
    
    // Show 404 for invalid health sections
    return (
      <NotFound 
        title="Health Section Not Found"
        message="The health section you're looking for doesn't exist."
      />
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to access health features.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Health Hub - {selectedChild.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive health management for your child
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="p-4">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Health Score</h3>
              <p className="text-2xl font-bold text-blue-600">92%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Excellent</p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-4">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Next Checkup</h3>
              <p className="text-lg font-bold text-green-600">Mar 15</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">2 weeks away</p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-4">
              <Bell className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Active Reminders</h3>
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-4">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Growth</h3>
              <p className="text-lg font-bold text-purple-600">Normal</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">75th percentile</p>
            </div>
          </Card>
        </div>

        {/* Health Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div 
                  className="p-6"
                  onClick={() => handleSectionChange(section.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-${section.color}-100 dark:bg-${section.color}-900/30 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-6 w-6 text-${section.color}-600 dark:text-${section.color}-400`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {section.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {section.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
              <Link 
                onClick={() => handleSectionChange('timeline')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Growth measurement recorded</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Height: 110cm, Weight: 20kg</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">2 days ago</span>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Vitamin D reminder completed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily supplement taken</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Today</span>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Milestone test completed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Score: 85% - Good development</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">1 week ago</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};