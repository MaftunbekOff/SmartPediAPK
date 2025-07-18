import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyTabContentProps {
  isActive: boolean;
  children: React.ReactNode;
  onActivate?: () => void;
  loading?: boolean;
}

export const LazyTabContent: React.FC<LazyTabContentProps> = ({
  isActive,
  children,
  onActivate,
  loading = false,
}) => {
  const [hasBeenActivated, setHasBeenActivated] = useState(false);

  useEffect(() => {
    if (isActive && !hasBeenActivated) {
      setHasBeenActivated(true);
      onActivate?.();
    }
  }, [isActive, hasBeenActivated, onActivate]);

  if (!isActive) {
    return null;
  }

  if (!hasBeenActivated || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};