import React, { useState, useEffect } from 'react';
import { Zap, Clock, User, LogIn } from 'lucide-react';
import { authService, User as AuthUser } from '../services/authService';
import AuthModal from './AuthModal';

interface CreditBannerProps {
  onAuthRequired?: () => void;
}

const CreditBanner: React.FC<CreditBannerProps> = ({ onAuthRequired }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [guestCredits, setGuestCredits] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      updateResetTimer(currentUser.credits_reset_at);
    } else {
      const credits = await authService.getGuestCredits();
      setGuestCredits(credits);
    }
  };

  const updateResetTimer = (resetTime: string) => {
    const now = new Date();
    const reset = new Date(resetTime);
    const diff = reset.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeUntilReset('Resetting...');
      loadUserData(); // Reload to get fresh credits
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeUntilReset(`${hours}h ${minutes}m`);
  };

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    loadUserData();
    if (onAuthRequired) onAuthRequired();
  };

  if (user) {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">
                  {user.credits} AI Credits Remaining
                </div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Resets in {timeUntilReset}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.name}</span>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">
                {guestCredits > 0 ? `${guestCredits} Free Credit Available` : 'No Credits Remaining'}
              </div>
              <div className="text-orange-100 text-sm">
                {guestCredits > 0 
                  ? 'Sign in to get 5 credits that reset every 1.5 hours'
                  : 'Sign in to get 5 AI credits'
                }
              </div>
            </div>
          </div>
          <button
            onClick={handleSignInClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default CreditBanner;