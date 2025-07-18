import React from 'react';
import { Shield, Heart } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'parent' | 'admin';
  onRoleChange: (role: 'parent' | 'admin') => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  disabled = false,
}) => {
  const roles = [
    {
      value: 'parent' as const,
      label: 'Parent',
      description: 'Track your children\'s health and development',
      icon: Heart,
      color: 'blue',
    },
    {
      value: 'admin' as const,
      label: 'Healthcare Professional',
      description: 'Manage content and monitor patient data',
      icon: Shield,
      color: 'red',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Choose Your Role
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select how you'll be using SmartPedi
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;
          
          return (
            <button
              key={role.value}
              onClick={() => onRoleChange(role.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? `border-${role.color}-500 bg-${role.color}-50 dark:bg-${role.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              disabled={disabled}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected 
                    ? `bg-${role.color}-100 dark:bg-${role.color}-900/30` 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isSelected 
                      ? `text-${role.color}-600 dark:text-${role.color}-400` 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isSelected 
                      ? `text-${role.color}-900 dark:text-${role.color}-400` 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {role.label}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    isSelected 
                      ? `text-${role.color}-700 dark:text-${role.color}-300` 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};