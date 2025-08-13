import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Mail as MailIcon,
  Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const { resetPassword } = useAuth();

  // Simple validation
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message || 'Password reset failed. Please try again.');
      } else {
        setSuccess('Reset link sent! Check your inbox.');
        setTimeout(() => {
          onSuccess?.();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 text-sm">Enter your email for reset link</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="text-base">Sending...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <MailIcon className="h-4 w-4" />
              <span className="text-base">Send Reset Link</span>
            </div>
          )}
        </button>
      </form>

      {/* Quick Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Info className="h-4 w-4" />
          <span className="text-sm font-medium">What happens next?</span>
        </div>
        <p className="text-sm text-blue-600">We'll send a password reset link to your email. Check your spam folder if needed.</p>
      </div>

      {/* Back to Sign In */}
      <div className="mt-4 text-center">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm"
          disabled={loading}
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
