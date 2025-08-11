import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Zap, CheckCircle } from 'lucide-react';
import { usageLimitService } from '../services/usageLimitService';

interface UsageLimitBannerProps {
  toolName: string;
}

const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({ toolName }) => {
  const [remainingUses, setRemainingUses] = useState(5);
  const [isLimited, setIsLimited] = useState(false);
  const [resetTime, setResetTime] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const unsubscribe = usageLimitService.subscribe(({ remainingUses, isLimited, resetTime }) => {
      setRemainingUses(remainingUses);
      setIsLimited(isLimited);
      setResetTime(resetTime);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (resetTime && isLimited) {
      const updateTimer = () => {
        const now = Date.now();
        const timeLeft = resetTime - now;
        
        if (timeLeft <= 0) {
          setTimeUntilReset('');
          return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeUntilReset(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeUntilReset(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilReset(`${seconds}s`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [resetTime, isLimited]);

  if (isLimited) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Free Limit Reached</h3>
            <p className="text-red-700 text-sm mt-1">
              You've used all 5 free AI credits. Please come back in {timeUntilReset} to use the tools again.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-red-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{timeUntilReset}</span>
          </div>
        </div>
      </div>
    );
  }

  if (remainingUses <= 2) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">Running Low on Free Credits</h3>
            <p className="text-yellow-700 text-sm mt-1">
              You have {remainingUses} free {remainingUses === 1 ? 'use' : 'uses'} left across all AI tools.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">{remainingUses} left</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
      <div className="flex items-center space-x-3">
        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900">Use AI Tools for Free</h3>
          <p className="text-green-700 text-sm mt-1">
            You have {remainingUses} free credits remaining across all AI tools.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">{remainingUses}/5</span>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitBanner;