import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Plus, Clock, Pill, Droplets, Moon, Utensils, Check, X } from 'lucide-react';
import { useHealthReminders } from '../../hooks/useHealthReminders';
import { useChildren } from '../../contexts/ChildrenContext';

export const HealthReminders: React.FC = () => {
  const { selectedChild } = useChildren();
  const { 
    reminders, 
    loading, 
    addReminder, 
    updateReminder, 
    deleteReminder, 
    toggleReminder,
    markCompleted 
  } = useHealthReminders(selectedChild?.id || null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'medicine' as const,
    title: '',
    time: '',
    frequency: 'Daily',
    description: '',
    notes: ''
  });

  const handleToggleReminder = async (id: string, isActive: boolean) => {
    try {
      await toggleReminder(id, !isActive);
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleAddReminder = async () => {
    if (!selectedChild) return;
    
    if (newReminder.title && newReminder.time) {
      try {
        await addReminder({
          childId: selectedChild.id,
          type: newReminder.type,
          title: newReminder.title,
          description: newReminder.description,
          time: newReminder.time,
          frequency: newReminder.frequency as any,
          isActive: true,
          notificationEnabled: true,
          completedDates: [],
        });
        
        setNewReminder({
          type: 'medicine',
          title: '',
          time: '',
          frequency: 'Daily',
          description: '',
          notes: ''
        });
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding reminder:', error);
      }
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markCompleted(id, today);
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await deleteReminder(id);
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to manage their health reminders.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }
  const activeReminders = reminders.filter(r => r.isActive);
  const inactiveReminders = reminders.filter(r => !r.isActive);

  const getIcon = (type: string) => {
    switch (type) {
      case 'medicine': return Pill;
      case 'water': return Droplets;
      case 'sleep': return Moon;
      case 'meal': return Utensils;
      default: return Clock;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'medicine': return 'blue';
      case 'water': return 'cyan';
      case 'sleep': return 'purple';
      case 'meal': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Health Reminders - {selectedChild.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Set and track daily health reminders for {selectedChild.name}.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Reminder</span>
          </button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Reminder</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({...newReminder, type: e.target.value as any})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="medicine">Medicine</option>
                    <option value="water">Water</option>
                    <option value="sleep">Sleep</option>
                    <option value="meal">Meal</option>
                    <option value="appointment">Appointment</option>
                    <option value="exercise">Exercise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Vitamin C"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="once">Once</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Brief description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newReminder.notes}
                  onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddReminder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Reminder
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Reminders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Active ({activeReminders.length})
            </h2>
            <div className="space-y-4">
              {activeReminders.map((reminder) => {
                const Icon = getIcon(reminder.type);
                const color = getColor(reminder.type);
                const today = new Date().toISOString().split('T')[0];
                const isCompletedToday = reminder.completedDates.includes(today);
                
                return (
                  <Card key={reminder.id} className="hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-${color}-100`}>
                          <Icon className={`h-6 w-6 text-${color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{reminder.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{reminder.time}</span>
                            </span>
                            <span>{reminder.frequency}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!isCompletedToday && (
                          <button
                            onClick={() => handleMarkCompleted(reminder.id)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleReminder(reminder.id, reminder.isActive)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {isCompletedToday && (
                      <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                        ✓ Completed today
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Inactive Reminders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Inactive ({inactiveReminders.length})
            </h2>
            <div className="space-y-4">
              {inactiveReminders.map((reminder) => {
                const Icon = getIcon(reminder.type);
                return (
                  <Card key={reminder.id} className="bg-gray-50 dark:bg-gray-800 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                          <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600 dark:text-gray-400">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">{reminder.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{reminder.time}</span>
                            </span>
                            <span>{reminder.frequency}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleReminder(reminder.id, reminder.isActive)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {inactiveReminders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No inactive reminders</p>
              </div>
            )}
          </div>
        </div>
        
        {activeReminders.length === 0 && inactiveReminders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Reminders Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first health reminder for {selectedChild.name}.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add First Reminder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};