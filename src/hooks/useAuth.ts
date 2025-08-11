import { useState, useEffect } from 'react';
import { authService, AuthState } from '../services/authService';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    initialized: authState.initialized,
    isAuthenticated: !!authState.user,
    signIn: authService.signInWithEmail.bind(authService),
    signUp: authService.signUpWithEmail.bind(authService),

    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    useCredit: authService.useCredit.bind(authService)
  };
};