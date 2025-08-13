import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Sparkles, Shield, Zap } from 'lucide-react';
import SigninPage from './SigninPage';
import SignupPage from './SignupPage';
import ForgotPasswordPage from './ForgotPasswordPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'signin' | 'signup' | 'welcome';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = 'welcome' 
}) => {
  const [mode, setMode] = useState<'welcome' | 'signin' | 'signup' | 'forgot'>(defaultMode);

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (mode === 'forgot') {
      setMode('signin');
    } else if (mode === 'signup' || mode === 'signin') {
      setMode('welcome');
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  // Welcome Screen Component
  const WelcomeScreen = () => (
    <div className="bg-white rounded-2xl shadow-2xl w-full p-8 text-center">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FresherHub</h2>
        <p className="text-gray-600 text-lg">Your AI-powered job search companion</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Zap className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">5 AI Credits for Resume Analysis</span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
          <Shield className="h-5 w-5 text-purple-600" />
          <span className="text-purple-800 font-medium">Secure Account & Data Protection</span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <Sparkles className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Personalized Job Recommendations</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => setMode('signup')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <UserPlus className="h-5 w-5" />
          <span>Create Account</span>
        </button>
        
        <button
          onClick={() => setMode('signin')}
          className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-gray-50"
        >
          <LogIn className="h-5 w-5" />
          <span>Sign In</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-sm text-gray-500">
        <p>By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg mx-auto my-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Content */}
        {mode === 'welcome' && <WelcomeScreen />}
        
        {mode === 'signin' && (
          <SigninPage
            onBack={handleBack}
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToForgot={() => setMode('forgot')}
          />
        )}

        {mode === 'signup' && (
          <SignupPage
            onBack={handleBack}
            onSuccess={handleSuccess}
            onSwitchToSignin={() => setMode('signin')}
          />
        )}

        {mode === 'forgot' && (
          <ForgotPasswordPage
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;