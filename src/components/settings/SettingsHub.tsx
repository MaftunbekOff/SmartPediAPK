import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  User, 
  Bell, 
  Globe, 
  Moon, 
  Shield, 
  HelpCircle,
  ChevronRight,
  Settings as SettingsIcon,
  Smartphone,
  Database,
  Download
} from 'lucide-react';
import { NotificationSettings } from '../notifications/NotificationSettings';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalization } from '../../contexts/LocalizationContext';

type SettingsSection = 'overview' | 'notifications' | 'account' | 'privacy' | 'help';

export const SettingsHub: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { language } = useLocalization();
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');

  const settingsSections = [
    {
      id: 'notifications' as const,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: Bell,
      color: 'yellow',
      component: NotificationSettings,
    },
    {
      id: 'account' as const,
      title: 'Account Settings',
      description: 'Profile and account information',
      icon: User,
      color: 'blue',
    },
    {
      id: 'privacy' as const,
      title: 'Privacy & Security',
      description: 'Data privacy and security settings',
      icon: Shield,
      color: 'green',
    },
    {
      id: 'help' as const,
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      color: 'purple',
    },
  ];

  if (activeSection === 'notifications') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Back to Settings</span>
          </button>
        </div>
        <NotificationSettings />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account and app preferences
          </p>
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</span>
                </div>
                <ThemeToggle />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Currently: {isDarkMode ? 'Dark' : 'Light'} theme
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Language</span>
                </div>
                <LanguageSelector />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current: {language === 'en' ? 'English' : language === 'uz' ? 'Uzbek' : 'Russian'}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Account</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </Card>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => setActiveSection(section.id)}
              >
                <div className="p-6">
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

        {/* App Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">App Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Version</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Data Storage</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cloud Synced</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Last Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};