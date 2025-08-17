import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Lock
} from 'lucide-react';
import ResponsiveSignInForm from './ResponsiveSignInForm';
import ResponsiveSignUpForm from './ResponsiveSignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'welcome' | 'signin' | 'signup';
}

const AuthContainer: React.FC<AuthContainerProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = 'welcome' 
}) => {
  const [currentMode, setCurrentMode] = useState<'welcome' | 'signin' | 'signup' | 'forgot'>(defaultMode);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(defaultMode);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultMode]);

  const handleModeChange = (newMode: 'welcome' | 'signin' | 'signup' | 'forgot') => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMode(newMode);
      setIsAnimating(false);
    }, 150);
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleSignupSuccess = () => {
    // For signup, don't close modal immediately - show email verification message
    // The signup form will handle the flow
  };

  if (!isOpen) return null;

  const WelcomeScreen = () => (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl sm:rounded-3xl opacity-60"></div>
      
      <div className="relative p-4 sm:p-6 lg:p-8 text-center">
        {/* Logo & Brand */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome to FresherHub</h1>
          <p className="text-base sm:text-lg text-gray-600">Your AI-powered career companion</p>
        </div>

        {/* Value Propositions */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">5 AI Credits</h3>
              <p className="text-xs sm:text-sm text-gray-600">Resume analysis, cover letters & salary insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Secure & Private</h3>
              <p className="text-xs sm:text-sm text-gray-600">Enterprise-grade security for your data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Smart Matching</h3>
              <p className="text-xs sm:text-sm text-gray-600">AI-powered job recommendations</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 fill-current" />
            ))}
          </div>
          <p className="text-xs sm:text-sm text-amber-800 font-medium">Trusted by 50,000+ job seekers</p>
          <p className="text-xs text-amber-700">Join professionals who landed their dream jobs</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => handleModeChange('signup')}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          <button
            onClick={() => handleModeChange('signin')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-4 sm:space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Lock className="h-3 w-3" />
            <span className="hidden sm:inline">SSL Secured</span>
            <span className="sm:hidden">Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline">Global Access</span>
            <span className="sm:hidden">Global</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>50K+ Users</span>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-4 sm:mt-6 text-xs text-gray-500 px-2">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md mx-auto my-4 min-h-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all duration-200 z-10 hover:scale-110"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </button>

        {/* Content Container */}
        <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300 max-h-[95vh] overflow-y-auto ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          {currentMode === 'welcome' && <WelcomeScreen />}
          
          {currentMode === 'signin' && (
            <ResponsiveSignInForm
              onBack={() => handleModeChange('welcome')}
              onSuccess={handleSuccess}
              onSwitchToSignup={() => handleModeChange('signup')}
              onSwitchToForgot={() => handleModeChange('forgot')}
            />
          )}

          {currentMode === 'signup' && (
            <ResponsiveSignUpForm
              onBack={() => handleModeChange('welcome')}
              onSuccess={handleSignupSuccess}
              onSwitchToSignin={() => handleModeChange('signin')}
            />
          )}

          {currentMode === 'forgot' && (
            <ForgotPasswordForm
              onBack={() => handleModeChange('signin')}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;