import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Send,
  Shield,
  Clock,
  Key,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useAdvancedAuth } from '../../hooks/useAdvancedAuth';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onBack, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { resetPassword } = useAdvancedAuth();

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
    if (emailError) setEmailError('');
    
    // Real-time validation
    const error = validateEmail(value);
    setEmailError(error);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message || 'Failed to send reset email. Please try again.');
      } else {
        setSuccess('RESET_EMAIL_SENT');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Email Sent State
  if (success === 'RESET_EMAIL_SENT') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-h-[95vh] overflow-y-auto">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full mb-4">
              <Send className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            </div>
          </div>
          
          {/* Success Message */}
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              📧 Password Reset Email Sent!
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              We've sent a password reset link to:
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">{email}</span>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <Key className="h-5 w-5 mr-2 text-blue-600" />
              Next Steps
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-blue-800 font-medium text-center">Check your email</p>
                <p className="text-blue-600 text-xs mt-1">(Check spam folder too)</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="text-green-800 font-medium text-center">Click reset link</p>
                <p className="text-green-600 text-xs mt-1">(Link expires in 1 hour)</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-purple-800 font-medium text-center">Set new password</p>
                <p className="text-purple-600 text-xs mt-1">(Then sign in normally)</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 mb-6">
            <button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Sign In</span>
            </button>
            
            <button
              onClick={() => {
                setSuccess('');
                setError('');
                setEmail('');
                setEmailError('');
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Different Email</span>
            </button>
          </div>
          
          {/* Security Notice */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h5 className="text-yellow-800 font-semibold text-sm mb-2 flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2" />
              Security Notice
            </h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>• Reset link expires in 1 hour for security</p>
              <p>• Check spam folder if email doesn't arrive</p>
              <p>• Only one reset request per email per hour</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Reset your password</h2>
          <p className="text-sm sm:text-base text-gray-600">Enter your email to receive reset instructions</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Email address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                emailError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : email && !emailError
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Enter your email address"
              disabled={loading}
            />
            {email && !emailError && (
              <CheckCircle2 className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            )}
          </div>
          {emailError && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{emailError}</span>
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-red-800 font-semibold text-xs sm:text-sm">Reset failed</h4>
                <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{error}</p>
                
                {/* Help for specific errors */}
                {error.includes('No account found') && (
                  <div className="mt-3 p-2 bg-white rounded border border-red-300">
                    <p className="text-red-800 text-xs font-medium">🚨 Email not registered?</p>
                    <p className="text-red-700 text-xs">This email doesn't have a FresherHub account. Please sign up first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || emailError !== '' || !email}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>Sending reset email...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Send reset email</span>
            </>
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="text-blue-800 font-semibold text-xs sm:text-sm mb-1">Security Notice</h4>
            <div className="text-blue-700 text-xs space-y-1">
              <p>• Password reset links expire after 1 hour for security</p>
              <p>• Check your spam folder if email doesn't arrive</p>
              <p>• Only registered emails can receive reset links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Remember your password?{' '}
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            disabled={loading}
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;