import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../../services/supabaseService';

const EmailConfirmation: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setStatus('error');
            setMessage('Failed to confirm email. Please try again.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in.');
            
            // Redirect to home after 3 seconds
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during confirmation. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirming Email</h2>
            <p className="text-gray-600">Please wait while we confirm your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">Email Confirmed!</h2>
            <p className="text-green-700 mb-6">{message}</p>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <span className="text-sm">Redirecting to FresherHub</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">Confirmation Failed</h2>
            <p className="text-red-700 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Go to FresherHub
              </button>
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Check your email for a new confirmation link</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;