class UsageLimitService {
  private static instance: UsageLimitService;
  private subscribers: ((data: { remainingUses: number; isLimited: boolean; resetTime: number | null }) => void)[] = [];
  private resetTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeResetTimer();
  }

  static getInstance(): UsageLimitService {
    if (!UsageLimitService.instance) {
      UsageLimitService.instance = new UsageLimitService();
    }
    return UsageLimitService.instance;
  }

  private getStorageKey(): string {
    return 'fresherhub_usage_limit';
  }

  private getUsageData(): { uses: number; resetTime: number | null } {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const data = JSON.parse(stored);
        return {
          uses: data.uses || 0,
          resetTime: data.resetTime || null
        };
      }
    } catch (error) {
      console.error('Error reading usage data:', error);
    }
    
    return { uses: 0, resetTime: null };
  }

  private saveUsageData(uses: number, resetTime: number | null): void {
    try {
      const data = { uses, resetTime };
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  private notifySubscribers(): void {
    const { uses, resetTime } = this.getUsageData();
    const remainingUses = Math.max(0, 5 - uses);
    const isLimited = uses >= 5 && this.isWithinResetPeriod();
    
    this.subscribers.forEach(callback => {
      callback({ remainingUses, isLimited, resetTime });
    });
  }

  private isWithinResetPeriod(): boolean {
    const { resetTime } = this.getUsageData();
    if (!resetTime) return false;
    return Date.now() < resetTime;
  }

  private initializeResetTimer(): void {
    const { resetTime } = this.getUsageData();
    
    if (resetTime && Date.now() < resetTime) {
      const timeUntilReset = resetTime - Date.now();
      this.resetTimer = setTimeout(() => {
        this.resetUsage();
      }, timeUntilReset);
    }
  }

  private resetUsage(): void {
    this.saveUsageData(0, null);
    this.notifySubscribers();
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  canUseAI(): boolean {
    const { uses } = this.getUsageData();
    
    // If user has used 5 times, check if reset period has passed
    if (uses >= 5) {
      if (!this.isWithinResetPeriod()) {
        // Reset period has passed, reset usage
        this.resetUsage();
        return true;
      }
      return false;
    }
    
    return true;
  }

  useAI(): boolean {
    if (!this.canUseAI()) {
      return false;
    }

    const { uses } = this.getUsageData();
    const newUses = uses + 1;
    
    // Set reset time when user reaches the limit
    let resetTime = null;
    if (newUses >= 5) {
      resetTime = Date.now() + (1.5 * 60 * 60 * 1000); // 1.5 hours from now
      
      // Set timer for automatic reset
      this.resetTimer = setTimeout(() => {
        this.resetUsage();
      }, 1.5 * 60 * 60 * 1000);
    }
    
    this.saveUsageData(newUses, resetTime);
    this.notifySubscribers();
    
    return true;
  }

  getRemainingUses(): number {
    const { uses } = this.getUsageData();
    return Math.max(0, 5 - uses);
  }

  getResetTime(): number | null {
    const { resetTime } = this.getUsageData();
    return resetTime;
  }

  isLimited(): boolean {
    const { uses } = this.getUsageData();
    return uses >= 5 && this.isWithinResetPeriod();
  }

  subscribe(callback: (data: { remainingUses: number; isLimited: boolean; resetTime: number | null }) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately call with current state
    const { uses, resetTime } = this.getUsageData();
    const remainingUses = Math.max(0, 5 - uses);
    const isLimited = uses >= 5 && this.isWithinResetPeriod();
    callback({ remainingUses, isLimited, resetTime });
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Debug methods
  debugReset(): void {
    this.resetUsage();
    console.log('Usage limit reset for debugging');
  }

  debugSetLimit(): void {
    const resetTime = Date.now() + (1.5 * 60 * 60 * 1000);
    this.saveUsageData(5, resetTime);
    this.notifySubscribers();
    console.log('Usage limit set to maximum for debugging');
  }
}

export const usageLimitService = UsageLimitService.getInstance();