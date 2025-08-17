import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Mail, ArrowRight, Home, LogIn, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseService';

const EmailConfirmationPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Email confirmation params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (accessToken && refreshToken && type === 'signup') {
          // Set the session to confirm the user
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage('Failed to confirm email. The link may be expired or invalid.');
          } else if (data.user) {
            console.log('Email confirmed successfully for:', data.user.email);
            setUserEmail(data.user.email || '');
            setStatus('success');
            setMessage('Email confirmed successfully! Your account is now active.');
            
            // Sign out immediately after confirmation so user can sign in normally
            await supabase.auth.signOut();
          } else {
            setStatus('error');
            setMessage('Confirmation failed. Please try again.');
          }
        } else if (type === 'recovery') {
          // Handle password reset
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              setStatus('error');
              setMessage('Invalid reset link. Please request a new password reset.');
            } else {
              // Redirect to reset password page
              window.location.href = '/reset-password';
              return;
            }
          } else {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new password reset.');
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred during confirmation. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, []);

  const handleGoToSignIn = () => {
    // Add a flag to show success message on homepage
    localStorage.setItem('email_confirmed', 'true');
    localStorage.setItem('confirmed_email', userEmail);
    window.location.href = '/';
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetryConfirmation = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        
        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirming Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-900 mb-4">🎉 Email Verified!</h2>
            <p className="text-green-700 mb-6 text-lg">{message}</p>
            
            {userEmail && (
              <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">{userEmail}</span>
                </div>
                <p className="text-green-700 text-sm">Your account is now active and ready to use!</p>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={handleGoToSignIn}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <LogIn className="h-5 w-5" />
                <span>Continue to Sign In</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Go to Homepage</span>
              </button>
            </div>
            
            {/* Success Benefits */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <h4 className="text-green-800 font-semibold text-sm mb-2">🎁 Your Account Benefits:</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col items-center space-y-1 text-green-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">5</span>
                  </div>
                  <span>AI Credits</span>
                </div>
                <div className="flex flex-col items-center space-y-1 text-blue-700">
                  <Shield className="h-4 w-4" />
                  <span>Secure Profile</span>
                </div>
                <div className="flex flex-col items-center space-y-1 text-purple-700">
                  <Clock className="h-4 w-4" />
                  <span>24h Reset</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">Verification Failed</h2>
            <p className="text-red-700 mb-6">{message}</p>
            
            <div className="space-y-4">
              <button
                onClick={handleRetryConfirmation}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Go to FresherHub</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-center space-x-2 text-yellow-800 mb-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Need help?</span>
              </div>
              <div className="text-yellow-700 text-xs space-y-1">
                <p>• Check if the link is complete and not broken</p>
                <p>• Verification links expire after 1 hour</p>
                <p>• Try requesting a new verification email</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmationPage;