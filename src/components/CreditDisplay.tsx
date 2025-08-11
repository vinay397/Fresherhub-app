import React, { useState } from 'react';
import { Zap, Clock, LogIn, AlertCircle, User, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const CreditDisplay: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  React.useEffect(() => {
    if (user?.credits_reset_at) {
      const updateTimer = () => {
        const now = new Date();
        const reset = new Date(user.credits_reset_at);
        const diff = reset.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeUntilReset('Resetting...');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilReset(`${hours}h ${minutes}m`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.credits_reset_at]);

  // Check guest credit status
  const guestUsed = localStorage.getItem('fresherhub_guest_used');
  const creditsInfo = {
    credits: isAuthenticated ? (user?.credits || 5) : (guestUsed ? 0 : 1)
  };

  if (isAuthenticated && user) {
    const hasCredits = user.credits > 0;
    
    return (
      <>
        <div className={`relative overflow-hidden rounded-2xl shadow-lg ${
          hasCredits 
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600' 
            : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600'
        }`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {hasCredits ? <Zap className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold">{user.credits}/5</span>
                    <span className="text-lg font-semibold">AI Credits</span>
                    {user.subscription_type === 'premium' && (
                      <Crown className="h-5 w-5 text-yellow-300" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Resets in {timeUntilReset}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-white/80 text-sm">
                  {user.subscription_type === 'premium' ? 'Premium User' : 'Free Account'}
                </div>
              </div>
            </div>
            
            {!hasCredits && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-white/90">
                  No credits remaining. Your credits will reset automatically in {timeUntilReset}.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // Guest user
  const guestCredits = creditsInfo.credits;
  const hasGuestCredits = guestCredits > 0;

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl shadow-lg ${
        hasGuestCredits 
          ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
          : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600'
      }`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {hasGuestCredits ? <Zap className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">
                  {hasGuestCredits ? '1 Free Credit Available' : 'Free Credit Used'}
                </div>
                <div className="text-white/80 text-sm">
                  {hasGuestCredits 
                    ? 'Sign in to get 5 credits that reset after exhaustion'
                    : 'Free credit used. Sign in to get 5 credits!'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </div>
          
          {!hasGuestCredits && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-white/90">
                You've used your free credit. Sign in to get 5 credits that reset after exhaustion.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default CreditDisplay;