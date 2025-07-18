import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { Plus, TrendingUp, Ruler, Weight } from 'lucide-react';
import { useGrowthData } from '../../hooks/useGrowthData';
import { useChildren } from '../../contexts/ChildrenContext';
import { useAuth } from '../../hooks/useAuth';
import { useWHOGrowthStandards } from '../../hooks/useWHOGrowthStandards';
import { calculateAgeInMonths } from '../../utils/dateUtils';
import { format } from 'date-fns';

export const GrowthTracker: React.FC = () => {
  const { selectedChild } = useChildren();
  const { growthRecords, loading, addGrowthRecord } = useGrowthData(selectedChild?.id || null);
  const { user, loading: authLoading } = useAuth();
  const { calculatePercentile, getGrowthAssessment } = useWHOGrowthStandards();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    notes: '',
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || authLoading || !user) return;

    const ageInMonths = calculateAgeInMonths(selectedChild.dateOfBirth);
    const heightPercentile = calculatePercentile(
      parseFloat(newRecord.height), 
      ageInMonths, 
      selectedChild.gender, 
      'height'
    );
    const weightPercentile = calculatePercentile(
      parseFloat(newRecord.weight), 
      ageInMonths, 
      selectedChild.gender, 
      'weight'
    );

    try {
      await addGrowthRecord({
        childId: selectedChild.id,
        parentId: selectedChild.parentId,
        date: newRecord.date,
        height: parseFloat(newRecord.height),
        weight: parseFloat(newRecord.weight),
        notes: newRecord.notes || undefined,
        percentiles: {
          heightPercentile,
          weightPercentile,
        },
      });
      
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        notes: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding growth record:', error);
      // Error handling is done in the hook with toast notifications
    }
  };

  const chartData = growthRecords.map(record => ({
    date: format(new Date(record.date), 'MMM yyyy'),
    height: record.height,
    weight: record.weight,
    fullDate: record.date,
  }));

  const latestRecord = growthRecords[growthRecords.length - 1];
  const previousRecord = growthRecords[growthRecords.length - 2];

  // Calculate growth assessment
  const growthAssessment = latestRecord?.percentiles 
    ? getGrowthAssessment(
        latestRecord.percentiles.heightPercentile,
        latestRecord.percentiles.weightPercentile
      )
    : null;

  const heightChange = latestRecord && previousRecord 
    ? latestRecord.height - previousRecord.height 
    : 0;
  const weightChange = latestRecord && previousRecord 
    ? latestRecord.weight - previousRecord.weight 
    : 0;

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to view their growth tracking.</p>
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
              Growth Tracker - {selectedChild.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Track your child's height and weight over time.</p>
          </div>
          <button
            disabled={authLoading}
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add Record</span>
          </button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Ruler className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Height</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {latestRecord ? `${latestRecord.height} cm` : 'No data'}
                </p>
                {heightChange !== 0 && (
                  <p className={`text-sm ${heightChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {heightChange > 0 ? '+' : ''}{heightChange.toFixed(1)} cm
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Weight className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Weight</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {latestRecord ? `${latestRecord.weight} kg` : 'No data'}
                </p>
                {weightChange !== 0 && (
                  <p className={`text-sm ${weightChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Growth Assessment */}
          {growthAssessment && (
            <Card>
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${growthAssessment.color}-100 dark:bg-${growthAssessment.color}-900/30 rounded-lg`}>
                  <TrendingUp className={`h-6 w-6 text-${growthAssessment.color}-600 dark:text-${growthAssessment.color}-400`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth Status</p>
                  <p className={`text-2xl font-bold text-${growthAssessment.color}-600 dark:text-${growthAssessment.color}-400`}>
                    {growthAssessment.status}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{growthAssessment.message}</p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{growthRecords.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">measurements</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Add Record Form */}
        {showAddForm && (
          <Card className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Measurement</h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.height}
                    onChange={(e) => setNewRecord({ ...newRecord, height: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="110.5"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.weight}
                    onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="20.5"
                    required
                  />
                  {latestRecord?.percentiles && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Previous percentiles: Height {latestRecord.percentiles.heightPercentile.toFixed(1)}%, 
                      Weight {latestRecord.percentiles.weightPercentile.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Growth Charts */}
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Height Progress">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="height" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Weight Progress">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Growth Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start tracking {selectedChild.name}'s growth by adding their first measurement.
              </p>
              <button
                disabled={authLoading}
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add First Record
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};