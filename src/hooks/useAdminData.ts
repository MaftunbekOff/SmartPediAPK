import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { User, Child, GrowthRecord, HealthReminder, MediaItem, IllnessInfo } from '../types';

export const useAdminData = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [users, setUsers] = useState<User[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [illnessData, setIllnessData] = useState<IllnessInfo[]>([]);
  const [totalChildren, setTotalChildren] = useState(0);
  const [totalGrowthRecords, setTotalGrowthRecords] = useState(0);
  const [totalReminders, setTotalReminders] = useState(0);
  const [activeReminders, setActiveReminders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only proceed if user is authenticated as admin
    if (!isAdmin || authLoading) {
      setLoading(false);
      return;
    }

    let loadingCount = 6;
    
    const decrementLoading = () => {
      loadingCount--;
      if (loadingCount === 0) {
        setLoading(false);
      }
    };

    // Load users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUsers = onSnapshot(usersQuery, 
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          lastActive: doc.data().lastActive?.toDate(),
          isActive: doc.data().isActive ?? true,
        })) as User[];
        
        setUsers(usersData);
        decrementLoading();
      },
      (err) => {
        setError(err.message);
        decrementLoading();
      }
    );

    // Load media items
    const mediaQuery = query(collection(db, 'mediaItems'), orderBy('createdAt', 'desc'));
    const unsubscribeMedia = onSnapshot(mediaQuery, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as MediaItem[];
        setMediaItems(items);
        decrementLoading();
      },
      (err) => {
        setError(err.message);
        decrementLoading();
      }
    );

    // Load illness data
    const illnessQuery = query(collection(db, 'illnessInfo'), orderBy('name', 'asc'));
    const unsubscribeIllness = onSnapshot(illnessQuery, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as IllnessInfo[];
        setIllnessData(items);
        decrementLoading();
      },
      (err) => {
        setError(err.message);
        decrementLoading();
      }
    );

    // Load children count
    const childrenQuery = query(collection(db, 'children'));
    const unsubscribeChildren = onSnapshot(childrenQuery, 
      (snapshot) => {
        setTotalChildren(snapshot.size);
        decrementLoading();
      },
      (err) => {
        setError(err.message);
        decrementLoading();
      }
    );

    // Load growth records count
    const growthQuery = query(collection(db, 'growthRecords'));
    const unsubscribeGrowth = onSnapshot(growthQuery, 
      (snapshot) => {
        setTotalGrowthRecords(snapshot.size);
        decrementLoading();
      },
      (err) => {
        setError(err.message);
        decrementLoading();
      }
    );

    // Load reminders data
    const remindersQuery = query(collection(db, 'healthReminders'));
    const unsubscribeReminders = onSnapshot(remindersQuery, 
      (snapshot) => {
        const reminders = snapshot.docs.map(doc => doc.data());
        setTotalReminders(snapshot.size);
        setActiveReminders(reminders.filter(r => r.isActive).length);
        decrementLoading();
      },
      (err) => {
        setError(err.message);
        decrementLoading();
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeMedia();
      unsubscribeIllness();
      unsubscribeChildren();
      unsubscribeGrowth();
      unsubscribeReminders();
    };
  }, [isAdmin, authLoading]);

  const getUserChildren = async (userId: string): Promise<Child[]> => {
    try {
      const q = query(
        collection(db, 'children'),
        where('parentId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Child[];
    } catch (err) {
      console.error('Error fetching user children:', err);
      return [];
    }
  };

  const getChildGrowthData = async (childId: string): Promise<GrowthRecord[]> => {
    try {
      const q = query(
        collection(db, 'growthRecords'),
        where('childId', '==', childId),
        orderBy('date', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as GrowthRecord[];
    } catch (err) {
      console.error('Error fetching growth data:', err);
      return [];
    }
  };

  const getChildReminders = async (childId: string): Promise<HealthReminder[]> => {
    try {
      const q = query(
        collection(db, 'healthReminders'),
        where('childId', '==', childId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as HealthReminder[];
    } catch (err) {
      console.error('Error fetching reminders:', err);
      return [];
    }
  };

  return {
    users,
    mediaItems,
    illnessData,
    totalChildren,
    totalGrowthRecords,
    totalReminders,
    activeReminders,
    loading,
    error,
    getUserChildren,
    getChildGrowthData,
    getChildReminders,
  };
};