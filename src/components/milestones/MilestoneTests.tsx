import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Brain, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useChildren } from '../../contexts/ChildrenContext';
import { useTests } from '../../contexts/TestContext';
import { useAuth } from '../../hooks/useAuth';
import { calculateAgeInMonths } from '../../utils/dateUtils';
import { TestTaking } from './TestTaking';
import { TestResults } from './TestResults';
import { DEVELOPMENT_CATEGORIES } from '../../types/milestone';
import { format } from 'date-fns';
import { useToast } from '../../contexts/ToastContext';

export const MilestoneTests: React.FC = () => {
  const { selectedChild } = useChildren();
  const { user, isAdmin } = useAuth();
  const { 
    tests, 
    getTestForAge, 
    getChildResults, 
    currentSession, 
    startTest,
    createTest,
    updateTest,
    deleteTest,
    loading: testsLoading, 
    error: testsError 
  } = useTests();
  const { showToast } = useToast();
  
  const [showTest, setShowTest] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ageInMonths: 12,
    questions: [],
    recommendations: []
  });

  // Calculate child age and find appropriate test
  const ageInMonths = selectedChild ? calculateAgeInMonths(selectedChild.dateOfBirth) : 0;
  const childResults = selectedChild ? getChildResults(selectedChild.id) : [];
  const latestResult = childResults[0]; // Most recent result

  if (!selectedChild && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to view milestone tests.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (testsError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-300 dark:text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Tests</h3>
            <p className="text-red-600 dark:text-red-400">{testsError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while tests are loading
  if (testsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Developmental Milestones{selectedChild ? ` - ${selectedChild.name}` : ''}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Loading milestone tests...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show test taking interface if a test is active
  if (currentSession && showTest) {
    return <TestTaking onComplete={() => setShowTest(false)} />;
  }

  const handleStartTest = (testId: string) => {
    if (!selectedChild) {
      showToast('Please select a child first', 'error');
      return;
    }
    
    try {
      startTest(testId, selectedChild.id);
      setShowTest(true);
    } catch (error) {
      console.error('Error starting test:', error);
      showToast('Failed to start test', 'error');
    }
  };

  const handleCreateTest = () => {
    setEditingTest(null);
    setFormData({
      title: '',
      description: '',
      ageInMonths: 12,
      questions: [],
      recommendations: []
    });
    setShowCreateForm(true);
  };

  const handleEditTest = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      ageInMonths: test.ageInMonths,
      questions: [...test.questions],
      recommendations: [...test.recommendations]
    });
    setShowCreateForm(true);
  };

  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest(testId);
        showToast('Test deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting test:', error);
        showToast('Failed to delete test', 'error');
      }
    }
  };

  const handleSaveTest = async () => {
    if (!formData.title || !formData.description || formData.questions.length === 0) {
      showToast('Please fill in all required fields and add at least one question', 'error');
      return;
    }

    try {
      if (editingTest) {
        await updateTest(editingTest.id, formData);
        showToast('Test updated successfully', 'success');
      } else {
        await createTest({
          ...formData,
          isActive: true
        });
        showToast('Test created successfully', 'success');
      }
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error saving test:', error);
      showToast('Failed to save test', 'error');
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      category: 'physical',
      options: ['', '', '', ''],
      expectedAnswer: 0,
      weight: 1
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const updateQuestion = (index: number, updates: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const addRecommendation = () => {
    const newRecommendation = {
      id: `r_${Date.now()}`,
      scoreRange: { min: 0, max: 100 },
      status: 'good',
      title: '',
      message: '',
      tips: [],
      urgency: 'low'
    };
    setFormData({
      ...formData,
      recommendations: [...formData.recommendations, newRecommendation]
    });
  };

  const updateRecommendation = (index: number, updates: any) => {
    const updatedRecommendations = [...formData.recommendations];
    updatedRecommendations[index] = { ...updatedRecommendations[index], ...updates };
    setFormData({ ...formData, recommendations: updatedRecommendations });
  };

  const removeRecommendation = (index: number) => {
    setFormData({
      ...formData,
      recommendations: formData.recommendations.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'needs_attention': return 'yellow';
      case 'consult_doctor': return 'red';
      default: return 'gray';
    }
  };
  // Admin Test Creation Form
  if (showCreateForm && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {editingTest ? 'Edit Test' : 'Create New Test'}
            </h1>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <Card title="Test Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., 1-Year Milestone Assessment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Describe what this test assesses..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Age (months) *
                  </label>
                  <input
                    type="number"
                    value={formData.ageInMonths}
                    onChange={(e) => setFormData({ ...formData, ageInMonths: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    min="1"
                    max="216"
                  />
                </div>
              </div>
            </Card>

            {/* Questions */}
            <Card title={`Questions (${formData.questions.length})`}>
              <div className="space-y-4">
                <button
                  onClick={addQuestion}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </button>

                {formData.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Question {index + 1}
                      </h4>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Question Text
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(index, { text: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter the question..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category
                          </label>
                          <select
                            value={question.category}
                            onChange={(e) => updateQuestion(index, { category: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            {Object.entries(DEVELOPMENT_CATEGORIES).map(([key, category]) => (
                              <option key={key} value={key}>
                                {category.icon} {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Correct Answer
                          </label>
                          <select
                            value={question.expectedAnswer}
                            onChange={(e) => updateQuestion(index, { expectedAnswer: parseInt(e.target.value) })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            {question.options.map((_, optionIndex) => (
                              <option key={optionIndex} value={optionIndex}>
                                Option {optionIndex + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Answer Options
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                                {optionIndex + 1}.
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(index, { options: newOptions });
                                }}
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              {optionIndex === question.expectedAnswer && (
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card title={`Recommendations (${formData.recommendations.length})`}>
              <div className="space-y-4">
                <button
                  onClick={addRecommendation}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Recommendation</span>
                </button>

                {formData.recommendations.map((recommendation, index) => (
                  <div key={recommendation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Recommendation {index + 1}
                      </h4>
                      <button
                        onClick={() => removeRecommendation(index)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Score Range (Min %)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={recommendation.scoreRange.min}
                          onChange={(e) => updateRecommendation(index, {
                            scoreRange: { ...recommendation.scoreRange, min: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Score Range (Max %)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={recommendation.scoreRange.max}
                          onChange={(e) => updateRecommendation(index, {
                            scoreRange: { ...recommendation.scoreRange, max: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={recommendation.status}
                          onChange={(e) => updateRecommendation(index, { status: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="needs_attention">Needs Attention</option>
                          <option value="consult_doctor">Consult Doctor</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={recommendation.title}
                          onChange={(e) => updateRecommendation(index, { title: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., Excellent Development Progress"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          value={recommendation.message}
                          onChange={(e) => updateRecommendation(index, { message: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          rows={3}
                          placeholder="Detailed message for parents..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex space-x-3">
              <button
                onClick={handleSaveTest}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>{editingTest ? 'Update Test' : 'Create Test'}</span>
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Developmental Milestones{selectedChild ? ` - ${selectedChild.name}` : ''}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isAdmin 
                ? 'Create and manage developmental milestone tests for children.'
                : 'Track your child\'s development with age-appropriate milestone assessments.'
              }
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateTest}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create Test</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Tests Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Available Milestone Tests">
              {tests.length > 0 ? (
                <div className="space-y-4">
                  {tests.map((test) => {
                    const isAppropriate = selectedChild && Math.abs(test.ageInMonths - ageInMonths) <= 12;
                    const hasCompleted = childResults.some(result => result.testId === test.id);
                    
                    return (
                      <div
                        key={test.id}
                        className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                          isAppropriate 
                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        } ${hasCompleted ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              isAppropriate 
                                ? 'bg-blue-100 dark:bg-blue-900/30' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <Brain className={`h-5 w-5 ${
                                isAppropriate 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {test.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Target Age: {Math.floor(test.ageInMonths / 12)} years {test.ageInMonths % 12} months
                              </p>
                              {selectedChild && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {selectedChild.name} is {Math.floor(ageInMonths / 12)} years {Math.round(ageInMonths % 12)} months old
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {hasCompleted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            )}
                            {isAppropriate && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Recommended
                              </span>
                            )}
                            {isAdmin && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEditTest(test)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTest(test.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            {!isAdmin && selectedChild && (
                              <button
                                onClick={() => handleStartTest(test.id)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                              >
                                <Play className="h-4 w-4" />
                                <span>{hasCompleted ? 'Retake' : 'Start Test'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {test.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {test.questions.length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              ~{Math.ceil(test.questions.length * 1.5)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Minutes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {new Set(test.questions.map(q => q.category)).size}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Areas</div>
                          </div>
                        </div>

                        {/* Categories Preview */}
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(test.questions.map(q => q.category))).map(category => {
                            const categoryInfo = DEVELOPMENT_CATEGORIES[category];
                            if (!categoryInfo) {
                              return null; // Skip rendering if category is not found
                            }
                            return (
                              <span
                                key={category}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <span>{categoryInfo.icon}</span>
                                <span>{categoryInfo.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Tests Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isAdmin 
                      ? 'Create your first milestone test to get started.'
                      : 'No milestone tests are currently available. Please check back later.'
                    }
                  </p>
                  {isAdmin && (
                    <button
                      onClick={handleCreateTest}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create First Test
                    </button>
                  )}
                </div>
              )}
            </Card>

            {/* Previous Results for Parents */}
            {!isAdmin && childResults.length > 0 && (
              <Card title="Previous Test Results">
                <div className="space-y-4">
                  {childResults.slice(0, 3).map((result) => {
                    const statusColor = getStatusColor(result.recommendation.status);
                    return (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 bg-${statusColor}-100 dark:bg-${statusColor}-900/30 rounded-lg`}>
                            <Award className={`h-5 w-5 text-${statusColor}-600 dark:text-${statusColor}-400`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {Math.floor(result.ageInMonths / 12)} Year Milestone Test
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {format(result.completedAt, 'MMM dd, yyyy')} • Score: {result.score}%
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800 capitalize`}>
                          {result.recommendation?.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Result Summary for Parents */}
            {!isAdmin && latestResult && (
              <Card title="Latest Assessment">
                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold text-${getStatusColor(latestResult.recommendation.status)}-600 dark:text-${getStatusColor(latestResult.recommendation.status)}-400`}>
                    {latestResult.score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {latestResult.correctAnswers} of {latestResult.totalQuestions} correct
                  </div>
                </div>

                <div className={`p-3 bg-${getStatusColor(latestResult.recommendation.status)}-50 dark:bg-${getStatusColor(latestResult.recommendation.status)}-900/20 rounded-lg mb-4`}>
                  <h4 className={`font-medium text-${getStatusColor(latestResult.recommendation.status)}-900 dark:text-${getStatusColor(latestResult.recommendation.status)}-400 mb-1`}>
                    {latestResult.recommendation.title}
                  </h4>
                  <p className={`text-sm text-${getStatusColor(latestResult.recommendation.status)}-800 dark:text-${getStatusColor(latestResult.recommendation.status)}-300`}>
                    {latestResult.recommendation.message}
                  </p>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Completed {format(latestResult.completedAt, 'MMM dd, yyyy')}
                </div>
              </Card>
            )}

            {/* Development Categories Info */}
            <Card title="Development Areas">
              <div className="space-y-3">
                {Object.entries(DEVELOPMENT_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tips for Parents */}
            {!isAdmin && (
              <Card title="Assessment Tips">
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Answer based on what your child can do consistently</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Take the test in a quiet, comfortable environment</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p>Results are for guidance only - consult your pediatrician for concerns</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};