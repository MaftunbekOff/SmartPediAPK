import React from 'react';
import { ChevronDown, Plus, User } from 'lucide-react';
import { useChildren } from '../../contexts/ChildrenContext';
import { calculateAgeWithMonths } from '../../utils/dateUtils';
import { AddChildModal } from './AddChildModal';

export const ChildSelector: React.FC = () => {
  const { children, selectedChild, setSelectedChild, addChild } = useChildren();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAddChildModal, setShowAddChildModal] = React.useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {selectedChild ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                {selectedChild.photoURL ? (
                  <img 
                    src={selectedChild.photoURL} 
                    alt={selectedChild.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {selectedChild.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedChild.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {calculateAgeWithMonths(selectedChild.dateOfBirth)} old
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">Select a child</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose child profile</p>
              </div>
            </>
          )}
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChild(child);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  {child.photoURL ? (
                    <img 
                      src={child.photoURL} 
                      alt={child.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {child.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{child.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {calculateAgeWithMonths(child.dateOfBirth)} old
                  </p>
                </div>
              </button>
            ))}
            
            <button
              onClick={() => {
                setShowAddChildModal(true);
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">Add New Child</p>
                <p className="text-sm text-blue-500 dark:text-blue-300">Create a new profile</p>
              </div>
            </button>
          </div>
        )}
      </div>
      
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onAddChild={addChild}
      />
    </>
  );
};