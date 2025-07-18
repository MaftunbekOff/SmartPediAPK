import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Eye,
  Save,
  X,
  Stethoscope,
  Heart,
  Thermometer
} from 'lucide-react';
import { useIllnessData } from '../../hooks/useIllnessData';
import { IllnessInfo } from '../../types';

export const IllnessManager: React.FC = () => {
  const { illnesses, loading, addIllness, updateIllness, deleteIllness } = useIllnessData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingIllness, setEditingIllness] = useState<IllnessInfo | null>(null);
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

  const filteredIllnesses = illnesses.filter(illness => {
    const matchesSearch = illness.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         illness.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || illness.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || illness.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
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
    setShowForm(false);
    setEditingIllness(null);
  };

  const handleEdit = (illness: IllnessInfo) => {
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
    setShowForm(true);
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

  const getIcon = (category: string) => {
    switch (category) {
      case 'respiratory': return Stethoscope;
      case 'digestive': return Heart;
      case 'general': return Thermometer;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading illness data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Illness Information Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredIllnesses.length} of {illnesses.length} illness entries
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Illness</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptoms * (one per line)
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="Runny nose&#10;Sneezing&#10;Cough"
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
                  rows={4}
                  placeholder="Viral infection&#10;Exposure to viruses"
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
                  placeholder="Rest&#10;Plenty of fluids&#10;Saline drops"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  When to See Doctor * (one per line)
                </label>
                <textarea
                  value={formData.whenToSeeDoctor}
                  onChange={(e) => setFormData({ ...formData, whenToSeeDoctor: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="High fever&#10;Difficulty breathing&#10;Severe symptoms"
                  required
                />
              </div>
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
                placeholder="Regular handwashing&#10;Avoid sick contacts&#10;Good nutrition"
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

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by illness name or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Severities</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Illness List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIllnesses.map((illness) => {
          const Icon = getIcon(illness.category);
          const severityColor = getSeverityColor(illness.severity);
          
          return (
            <Card key={illness.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{illness.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{illness.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${severityColor}-100 text-${severityColor}-800 capitalize`}>
                        {illness.severity}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
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
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms</h4>
                  <div className="flex flex-wrap gap-1">
                    {illness.symptoms.slice(0, 3).map((symptom, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                    {illness.symptoms.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{illness.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treatment Options</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {illness.treatment.length} treatment options available
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prevention</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {illness.prevention.length} prevention tips
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredIllnesses.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm || categoryFilter !== 'all' || severityFilter !== 'all' 
              ? 'No illness information found'
              : 'No illness information available'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter !== 'all' || severityFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Start by adding your first illness information entry.'
            }
          </p>
          {(!searchTerm && categoryFilter === 'all' && severityFilter === 'all') && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add First Illness
            </button>
          )}
        </div>
      )}
    </div>
  );
};