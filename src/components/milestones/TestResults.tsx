import React from 'react';
import { Card } from '../ui/Card';
import { 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  X,
  Download,
  Share,
  Calendar,
  Target
} from 'lucide-react';
import { TestResult } from '../../types/milestone';
import { DEVELOPMENT_CATEGORIES } from '../../types/milestone';
import { format } from 'date-fns';
import { useTests } from '../../contexts/TestContext';

interface TestResultsProps {
  result: TestResult;
  onClose: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ result, onClose }) => {
  const { tests } = useTests();
  
  // Get the test object to access questions
  const test = tests.find(t => t.id === result.testId);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'needs_attention': return AlertCircle;
      case 'consult_doctor': return AlertCircle;
      default: return Award;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'needs_attention': return 'yellow';
      case 'consult_doctor': return 'red';
      default: return 'gray';
    }
  };

  const StatusIcon = getStatusIcon(result.recommendation.status);
  const statusColor = getStatusColor(result.recommendation.status);

  // Calculate category performance
  const categoryPerformance = Object.keys(DEVELOPMENT_CATEGORIES).map(category => {
    // Ensure we have valid arrays to work with
    const answers = result.answers || [];
    const questions = test?.questions || [];
    
    // Filter answers for this category by matching questionId with question.id and question.category
    const categoryAnswers = answers.filter(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return question?.category === category;
    });
    
    const correctInCategory = categoryAnswers.filter(a => a.isCorrect).length;
    const totalInCategory = categoryAnswers.length;
    
    return {
      category,
      correct: correctInCategory,
      total: totalInCategory,
      percentage: totalInCategory > 0 ? Math.round((correctInCategory / totalInCategory) * 100) : 0,
    };
  }).filter(cat => cat.total > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Test Results
          </h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card>
              <div className="text-center mb-6">
                <div className={`w-24 h-24 bg-${statusColor}-100 dark:bg-${statusColor}-900/30 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <StatusIcon className={`h-12 w-12 text-${statusColor}-600 dark:text-${statusColor}-400`} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {result.score}%
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {result.correctAnswers} out of {result.totalQuestions} questions correct
                </p>
              </div>

              <div className={`p-4 bg-${statusColor}-50 dark:bg-${statusColor}-900/20 rounded-lg border border-${statusColor}-200 dark:border-${statusColor}-800`}>
                <h3 className={`font-semibold text-${statusColor}-900 dark:text-${statusColor}-400 mb-2`}>
                  {result.recommendation.title}
                </h3>
                <p className={`text-${statusColor}-800 dark:text-${statusColor}-300 mb-3`}>
                  {result.recommendation.message}
                </p>
                
                {result.recommendation.urgency === 'high' && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">High Priority</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Development Tips */}
            {result.recommendation.tips.length > 0 && (
              <Card title="Development Tips">
                <div className="space-y-3">
                  {result.recommendation.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Next Steps */}
            {result.recommendation.nextSteps && result.recommendation.nextSteps.length > 0 && (
              <Card title="Recommended Next Steps">
                <div className="space-y-3">
                  {result.recommendation.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Category Breakdown */}
            <Card title="Development Area Performance">
              <div className="space-y-4">
                {categoryPerformance.map(({ category, correct, total, percentage }) => {
                  const categoryInfo = DEVELOPMENT_CATEGORIES[category];
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {categoryInfo.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {correct} of {total} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          percentage >= 80 ? 'text-green-600' :
                          percentage >= 60 ? 'text-blue-600' :
                          percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {percentage}%
                        </div>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-blue-500' :
                              percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Info */}
            <Card title="Test Information">
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                  <span className="font-medium">{format(result.completedAt, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Age Group:</span>
                  <span className="font-medium">{Math.floor(result.ageInMonths / 12)} years</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-medium">{result.totalQuestions}</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card title="Actions">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                  <Share className="h-4 w-4" />
                  <span>Share Results</span>
                </button>
              </div>
            </Card>

            {/* Important Note */}
            <Card>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Important Note
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These results are for guidance only. Always consult with your pediatrician 
                    for professional medical advice about your child's development.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};