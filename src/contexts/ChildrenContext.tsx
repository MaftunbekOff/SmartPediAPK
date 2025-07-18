import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { auth, db } from '../config/firebase';
import { Child } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from '../hooks/useAuth';

interface ChildrenContextType {
  children: Child[];
  selectedChild: Child | null;
  loading: boolean;
  error: string | null;
  setSelectedChild: (child: Child | null) => void;
  addChild: (childData: Omit<Child, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  refreshChildren: () => void;
}

const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined);

export const useChildren = () => {
  const context = useContext(ChildrenContext);
  if (!context) {
    throw new Error('useChildren must be used within a ChildrenProvider');
  }
  return context;
};

interface ChildrenProviderProps {
  children: React.ReactNode;
}

export const ChildrenProvider: React.FC<ChildrenProviderProps> = ({ children }) => {
  const { user, firebaseUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for children data
  useEffect(() => {
    if (!isAuthenticated || !firebaseUser) {
      setChildrenData([]);
      setSelectedChild(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'children'),
      where('parentId', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const newChildrenData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Child[];
          
          // Sort in memory to avoid composite index requirement
          newChildrenData.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.getTime() - a.createdAt.getTime();
          });
          
          setChildrenData(newChildrenData);
          
          // Auto-select first child if none selected and children exist
          setSelectedChild(prev => {
            if (!prev && newChildrenData.length > 0) {
              return newChildrenData[0];
            }
            // Clear selected child if it no longer exists
            if (prev && !newChildrenData.find(child => child.id === prev.id)) {
              return newChildrenData.length > 0 ? newChildrenData[0] : null;
            }
            return prev;
          });
          
          setLoading(false);
          setError(null);
        } catch (err: any) {
          console.error('Error processing children data:', err);
          setError('Failed to load children data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to children:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, firebaseUser]);

  const addChild = useCallback(async (childData: Omit<Child, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseUser || !user) {
      const errorMsg = 'User not authenticated or user profile not loaded';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }
    
    if (!firebaseUser.uid || !user.id) {
      const errorMsg = 'User ID not available';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }
    
    // Ensure user has parent role
    if (user.role !== 'parent') {
      const errorMsg = 'Only parents can create child profiles';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }
    

    try {
      // Ensure all required fields are present and properly typed
      const childDocData = {
        ...childData,
        parentId: firebaseUser.uid, // Use Firebase UID as parentId
        allergies: childData.allergies || [], // Ensure allergies is always an array
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate required fields before submission
      if (!childDocData.name || !childDocData.dateOfBirth || !childDocData.gender || !childDocData.parentId) {
        const missingFields = [];
        if (!childDocData.name) missingFields.push('name');
        if (!childDocData.dateOfBirth) missingFields.push('dateOfBirth');
        if (!childDocData.gender) missingFields.push('gender');
        if (!childDocData.parentId) missingFields.push('parentId');
        
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }

      await addDoc(collection(db, 'children'), childDocData);
      showToast('Child profile created successfully', 'success');
    } catch (err: any) {
      // Enhanced error handling with specific messages
      if (err.code === 'permission-denied') {
        const errorMsg = 'Permission denied. Please ensure you are logged in as a parent and try again.';
        showToast(errorMsg, 'error');
        throw new Error('permission-denied');
      } else if (err.code === 'invalid-argument') {
        const errorMsg = 'Invalid data provided. Please check all fields and try again.';
        showToast(errorMsg, 'error');
        throw new Error('invalid-argument');
      } else if (err.code === 'unauthenticated') {
        const errorMsg = 'Authentication required. Please log in again.';
        showToast(errorMsg, 'error');
        throw new Error('unauthenticated');
      } else {
        const errorMsg = `Failed to create child profile: ${err.message}`;
        showToast(errorMsg, 'error');
        throw new Error(err.message);
      }
    }
  }, [firebaseUser, user, showToast]);

  const updateChild = useCallback(async (childId: string, updates: Partial<Child>) => {
    try {
      await updateDoc(doc(db, 'children', childId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Child profile updated successfully', 'success');
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        showToast('Permission denied. Unable to update child profile.', 'error');
      } else {
        showToast('Failed to update child profile', 'error');
      }
      throw new Error(err.message);
    }
  }, [showToast]);

  const deleteChild = useCallback(async (childId: string) => {
    try {
      await deleteDoc(doc(db, 'children', childId));
      showToast('Child profile deleted successfully', 'success');
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        showToast('Permission denied. Unable to delete child profile.', 'error');
      } else {
        showToast('Failed to delete child profile', 'error');
      }
      throw new Error(err.message);
    }
  }, [showToast]);

  const refreshChildren = useCallback(() => {
    // The real-time listener will automatically refresh the data
    setError(null);
  }, []);

  return (
    <ChildrenContext.Provider value={{
      children: childrenData,
      selectedChild,
      loading,
      error,
      setSelectedChild,
      addChild,
      updateChild,
      deleteChild,
      refreshChildren,
    }}>
      {children}
    </ChildrenContext.Provider>
  );
};