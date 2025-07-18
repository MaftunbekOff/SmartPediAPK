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
import { GrowthRecord } from '../types';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export const useGrowthData = (childId: string | null) => {
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!childId || authLoading || !firebaseUser || !user) {
      setGrowthRecords([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'growthRecords'),
      where('childId', '==', childId),
      where('parentId', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as GrowthRecord[];
        
        setGrowthRecords(records);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading growth records:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId, user, firebaseUser, authLoading]);

  const addGrowthRecord = async (recordData: Omit<GrowthRecord, 'id' | 'createdAt'>) => {
    if (!firebaseUser || !user) {
      const errorMsg = 'User not authenticated';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    // Validate required fields
    if (!recordData.childId || !recordData.parentId || !recordData.date || 
        recordData.height === undefined || recordData.weight === undefined) {
      const errorMsg = 'Missing required fields for growth record';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      const growthRecordData = {
        ...recordData,
        parentId: firebaseUser.uid, // Ensure parentId matches authenticated user
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'growthRecords'), growthRecordData);
      showToast('Growth record added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding growth record:', err);
      const errorMsg = `Failed to add growth record: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const updateGrowthRecord = async (recordId: string, updates: Partial<GrowthRecord>) => {
    try {
      await updateDoc(doc(db, 'growthRecords', recordId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Growth record updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating growth record:', err);
      const errorMsg = `Failed to update growth record: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const deleteGrowthRecord = async (recordId: string) => {
    try {
      await deleteDoc(doc(db, 'growthRecords', recordId));
      showToast('Growth record deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting growth record:', err);
      const errorMsg = `Failed to delete growth record: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  return {
    growthRecords,
    loading,
    error,
    addGrowthRecord,
    updateGrowthRecord,
    deleteGrowthRecord,
  };
};