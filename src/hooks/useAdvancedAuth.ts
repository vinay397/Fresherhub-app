import { useState, useEffect } from 'react';
import { advancedAuthService, AuthState, CreditInfo } from '../services/advancedAuthService';

export const useAdvancedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(advancedAuthService.getState());

  useEffect(() => {
    const unsubscribe = advancedAuthService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  // Credit system methods
  const getCreditsInfo = (): CreditInfo => {
    return advancedAuthService.getCreditsInfo();
  };

  const useCredit = async (): Promise<boolean> => {
    if (authState.user) {
      return await advancedAuthService.useCredit();
    } else {
      return advancedAuthService.useGuestCredit();
    }
  };

  const canUseCredit = (): boolean => {
    return advancedAuthService.canUseCredit();
  };

  return {
    // Auth state
    user: authState.user,
    loading: authState.loading,
    initialized: authState.initialized,
    isAuthenticated: !!authState.user,
    
    // Auth methods
    signIn: advancedAuthService.signInWithEmail.bind(advancedAuthService),
    signUp: advancedAuthService.signUpWithEmail.bind(advancedAuthService),
    signOut: advancedAuthService.signOut.bind(advancedAuthService),
    resetPassword: advancedAuthService.resetPassword.bind(advancedAuthService),
    
    // Credit system
    getCreditsInfo,
    useCredit,
    canUseCredit,
    
    // Convenience methods
    hasCredits: () => getCreditsInfo().credits > 0,
    isGuest: () => !authState.user,
    isPremium: () => authState.user?.subscription_type === 'premium',
    
    // Credit display helpers
    getCreditDisplay: () => {
      const info = getCreditsInfo();
      if (info.isGuest) {
        return info.credits > 0 ? '1 Free Credit' : 'No Credits';
      }
      return `${info.credits}/${info.maxCredits} Credits`;
    },
    
    getResetTimeDisplay: () => {
      const info = getCreditsInfo();
      if (info.timeUntilReset) {
        return `Resets in ${info.timeUntilReset}`;
      }
      if (info.credits === 0) {
        return 'Credits exhausted';
      }
      return null;
    },
    
    // Debug methods
    testDatabaseConnection: () => advancedAuthService.testDatabaseConnection(),
    refreshUserProfile: () => advancedAuthService.refreshUserProfile()
  };
};