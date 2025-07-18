import React, { useState } from 'react';
import { X, User, Calendar, Users } from 'lucide-react';
import { Child } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (childData: Omit<Child, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onAddChild,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
    bloodType: '',
    allergies: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      setError('Child name is required');
      return;
    }
    
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }
    
    if (!formData.gender) {
      setError('Gender is required');
      return;
    }

    // Validate date of birth is not in the future
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      setError('Date of birth cannot be in the future');
      return;
    }
    
    // Validate child is not too old (reasonable limit)
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 18);
    if (birthDate < maxAge) {
      setError('Child must be under 18 years old');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Ensure data is properly formatted
      const childData = {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female',
        allergies: formData.allergies 
          ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) 
          : [],
      };

      // Only include bloodType if it has a value
      if (formData.bloodType.trim()) {
        (childData as any).bloodType = formData.bloodType.trim();
      }
      
      await onAddChild(childData);
      
      showToast('Child profile created successfully!', 'success');
      
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: 'male',
        bloodType: '',
        allergies: '',
      });
      onClose();
    } catch (err: any) {
      let errorMessage = 'Failed to create child profile';
      
      if (err.message.includes('Missing required fields')) {
        errorMessage = 'Please fill in all required fields';
      } else if (err.message.includes('permission-denied')) {
        errorMessage = 'Permission denied. Please ensure you are logged in as a parent and try again.';
      } else if (err.message.includes('invalid-argument')) {
        errorMessage = 'Invalid data provided. Please check all fields.';
      } else if (err.message.includes('unauthenticated')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.message.includes('User not authenticated')) {
        errorMessage = 'Please wait for your profile to load completely, then try again.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Child</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Child's Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter child's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blood Type (Optional)
            </label>
            <select
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Allergies (Optional)
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Separate multiple allergies with commas"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Adding...' : 'Add Child'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};