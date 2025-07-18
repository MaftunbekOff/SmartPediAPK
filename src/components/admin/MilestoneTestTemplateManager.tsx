import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Plus, Edit, Trash2, TestTube, Save, X } from 'lucide-react';
import { useMilestoneTests } from '../../hooks/useMilestoneTests';
import { MilestoneTestTemplate, MilestoneTestQuestion } from '../../types/milestone';

export const MilestoneTestTemplateManager: React.FC = () => {
  const { 
    testTemplates, 
    milestones, 
    createTestTemplate, 
    updateTestTemplate, 
    deleteTestTemplate,
    loading 
  } = useMilestoneTests();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MilestoneTestTemplate | null>(null);
  const [formData, setFormData] = useState({
    milestoneId: '',
    title: '',
    description: '',
    passingScore: 70,
    questions: [] as MilestoneTestQuestion[],
  });
  const [saving, setSaving] = useState(false);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormData({
      milestoneId: '',
      title: '',
      description: '',
      passingScore: 70,
      questions: [],
    });
    setShowForm(true);
  };

  const handleEdit = (template: MilestoneTestTemplate) => {
    setEditingTemplate(template);
    setFormData({
      milestoneId: template.milestoneId,
      title: template.title,
      description: template.description,
      passingScore: template.passingScore || 70,
      questions: [...template.questions],
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this test template?')) {
      try {
        await deleteTestTemplate(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const templateData = {
        ...formData,
        isActive: true,
      };

      if (editingTemplate) {
        await updateTestTemplate(editingTemplate.id, templateData);
      } else {
        await createTestTemplate(templateData);
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: MilestoneTestQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'yes_no',
      weight: 1,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const updateQuestion = (index: number, updates: Partial<MilestoneTestQuestion>) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    
    // Reset options and correct answer when type changes
    if (updates.type) {
      if (updates.type === 'yes_no') {
        updatedQuestions[index].options = ['Yes', 'No'];
        updatedQuestions[index].correctAnswer = 0;
      } else if (updates.type === 'multiple_choice') {
        updatedQuestions[index].options = ['', '', '', ''];
        updatedQuestions[index].correctAnswer = 0;
      } else if (updates.type === 'text') {
        delete updatedQuestions[index].options;
        delete updatedQuestions[index].correctAnswer;
      }
    }
    
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {editingTemplate ? 'Edit Test Template' : 'Create Test Template'}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Milestone *
                </label>
                <select
                  value={formData.milestoneId}
                  onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="1">Sitting Up (0y 6m)</option>
                  <option value="2">Walking (1y 0m)</option>
                  <option value="3">Speaking First Words (1y 6m)</option>
                  {milestones.map(milestone => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title} ({Math.floor(milestone.ageInMonths / 12)}y {milestone.ageInMonths % 12}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Walking Assessment"
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
                  Passing Score (%) - Optional
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="70"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  If set, milestone will be marked as achieved when this score is reached
                </p>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Questions ({formData.questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Question {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(index, { text: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter the question..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(index, { type: e.target.value as any })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="yes_no">Yes/No</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="text">Text Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Weight
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.weight || 1}
                          onChange={(e) => updateQuestion(index, { weight: parseInt(e.target.value) })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {question.type === 'multiple_choice' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(index, { options: newOptions });
                                }}
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuestion(index, { correctAnswer: optionIndex })}
                                className="text-blue-600"
                              />
                              <span className="text-xs text-gray-500">Correct</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'yes_no' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Correct Answer
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === 0}
                              onChange={() => updateQuestion(index, { correctAnswer: 0 })}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === 1}
                              onChange={() => updateQuestion(index, { correctAnswer: 1 })}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formData.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TestTube className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No questions added yet</p>
                  <p className="text-sm">Click "Add Question" to get started</p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saving || formData.questions.length === 0}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Milestone Test Templates
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage test templates for developmental milestones
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testTemplates.map((template) => {
          const milestone = milestones.find(m => m.id === template.milestoneId);
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {milestone?.title || 'Unknown Milestone'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {template.questions.length} questions
                    {template.passingScore && ` • ${template.passingScore}% to pass`}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created {template.createdAt.toLocaleDateString()}
              </div>
            </Card>
          );
        })}

        {testTemplates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <TestTube className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Test Templates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first test template to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create First Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};