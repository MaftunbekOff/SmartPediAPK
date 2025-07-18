import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { useToast } from '../contexts/ToastContext';

export const useAuth = () => {
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) {
        return; // Wait for auth to complete
      }

      if (!firebaseUser) {
        setUser(null);
        setUserLoading(false);
        setUserError(null);
        setRetryCount(0);
        return;
      }

      setUserLoading(true);
      setUserError(null);

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'id'>;
          const fullUser: User = {
            id: firebaseUser.uid,
            ...userData,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            updatedAt: userData.updatedAt?.toDate?.() || new Date(),
          };
          
          // Check if user is inactive
          if (fullUser.isActive === false) {
            setUserError('Your account has been deactivated. Please contact support for assistance.');
            showToast('Account deactivated. Please contact support.', 'error');
            setUser(null);
            setUserLoading(false);
            return;
          }
          
          setUser(fullUser);
          setRetryCount(0);
        } else {
          // Create user document if it doesn't exist with proper error handling
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'parent', // Default role
            language: 'en',
            isActive: true, // Default to active
            notificationPreferences: {
              medicine: true,
              meals: true,
              water: true,
              sleep: true,
              appointments: true,
              healthTips: true,
              contentUpdates: true,
              systemUpdates: true,
            },
            lastActive: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          } catch (createError) {
            console.error('Error creating user document:', createError);
            // Continue with the user object even if document creation fails
          }
          
          setUser(newUser);
          setRetryCount(0);
        }
      } catch (err: any) {
        // Handle specific permission errors
        if (err.code === 'permission-denied') {
          if (retryCount < 2) {
            // Retry with exponential back off
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchUserData();
            }, Math.pow(2, retryCount) * 1000);
            return;
          }
          
          setUserError('Permission denied. Please try logging out and logging back in.');
          
          // Try to refresh the auth token and retry once
          try {
            await firebaseUser.getIdToken(true);
            // Retry the fetch after token refresh
            setTimeout(() => {
              setRetryCount(0);
              fetchUserData();
            }, 1000);
            return;
          } catch (refreshError) {
            setUserError('Authentication error. Please log out and log back in.');
          }
        } else {
          // Set error but continue with user object for offline scenarios
          if (err.code !== 'unavailable') {
            if (retryCount < 2) {
              // Retry for network errors
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                fetchUserData();
              }, Math.pow(2, retryCount) * 1000);
              return;
            }
            setUserError('Failed to load user profile. Some features may not work properly.');
          }
        }
        
        // Handle offline errors gracefully
        if (err.message.includes('offline') || err.code === 'unavailable') {
          // Don't show error for offline scenarios
        }
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [firebaseUser, authLoading, retryCount]);

  const isLoading = authLoading || userLoading;
  const error = authError?.message || userError;

  return {
    user,
    firebaseUser,
    loading: isLoading,
    authLoading,
    userLoading,
    error,
    isAdmin: user?.role === 'admin',
    isActive: user?.isActive ?? true,
    isAuthenticated: !!firebaseUser && !!user,
  };
};