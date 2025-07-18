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
import { HealthReminder } from '../types';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export const useHealthReminders = (childId: string | null) => {
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!childId || authLoading || !firebaseUser || !user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'healthReminders'),
      where('childId', '==', childId),
      where('parentId', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const reminderData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as HealthReminder[];
        
        setReminders(reminderData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading health reminders:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId, user, firebaseUser, authLoading]);

  const addReminder = async (reminderData: Omit<HealthReminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseUser || !user) {
      const errorMsg = 'User not authenticated';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    // Validate required fields
    if (!reminderData.childId || !reminderData.type || !reminderData.title || 
        !reminderData.time || !reminderData.frequency) {
      const errorMsg = 'Missing required fields for health reminder';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      const healthReminderData = {
        ...reminderData,
        parentId: firebaseUser.uid,
        isActive: reminderData.isActive ?? true,
        notificationEnabled: reminderData.notificationEnabled ?? true,
        completedDates: reminderData.completedDates || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'healthReminders'), healthReminderData);
      showToast('Health reminder added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding health reminder:', err);
      const errorMsg = `Failed to add health reminder: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const updateReminder = async (reminderId: string, updates: Partial<HealthReminder>) => {
    try {
      await updateDoc(doc(db, 'healthReminders', reminderId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Health reminder updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating health reminder:', err);
      const errorMsg = `Failed to update health reminder: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      await deleteDoc(doc(db, 'healthReminders', reminderId));
      showToast('Health reminder deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting health reminder:', err);
      const errorMsg = `Failed to delete health reminder: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const toggleReminder = async (reminderId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'healthReminders', reminderId), {
        isActive,
        updatedAt: new Date(),
      });
      showToast(`Reminder ${isActive ? 'activated' : 'deactivated'}`, 'success');
    } catch (err: any) {
      console.error('Error toggling health reminder:', err);
      const errorMsg = `Failed to toggle health reminder: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const markCompleted = async (reminderId: string, date: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId);
      if (!reminder) throw new Error('Reminder not found');

      const updatedCompletedDates = [...reminder.completedDates, date];
      
      await updateDoc(doc(db, 'healthReminders', reminderId), {
        completedDates: updatedCompletedDates,
        updatedAt: new Date(),
      });
      showToast('Reminder marked as completed', 'success');
    } catch (err: any) {
      console.error('Error marking reminder as completed:', err);
      const errorMsg = `Failed to mark reminder as completed: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    markCompleted,
  };
};