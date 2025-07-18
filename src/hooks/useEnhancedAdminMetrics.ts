import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  limit,
  getCountFromServer,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { subDays, format, startOfDay } from 'date-fns';

interface EnhancedMetrics {
  totalUsers: number;
  totalParents: number;
  totalAdmins: number;
  totalChildren: number;
  totalTests: number;
  activeTests: number;
  totalTestResults: number;
  activeSessions: number;
  userGrowth: number;
  childrenGrowth: number;
  testsGrowth: number;
  resultsGrowth: number;
}

interface ActivityTrend {
  date: string;
  users: number;
  tests: number;
  children: number;
}

interface RecentActivity {
  type: 'user_registration' | 'test_submission' | 'test_creation' | 'system_alert';
  message: string;
  timestamp: Date;
  user?: string;
  severity?: 'low' | 'medium' | 'high';
}

interface RoleDistribution {
  name: string;
  value: number;
}

export const useEnhancedAdminMetrics = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [metrics, setMetrics] = useState<EnhancedMetrics>({
    totalUsers: 0,
    totalParents: 0,
    totalAdmins: 0,
    totalChildren: 0,
    totalTests: 0,
    activeTests: 0,
    totalTestResults: 0,
    activeSessions: 0,
    userGrowth: 0,
    childrenGrowth: 0,
    testsGrowth: 0,
    resultsGrowth: 0,
  });
  
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || authLoading) {
      return;
    }

    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date ranges
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);
        const sixtyDaysAgo = subDays(now, 60);

        // Get current counts
        const [
          usersCount,
          parentsCount,
          adminsCount,
          childrenCount,
          testsCount,
          activeTestsCount,
          testResultsCount
        ] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'parent'))),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'admin'))),
          getCountFromServer(collection(db, 'children')),
          getCountFromServer(collection(db, 'tests')),
          getCountFromServer(query(collection(db, 'tests'), where('isActive', '==', true))),
          getCountFromServer(collection(db, 'testResults'))
        ]);

        // Get previous period counts for growth calculation
        const [
          prevUsersCount,
          prevChildrenCount,
          prevTestsCount,
          prevResultsCount
        ] = await Promise.all([
          getCountFromServer(query(collection(db, 'users'), where('createdAt', '<=', thirtyDaysAgo))),
          getCountFromServer(query(collection(db, 'children'), where('createdAt', '<=', thirtyDaysAgo))),
          getCountFromServer(query(collection(db, 'tests'), where('createdAt', '<=', thirtyDaysAgo))),
          getCountFromServer(query(collection(db, 'testResults'), where('createdAt', '<=', thirtyDaysAgo)))
        ]);

        // Calculate growth percentages
        const calculateGrowth = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        const currentMetrics: EnhancedMetrics = {
          totalUsers: usersCount.data().count,
          totalParents: parentsCount.data().count,
          totalAdmins: adminsCount.data().count,
          totalChildren: childrenCount.data().count,
          totalTests: testsCount.data().count,
          activeTests: activeTestsCount.data().count,
          totalTestResults: testResultsCount.data().count,
          activeSessions: Math.floor(Math.random() * 50) + 10, // Mock data
          userGrowth: calculateGrowth(usersCount.data().count, prevUsersCount.data().count),
          childrenGrowth: calculateGrowth(childrenCount.data().count, prevChildrenCount.data().count),
          testsGrowth: calculateGrowth(testsCount.data().count, prevTestsCount.data().count),
          resultsGrowth: calculateGrowth(testResultsCount.data().count, prevResultsCount.data().count),
        };

        setMetrics(currentMetrics);

        // Generate activity trends for the last 30 days
        const trends: ActivityTrend[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = subDays(now, i);
          const dateStr = format(date, 'MMM dd');
          
          // Mock trend data - in production, you'd query actual daily counts
          trends.push({
            date: dateStr,
            users: Math.floor(Math.random() * 10) + 1,
            tests: Math.floor(Math.random() * 15) + 2,
            children: Math.floor(Math.random() * 8) + 1,
          });
        }
        setActivityTrends(trends);

        // Set role distribution
        setRoleDistribution([
          { name: 'Parents', value: currentMetrics.totalParents },
          { name: 'Admins', value: currentMetrics.totalAdmins },
        ]);

      } catch (err: any) {
        console.error('Error loading enhanced metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    // Set up real-time listeners for recent activity
    const setupActivityListeners = () => {
      const activities: RecentActivity[] = [];

      // Listen for new user registrations
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const userData = change.doc.data();
            activities.unshift({
              type: 'user_registration',
              message: `New ${userData.role} registered: ${userData.displayName}`,
              timestamp: userData.createdAt?.toDate() || new Date(),
              user: userData.displayName,
            });
          }
        });
        
        // Keep only the latest 20 activities
        setRecentActivity(activities.slice(0, 20));
      });

      // Listen for new test results
      const testResultsQuery = query(
        collection(db, 'testResults'),
        orderBy('completedAt', 'desc'),
        limit(10)
      );

      const unsubscribeTestResults = onSnapshot(testResultsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const resultData = change.doc.data();
            activities.unshift({
              type: 'test_submission',
              message: `Test completed with ${resultData.score}% score`,
              timestamp: resultData.completedAt?.toDate() || new Date(),
            });
          }
        });
        
        setRecentActivity(activities.slice(0, 20));
      });

      // Listen for new tests created
      const testsQuery = query(
        collection(db, 'tests'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const unsubscribeTests = onSnapshot(testsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const testData = change.doc.data();
            activities.unshift({
              type: 'test_creation',
              message: `New test created: ${testData.title}`,
              timestamp: testData.createdAt?.toDate() || new Date(),
            });
          }
        });
        
        setRecentActivity(activities.slice(0, 20));
      });

      return () => {
        unsubscribeUsers();
        unsubscribeTestResults();
        unsubscribeTests();
      };
    };

    const unsubscribeActivity = setupActivityListeners();

    return () => {
      unsubscribeActivity();
    };
  }, [isAdmin, authLoading]);

  return {
    metrics,
    activityTrends,
    recentActivity,
    roleDistribution,
    loading,
    error,
  };
};