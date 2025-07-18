import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { HealthTimeline } from '../types';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export const useHealthTimeline = (childId: string | null) => {
  const [timelineEvents, setTimelineEvents] = useState<HealthTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!childId || authLoading || !firebaseUser || !user) {
      setTimelineEvents([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'healthTimeline'),
      where('childId', '==', childId),
      where('parentId', '==', firebaseUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as HealthTimeline[];
        
        setTimelineEvents(events);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading health timeline:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId, user, firebaseUser, authLoading]);

  const addTimelineEvent = async (eventData: Omit<HealthTimeline, 'id' | 'createdAt'>) => {
    if (!firebaseUser || !user) {
      const errorMsg = 'User not authenticated';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      const timelineEventData = {
        ...eventData,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'healthTimeline'), timelineEventData);
      showToast('Timeline event added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding timeline event:', err);
      const errorMsg = `Failed to add timeline event: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const updateTimelineEvent = async (eventId: string, updates: Partial<HealthTimeline>) => {
    try {
      await updateDoc(doc(db, 'healthTimeline', eventId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Timeline event updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating timeline event:', err);
      const errorMsg = `Failed to update timeline event: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const deleteTimelineEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'healthTimeline', eventId));
      showToast('Timeline event deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting timeline event:', err);
      const errorMsg = `Failed to delete timeline event: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const getEventsByType = (type: HealthTimeline['type']) => {
    return timelineEvents.filter(event => event.type === type);
  };

  const getUnresolvedEvents = () => {
    return timelineEvents.filter(event => 
      ['illness', 'injury'].includes(event.type) && 
      event.isResolved === false
    );
  };

  const getUpcomingFollowUps = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return timelineEvents.filter(event => 
      event.followUpDate && 
      event.followUpDate >= now && 
      event.followUpDate <= thirtyDaysFromNow
    );
  };

  return {
    timelineEvents,
    loading,
    error,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    getEventsByType,
    getUnresolvedEvents,
    getUpcomingFollowUps,
  };
};