import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Plus, Send, Edit, Trash2, Megaphone, Calendar } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Announcement } from '../../types';
import { format } from 'date-fns';

export const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    targetAudience: 'all' as 'all' | 'parents' | 'admins',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Announcement[];
      
      setAnnouncements(announcementData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData = {
        ...formData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingAnnouncement) {
        await updateDoc(doc(db, 'announcements', editingAnnouncement.id), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'announcements'), announcementData);
      }

      // Reset form
      setFormData({
        title: '',
        message: '',
        priority: 'normal',
        targetAudience: 'all',
      });
      setShowAddForm(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
    });
    setEditingAnnouncement(announcement);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      await updateDoc(doc(db, 'announcements', announcement.id), {
        isActive: !announcement.isActive,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'blue';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'parents': return '👨‍👩‍👧‍👦';
      case 'admins': return '👨‍⚕️';
      default: return '📢';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center space-x-3">
          <Megaphone className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Announcements
          </h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAnnouncement(null);
            setFormData({
              title: '',
              message: '',
              priority: 'normal',
              targetAudience: 'all',
            });
          }}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Announcement title"
                  required
                />
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
            </div>
            
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
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={4}
                placeholder="Enter your announcement message..."
                required
              />
            </div>
            
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAnnouncement(null);
                }}
                className="w-full sm:w-auto bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => {
          const priorityColor = getPriorityColor(announcement.priority);
          
          return (
            <Card key={announcement.id} className={`${
              !announcement.isActive ? 'opacity-60' : ''
            }`}>
              <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">
                      {getAudienceIcon(announcement.targetAudience)}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {announcement.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${priorityColor}-100 text-${priorityColor}-800`}>
                      {announcement.priority}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {announcement.targetAudience}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {announcement.message}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(announcement.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row lg:flex-col xl:flex-row gap-2 lg:flex-shrink-0">
                  <button
                    onClick={() => toggleActive(announcement)}
                    className={`flex-1 lg:flex-none flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                      announcement.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Send className="h-4 w-4" />
                    <span className="lg:hidden xl:inline">{announcement.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors duration-200 text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="lg:hidden xl:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors duration-200 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="lg:hidden xl:inline">Delete</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        
        {announcements.length === 0 && (
          <Card>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No announcements yet</p>
              <p className="text-sm">Create your first announcement to communicate with users</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};