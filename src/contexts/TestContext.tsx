import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Test, TestResult, TestSession, TestAnswer } from '../types/milestone';
import { useToast } from './ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useChildren } from './ChildrenContext';

interface TestContextType {
  tests: Test[];
  testResults: TestResult[];
  currentSession: TestSession | null;
  loading: boolean;
  error: string | null;
  
  // Test management
  createTest: (testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateTest: (testId: string, updates: Partial<Test>) => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;
  
  // Test taking
  startTest: (testId: string, childId: string) => void;
  answerQuestion: (questionId: string, selectedOption: number) => void;
  submitTest: (childId: string) => Promise<TestResult | null>;
  
  // Results
  getTestForAge: (ageInMonths: number) => Test | null;
  getChildResults: (childId: string) => TestResult[];
  
  // Session management
  clearSession: () => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const useTests = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTests must be used within a TestProvider');
  }
  return context;
};

interface TestProviderProps {
  children: React.ReactNode;
}

export const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  const { user, loading: authLoading, userLoading } = useAuth();
  const { children: userChildren } = useChildren();
  const { showToast } = useToast();
  
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tests - Fixed dependency array and loading logic
  useEffect(() => {
    // Don't start loading until auth is complete and we have a user
    if (authLoading || userLoading || !user) {
      return;
    }

    setLoading(true);
    setError(null);

    // Load all active tests - no role restriction needed for reading tests
    const q = query(
      collection(db, 'tests'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const testsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Test[];
          
          // Sort in memory to avoid index requirement
          testsData.sort((a, b) => a.ageInMonths - b.ageInMonths);
          
          console.log('Loaded tests:', testsData.length, testsData);
          setTests(testsData);
          setLoading(false);
          setError(null);
        } catch (err: any) {
          console.error('Error processing tests data:', err);
          setError('Failed to load tests');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to tests:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, userLoading]);

  // Load test results - Fixed to prevent unnecessary re-renders
  useEffect(() => {
    if (!user || userChildren.length === 0) {
      setTestResults([]);
      return;
    }

    const childIds = userChildren.map(child => child.id);
    
    // Prevent query with empty array
    if (childIds.length === 0) {
      setTestResults([]);
      return;
    }

    const q = query(
      collection(db, 'testResults'),
      where('childId', 'in', childIds)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const resultsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            completedAt: doc.data().completedAt?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
          })) as TestResult[];
          
          // Sort in memory to avoid index requirement
          resultsData.sort((a, b) => {
            if (!a.completedAt || !b.completedAt) return 0;
            return b.completedAt.getTime() - a.completedAt.getTime();
          });
          
          setTestResults(resultsData);
        } catch (err: any) {
          console.error('Error processing test results:', err);
        }
      },
      (err) => {
        console.error('Error listening to test results:', err);
      }
    );

    return () => unsubscribe();
  }, [user, userChildren]);

  const createTest = async (testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!user) {
      showToast('User not authenticated', 'error');
      throw new Error('User not authenticated');
    }

    try {
      await addDoc(collection(db, 'tests'), {
        ...testData,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      showToast('Milestone test created successfully', 'success');
    } catch (err: any) {
      console.error('Error creating test:', err);
      showToast('Failed to create milestone test', 'error');
      throw new Error(err.message);
    }
  };

  const updateTest = async (testId: string, updates: Partial<Test>) => {
    try {
      await updateDoc(doc(db, 'tests', testId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Milestone test updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating test:', err);
      showToast('Failed to update milestone test', 'error');
      throw new Error(err.message);
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      await updateDoc(doc(db, 'tests', testId), {
        isActive: false,
        updatedAt: new Date(),
      });
      showToast('Milestone test deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting test:', err);
      showToast('Failed to delete milestone test', 'error');
      throw new Error(err.message);
    }
  };

  const startTest = (testId: string, childId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) {
      showToast('Test not found', 'error');
      return;
    }

    setCurrentSession({
      testId,
      childId,
      currentQuestionIndex: 0,
      answers: [],
      startedAt: new Date(),
      isCompleted: false,
    });
  };

  const answerQuestion = (questionId: string, selectedOption: number) => {
    if (!currentSession) return;

    const test = tests.find(t => t.id === currentSession.testId);
    if (!test) return;

    const question = test.questions.find(q => q.id === questionId);
    if (!question) return;

    const answer: TestAnswer = {
      questionId,
      selectedOption,
      isCorrect: selectedOption === question.expectedAnswer,
    };

    const updatedAnswers = currentSession.answers.filter(a => a.questionId !== questionId);
    updatedAnswers.push(answer);

    setCurrentSession({
      ...currentSession,
      answers: updatedAnswers,
    });
  };

  const submitTest = async (childId: string): Promise<TestResult | null> => {
    if (!currentSession || !user) {
      showToast('Invalid test session', 'error');
      return null;
    }

    const test = tests.find(t => t.id === currentSession.testId);
    if (!test) {
      showToast('Test not found', 'error');
      return null;
    }

    try {
      // Calculate score
      const correctAnswers = currentSession.answers.filter(a => a.isCorrect).length;
      const score = Math.round((correctAnswers / test.questions.length) * 100);

      // Find appropriate recommendation
      let recommendation = test.recommendations?.find(r => 
        score >= r.scoreRange.min && score <= r.scoreRange.max
      );
      
      // If no recommendation found, use the last one or create a default
      if (!recommendation) {
        if (test.recommendations && test.recommendations.length > 0) {
          recommendation = test.recommendations[test.recommendations.length - 1];
        } else {
          // Create a default recommendation if none exist
          recommendation = {
            title: 'Assessment Complete',
            description: 'Your child has completed the milestone assessment.',
            tips: [],
            status: 'good',
            urgency: 'low',
            scoreRange: { min: 0, max: 100 }
          };
        }
      }

      const result: Omit<TestResult, 'id'> = {
        childId,
        parentId: user.id,
        testId: test.id,
        ageInMonths: test.ageInMonths,
        answers: currentSession.answers,
        score,
        totalQuestions: test.questions.length,
        correctAnswers,
        recommendation,
        submittedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'testResults'), result);
      
      const finalResult: TestResult = {
        id: docRef.id,
        ...result,
      };

      setCurrentSession({
        ...currentSession,
        isCompleted: true,
      });

      showToast('Milestone test completed successfully', 'success');
      return finalResult;
    } catch (err: any) {
      console.error('Error submitting test:', err);
      showToast('Failed to submit test results', 'error');
      throw new Error(err.message);
    }
  };

  const getTestForAge = (ageInMonths: number): Test | null => {
    // Find the most appropriate test for the given age
    // Find tests within a reasonable range (±6 months for better matching)
    const suitableTests = tests.filter(t => 
      Math.abs(t.ageInMonths - ageInMonths) <= 6
    );
    
    console.log('Finding test for age:', ageInMonths, 'months. Available tests:', tests.map(t => t.ageInMonths), 'Suitable:', suitableTests.map(t => t.ageInMonths));
    
    if (suitableTests.length === 0) return null;

    // Return the closest match
    return suitableTests.reduce((closest, current) => 
      Math.abs(current.ageInMonths - ageInMonths) < Math.abs(closest.ageInMonths - ageInMonths) 
        ? current : closest
    );
  };

  const getChildResults = (childId: string): TestResult[] => {
    return testResults.filter(result => result.childId === childId);
  };

  const clearSession = () => {
    setCurrentSession(null);
  };

  return (
    <TestContext.Provider value={{
      tests,
      testResults,
      currentSession,
      loading,
      error,
      createTest,
      updateTest,
      deleteTest,
      startTest,
      answerQuestion,
      submitTest,
      getTestForAge,
      getChildResults,
      clearSession,
    }}>
      {children}
    </TestContext.Provider>
  );
};