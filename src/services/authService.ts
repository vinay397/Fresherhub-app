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
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    loading: true,
    initialized: false
  };

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
        
        if (event === 'SIGNED_IN' && session?.user) {
          await this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.setState({ user: null, loading: false, initialized: true });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_UP' && session?.user) {
          // Handle signup - create profile immediately
          await this.loadUserProfile(session.user.id);
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.setState({ user: null, loading: false, initialized: true });
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      // First get the auth user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Auth user error:', authError);
        this.setState({ user: null, loading: false, initialized: true });
        return;
      }

      // Try to get existing profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new user profile for:', authUser.email);
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
    const now = new Date().toISOString();

    const profile = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0],
      avatar_url: authUser.user_metadata?.avatar_url || null,
      credits: 5,
      credits_reset_at: null, // No reset time until credits are exhausted
      created_at: now,
      last_login: now,
      profile_completed: false,
      subscription_type: 'free' as const
    };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // If profile already exists, try to fetch it
        if (error.code === '23505') { // Unique constraint violation
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (existingProfile) {
            return existingProfile;
          }
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile creation failed:', error);
      // Return a minimal profile object to prevent infinite loading
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        avatar_url: authUser.user_metadata?.avatar_url,
        credits: 5,
        credits_reset_at: null,
        created_at: now,
        last_login: now,
        profile_completed: false,
        subscription_type: 'free' as const
      };
    }
  }

  private async checkAndResetCredits(profile: User): Promise<User> {
    const now = new Date();
    
    // Only check reset if credits are 0 and reset_at is set
    if (profile.credits === 0 && profile.credits_reset_at) {
      const resetTime = new Date(profile.credits_reset_at);
      
      if (now > resetTime) {
        // Reset credits and clear reset time
        const maxCredits = profile.subscription_type === 'premium' ? 50 : 5;
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            credits: maxCredits,
            credits_reset_at: null, // Clear reset time
            last_login: new Date().toISOString()
          })
          .eq('id', profile.id)
          .select()
          .single();

        if (error) {
          console.error('Error resetting credits:', error);
          return profile;
        }

        return data;
      }
    }

    // Just update last login
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .single();

    return error ? profile : data;
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    console.log('Auth state updated:', this.state);
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
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
      
      // First check if email exists in our database
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        // Email not found in database
        this.setState({ ...this.state, loading: false });
        return { 
          data: null, 
          error: { message: 'Email not registered. Please sign up first.' }
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        this.setState({ ...this.state, loading: false });
        return { data: null, error };
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { data, error: null };
    } catch (error: any) {
      this.setState({ ...this.state, loading: false });
      return { data: null, error };
    }
  }

  async signUpWithEmail(email: string, password: string, name: string) {
    try {
      this.setState({ ...this.state, loading: true });
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim()
          },
          emailRedirectTo: undefined // Disable email confirmation for now
        }
      });

      if (error) {
        this.setState({ ...this.state, loading: false });
        return { data: null, error };
      }

      // If user is created and confirmed immediately, load profile
      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required - set loading to false
        this.setState({ ...this.state, loading: false });
      }
      
      return { data, error: null };
    } catch (error: any) {
      this.setState({ ...this.state, loading: false });
      return { data: null, error };
    }
  }

  async signInWithGoogle() {
    try {
      this.setState({ ...this.state, loading: true });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        this.setState({ ...this.state, loading: false });
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      this.setState({ ...this.state, loading: false });
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      // Immediately clear state for instant UI update
      this.setState({ user: null, loading: false, initialized: true });
      
      // DON'T clear guest credits on logout - they should persist
      // localStorage.removeItem('guest_credit_used'); // REMOVED
      
      // Sign out from Supabase in background
      supabase.auth.signOut().catch(console.error);
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar_url'>>) {
    if (!this.state.user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.state.user.id)
        .select()
        .single();

      if (error) throw error;
      
      this.setState({ user: data });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async useCredit(): Promise<boolean> {
    if (!this.state.user) return false;

    const user = this.state.user;
    if (user.credits <= 0) return false;

    try {
      const newCredits = user.credits - 1;
      const updateData: any = { credits: newCredits };
      
      // If this is the last credit, set reset timer
      if (newCredits === 0) {
        updateData.credits_reset_at = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error using credit:', error);
        return false;
      }
      
      this.setState({ user: data });
      return true;
    } catch (error) {
      console.error('Error using credit:', error);
      return false;
    }
  }

  getGuestCredits(): number {
    const lastUsed = localStorage.getItem('guest_credit_used');
    if (!lastUsed) return 1;

    const lastUsedTime = new Date(lastUsed);
    const now = new Date();
    const timeDiff = now.getTime() - lastUsedTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff >= 3) {
      localStorage.removeItem('guest_credit_used');
      return 1;
    }

    return 0;
  }

  useGuestCredit(): boolean {
    const credits = this.getGuestCredits();
    if (credits > 0) {
      localStorage.setItem('guest_credit_used', new Date().toISOString());
      return true;
    }
    return false;
  }

  hasCredits(): boolean {
    if (this.state.user) {
      return this.state.user.credits > 0;
    }
    return this.getGuestCredits() > 0;
  }

  getCreditsInfo(): { credits: number; isGuest: boolean; resetTime?: string } {
    if (this.state.user) {
      return {
        credits: this.state.user.credits,
        isGuest: false,
        resetTime: this.state.user.credits_reset_at
      };
    }
    
    return {
      credits: this.getGuestCredits(),
      isGuest: true
    };
  }
}

export const authService = new AuthService();