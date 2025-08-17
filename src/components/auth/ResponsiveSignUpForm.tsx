import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  UserPlus,
  LogIn,
  Shield,
  Zap,
  Clock,
  Gift,
  Sparkles,
  ArrowRight,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAdvancedAuth } from '../../hooks/useAdvancedAuth';

interface SignUpFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  onSwitchToSignin: () => void;
}

const ResponsiveSignUpForm: React.FC<SignUpFormProps> = ({ 
  onBack, 
  onSuccess, 
  onSwitchToSignin 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { signUp } = useAdvancedAuth();

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
      case 2: return { text: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-500' };
      case 3: return { text: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
      case 4: return { text: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
      case 5: return { text: 'Very Strong', color: 'text-green-700', bgColor: 'bg-green-600' };
      default: return { text: '', color: '', bgColor: '' };
    }
  };

  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    if (field === 'name') {
      if (!value.trim()) {
        errors.name = 'Full name is required';
      } else if (value.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        errors.name = 'Name should only contain letters and spaces';
      }
    }
    
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
    
    if (field === 'confirmPassword') {
      if (!value) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.password) {
        errors.confirmPassword = 'Passwords do not match';
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
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    const errors = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, ...errors }));
    
    if (field === 'password' && formData.confirmPassword) {
      const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({ ...prev, ...confirmErrors }));
    }
  };

  const validateForm = () => {
    const nameErrors = validateField('name', formData.name);
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const confirmPasswordErrors = validateField('confirmPassword', formData.confirmPassword);
    const allErrors = { ...nameErrors, ...emailErrors, ...passwordErrors, ...confirmPasswordErrors };
    
    setFieldErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        if (error.code === 'EMAIL_ALREADY_EXISTS') {
          setSuccess('EMAIL_EXISTS');
          return;
        }
        
        setError(error.message);
      } else {
        setSuccess('EMAIL_SENT');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email Already Exists State
  if (success === 'EMAIL_EXISTS') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-h-[95vh] overflow-y-auto">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-orange-100 rounded-full mb-4">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600" />
            </div>
          </div>
          
          {/* Error Message */}
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              🚨 Email Already Registered
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              An account with this email already exists:
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg mb-6">
              <Mail className="h-4 w-4 text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800">{formData.email}</span>
            </div>
          </div>
          
          {/* Action Options */}
          <div className="space-y-4 mb-8">
            <button
              onClick={onSwitchToSignin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In to Existing Account</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => {
                setSuccess('');
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
                setPasswordStrength(0);
                setFieldErrors({});
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Different Email</span>
            </button>
          </div>
          
          {/* Help Section */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-blue-800 font-semibold text-sm mb-2 flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2" />
              Need Help?
            </h4>
            <div className="text-xs sm:text-sm text-blue-700 space-y-1">
              <p>• Use "Forgot Password" if you don't remember your password</p>
              <p>• Contact support if you believe this is an error</p>
              <p>• Each email can only have one FresherHub account</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email Verification Sent State
  if (success === 'EMAIL_SENT') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-h-[95vh] overflow-y-auto">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-4">
              <Send className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            </div>
          </div>
          
          {/* Success Message */}
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              📧 Verification Email Sent!
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              We've sent a verification email to:
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">{formData.email}</span>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              Next Steps
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-blue-800 font-medium text-center">Check your email inbox</p>
                <p className="text-blue-600 text-xs mt-1">(Check spam folder too)</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="text-green-800 font-medium text-center">Click verification link</p>
                <p className="text-green-600 text-xs mt-1">(Link expires in 1 hour)</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-purple-800 font-medium text-center">Return to sign in</p>
                <p className="text-purple-600 text-xs mt-1">(Account will be activated)</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 mb-6">
            <button
              onClick={() => {
                // Show confirmation dialog
                if (confirm('✅ I have verified my email and want to proceed to sign in. Click OK to continue.')) {
                  onSwitchToSignin();
                }
              }}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>I've Verified My Email</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => {
                setSuccess('');
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
                setPasswordStrength(0);
                setFieldErrors({});
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Create Different Account</span>
            </button>
          </div>
          
          {/* Benefits Reminder */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <h5 className="text-purple-800 font-semibold text-sm mb-2 flex items-center justify-center">
              <Gift className="h-4 w-4 mr-2" />
              Your FresherHub Benefits (After Verification)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center justify-center space-x-2 text-purple-700">
                <Zap className="h-3 w-3" />
                <span>5 AI Credits</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Shield className="h-3 w-3" />
                <span>Secure Profile</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Clock className="h-3 w-3" />
                <span>24h Auto Reset</span>
              </div>
            </div>
          </div>
          
          {/* Email Help */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-xs text-center">
              📧 Didn't receive the email? Check your spam folder or wait a few minutes for delivery.
            </p>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Create your account</h2>
          <p className="text-sm sm:text-base text-gray-600">Join thousands of professionals advancing their careers</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Full name *</label>
          <div className="relative">
            <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                fieldErrors.name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : formData.name && !fieldErrors.name
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {formData.name && !fieldErrors.name && (
              <CheckCircle2 className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            )}
          </div>
          {fieldErrors.name && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{fieldErrors.name}</span>
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email address *</label>
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
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                fieldErrors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : formData.password && !fieldErrors.password && passwordStrength >= 3
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Create a strong password"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password strength</span>
                <span className={`text-xs font-medium ${getPasswordStrengthText(passwordStrength).color}`}>
                  {getPasswordStrengthText(passwordStrength).text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthText(passwordStrength).bgColor}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {fieldErrors.password && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Confirm password *</label>
          <div className="relative">
            <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                fieldErrors.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : formData.confirmPassword && !fieldErrors.confirmPassword
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            {formData.confirmPassword && !fieldErrors.confirmPassword && (
              <CheckCircle2 className="absolute right-8 sm:right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            )}
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{fieldErrors.confirmPassword}</span>
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-red-800 font-semibold text-xs sm:text-sm">Sign up failed</h4>
                <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key]) || passwordStrength < 2}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Create account</span>
            </>
          )}
        </button>

        {/* Password Requirements */}
        {formData.password && (
          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-gray-800 font-semibold text-xs sm:text-sm mb-2">Password Requirements:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center space-x-2 ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                <CheckCircle2 className={`h-3 w-3 ${formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} />
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center space-x-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                <CheckCircle2 className={`h-3 w-3 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center space-x-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                <CheckCircle2 className={`h-3 w-3 ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Lowercase letter</span>
              </div>
              <div className={`flex items-center space-x-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                <CheckCircle2 className={`h-3 w-3 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Number</span>
              </div>
            </div>
          </div>
        )}

        {/* What you get */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h4 className="text-green-800 font-semibold text-xs sm:text-sm mb-3 flex items-center">
            <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            What you get with your free account:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-700">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>5 AI credits immediately after email verification</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-700">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Secure profile & data protection</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-purple-700">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Credits reset every 24 hours automatically</span>
            </div>
          </div>
        </div>
      </form>

      {/* Switch to Sign In */}
      <div className="my-6 sm:my-8 flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500 bg-white whitespace-nowrap">Already have an account?</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <button
        onClick={onSwitchToSignin}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
        disabled={loading}
      >
        <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
        <span>Sign in instead</span>
      </button>

      {/* Terms */}
      <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500 px-2">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
};

export default ResponsiveSignUpForm;