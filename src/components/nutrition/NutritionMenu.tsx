import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Plus, Clock, Utensils, Apple, Coffee, Moon, Trash2, Edit } from 'lucide-react';
import { useNutritionData } from '../../hooks/useNutritionData';
import { useChildren } from '../../contexts/ChildrenContext';
import { NutritionRecord } from '../../types';

export const NutritionMenu: React.FC = () => {
  const { selectedChild } = useChildren();
  const { 
    nutritionRecords, 
    loading, 
    addNutritionRecord, 
    updateNutritionRecord,
    deleteNutritionRecord,
    toggleMealCompletion,
    getTodaysRecords,
    getRecordsByType,
    getTotalCalories,
    getCompletedMealsCount
  } = useNutritionData(selectedChild?.id || null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<NutritionRecord | null>(null);
  const [newMeal, setNewMeal] = useState({
    mealType: 'breakfast' as const,
    name: '',
    time: '',
    calories: 0,
    ingredients: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      const mealData = {
        childId: selectedChild.id,
        parentId: selectedChild.parentId,
        date: new Date().toISOString().split('T')[0],
        mealType: newMeal.mealType,
        name: newMeal.name,
        time: newMeal.time,
        calories: newMeal.calories || undefined,
        ingredients: newMeal.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        notes: newMeal.notes || undefined,
        completed: false,
      };

      if (editingMeal) {
        await updateNutritionRecord(editingMeal.id, mealData);
      } else {
        await addNutritionRecord(mealData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const resetForm = () => {
    setNewMeal({
      mealType: 'breakfast',
      name: '',
      time: '',
      calories: 0,
      ingredients: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingMeal(null);
  };

  const handleEdit = (meal: NutritionRecord) => {
    setNewMeal({
      mealType: meal.mealType,
      name: meal.name,
      time: meal.time,
      calories: meal.calories || 0,
      ingredients: meal.ingredients.join(', '),
      notes: meal.notes || ''
    });
    setEditingMeal(meal);
    setShowAddForm(true);
  };

  const handleDelete = async (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteNutritionRecord(mealId);
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return Coffee;
      case 'lunch': return Utensils;
      case 'dinner': return Moon;
      case 'snack': return Apple;
      default: return Utensils;
    }
  };

  const getMealColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'yellow';
      case 'lunch': return 'green';
      case 'dinner': return 'purple';
      case 'snack': return 'orange';
      default: return 'gray';
    }
  };

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to manage their nutrition.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const todaysRecords = getTodaysRecords();
  const totalCalories = getTotalCalories();
  const completedMeals = getCompletedMealsCount();
  const targetCalories = 1800; // This could be calculated based on child's age/weight

  const mealsByType = {
    breakfast: getRecordsByType('breakfast'),
    lunch: getRecordsByType('lunch'),
    dinner: getRecordsByType('dinner'),
    snack: getRecordsByType('snack')
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Nutrition Menu - {selectedChild.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Plan and track your child's daily meals and nutrition.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Meal</span>
          </button>
        </div>

        {/* Nutrition Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Today's Calories</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalCalories}
              </div>
              <p className="text-gray-600 dark:text-gray-400">of {targetCalories} target</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Meals Today</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {completedMeals}
              </div>
              <p className="text-gray-600 dark:text-gray-400">of {todaysRecords.length} planned</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nutrition Score</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {todaysRecords.length > 0 ? Math.round((completedMeals / todaysRecords.length) * 100) : 0}%
              </div>
              <p className="text-gray-600 dark:text-gray-400">Completion rate</p>
            </div>
          </Card>
        </div>

        {/* Add/Edit Meal Form */}
        {showAddForm && (
          <Card className="mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingMeal ? 'Edit Meal' : 'Add New Meal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meal Type
                    </label>
                    <select
                      value={newMeal.mealType}
                      onChange={(e) => setNewMeal({...newMeal, mealType: e.target.value as any})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meal Name
                    </label>
                    <input
                      type="text"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., Pancakes with syrup"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newMeal.time}
                      onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Calories (Optional)
                    </label>
                    <input
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ingredients (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newMeal.ingredients}
                    onChange={(e) => setNewMeal({...newMeal, ingredients: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Flour, Eggs, Milk, Butter"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newMeal.notes}
                    onChange={(e) => setNewMeal({...newMeal, notes: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                    placeholder="Nutritional benefits, special instructions..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    {editingMeal ? 'Update Meal' : 'Add Meal'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Meals by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(mealsByType).map(([type, typeMeals]) => {
            const Icon = getMealIcon(type);
            const color = getMealColor(type);
            
            return (
              <div key={type}>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon className={`h-5 w-5 text-${color}-600`} />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {type} ({typeMeals.length})
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {typeMeals.map((meal) => (
                    <Card key={meal.id} className={`hover:shadow-lg transition-shadow duration-200 ${
                      meal.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${
                              meal.completed 
                                ? 'text-green-800 dark:text-green-400 line-through' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {meal.name}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{meal.time}</span>
                            </span>
                          </div>
                          
                          {meal.calories && (
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <span className="font-medium">{meal.calories} cal</span>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {meal.ingredients.map((ingredient, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                          
                          {meal.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{meal.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleMealCompletion(meal.id, !meal.completed)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              meal.completed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {meal.completed ? 'Completed' : 'Mark Done'}
                          </button>
                          
                          <button
                            onClick={() => handleEdit(meal)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {typeMeals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Icon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No {type} meals planned</p>
                      <button
                        onClick={() => {
                          setNewMeal({ ...newMeal, mealType: type as any });
                          setShowAddForm(true);
                        }}
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Add {type} meal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {nutritionRecords.length === 0 && (
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Meals Planned</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start planning {selectedChild.name}'s nutrition by adding their first meal.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Add First Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};