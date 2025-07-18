import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Send, Users, Filter, Calendar, Bell } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { User, Announcement } from '../../types';

export const BroadcastMessaging: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    targetAudience: 'all' as 'all' | 'parents' | 'admins',
    ageGroupFilter: [] as string[],
    category: 'general' as 'health_tip' | 'system_update' | 'content_alert' | 'general',
    scheduledFor: '',
  });
  const [loading, setLoading] = useState(false);
  const [previewRecipients, setPreviewRecipients] = useState(0);

  const ageGroups = ['0-2', '3-5', '6-8', '9-12', '12+'];
  const categories = [
    { value: 'health_tip', label: 'Health Tip', icon: '💡' },
    { value: 'system_update', label: 'System Update', icon: '🔧' },
    { value: 'content_alert', label: 'New Content', icon: '📚' },
    { value: 'general', label: 'General', icon: '📢' },
  ];

  useEffect(() => {
    // Only proceed if user is authenticated as admin
    if (!isAdmin || authLoading) {
      return;
    }

    loadUsers();
  }, [isAdmin, authLoading]);

  useEffect(() => {
    calculateRecipients();
  }, [formData.targetAudience, formData.ageGroupFilter, users]);

  const loadUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as User[];
      
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const calculateRecipients = async () => {
    let filteredUsers = users;

    // Filter by role
    if (formData.targetAudience !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === formData.targetAudience);
    }

    // Filter by age group (for parents with children in specific age groups)
    if (formData.ageGroupFilter.length > 0 && formData.targetAudience !== 'admins') {
      // This would require checking children's ages - simplified for now
      // In production, you'd query children collection and filter parents
    }

    setPreviewRecipients(filteredUsers.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData: Omit<Announcement, 'id'> = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        ageGroupFilter: formData.ageGroupFilter.length > 0 ? formData.ageGroupFilter : [],
        category: formData.category,
        isActive: true,
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
        readBy: [],
        createdBy: 'current-admin-id', // Replace with actual admin ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'announcements'), announcementData);

      // Send FCM notifications (this would be handled by a cloud function in production)
      await sendFCMNotifications(announcementData);

      // Reset form
      setFormData({
        title: '',
        message: '',
        priority: 'normal',
        targetAudience: 'all',
        ageGroupFilter: [],
        category: 'general',
        scheduledFor: '',
      });

      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendFCMNotifications = async (announcement: Omit<Announcement, 'id'>) => {
    // This would typically be handled by a Firebase Cloud Function
    // For demo purposes, we'll just log the action
    console.log('Sending FCM notifications for announcement:', announcement);
    
    // In production, you would:
    // 1. Filter users based on targetAudience and ageGroupFilter
    // 2. Get their FCM tokens
    // 3. Send batch notifications using Firebase Admin SDK
  };

  const toggleAgeGroup = (ageGroup: string) => {
    setFormData(prev => ({
      ...prev,
      ageGroupFilter: prev.ageGroupFilter.includes(ageGroup)
        ? prev.ageGroupFilter.filter(ag => ag !== ageGroup)
        : [...prev.ageGroupFilter, ageGroup]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Broadcast Messaging</h2>
            <p className="text-gray-600 dark:text-gray-400">Send messages to users with push notifications</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Message title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
              placeholder="Enter your message..."
              required
            />
          </div>

          {/* Targeting Options */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Targeting Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Users</option>
                  <option value="parents">Parents Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Age Group Filter */}
          {formData.targetAudience !== 'admins' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Age Group Filter (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {ageGroups.map(ageGroup => (
                  <button
                    key={ageGroup}
                    type="button"
                    onClick={() => toggleAgeGroup(ageGroup)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      formData.ageGroupFilter.includes(ageGroup)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {ageGroup} years
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-400">
                Estimated Recipients: {previewRecipients}
              </span>
            </div>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              This message will be sent to {previewRecipients} users matching your criteria.
            </p>
          </div>

          {/* Submit */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
            
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};