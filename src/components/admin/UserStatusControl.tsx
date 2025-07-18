import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  Shield, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { format } from 'date-fns';
import { useAdminData } from '../../hooks/useAdminData';

interface UserStatusControlProps {
  users?: User[];
  onUserUpdate?: () => void;
}

export const UserStatusControl: React.FC<UserStatusControlProps> = ({ 
  users: propUsers, 
  onUserUpdate 
}) => {
  const { showToast } = useToast();
  const { users: hookUsers, loading: dataLoading } = useAdminData();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Use users from props if provided, otherwise use from hook
  const users = propUsers || hookUsers;
  
  if (dataLoading && !propUsers) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              User Status Control
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Loading users...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    setLoading(userId);
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: newStatus,
        updatedAt: new Date(),
      });
      
      showToast(
        `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        'success'
      );
      
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast('Failed to update user status', 'error');
    } finally {
      setLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const activeUsers = users.filter(user => user.isActive).length;
  const inactiveUsers = users.filter(user => !user.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            User Status Control
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user access by activating or deactivating accounts
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Users</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User List */}
      <Card>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {user.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="capitalize">{user.role}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Joined {format(user.createdAt, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3 lg:flex-shrink-0">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <span>Inactive</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleStatusChange(user.id, !user.isActive)}
                  disabled={loading === user.id}
                  className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 ${
                    user.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading === user.id ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : user.isActive ? (
                    <>
                      <UserX className="h-4 w-4" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </div>
      </Card>

      {/* Warning Notice */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-2">
              Important Security Notice
            </h3>
            
            <div className="text-yellow-800 dark:text-yellow-300 text-sm space-y-2">
              <p>
                <strong>Deactivating a user will:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Immediately block their access to all application features</li>
                <li>Prevent them from reading or writing any data</li>
                <li>Sign them out of all active sessions</li>
                <li>Block API access through Firestore security rules</li>
              </ul>
              <p className="mt-3">
                <strong>Use this feature responsibly.</strong> Deactivated users will see an account deactivation message and must contact support for reactivation.
              </p>
            
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};