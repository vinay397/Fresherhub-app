import React, { useState } from 'react';
import { Shield, Lock, X, Eye, EyeOff, Key, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

interface AdminLoginProps {
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Simple admin password
  const ADMIN_PASSWORD = 'Vinay@270';
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 300000; // 5 minutes

  // Check for existing lockout and load API key
  React.useEffect(() => {
    const lockoutEnd = localStorage.getItem('admin_lockout_end');
    if (lockoutEnd) {
      const lockoutEndTime = parseInt(lockoutEnd);
      if (Date.now() < lockoutEndTime) {
        setIsLocked(true);
        setLockoutTime(lockoutEndTime);
        const timer = setInterval(() => {
          if (Date.now() >= lockoutEndTime) {
            setIsLocked(false);
            setLockoutTime(0);
            localStorage.removeItem('admin_lockout_end');
            localStorage.removeItem('admin_login_attempts');
            clearInterval(timer);
          }
        }, 1000);
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem('admin_lockout_end');
        localStorage.removeItem('admin_login_attempts');
      }
    }

    // Check if already logged in
    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    if (adminLoggedIn === 'true') {
      setIsLoggedIn(true);
      loadApiKey();
    }

    // Load login attempts
    const attempts = localStorage.getItem('admin_login_attempts');
    if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
  }, []);

  const loadApiKey = async () => {
    try {
      console.log('🔄 Loading API key from database...');
      const key = await supabaseService.getGeminiApiKey();
      setApiKey(key || '');
      console.log('✅ API key loaded:', key ? 'Key found' : 'No key found');
    } catch (error) {
      console.error('❌ Error loading API key:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('🔒 Account temporarily locked due to multiple failed attempts. Please try again later.');
      return;
    }

    if (!password) {
      alert('⚠️ Please enter the admin password.');
      return;
    }

    if (password === ADMIN_PASSWORD) {
      // Successful login
      setIsLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
      
      // Reset login attempts on successful login
      setLoginAttempts(0);
      localStorage.removeItem('admin_login_attempts');
      
      // Load API key from database
      loadApiKey();
      
      alert('✅ Login successful! Welcome to Admin Panel.');
    } else {
      // Failed login attempt
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock account
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
        localStorage.setItem('admin_lockout_end', lockoutEnd.toString());
        
        alert(`🚨 SECURITY ALERT\n\nToo many failed login attempts!\nAccount locked for 5 minutes.\n\nRemaining attempts: 0/${MAX_LOGIN_ATTEMPTS}`);
      } else {
        alert(`❌ Incorrect password!\n\nRemaining attempts: ${MAX_LOGIN_ATTEMPTS - newAttempts}/${MAX_LOGIN_ATTEMPTS}\n\n⚠️ Account will be locked after ${MAX_LOGIN_ATTEMPTS} failed attempts.`);
      }
      
      setPassword('');
    }
  };

  const handleApiKeySave = async () => {
    if (!apiKey.trim()) {
      alert('⚠️ Please enter a valid API key.');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Attempting to save API key...');
      
      // Debug admin settings first
      await supabaseService.debugAdminSettings();
      
      const success = await supabaseService.setGeminiApiKey(apiKey.trim());
      
      if (success) {
        alert('✅ FresherHub AI key saved successfully! The AI features will now work for all users visiting the site.');
        
        // Verify the save worked
        const savedKey = await supabaseService.getGeminiApiKey();
        console.log('🔍 Verification - saved key:', savedKey ? 'Key verified' : 'Key not found');
        
        // Reload the page to reinitialize AI service
        window.location.reload();
      } else {
        alert('❌ Failed to save API key. Please check the console for errors and try again.');
      }
    } catch (error) {
      console.error('❌ Error saving API key:', error);
      alert('❌ Error saving API key. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyRemove = async () => {
    if (!confirm('Are you sure you want to remove the API key? This will disable AI features for all users.')) {
      return;
    }

    setLoading(true);
    try {
      const success = await supabaseService.setGeminiApiKey('');
      
      if (success) {
        setApiKey('');
        alert('🗑️ API key removed successfully. AI features will now use fallback analysis.');
        window.location.reload();
      } else {
        alert('❌ Failed to remove API key. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error removing API key:', error);
      alert('❌ Error removing API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowApiSettings(false);
    localStorage.removeItem('admin_logged_in');
    onClose();
  };

  // Format remaining lockout time
  const formatLockoutTime = (): string => {
    if (!isLocked || !lockoutTime) return '';
    const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Main Admin Panel (when logged in)
  if (isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <p className="text-gray-600">Manage your FresherHub platform globally</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Admin Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const event = new CustomEvent('navigateToAdmin');
                  window.dispatchEvent(event);
                  onClose();
                }}
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <Settings className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Job Management</div>
                  <div className="text-sm text-blue-700">Add, edit, and manage job listings globally</div>
                </div>
              </button>

              <button
                onClick={() => setShowApiSettings(!showApiSettings)}
                className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-200"
              >
                <Key className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-purple-900">Global AI Settings</div>
                  <div className="text-sm text-purple-700">Configure FresherHub AI for all users</div>
                </div>
              </button>
            </div>

            {/* API Settings */}
            {showApiSettings && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2 text-purple-600" />
                  Global FresherHub AI Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Important: Global Configuration
                    </h4>
                    <p className="text-sm text-blue-800">
                      This API key will be used by <strong>all users</strong> visiting your website. Once configured, 
                      the AI features (ATS Analyzer, Resume Rebuilder, Salary Calculator) will work for everyone.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={apiKeyVisible ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API key here..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {apiKeyVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      How to get your Gemini API Key:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Create API Key"</li>
                      <li>Copy the generated API key</li>
                      <li>Paste it in the field above and save</li>
                    </ol>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleApiKeySave}
                      disabled={loading || !apiKey.trim()}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Key className="h-4 w-4" />
                      )}
                      <span>Save Global API Key</span>
                    </button>
                    
                    <button
                      onClick={handleApiKeyRemove}
                      disabled={loading}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove Key
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={apiKey ? 'text-green-700' : 'text-yellow-700'}>
                      {apiKey ? 'Global AI Configured - Active for all users' : 'Using Fallback Analysis for all users'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>Logout from Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simple Password Login Form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
              <p className="text-gray-600">Enter admin password to continue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Lockout Warning */}
        {isLocked && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-900">Account Temporarily Locked</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Too many failed attempts. Try again in: {formatLockoutTime()}
            </p>
          </div>
        )}

        {/* Login Attempts Warning */}
        {loginAttempts > 0 && !isLocked && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-900">Security Warning</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Failed attempts: {loginAttempts}/{MAX_LOGIN_ATTEMPTS}. Account will be locked after {MAX_LOGIN_ATTEMPTS} attempts.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <Lock className="h-4 w-4" />
              <span>Admin Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLocked}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLocked}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked || !password}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <Shield className="h-5 w-5" />
            <span>Access Admin Panel</span>
          </button>
        </form>

        {/* Security Info */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-blue-600" />
            Global Admin Features:
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Centralized job management for all users</li>
            <li>• Global AI configuration affecting all visitors</li>
            <li>• Secure cloud-based data storage</li>
            <li>• Real-time updates across all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;