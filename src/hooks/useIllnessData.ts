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
import { IllnessInfo } from '../types';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export const useIllnessData = () => {
  const [illnesses, setIllnesses] = useState<IllnessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    const q = query(
      collection(db, 'illnessInfo'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const illnessData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as IllnessInfo[];
        
        setIllnesses(illnessData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading illness data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading]);

  const addIllness = async (illnessData: Omit<IllnessInfo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || user.role !== 'admin') {
      const errorMsg = 'Only admins can add illness information';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      const newIllnessData = {
        ...illnessData,
        isActive: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'illnessInfo'), newIllnessData);
      showToast('Illness information added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding illness:', err);
      const errorMsg = `Failed to add illness information: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const updateIllness = async (illnessId: string, updates: Partial<IllnessInfo>) => {
    if (!user || user.role !== 'admin') {
      const errorMsg = 'Only admins can update illness information';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      await updateDoc(doc(db, 'illnessInfo', illnessId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Illness information updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating illness:', err);
      const errorMsg = `Failed to update illness information: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  const deleteIllness = async (illnessId: string) => {
    if (!user || user.role !== 'admin') {
      const errorMsg = 'Only admins can delete illness information';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      // Soft delete by setting isActive to false
      await updateDoc(doc(db, 'illnessInfo', illnessId), {
        isActive: false,
        updatedAt: new Date(),
      });
      showToast('Illness information deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting illness:', err);
      const errorMsg = `Failed to delete illness information: ${err.message}`;
      showToast(errorMsg, 'error');
      throw new Error(err.message);
    }
  };

  return {
    illnesses,
    loading,
    error,
    addIllness,
    updateIllness,
    deleteIllness,
  };
};