import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Calendar, Ruler, Weight, Edit, Camera, User, TrendingUp, Bell } from 'lucide-react';
import { useChildren } from '../../contexts/ChildrenContext';
import { Link } from 'react-router-dom';
import { calculateAgeWithMonths } from '../../utils/dateUtils';

export const ChildProfile: React.FC = () => {
  const { selectedChild, updateChild } = useChildren();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: selectedChild?.name || '',
    dateOfBirth: selectedChild?.dateOfBirth || '',
    gender: selectedChild?.gender || 'male',
    bloodType: selectedChild?.bloodType || '',
    allergies: selectedChild?.allergies.join(', ') || '',
  });

  React.useEffect(() => {
    if (selectedChild) {
      setEditData({
        name: selectedChild.name,
        dateOfBirth: selectedChild.dateOfBirth,
        gender: selectedChild.gender,
        bloodType: selectedChild.bloodType || '',
        allergies: selectedChild.allergies.join(', '),
      });
    }
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to view their profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateChild(selectedChild.id, {
        name: editData.name,
        dateOfBirth: editData.dateOfBirth,
        gender: editData.gender as 'male' | 'female',
        bloodType: editData.bloodType || undefined,
        allergies: editData.allergies 
          ? editData.allergies.split(',').map(a => a.trim()).filter(Boolean)
          : [],
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating child profile:', error);
      // Error handling is done in the context with toast notifications
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edit data to original values
    setEditData({
      name: selectedChild.name,
      dateOfBirth: selectedChild.dateOfBirth,
      gender: selectedChild.gender,
      bloodType: selectedChild.bloodType || '',
      allergies: selectedChild.allergies.join(', '),
    });
  };

  const growthData = [
    { month: 'Jan', height: 105, weight: 18 },
    { month: 'Mar', height: 107, weight: 19 },
    { month: 'Jun', height: 109, weight: 19.5 },
    { month: 'Sep', height: 110, weight: 20 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Child Profile</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage {selectedChild.name}'s health information and track growth.</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Edit className="h-4 w-4" />
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectedChild.photoURL ? (
                      <img 
                        src={selectedChild.photoURL} 
                        alt={selectedChild.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {selectedChild.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors duration-200">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                
                {isEditing ? (
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedChild.name}</h2>
                )}
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{calculateAgeWithMonths(selectedChild.dateOfBirth)} old</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Born:</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.dateOfBirth}
                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <span>{new Date(selectedChild.dateOfBirth).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    {isEditing ? (
                      <select
                        value={editData.gender}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value as 'male' | 'female' })}
                        className="ml-2 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <span className="ml-2 capitalize">{selectedChild.gender}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Details and Growth */}
          <div className="lg:col-span-2 space-y-8">
            {/* Medical Information */}
            <Card title="Medical Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blood Type
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.bloodType}
                      onChange={(e) => setEditData({ ...editData, bloodType: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{selectedChild.bloodType || 'Not specified'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allergies
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.allergies}
                      onChange={(e) => setEditData({ ...editData, allergies: e.target.value })}
                      placeholder="Separate allergies with commas"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : selectedChild.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedChild.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No known allergies</p>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/health"
                  className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-400">Growth Tracker</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">View growth charts</p>
                  </div>
                </Link>
                
                <Link
                  to="/health"
                  className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                >
                  <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-400">Health Reminders</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Manage reminders</p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};