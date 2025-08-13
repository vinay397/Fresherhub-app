import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  LogIn, 
  AlertCircle, 
  User, 
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Gift,
  RefreshCw
} from 'lucide-react';
import { useAdvancedAuth } from '../../hooks/useAdvancedAuth';
import AuthContainer from './AuthContainer';

const AdvancedCreditDisplay: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    getCreditsInfo, 
    getCreditDisplay, 
    getResetTimeDisplay,
    isPremium 
  } = useAdvancedAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('');

  const creditsInfo = getCreditsInfo();

  // Update time display every minute
  useEffect(() => {
    const updateTimeDisplay = () => {
      const resetDisplay = getResetTimeDisplay();
      setTimeDisplay(resetDisplay || '');
    };

    updateTimeDisplay();
    const interval = setInterval(updateTimeDisplay, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [getResetTimeDisplay, creditsInfo.resetTime]);

  if (isAuthenticated && user) {
    const hasCredits = user.credits > 0;
    const isUserPremium = isPremium();
    
    return (
      <>
        <div className={`relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 ${
          hasCredits 
            ? isUserPremium
              ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 border-yellow-300'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 border-blue-300'
            : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600 border-red-300'
        }`}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </div>
          
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                  hasCredits 
                    ? 'bg-white/20 shadow-lg' 
                    : 'bg-white/10'
                }`}>
                  {hasCredits ? (
                    <Zap className="h-7 w-7 animate-pulse" />
                  ) : (
                    <AlertCircle className="h-7 w-7" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold">
                      {user.credits}/{isUserPremium ? 50 : 5}
                    </span>
                    <span className="text-lg font-semibold">AI Credits</span>
                    {isUserPremium && (
                      <Crown className="h-5 w-5 text-yellow-200 animate-bounce" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    {hasCredits ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Ready to use • {user.total_credits_used || 0} used total</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>{timeDisplay || 'Credits exhausted'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-sm">{user.name}</span>
                </div>
                <div className="text-white/80 text-xs flex items-center gap-1">
                  {isUserPremium ? (
                    <>
                      <Crown className="h-3 w-3" />
                      <span>Premium Account</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-3 w-3" />
                      <span>Free Account</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/80">Credit Usage</span>
                <span className="text-xs text-white/80">
                  {Math.round((user.credits / (isUserPremium ? 50 : 5)) * 100)}% remaining
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    user.credits > (isUserPremium ? 25 : 2) 
                      ? 'bg-white shadow-lg' 
                      : user.credits > 0 
                        ? 'bg-yellow-200' 
                        : 'bg-red-200'
                  }`}
                  style={{ width: `${(user.credits / (isUserPremium ? 50 : 5)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Status Messages */}
            {!hasCredits && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Credits Exhausted</span>
                </div>
                <p className="text-xs text-white/90">
                  Your credits will automatically reset {timeDisplay ? `in ${timeDisplay}` : 'soon'}. 
                  {!isUserPremium && ' Upgrade to Premium for 50 credits!'}
                </p>
              </div>
            )}
            
            {hasCredits && user.credits <= (isUserPremium ? 10 : 1) && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Low Credits</span>
                </div>
                <p className="text-xs text-white/90">
                  You have {user.credits} credit{user.credits !== 1 ? 's' : ''} remaining. 
                  Use them wisely for your AI-powered career tools.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <AuthContainer
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // Guest user display
  const guestCredits = creditsInfo.credits;
  const hasGuestCredits = guestCredits > 0;

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 ${
        hasGuestCredits 
          ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 border-green-300'
          : 'bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 border-gray-300'
      }`}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        
        <div className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl backdrop-blur-sm ${
                hasGuestCredits 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-white/10'
              }`}>
                {hasGuestCredits ? (
                  <Gift className="h-7 w-7 animate-bounce" />
                ) : (
                  <AlertCircle className="h-7 w-7" />
                )}
              </div>
              
              <div>
                <div className="text-2xl font-bold mb-1">
                  {hasGuestCredits ? '1 Free Credit Available' : 'No Credits Remaining'}
                </div>
                <div className="text-white/90 text-sm flex items-center gap-2">
                  {hasGuestCredits ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Try our AI tools • No account needed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>{timeDisplay || 'Credit used'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          </div>
          
          {/* Guest Benefits */}
          <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                {hasGuestCredits ? 'What you can do:' : 'Sign in to unlock:'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span>{hasGuestCredits ? 'Use 1 AI tool' : '5 AI credits for analysis & insights'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>{hasGuestCredits ? 'Secure & private' : 'Save your progress & results'}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                <span>{hasGuestCredits ? 'More with account' : 'Credits reset automatically'}</span>
              </div>
            </div>
          </div>
          
          {!hasGuestCredits && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-xs text-white/90 text-center">
                You've used your free credit. {timeDisplay ? `Resets in ${timeDisplay}` : 'Sign in for 5 credits!'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <AuthContainer
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default AdvancedCreditDisplay;