import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Flag,
  X
} from 'lucide-react';
import { useTests } from '../../contexts/TestContext';
import { useChildren } from '../../contexts/ChildrenContext';
import { DEVELOPMENT_CATEGORIES } from '../../types/milestone';
import { TestResults } from './TestResults';
import { useToast } from '../../contexts/ToastContext';

interface TestTakingProps {
  onComplete: () => void;
}

export const TestTaking: React.FC<TestTakingProps> = ({ onComplete }) => {
  const { selectedChild } = useChildren();
  const { 
    tests, 
    currentSession,
    answerQuestion, 
    submitTest, 
    clearSession 
  } = useTests();
  const { showToast } = useToast();
  
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const test = tests.find(t => t.id === currentSession?.testId);

  // Timer
  useEffect(() => {
    if (!currentSession || currentSession.isCompleted) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  if (!currentSession || !test || !selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Test Session Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load test session. Please ensure a child is selected and try again.
          </p>
          <button
            onClick={onComplete}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (showResults && testResult) {
    return (
      <TestResults 
        result={testResult} 
        onClose={() => {
          setShowResults(false);
          clearSession();
          onComplete();
        }} 
      />
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const currentAnswer = currentSession.answers.find(a => a.questionId === currentQuestion.id);

  const handleAnswerSelect = (optionIndex: number) => {
    answerQuestion(currentQuestion.id, optionIndex);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmitTest();
    } else {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, test.questions.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSubmitTest = async () => {
    try {
      const result = await submitTest(currentSession.childId);
      if (result) {
        setTestResult(result);
        setShowResults(true);
        showToast('Test completed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      showToast('Failed to submit test. Please try again.', 'error');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryInfo = DEVELOPMENT_CATEGORIES[currentQuestion.category];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
                  clearSession();
                  onComplete();
                }
              }}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Exit Test</span>
            </button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Flag className="h-4 w-4" />
                <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {test.title}
          </h1>
        </div>

        {/* Question Card */}
        <Card>
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {categoryInfo.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {categoryInfo.description}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              {currentQuestion.text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    currentAnswer?.selectedOption === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      currentAnswer?.selectedOption === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {currentAnswer?.selectedOption === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentSession.answers.length} of {test.questions.length} answered
            </div>

            <button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span>{isLastQuestion ? 'Submit Test' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Card>

        {/* Question Navigation */}
        <Card className="mt-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Question Navigation</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {test.questions.map((_, index) => {
              const isAnswered = currentSession.answers.some(a => a.questionId === test.questions[index].id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors duration-200 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};