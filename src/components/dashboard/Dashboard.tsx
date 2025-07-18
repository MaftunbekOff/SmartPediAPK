import React from 'react';
import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { User, Heart, TrendingUp, Bell, Plus, Baby, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnnouncementBanner } from './AnnouncementBanner';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useChildren } from '../../contexts/ChildrenContext';
import { useAuth } from '../../hooks/useAuth';
import { AddChildModal } from '../children/AddChildModal';
import { useState } from 'react';

export const Dashboard: React.FC = () => {
  const { children, selectedChild, loading, error, addChild } = useChildren();
  const { isAdmin } = useAuth();
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // Memoize expensive calculations
  const dashboardContent = useMemo(() => {
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have admin access. Please use the admin dashboard.
            </p>
            <Link
              to="/admin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Unable to Load Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (children.length === 0) {
      return (
        <>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Baby className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Welcome to SmartPedi!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Get started by adding your first child's profile to begin tracking their health and development.
                </p>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Your First Child</span>
                </button>
              </div>
            </div>
          </div>
          
          <AddChildModal
            isOpen={showAddChildModal}
            onClose={() => setShowAddChildModal(false)}
            onAddChild={addChild}
          />
        </>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's an overview of your child's health today.</p>
          </div>

          <AnnouncementBanner />
          <DashboardStats />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/health" className="group">
              <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Health Hub</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Complete health management</p>
                </div>
              </Card>
            </Link>

            <Link to="/profile" className="group">
              <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Child information</p>
                </div>
              </Card>
            </Link>

            <Link to="/multimedia" className="group">
              <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Media</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Educational content</p>
                </div>
              </Card>
            </Link>

            <Link to="/settings" className="group">
              <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">App preferences</p>
                </div>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <RecentActivity />

            <Card title="Today's Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-400">Growth on Track</p>
                      <p className="text-sm text-green-700 dark:text-green-300">75th percentile</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-400">3 Reminders</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">2 completed today</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-400">Health Score</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">92% - Excellent</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }, [isAdmin, loading, error, children.length, selectedChild, showAddChildModal]);

  return (
    <>
      {dashboardContent}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onAddChild={addChild}
      />
    </>
  );
};