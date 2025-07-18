import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

interface AdminMetrics {
  totalParents: number;
  totalChildren: number;
  activeReminders: number;
  totalMediaItems: number;
  featuredMediaItems: number;
  totalGrowthRecords: number;
  recentRegistrations: number; // Last 30 days
}

export const useAdminMetrics = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalParents: 0,
    totalChildren: 0,
    activeReminders: 0,
    totalMediaItems: 0,
    featuredMediaItems: 0,
    totalGrowthRecords: 0,
    recentRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only proceed if user is authenticated as admin
    if (!isAdmin || authLoading) {
      return;
    }

    const loadMetrics = async () => {
      try {
        setLoading(true);
        
        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get counts using getCountFromServer for better performance
        const [
          parentsCount,
          childrenCount,
          activeRemindersCount,
          mediaItemsCount,
          featuredMediaCount,
          growthRecordsCount,
          recentRegistrationsCount
        ] = await Promise.all([
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'parent'))),
          getCountFromServer(collection(db, 'children')),
          getCountFromServer(query(collection(db, 'healthReminders'), where('isActive', '==', true))),
          getCountFromServer(collection(db, 'mediaItems')),
          getCountFromServer(query(collection(db, 'mediaItems'), where('isFeatured', '==', true))),
          getCountFromServer(collection(db, 'growthRecords')),
          getCountFromServer(query(collection(db, 'users'), where('createdAt', '>=', thirtyDaysAgo)))
        ]);

        setMetrics({
          totalParents: parentsCount.data().count,
          totalChildren: childrenCount.data().count,
          activeReminders: activeRemindersCount.data().count,
          totalMediaItems: mediaItemsCount.data().count,
          featuredMediaItems: featuredMediaCount.data().count,
          totalGrowthRecords: growthRecordsCount.data().count,
          recentRegistrations: recentRegistrationsCount.data().count,
        });

        setError(null);
      } catch (err: any) {
        console.error('Error loading admin metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    // Set up real-time listeners for key metrics
    const unsubscribeUsers = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'parent')),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, totalParents: snapshot.size }));
      }
    );

    const unsubscribeChildren = onSnapshot(
      collection(db, 'children'),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, totalChildren: snapshot.size }));
      }
    );

    const unsubscribeReminders = onSnapshot(
      query(collection(db, 'healthReminders'), where('isActive', '==', true)),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, activeReminders: snapshot.size }));
      }
    );

    const unsubscribeMedia = onSnapshot(
      collection(db, 'mediaItems'),
      (snapshot) => {
        const total = snapshot.size;
        const featured = snapshot.docs.filter(doc => doc.data().isFeatured).length;
        setMetrics(prev => ({ 
          ...prev, 
          totalMediaItems: total,
          featuredMediaItems: featured 
        }));
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeChildren();
      unsubscribeReminders();
      unsubscribeMedia();
    };
  }, []);

  return { metrics, loading, error };
};