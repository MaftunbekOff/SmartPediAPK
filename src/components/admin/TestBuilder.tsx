import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Brain,
  Settings,
  Eye,
  Copy
} from 'lucide-react';
import { useTests } from '../../contexts/TestContext';
import { Test, Question, TestRecommendation, DEVELOPMENT_CATEGORIES, AGE_GROUPS } from '../../types/milestone';

export const TestBuilder: React.FC = () => {
  const { tests, createTest, updateTest, deleteTest } = useTests();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const handleCreateTest = () => {
    setEditingTest(null);
    setShowCreateForm(true);
  };

  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setShowCreateForm(true);
  };

  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        await deleteTest(testId);
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingTest(null);
  };

  if (showCreateForm) {
    return (
      <TestForm 
        test={editingTest} 
        onSave={editingTest ? updateTest : createTest}
        onCancel={handleCloseForm}
      />
    );
  }

  if (selectedTest) {
    return (
      <TestPreview 
        test={selectedTest} 
        onBack={() => setSelectedTest(null)}
        onEdit={() => handleEditTest(selectedTest)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Test Builder</h2>
            <p className="text-gray-600 dark:text-gray-400">Create and manage developmental milestone tests</p>
          </div>
        </div>
        <button
          onClick={handleCreateTest}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {test.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Age: {Math.floor(test.ageInMonths / 12)} years {test.ageInMonths % 12} months
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                test.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {test.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {test.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {test.questions.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {test.recommendations.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Recommendations</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedTest(test)}
                className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => handleEditTest(test)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteTest(test.id)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Tests Created
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first developmental milestone test to get started.
            </p>
            <button
              onClick={handleCreateTest}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Create First Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Test Form Component
interface TestFormProps {
  test: Test | null;
  onSave: (testData: any) => Promise<void>;
  onCancel: () => void;
}

const TestForm: React.FC<TestFormProps> = ({ test, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: test?.title || '',
    description: test?.description || '',
    ageInMonths: test?.ageInMonths || 12,
    isActive: test?.isActive ?? true,
    questions: test?.questions || [],
    recommendations: test?.recommendations || [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'recommendations'>('basic');

  const handleSave = async () => {
    setLoading(true);
    try {
      if (test) {
        await onSave(test.id, formData);
      } else {
        await onSave(formData);
      }
      onCancel();
    } catch (error) {
      console.error('Error saving test:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      category: 'physical',
      options: ['', '', '', ''],
      expectedAnswer: 0,
      weight: 1,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const addRecommendation = () => {
    const newRecommendation: TestRecommendation = {
      id: `r_${Date.now()}`,
      scoreRange: { min: 0, max: 100 },
      status: 'good',
      title: '',
      message: '',
      tips: [],
      urgency: 'low',
    };
    setFormData({
      ...formData,
      recommendations: [...formData.recommendations, newRecommendation],
    });
  };

  const updateRecommendation = (index: number, updates: Partial<TestRecommendation>) => {
    const updatedRecommendations = [...formData.recommendations];
    updatedRecommendations[index] = { ...updatedRecommendations[index], ...updates };
    setFormData({ ...formData, recommendations: updatedRecommendations });
  };

  const removeRecommendation = (index: number) => {
    setFormData({
      ...formData,
      recommendations: formData.recommendations.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {test ? 'Edit Test' : 'Create New Test'}
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Test'}</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'questions', label: `Questions (${formData.questions.length})` },
            { id: 'recommendations', label: `Recommendations (${formData.recommendations.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <Card>
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
                required
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Age *
              </label>
              <select
                value={formData.ageInMonths}
                onChange={(e) => setFormData({ ...formData, ageInMonths: parseInt(e.target.value) })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {AGE_GROUPS.map(group => (
                  <option key={group.months} value={group.months}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Make this test active and available to parents
              </label>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Questions ({formData.questions.length})
            </h3>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          {formData.questions.map((question, index) => (
            <Card key={question.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Question {index + 1}
                  </h4>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={question.category}
                      onChange={(e) => updateQuestion(index, { category: e.target.value as any })}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Answer
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
                    Question Text
                  </label>
                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(index, { text: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                    placeholder="Enter the question..."
                  />
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
                            ✓ Expected
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {formData.questions.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Questions Added
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add questions to create your milestone test.
                </p>
                <button
                  onClick={addQuestion}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Add First Question
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recommendations ({formData.recommendations.length})
            </h3>
            <button
              onClick={addRecommendation}
              className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Recommendation</span>
            </button>
          </div>

          {formData.recommendations.map((recommendation, index) => (
            <Card key={recommendation.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Recommendation {index + 1}
                  </h4>
                  <button
                    onClick={() => removeRecommendation(index)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={recommendation.status}
                      onChange={(e) => updateRecommendation(index, { status: e.target.value as any })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="needs_attention">Needs Attention</option>
                      <option value="consult_doctor">Consult Doctor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Development Tips (one per line)
                  </label>
                  <textarea
                    value={recommendation.tips.join('\n')}
                    onChange={(e) => updateRecommendation(index, { 
                      tips: e.target.value.split('\n').filter(tip => tip.trim()) 
                    })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={4}
                    placeholder="Enter development tips, one per line..."
                  />
                </div>
              </div>
            </Card>
          ))}

          {formData.recommendations.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Recommendations Added
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add recommendations based on different score ranges.
                </p>
                <button
                  onClick={addRecommendation}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Add First Recommendation
                </button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Test Preview Component
interface TestPreviewProps {
  test: Test;
  onBack: () => void;
  onEdit: () => void;
}

const TestPreview: React.FC<TestPreviewProps> = ({ test, onBack, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
          <span>Back to Tests</span>
        </button>
        <button
          onClick={onEdit}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Test</span>
        </button>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {test.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {test.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Age: {Math.floor(test.ageInMonths / 12)} years {test.ageInMonths % 12} months</span>
            <span>•</span>
            <span>{test.questions.length} questions</span>
            <span>•</span>
            <span>{test.recommendations.length} recommendations</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Questions Preview
            </h3>
            <div className="space-y-4">
              {test.questions.slice(0, 3).map((question, index) => {
                const categoryInfo = DEVELOPMENT_CATEGORIES[question.category];
                if (!categoryInfo) {
                  return null; // Skip rendering if category is not found
                }
                return (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span>{categoryInfo.icon}</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {categoryInfo.name}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {index + 1}. {question.text}
                    </h4>
                    <div className="space-y-1">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-400">{String.fromCharCode(65 + optionIndex)}.</span>
                          <span className={optionIndex === question.expectedAnswer ? 'font-medium text-green-600' : 'text-gray-600 dark:text-gray-400'}>
                            {option}
                          </span>
                          {optionIndex === question.expectedAnswer && (
                            <span className="text-green-600 text-xs">✓ Expected</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {test.questions.length > 3 && (
                <div className="text-center text-gray-600 dark:text-gray-400">
                  ... and {test.questions.length - 3} more questions
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recommendations
            </h3>
            <div className="space-y-3">
              {test.recommendations.map((recommendation, index) => (
                <div key={recommendation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {recommendation.title}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {recommendation.scoreRange.min}% - {recommendation.scoreRange.max}%
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {recommendation.message}
                  </p>
                  {recommendation.tips.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {recommendation.tips.length} development tips included
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};