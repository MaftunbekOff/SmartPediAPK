import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-all duration-200 hover:shadow-lg ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>}
          {subtitle && <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};