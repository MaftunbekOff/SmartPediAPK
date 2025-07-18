import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Search, 
  AlertTriangle, 
  Thermometer, 
  Heart, 
  Eye, 
  Stethoscope,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Filter
} from 'lucide-react';
import { useIllnessData } from '../../hooks/useIllnessData';
import { useAuth } from '../../hooks/useAuth';
import { IllnessInfo as IllnessInfoType } from '../../types';

export const IllnessInfo: React.FC = () => {
  const { illnesses, loading, addIllness, updateIllness, deleteIllness } = useIllnessData();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIllness, setEditingIllness] = useState<IllnessInfoType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'respiratory',
    symptoms: '',
    causes: '',
    treatment: '',
    whenToSeeDoctor: '',
    prevention: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'respiratory', label: 'Respiratory' },
    { value: 'digestive', label: 'Digestive' },
    { value: 'general', label: 'General' },
    { value: 'ear', label: 'Ear' },
    { value: 'skin', label: 'Skin' },
    { value: 'eye', label: 'Eye' },
    { value: 'neurological', label: 'Neurological' },
    { value: 'infectious', label: 'Infectious' },
  ];

  const getIcon = (category: string) => {
    switch (category) {
      case 'respiratory': return Stethoscope;
      case 'digestive': return Heart;
      case 'general': return Thermometer;
      case 'ear': return Stethoscope;
      case 'skin': return Heart;
      case 'eye': return Eye;
      case 'neurological': return AlertTriangle;
      case 'infectious': return Thermometer;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'green';
      case 'moderate': return 'yellow';
      case 'severe': return 'red';
      default: return 'gray';
    }
  };

  const filteredIllnesses = illnesses.filter(illness => {
    const matchesSearch = illness.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         illness.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || illness.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const illnessData = {
        name: formData.name,
        category: formData.category,
        symptoms: formData.symptoms.split('\n').map(s => s.trim()).filter(Boolean),
        causes: formData.causes.split('\n').map(c => c.trim()).filter(Boolean),
        treatment: formData.treatment.split('\n').map(t => t.trim()).filter(Boolean),
        whenToSeeDoctor: formData.whenToSeeDoctor.split('\n').map(w => w.trim()).filter(Boolean),
        prevention: formData.prevention.split('\n').map(p => p.trim()).filter(Boolean),
        severity: formData.severity,
        ageGroups: ['0-2', '3-5', '6-8', '9-12', '12+'], // Default to all age groups
      };

      if (editingIllness) {
        await updateIllness(editingIllness.id, illnessData);
      } else {
        await addIllness(illnessData);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving illness:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'respiratory',
      symptoms: '',
      causes: '',
      treatment: '',
      whenToSeeDoctor: '',
      prevention: '',
      severity: 'mild',
    });
    setShowAddForm(false);
    setEditingIllness(null);
  };

  const handleEdit = (illness: IllnessInfoType) => {
    setFormData({
      name: illness.name,
      category: illness.category,
      symptoms: illness.symptoms.join('\n'),
      causes: illness.causes.join('\n'),
      treatment: illness.treatment.join('\n'),
      whenToSeeDoctor: illness.whenToSeeDoctor.join('\n'),
      prevention: illness.prevention.join('\n'),
      severity: illness.severity,
    });
    setEditingIllness(illness);
    setShowAddForm(true);
  };

  const handleDelete = async (illnessId: string) => {
    if (window.confirm('Are you sure you want to delete this illness information?')) {
      try {
        await deleteIllness(illnessId);
      } catch (error) {
        console.error('Error deleting illness:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading illness information...</span>
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
              Childhood Illness Information
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Learn about common childhood illnesses, symptoms, and when to seek medical attention.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Illness</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && isAdmin && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingIllness ? 'Edit Illness Information' : 'Add New Illness Information'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Illness Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Common Cold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptoms * (one per line)
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="Runny nose&#10;Sneezing&#10;Cough&#10;Mild fever"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Causes * (one per line)
                </label>
                <textarea
                  value={formData.causes}
                  onChange={(e) => setFormData({ ...formData, causes: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Viral infection&#10;Exposure to cold viruses&#10;Weakened immune system"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Treatment * (one per line)
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="Rest&#10;Plenty of fluids&#10;Saline nasal drops&#10;Honey for cough (>1 year)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  When to See a Doctor * (one per line)
                </label>
                <textarea
                  value={formData.whenToSeeDoctor}
                  onChange={(e) => setFormData({ ...formData, whenToSeeDoctor: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Fever over 102°F&#10;Difficulty breathing&#10;Symptoms lasting >10 days"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prevention Tips * (one per line)
                </label>
                <textarea
                  value={formData.prevention}
                  onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Regular handwashing&#10;Avoid sick contacts&#10;Good nutrition&#10;Adequate sleep"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : (editingIllness ? 'Update' : 'Add Illness')}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by illness name or symptom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Emergency Notice */}
        <Card className="mb-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">Emergency Warning</h3>
              <p className="text-red-800 dark:text-red-300 text-sm">
                If your child has difficulty breathing, is unconscious, has a severe allergic reaction, 
                or you're concerned about their immediate safety, call emergency services (911) immediately. 
                This information is for educational purposes only and should not replace professional medical advice.
              </p>
            </div>
          </div>
        </Card>

        {/* Illness Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredIllnesses.map((illness) => {
            const Icon = getIcon(illness.category);
            const severityColor = getSeverityColor(illness.severity);
            
            return (
              <Card key={illness.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{illness.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{illness.category}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${severityColor}-100 text-${severityColor}-800 capitalize`}>
                          {illness.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(illness)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(illness.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Common Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {illness.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Home Treatment</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {illness.treatment.map((treatment, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{treatment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2">When to See a Doctor</h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      {illness.whenToSeeDoctor.map((warning, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Prevention Tips</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {illness.prevention.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredIllnesses.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No Results Found' : 'No Illness Information Available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search terms or category filter.'
                : isAdmin 
                  ? 'Start by adding the first illness information entry.'
                  : 'Illness information will appear here once added by administrators.'
              }
            </p>
            {isAdmin && !searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add First Illness
              </button>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">Medical Disclaimer</h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              This information is provided for educational purposes only and should not be used as a substitute 
              for professional medical advice, diagnosis, or treatment. Always consult with your child's healthcare 
              provider for any health concerns or before making any medical decisions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};