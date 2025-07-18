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
import { NutritionRecord } from '../types';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export const useNutritionData = (childId: string | null) => {
  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!childId || authLoading || !firebaseUser || !user) {
      setNutritionRecords([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'nutritionRecords'),
      where('childId', '==', childId),
      where('parentId', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as NutritionRecord[];
        
        // Sort in memory to avoid index requirement
        records.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`).getTime();
          const dateB = new Date(`${b.date} ${b.time}`).getTime();
          return dateA - dateB;
        });
        
        setNutritionRecords(records);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading nutrition records:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId, user, firebaseUser, authLoading]);

  const addNutritionRecord = async (recordData: Omit<NutritionRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseUser || !user) {
      const errorMsg = 'User not authenticated';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    // Validate required fields
    if (!recordData.childId || !recordData.date || !recordData.mealType || 
        !recordData.name || !recordData.time || !recordData.ingredients) {
      const errorMsg = 'Missing required fields for nutrition record';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      const nutritionRecordData = {
        ...recordData,
        parentId: firebaseUser.uid,
        completed: recordData.completed ?? false,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'nutritionRecords'), nutritionRecordData);
      showToast('Meal added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding nutrition record:', err);
      const errorMsg = `Failed to add meal: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const updateNutritionRecord = async (recordId: string, updates: Partial<NutritionRecord>) => {
    try {
      await updateDoc(doc(db, 'nutritionRecords', recordId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Meal updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating nutrition record:', err);
      const errorMsg = `Failed to update meal: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const deleteNutritionRecord = async (recordId: string) => {
    try {
      await deleteDoc(doc(db, 'nutritionRecords', recordId));
      showToast('Meal deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting nutrition record:', err);
      const errorMsg = `Failed to delete meal: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const toggleMealCompletion = async (recordId: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'nutritionRecords', recordId), {
        completed,
        updatedAt: new Date(),
      });
      showToast(`Meal marked as ${completed ? 'completed' : 'pending'}`, 'success');
    } catch (err: any) {
      console.error('Error toggling meal completion:', err);
      const errorMsg = `Failed to update meal status: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const getTodaysRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    return nutritionRecords.filter(record => record.date === today);
  };

  const getRecordsByType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return nutritionRecords.filter(record => record.mealType === mealType);
  };

  const getTotalCalories = (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return nutritionRecords
      .filter(record => record.date === targetDate && record.completed)
      .reduce((total, record) => total + (record.calories || 0), 0);
  };

  const getCompletedMealsCount = (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return nutritionRecords.filter(record => record.date === targetDate && record.completed).length;
  };

  return {
    nutritionRecords,
    loading,
    error,
    addNutritionRecord,
    updateNutritionRecord,
    deleteNutritionRecord,
    toggleMealCompletion,
    getTodaysRecords,
    getRecordsByType,
    getTotalCalories,
    getCompletedMealsCount,
  };
};