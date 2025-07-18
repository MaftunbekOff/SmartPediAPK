import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Bell, BellOff, Pill, Utensils, Droplets, Moon, Calendar } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { User } from '../../types';

export const NotificationSettings: React.FC = () => {
  const [user] = useAuthState(auth);
  const [preferences, setPreferences] = useState({
    medicine: true,
    meals: true,
    water: true,
    sleep: true,
    appointments: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setPreferences(userData.notificationPreferences || preferences);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const updatePreference = async (type: keyof typeof preferences, enabled: boolean) => {
    if (!user) return;

    setSaving(true);
    const newPreferences = { ...preferences, [type]: enabled };
    setPreferences(newPreferences);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notificationPreferences: newPreferences,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: 'medicine' as const,
      label: 'Medicine Reminders',
      description: 'Get notified when it\'s time for medications',
      icon: Pill,
      color: 'blue',
    },
    {
      key: 'meals' as const,
      label: 'Meal Reminders',
      description: 'Reminders for breakfast, lunch, dinner, and snacks',
      icon: Utensils,
      color: 'green',
    },
    {
      key: 'water' as const,
      label: 'Water Reminders',
      description: 'Stay hydrated with regular water reminders',
      icon: Droplets,
      color: 'cyan',
    },
    {
      key: 'sleep' as const,
      label: 'Sleep Reminders',
      description: 'Bedtime and nap time notifications',
      icon: Moon,
      color: 'purple',
    },
    {
      key: 'appointments' as const,
      label: 'Appointments',
      description: 'Doctor visits and health checkup reminders',
      icon: Calendar,
      color: 'red',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your notification preferences for health reminders.
          </p>
        </div>

        <Card className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Push Notifications</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose which types of reminders you want to receive</p>
            </div>
          </div>

          <div className="space-y-4">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              const isEnabled = preferences[type.key];
              
              return (
                <div
                  key={type.key}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 bg-${type.color}-100 dark:bg-${type.color}-900/30 rounded-lg`}>
                      <Icon className={`h-5 w-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{type.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => updatePreference(type.key, !isEnabled)}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <BellOff className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quiet Hours</h2>
              <p className="text-gray-600 dark:text-gray-400">Set times when you don't want to receive notifications</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Coming Soon:</strong> Quiet hours feature will allow you to set specific times when 
              notifications should be silenced, such as during sleep hours or family time.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};