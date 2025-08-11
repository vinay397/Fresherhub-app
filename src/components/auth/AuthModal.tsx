import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signIn, signUp, resetPassword } = useAuth();

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    setShowPassword(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode !== 'forgot') {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        setError('Full name is required');
        return false;
      }

      if (formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Sign in error:', error);
          if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message?.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else if (error.message?.includes('User not found')) {
            setError('No account found with this email. Please sign up first.');
          } else {
            setError('Sign in failed: ' + (error.message || 'Please try again.'));
          }
        } else {
          setSuccess('Successfully signed in! Welcome back.');
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 1500);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
            setError('Account with this email already exists. Switching to sign in...');
            setTimeout(() => {
              setMode('signin');
              setError('');
            }, 2000);
          } else {
            setError(error.message || 'Sign up failed. Please try again.');
          }
        } else {
          setSuccess('Account created successfully!');
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 1500);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(formData.email);
        if (error) {
          setError(error.message || 'Password reset failed. Please try again.');
        } else {
          setSuccess('Password reset email sent! Check your inbox (including spam folder) for reset instructions.');
          setTimeout(() => {
            setMode('signin');
            setSuccess('');
          }, 3000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to access your AI credits and saved jobs';
      case 'signup': return 'Get 5 AI credits that reset every 3 hours';
      case 'forgot': return 'Enter your email to receive a password reset link';
      default: return '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-gray-600 text-sm mt-1">{getSubtitle()}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>



        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {/* Name field - only for signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field - not for forgot password */}
          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your password"
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password - only for signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Confirm your password"
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Please wait...</span>
              </div>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => {
                  setMode('forgot');
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                disabled={loading}
              >
                Forgot your password?
              </button>
              <div className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    resetForm();
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => {
                setMode('signin');
                resetForm();
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              disabled={loading}
            >
              Back to sign in
            </button>
          )}
        </div>

        {/* Credits Info */}
        {mode !== 'forgot' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-sm">AI Credits System</span>
            </div>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• 1 free credit for guests (resets every 3 hours after use)</li>
              <li>• 5 credits for registered users</li>
              <li>• Credits reset 3 hours after you use all 5 credits</li>
              <li>• Use credits for AI resume analysis, cover letters & salary insights</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;