import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineSupport } from '../../hooks/useOfflineSupport';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, hasBeenOffline } = useOfflineSupport();

  if (isOnline && !hasBeenOffline) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Back online' : 'Offline mode'}
        </span>
      </div>
    </div>
  );
};