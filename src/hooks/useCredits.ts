import { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

export const useCredits = () => {
  const [user, setUser] = useState<User | null>(null);
  const [guestCredits, setGuestCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setGuestCredits(0);
      } else {
        const credits = await authService.getGuestCredits();
        setGuestCredits(credits);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
    setLoading(false);
  };

  const useCredit = async (): Promise<boolean> => {
    if (user) {
      // User is signed in - use account credits
      const result = await authService.updateCredits(user.id, 1);
      if (!result.error) {
        setUser({ ...user, credits: result.credits || 0 });
        return true;
      }
      return false;
    } else {
      // Guest user - use local storage credit
      const success = await authService.useGuestCredit();
      if (success) {
        setGuestCredits(0);
        return true;
      }
      return false;
    }
  };

  const hasCredits = (): boolean => {
    if (user) {
      return user.credits > 0;
    }
    return guestCredits > 0;
  };

  const getTotalCredits = (): number => {
    if (user) {
      return user.credits;
    }
    return guestCredits;
  };

  const requiresAuth = (): boolean => {
    return !user && guestCredits === 0;
  };

  return {
    user,
    guestCredits,
    loading,
    hasCredits: hasCredits(),
    totalCredits: getTotalCredits(),
    requiresAuth: requiresAuth(),
    useCredit,
    loadCredits
  };
};