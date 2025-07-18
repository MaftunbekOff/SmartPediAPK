import React, { useState, useEffect, useMemo } from 'react';
import { X, Megaphone, AlertTriangle, Info } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Announcement } from '../../types';

export const AnnouncementBanner: React.FC = () => {
  const { user, loading, firebaseUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (loading || !firebaseUser || !user) return;

    // Simplified query to avoid composite index requirement
    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true),
      limit(10) // Get more to filter and sort in memory
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementData = (snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Announcement[])
        .filter(announcement => 
          announcement.targetAudience === 'all' || announcement.targetAudience === user.role
        )
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
        .slice(0, 5); // Take only the first 5 after sorting
      
      setAnnouncements(announcementData);
    }, (error) => {
      console.error('Error loading announcements:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [loading, firebaseUser, user]);

  const visibleAnnouncements = useMemo(() => 
    announcements.filter(announcement => !dismissedIds.includes(announcement.id)),
    [announcements, dismissedIds]
  );

  const handleDismiss = (id: string) => {
    const newDismissedIds = [...dismissedIds, id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissedIds));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'normal': return Megaphone;
      case 'low': return Info;
      default: return Megaphone;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400';
      case 'normal':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400';
      case 'low':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-400';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400';
    }
  };

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const Icon = getPriorityIcon(announcement.priority);
        const styles = getPriorityStyles(announcement.priority);
        
        return (
          <div
            key={announcement.id}
            className={`border rounded-lg p-4 ${styles}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium mb-1">
                  {announcement.title}
                </h4>
                <p className="text-sm opacity-90">
                  {announcement.message}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(announcement.id)}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};