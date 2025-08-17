import { supabase } from './supabaseService';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  credits: number;
  credits_reset_at: string | null;
  created_at: string;
  last_login: string;
  profile_completed: boolean;
  subscription_type: 'free' | 'premium';
  email_confirmed: boolean;
  total_credits_used: number;
  last_credit_reset: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export interface CreditInfo {
  credits: number;
  maxCredits: number;
  resetTime: string | null;
  isGuest: boolean;
  timeUntilReset?: string;
}

class AdvancedAuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    loading: true,
    initialized: false
  };

  // Credit system constants
  private readonly FREE_CREDITS = 5;
  private readonly PREMIUM_CREDITS = 50;
  private readonly GUEST_CREDIT_KEY = 'fresherhub_guest_credit';
  private readonly GUEST_RESET_KEY = 'fresherhub_guest_reset';
  private readonly CREDIT_RESET_HOURS = 24;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        this.setState({ user: null, loading: false, initialized: true });
        return;
      }

      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.setState({ user: null, loading: false, initialized: true });
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              await this.loadUserProfile(session.user.id);
            }
            break;
          case 'SIGNED_OUT':
            this.setState({ user: null, loading: false, initialized: true });
            break;
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              await this.loadUserProfile(session.user.id);
            }
            break;
          case 'USER_UPDATED':
            if (session?.user) {
              await this.loadUserProfile(session.user.id);
            }
            break;
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.setState({ user: null, loading: false, initialized: true });
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Auth user error:', authError);
        this.setState({ user: null, loading: false, initialized: true });
        return;
      }

      // Get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = await this.createUserProfile(authUser);
        this.setState({ user: newProfile, loading: false, initialized: true });
      } else if (profile) {
        // Profile exists, check and reset credits if needed
        const updatedProfile = await this.checkAndResetCredits(profile);
        this.setState({ user: updatedProfile, loading: false, initialized: true });
      } else {
        console.error('Profile error:', profileError);
        this.setState({ user: null, loading: false, initialized: true });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.setState({ user: null, loading: false, initialized: true });
    }
  }

  private async createUserProfile(authUser: any): Promise<User> {
    const now = new Date();
    const resetTime = new Date(now.getTime() + this.CREDIT_RESET_HOURS * 60 * 60 * 1000);

    const profile = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || (authUser.email ? authUser.email.split('@')[0] : 'User'),
      avatar_url: authUser.user_metadata?.avatar_url || null,
      credits: this.FREE_CREDITS, // Always start with 5 credits
      credits_reset_at: resetTime.toISOString(), // Set 24-hour reset timer immediately
      created_at: now.toISOString(),
      last_login: now.toISOString(),
      profile_completed: false,
      subscription_type: 'free' as const,
      email_confirmed: !!authUser.email_confirmed_at,
      total_credits_used: 0,
      last_credit_reset: now.toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        if (error.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (existingProfile) {
            return await this.checkAndResetCredits(existingProfile);
          }
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile creation failed:', error);
      return profile as User;
    }
  }

  private async checkAndResetCredits(profile: User): Promise<User> {
    const now = new Date();
    console.log('🔍 Checking credits for user:', profile.email);
    console.log('Current credits:', profile.credits);
    console.log('Reset time:', profile.credits_reset_at);
    
    // Always check if 24 hours have passed since last reset
    if (profile.credits_reset_at) {
      const resetTime = new Date(profile.credits_reset_at);
      console.log('Reset time parsed:', resetTime);
      console.log('Current time:', now);
      console.log('Time until reset (ms):', resetTime.getTime() - now.getTime());
      
      if (now >= resetTime) {
        // 24 hours have passed, reset credits to full amount
        const maxCredits = profile.subscription_type === 'premium' ? this.PREMIUM_CREDITS : this.FREE_CREDITS;
        const nextResetTime = new Date(now.getTime() + this.CREDIT_RESET_HOURS * 60 * 60 * 1000);
        
        console.log('✅ 24 hours passed, resetting credits to:', maxCredits);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            credits: maxCredits,
            credits_reset_at: nextResetTime.toISOString(), // Set next 24-hour reset
            last_credit_reset: now.toISOString(),
            last_login: now.toISOString()
          })
          .eq('id', profile.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error resetting credits:', error);
          return profile;
        }

        console.log('✅ Credits reset successfully:', data);
        return data;
      }
    } else {
      // No reset time set, set it now (for existing users)
      const nextResetTime = new Date(now.getTime() + this.CREDIT_RESET_HOURS * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          credits_reset_at: nextResetTime.toISOString(),
          last_login: now.toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error setting reset time:', error);
        return profile;
      }

      return data;
    }

    // Just update last login
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ last_login: now.toISOString() })
      .eq('id', profile.id)
      .select()
      .single();

    const result = error ? profile : data;
    console.log('🔄 Final user state:', { credits: result.credits, reset_at: result.credits_reset_at });
    return result;
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Check if email exists in database before signup
  async checkEmailExists(email: string): Promise<{ exists: boolean; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Email not found
        return { exists: false };
      }
      
      if (error) {
        return { exists: false, error };
      }
      
      return { exists: true };
    } catch (error) {
      return { exists: false, error };
    }
  }

  // Public methods
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return this.state;
  }

  async signInWithEmail(email: string, password: string) {
    try {
      this.setState({ ...this.state, loading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        this.setState({ ...this.state, loading: false });
        
        // Enhanced error messages
        let userFriendlyMessage = 'Sign in failed. Please try again.';
        
        if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials')) {
          userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          userFriendlyMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message?.includes('Too many requests')) {
          userFriendlyMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.';
        } else if (error.message?.includes('User not found')) {
          userFriendlyMessage = 'No account found with this email. Please sign up first.';
        }
        
        return { data: null, error: { ...error, message: userFriendlyMessage } };
      }

      return { data, error: null };
    } catch (error: any) {
      this.setState({ ...this.state, loading: false });
      return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  }

  async signUpWithEmail(email: string, password: string, name: string) {
    try {
      this.setState({ ...this.state, loading: true });
      
      // First check if email already exists in our database
      const emailCheck = await this.checkEmailExists(email);
      if (emailCheck.exists) {
        this.setState({ ...this.state, loading: false });
        return { 
          data: null, 
          error: { 
            message: 'An account with this email already exists. Please sign in instead.',
            code: 'EMAIL_ALREADY_EXISTS'
          }
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim()
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        this.setState({ ...this.state, loading: false });
        
        let userFriendlyMessage = 'Sign up failed. Please try again.';
        
        if (error.message?.includes('Password should be at least')) {
          userFriendlyMessage = 'Password must be at least 6 characters long.';
        } else if (error.message?.includes('Invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        } else if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
          return { 
            data: null, 
            error: { 
              message: userFriendlyMessage,
              code: 'EMAIL_ALREADY_EXISTS'
            }
          };
        }
        
        return { data: null, error: { ...error, message: userFriendlyMessage } };
      }

      this.setState({ ...this.state, loading: false });
      return { data, error: null };
    } catch (error: any) {
      this.setState({ ...this.state, loading: false });
      return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  }

  async resetPassword(email: string) {
    try {
      // First check if email exists
      const emailCheck = await this.checkEmailExists(email);
      if (!emailCheck.exists) {
        return { error: { message: 'No account found with this email. Please sign up first.' } };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { error: { message: 'Password reset failed. Please try again.' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  }

  async signOut() {
    try {
      this.setState({ user: null, loading: false, initialized: true });
      supabase.auth.signOut().catch(console.error);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async useCredit(): Promise<boolean> {
    console.log('🔥 useCredit called');
    console.log('Current user:', this.state.user);
    
    if (!this.state.user) {
      console.log('❌ No user found');
      return false;
    }

    // Get fresh user data from database before using credit
    console.log('🔄 Getting fresh user data from database...');
    const { data: freshUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', this.state.user.id)
      .single();
    
    if (fetchError || !freshUser) {
      console.error('❌ Failed to fetch fresh user data:', fetchError);
      return false;
    }
    
    // Check if credits need to be reset first
    const updatedUser = await this.checkAndResetCredits(freshUser);
    this.setState({ user: updatedUser });
    
    console.log('Fresh user credits:', updatedUser.credits);
    
    // Check if user has credits available
    if (updatedUser.credits <= 0) {
      console.log('❌ No credits available, current credits:', updatedUser.credits);
      return false;
    }

    try {
      const newCredits = updatedUser.credits - 1;
      const updateData: any = { 
        credits: newCredits,
        total_credits_used: (updatedUser.total_credits_used || 0) + 1
      };

      console.log('Updating user profile with:', updateData);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', updatedUser.id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Database error using credit:', error);
        return false;
      }
      
      if (!data) {
        console.error('❌ No data returned from update');
        return false;
      }
      
      console.log('✅ Credit used successfully, new data:', data);
      this.setState({ user: data });
      return true;
    } catch (error) {
      console.error('❌ Exception in useCredit:', error);
      return false;
    }
  }

  // Guest credit system (1 credit per device)
  getGuestCredits(): number {
    const lastUsed = localStorage.getItem(this.GUEST_CREDIT_KEY);
    if (!lastUsed) return 1;

    const lastUsedTime = new Date(lastUsed);
    const now = new Date();
    const timeDiff = now.getTime() - lastUsedTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff >= this.CREDIT_RESET_HOURS) {
      localStorage.removeItem(this.GUEST_CREDIT_KEY);
      localStorage.removeItem(this.GUEST_RESET_KEY);
      return 1;
    }

    return 0;
  }

  useGuestCredit(): boolean {
    const credits = this.getGuestCredits();
    if (credits > 0) {
      const now = new Date();
      localStorage.setItem(this.GUEST_CREDIT_KEY, now.toISOString());
      localStorage.setItem(this.GUEST_RESET_KEY, new Date(now.getTime() + this.CREDIT_RESET_HOURS * 60 * 60 * 1000).toISOString());
      return true;
    }
    return false;
  }

  getCreditsInfo(): CreditInfo {
    if (this.state.user) {
      const user = this.state.user;
      const maxCredits = user.subscription_type === 'premium' ? this.PREMIUM_CREDITS : this.FREE_CREDITS;
      
      let timeUntilReset: string | undefined;
      if (user.credits_reset_at) {
        const resetTime = new Date(user.credits_reset_at);
        const now = new Date();
        const timeDiff = resetTime.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          timeUntilReset = `${hours}h ${minutes}m`;
        }
      }
      
      return {
        credits: user.credits,
        maxCredits,
        resetTime: user.credits_reset_at,
        isGuest: false,
        timeUntilReset
      };
    }
    
    // Guest user
    const guestCredits = this.getGuestCredits();
    let timeUntilReset: string | undefined;
    
    if (guestCredits === 0) {
      const resetTime = localStorage.getItem(this.GUEST_RESET_KEY);
      if (resetTime) {
        const resetDate = new Date(resetTime);
        const now = new Date();
        const timeDiff = resetDate.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          timeUntilReset = `${hours}h ${minutes}m`;
        }
      }
    }
    
    return {
      credits: guestCredits,
      maxCredits: 1,
      resetTime: localStorage.getItem(this.GUEST_RESET_KEY),
      isGuest: true,
      timeUntilReset
    };
  }

  canUseCredit(): boolean {
    const creditsInfo = this.getCreditsInfo();
    return creditsInfo.credits > 0;
  }

  // Debug method to test database connection
  async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing database connection...');
      
      if (!this.state.user) {
        console.log('❌ No user for database test');
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, credits, credits_reset_at, total_credits_used')
        .eq('id', this.state.user.id)
        .single();

      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }

      console.log('✅ Database connection test successful:', data);
      return true;
    } catch (error) {
      console.error('❌ Database connection test exception:', error);
      return false;
    }
  }

  async refreshUserProfile(): Promise<boolean> {
    try {
      if (!this.state.user) {
        console.log('❌ No user to refresh');
        return false;
      }

      console.log('🔄 Refreshing user profile from database...');
      await this.loadUserProfile(this.state.user.id);
      return true;
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
      return false;
    }
  }
}

export const advancedAuthService = new AdvancedAuthService();