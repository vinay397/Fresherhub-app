import React, { useState } from 'react';
import { 
  Briefcase, 
  LogIn, 
  User, 
  ChevronDown, 
  FileText, 
  Mail, 
  Calculator,
  LogOut,
  Settings,
  Crown,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

interface NavigationProps {
  onNavigate: (tab: 'home' | 'jobs' | 'ats' | 'cover' | 'salary') => void;
  currentTab: string;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentTab }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAIToolsDropdown, setShowAIToolsDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const aiTools = [
    {
      id: 'ats',
      name: 'ATS Scanner',
      description: 'Analyze resume compatibility',
      icon: <FileText className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      id: 'cover',
      name: 'Cover Letter',
      description: 'Generate personalized letters',
      icon: <Mail className="h-4 w-4" />,
      color: 'text-indigo-600'
    },
    {
      id: 'salary',
      name: 'Salary Calculator',
      description: 'Check market rates',
      icon: <Calculator className="h-4 w-4" />,
      color: 'text-green-600'
    }
  ];

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FresherHub
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 'home'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => onNavigate('jobs')}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 'jobs'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Jobs
              </button>

              {/* AI Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAIToolsDropdown(!showAIToolsDropdown)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all ${
                    ['ats', 'cover', 'salary'].includes(currentTab)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span>AI Tools</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    showAIToolsDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {showAIToolsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    {aiTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          onNavigate(tool.id as any);
                          setShowAIToolsDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                      >
                        <div className={`p-2 rounded-lg bg-gray-100 ${tool.color}`}>
                          {tool.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{tool.name}</div>
                          <div className="text-sm text-gray-600">{tool.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          {user.name}
                          {user.subscription_type === 'premium' && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {user.credits} credits
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {user.name}
                          {user.subscription_type === 'premium' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {user.credits}/5 AI Credits • Resets every 3h
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">Settings</span>
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => onNavigate('home')}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all ${
                currentTab === 'home'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all ${
                currentTab === 'jobs'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white'
              }`}
            >
              Jobs
            </button>
            {aiTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  currentTab === tool.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
              >
                <div className={tool.color}>{tool.icon}</div>
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Click outside handlers */}
      {(showUserMenu || showAIToolsDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowAIToolsDropdown(false);
          }}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navigation;