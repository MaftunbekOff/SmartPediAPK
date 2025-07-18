import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Home className="h-5 w-5" />
            <span>Go to Homepage</span>
          </Link>
          
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          )}
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};