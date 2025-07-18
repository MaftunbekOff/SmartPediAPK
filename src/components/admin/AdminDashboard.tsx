import React, { useState } from 'react';
import { 
  Users, 
  Play, 
  Bell, 
  Brain, 
  Heart, 
  Shield, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BroadcastMessaging } from './BroadcastMessaging';
import { EnhancedUserManagement } from './EnhancedUserManagement';
import { EnhancedMediaManager } from './EnhancedMediaManager';
import { AnnouncementManager } from './AnnouncementManager';
import { TestBuilder } from './TestBuilder';
import { EnhancedAdminOverview } from './EnhancedAdminOverview';
import { UserStatusControl } from './UserStatusControl';
import { IllnessManager } from './IllnessManager';

type AdminTab = 
  | 'overview'
  | 'users'
  | 'status'
  | 'media'
  | 'announcements'
  | 'tests'
  | 'illness'
  | 'messaging';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: Home,
      color: 'blue',
      description: 'System overview and metrics'
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users,
      color: 'green',
      description: 'Manage user accounts'
    },
    { 
      id: 'status', 
      label: 'Access Control', 
      icon: Shield,
      color: 'red',
      description: 'User status management'
    },
    { 
      id: 'media', 
      label: 'Media', 
      icon: Play,
      color: 'purple',
      description: 'Content library'
    },
    { 
      id: 'announcements', 
      label: 'Announcements', 
      icon: Bell,
      color: 'yellow',
      description: 'System notifications'
    },
    { 
      id: 'tests', 
      label: 'Tests', 
      icon: Brain,
      color: 'indigo',
      description: 'Milestone assessments'
    },
    { 
      id: 'illness', 
      label: 'Health Info', 
      icon: Heart,
      color: 'pink',
      description: 'Illness information'
    },
    { 
      id: 'messaging', 
      label: 'Messaging', 
      icon: Settings,
      color: 'gray',
      description: 'Broadcast messages'
    },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EnhancedAdminOverview />;
      case 'users':
        return <EnhancedUserManagement />;
      case 'status':
        return <UserStatusControl />;
      case 'media':
        return <EnhancedMediaManager />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'tests':
        return <TestBuilder />;
      case 'illness':
        return <IllnessManager />;
      case 'messaging':
        return <BroadcastMessaging />;
      default:
        return <EnhancedAdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">SmartPedi Admin</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{currentTab?.label}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SmartPedi</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                      isActive
                        ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-700 dark:text-${tab.color}-400 shadow-sm`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/30` 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isActive 
                          ? `text-${tab.color}-600 dark:text-${tab.color}-400` 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{tab.label}</p>
                      <p className="text-xs opacity-75">{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {currentUser?.displayName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {currentUser?.displayName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SmartPedi</h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Admin Panel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as AdminTab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-4 text-left rounded-xl transition-all duration-200 ${
                          isActive
                            ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-700 dark:text-${tab.color}-400 shadow-sm`
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${
                          isActive 
                            ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/30` 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            isActive 
                              ? `text-${tab.color}-600 dark:text-${tab.color}-400` 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-base">{tab.label}</p>
                          <p className="text-sm opacity-75 mt-1">{tab.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile User Info */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {currentUser?.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {currentUser?.displayName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Administrator</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="min-h-screen">
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {currentTab?.label}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {currentTab?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {currentUser?.displayName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Administrator</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {currentUser?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 lg:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};