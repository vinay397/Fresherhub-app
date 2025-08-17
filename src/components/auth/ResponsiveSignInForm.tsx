import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  LogIn,
  UserPlus,
  Shield,
  Zap,
  Key,
  RefreshCw
} from 'lucide-react';
import { useAdvancedAuth } from '../../hooks/useAdvancedAuth';

interface SignInFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

const ResponsiveSignInForm: React.FC<SignInFormProps> = ({ 
  onBack, 
  onSuccess, 
  onSwitchToSignup, 
  onSwitchToForgot 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const { signIn } = useAdvancedAuth();

  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    if (field === 'email') {
      if (!value.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (field === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    return errors;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (error) setError('');
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    const errors = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, ...errors }));
  };

  const validateForm = () => {
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const allErrors = { ...emailErrors, ...passwordErrors };
    
    setFieldErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        let errorMessage = result.error.message;
        
        // Enhanced error handling with specific UI messages
        if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email first. Check your inbox for the verification link.';
        } else if (errorMessage.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.';
        } else if (errorMessage.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        }
        
        setError(errorMessage);
      } else {
        setSuccess('Sign in successful! Welcome back to FresherHub.');
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-h-[95vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3 sm:mr-4 flex-shrink-0"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </button>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Welcome back</h2>
          <p className="text-sm sm:text-base text-gray-600">Sign in to access your AI-powered career tools</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Email address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                fieldErrors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : formData.email && !fieldErrors.email
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {formData.email && !fieldErrors.email && (
              <CheckCircle2 className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            )}
          </div>
          {fieldErrors.email && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                fieldErrors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : formData.password && !fieldErrors.password
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm transition-colors flex items-center space-x-1 ml-auto"
            disabled={loading}
          >
            <Key className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Forgot your password?</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-red-800 font-semibold text-xs sm:text-sm">Invalid Credentials</h4>
                <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{error}</p>
                
                {/* Helpful Actions for Different Error Types */}
                {error.includes('Invalid email or password') && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={onSwitchToForgot}
                      className="w-full bg-white hover:bg-gray-50 text-red-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border border-red-200 hover:border-red-300 text-xs sm:text-sm"
                    >
                      <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Reset Password</span>
                    </button>
                  </div>
                )}
                
                {error.includes('No account found') && (
                  <div className="mt-3">
                    <button
                      onClick={onSwitchToSignup}
                      className="w-full bg-white hover:bg-gray-50 text-red-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border border-red-200 hover:border-red-300 text-xs sm:text-sm"
                    >
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Create Account</span>
                    </button>
                  </div>
                )}
                
                {error.includes('verify your email') && (
                  <div className="mt-3 p-2 bg-white rounded border border-red-300">
                    <p className="text-red-800 text-xs font-medium">📧 Email not verified?</p>
                    <p className="text-red-700 text-xs">Check your inbox and click the verification link first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-green-800 font-semibold text-xs sm:text-sm">Success!</h4>
                <p className="text-green-700 text-xs sm:text-sm break-words">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 sm:my-8 flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500 bg-white whitespace-nowrap">New to FresherHub?</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* Switch to Sign Up */}
      <button
        onClick={onSwitchToSignup}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
        disabled={loading}
      >
        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base">Create new account</span>
      </button>

      {/* Benefits Reminder */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-blue-700">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>5 AI Credits</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center space-x-2 text-green-700">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>24h Reset</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveSignInForm;