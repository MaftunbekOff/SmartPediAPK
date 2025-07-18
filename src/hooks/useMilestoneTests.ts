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
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  MilestoneTestTemplate, 
  MilestoneTestAttempt, 
  Milestone,
  ChildMilestone,
  MilestoneTestAnswer
} from '../types/milestone';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export const useMilestoneTests = () => {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [testTemplates, setTestTemplates] = useState<MilestoneTestTemplate[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [userAttempts, setUserAttempts] = useState<MilestoneTestAttempt[]>([]);
  const [childMilestones, setChildMilestones] = useState<ChildMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load test templates and milestones
  useEffect(() => {
    if (authLoading || !firebaseUser || !user) return;

    const unsubscribes: (() => void)[] = [];

    // Load test templates
    const templatesQuery = query(
      collection(db, 'milestoneTestTemplates'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    unsubscribes.push(onSnapshot(templatesQuery, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as MilestoneTestTemplate[];
      setTestTemplates(templates);
    }));

    // Load milestones
    const milestonesQuery = query(
      collection(db, 'milestones'),
      where('isActive', '==', true),
      orderBy('ageInMonths', 'asc')
    );

    unsubscribes.push(onSnapshot(milestonesQuery, (snapshot) => {
      const milestonesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Milestone[];
      setMilestones(milestonesData);
    }));

    // Load user's test attempts
    const attemptsQuery = query(
      collection(db, 'milestoneTestAttempts'),
      where('userId', '==', firebaseUser.uid),
      orderBy('completedAt', 'desc')
    );

    unsubscribes.push(onSnapshot(attemptsQuery, (snapshot) => {
      const attempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as MilestoneTestAttempt[];
      setUserAttempts(attempts);
    }));

    // Load child milestones
    const childMilestonesQuery = query(
      collection(db, 'childMilestones'),
      where('parentId', '==', firebaseUser.uid)
    );

    unsubscribes.push(onSnapshot(childMilestonesQuery, (snapshot) => {
      const childMilestonesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        achievedAt: doc.data().achievedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ChildMilestone[];
      setChildMilestones(childMilestonesData);
      setLoading(false);
    }));

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [authLoading, firebaseUser, user]);

  // Admin functions for managing test templates
  const createTestTemplate = async (templateData: Omit<MilestoneTestTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can create test templates');
    }

    try {
      await addDoc(collection(db, 'milestoneTestTemplates'), {
        ...templateData,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      showToast('Test template created successfully', 'success');
    } catch (err: any) {
      showToast('Failed to create test template', 'error');
      throw err;
    }
  };

  const updateTestTemplate = async (templateId: string, updates: Partial<MilestoneTestTemplate>) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can update test templates');
    }

    try {
      await updateDoc(doc(db, 'milestoneTestTemplates', templateId), {
        ...updates,
        updatedAt: new Date(),
      });
      showToast('Test template updated successfully', 'success');
    } catch (err: any) {
      showToast('Failed to update test template', 'error');
      throw err;
    }
  };

  const deleteTestTemplate = async (templateId: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can delete test templates');
    }

    try {
      await updateDoc(doc(db, 'milestoneTestTemplates', templateId), {
        isActive: false,
        updatedAt: new Date(),
      });
      showToast('Test template deleted successfully', 'success');
    } catch (err: any) {
      showToast('Failed to delete test template', 'error');
      throw err;
    }
  };

  // Parent functions for taking tests
  const submitTestAttempt = async (
    testTemplateId: string,
    milestoneId: string,
    answers: MilestoneTestAnswer[],
    childId?: string
  ): Promise<MilestoneTestAttempt> => {
    if (!user || !firebaseUser) {
      throw new Error('User not authenticated');
    }

    const template = testTemplates.find(t => t.id === testTemplateId);
    if (!template) {
      throw new Error('Test template not found');
    }

    // Calculate results
    const result = calculateTestResult(template, answers);

    try {
      const attemptData: Omit<MilestoneTestAttempt, 'id'> = {
        userId: firebaseUser.uid,
        childId,
        milestoneId,
        testTemplateId,
        answers,
        result,
        completedAt: new Date(),
        createdAt: new Date(),
      };

      // Check if milestone should be marked as achieved
      if (template.passingScore && result.score && result.score >= template.passingScore) {
        attemptData.milestoneAchieved = true;
      }

      const docRef = await addDoc(collection(db, 'milestoneTestAttempts'), attemptData);

      // If milestone was achieved and childId is provided, update child milestone
      if (attemptData.milestoneAchieved && childId) {
        await markMilestoneAchieved(childId, milestoneId, docRef.id);
      }

      const finalAttempt: MilestoneTestAttempt = {
        id: docRef.id,
        ...attemptData,
      };

      showToast('Test completed successfully!', 'success');
      return finalAttempt;
    } catch (err: any) {
      showToast('Failed to submit test', 'error');
      throw err;
    }
  };

  const markMilestoneAchieved = async (childId: string, milestoneId: string, testAttemptId?: string) => {
    if (!user || !firebaseUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if child milestone already exists
      const existingMilestone = childMilestones.find(
        cm => cm.childId === childId && cm.milestoneId === milestoneId
      );

      if (existingMilestone) {
        // Update existing milestone
        await updateDoc(doc(db, 'childMilestones', existingMilestone.id), {
          achieved: true,
          achievedAt: new Date(),
          testAttemptId,
          updatedAt: new Date(),
        });
      } else {
        // Create new child milestone
        await addDoc(collection(db, 'childMilestones'), {
          childId,
          parentId: firebaseUser.uid,
          milestoneId,
          achieved: true,
          achievedAt: new Date(),
          testAttemptId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err: any) {
      console.error('Error marking milestone as achieved:', err);
      // Don't throw here as the test was still submitted successfully
    }
  };

  // Helper function to calculate test results
  const calculateTestResult = (template: MilestoneTestTemplate, answers: MilestoneTestAnswer[]) => {
    let correctAnswers = 0;
    let gradableQuestions = 0;

    template.questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (!answer) return;

      // Only grade multiple choice and yes/no questions
      if (question.type === 'multiple_choice' || question.type === 'yes_no') {
        gradableQuestions++;
        
        let isCorrect = false;
        if (question.type === 'multiple_choice' && typeof question.correctAnswer === 'number') {
          isCorrect = answer.answer === question.correctAnswer;
        } else if (question.type === 'yes_no' && typeof question.correctAnswer === 'string') {
          const answerText = question.options?.[answer.answer as number] || '';
          isCorrect = answerText.toLowerCase() === question.correctAnswer.toLowerCase();
        }

        if (isCorrect) {
          correctAnswers++;
          answer.isCorrect = true;
        } else {
          answer.isCorrect = false;
        }
      }
    });

    const score = gradableQuestions > 0 ? Math.round((correctAnswers / gradableQuestions) * 100) : undefined;
    const passed = template.passingScore && score ? score >= template.passingScore : undefined;

    return {
      score,
      passed,
      totalQuestions: template.questions.length,
      gradableQuestions,
      correctAnswers,
    };
  };

  // Utility functions
  const getTestTemplatesByMilestone = (milestoneId: string) => {
    return testTemplates.filter(template => template.milestoneId === milestoneId);
  };

  const getUserAttemptsByMilestone = (milestoneId: string) => {
    return userAttempts.filter(attempt => attempt.milestoneId === milestoneId);
  };

  const getChildMilestoneStatus = (childId: string, milestoneId: string) => {
    return childMilestones.find(cm => cm.childId === childId && cm.milestoneId === milestoneId);
  };

  const hasUserCompletedTest = (testTemplateId: string, childId?: string) => {
    return userAttempts.some(attempt => 
      attempt.testTemplateId === testTemplateId && 
      (!childId || attempt.childId === childId)
    );
  };

  return {
    // Data
    testTemplates,
    milestones,
    userAttempts,
    childMilestones,
    loading,
    error,

    // Admin functions
    createTestTemplate,
    updateTestTemplate,
    deleteTestTemplate,

    // Parent functions
    submitTestAttempt,
    markMilestoneAchieved,

    // Utility functions
    getTestTemplatesByMilestone,
    getUserAttemptsByMilestone,
    getChildMilestoneStatus,
    hasUserCompletedTest,
  };
};