import React, { useState, useEffect } from 'react';
import { Search, FileText, Briefcase, User, Shield, Calculator, Mail, Home, ChevronDown, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'jobs' | 'ats' | 'cover' | 'salary' | 'admin';
  setActiveTab: (tab: 'home' | 'jobs' | 'ats' | 'cover' | 'salary' | 'admin') => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isAdmin, setIsAdmin }) => {
  const [showAIToolsDropdown, setShowAIToolsDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    if (adminLoggedIn) {
      setIsAdmin(true);
    }

    // Listen for admin navigation events
    const handleAdminNavigation = () => {
      setIsAdmin(true);
      setActiveTab('admin');
    };

    window.addEventListener('navigateToAdmin', handleAdminNavigation);
    
    return () => {
      window.removeEventListener('navigateToAdmin', handleAdminNavigation);
    };
  }, [setIsAdmin, setActiveTab]);

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('admin_logged_in');
    setActiveTab('home');
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setShowAIToolsDropdown(false);
  };

  const handleNavigation = (tab: 'home' | 'jobs' | 'ats' | 'cover' | 'salary' | 'admin') => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <Briefcase className="h-10 w-10 text-blue-600" />
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FresherHub
                </span>
                <p className="text-xs text-gray-500 -mt-1">Find Your Dream Job</p>
              </div>
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
              <button
                onClick={() => handleNavigation('home')}
                className="flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Home</span>
              </button>
              
              <button
                onClick={() => handleNavigation('jobs')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'jobs'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="h-4 w-4" />
                <span className="font-medium">Find Jobs</span>
              </button>

              {/* AI Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAIToolsDropdown(!showAIToolsDropdown)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="font-medium">AI Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showAIToolsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        handleNavigation('ats');
                        setShowAIToolsDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                        activeTab === 'ats' ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                      }`}
                    >
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">ATS Analyser + Resume Builder</div>
                        <div className="text-sm text-gray-500">Scan & rebuild your resume with AI</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleNavigation('cover');
                        setShowAIToolsDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                        activeTab === 'cover' ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <Mail className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="font-medium text-gray-900">Cover Letter & Job Email Writer</div>
                        <div className="text-sm text-gray-500">AI-powered application materials</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleNavigation('salary');
                        setShowAIToolsDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                        activeTab === 'salary' ? 'bg-green-50 border-l-4 border-green-500' : ''
                      }`}
                    >
                      <Calculator className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Salary Checker</div>
                        <div className="text-sm text-gray-500">Check fresher salaries in India</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleNavigation('admin')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Admin</span>
                </button>
              )}
            </nav>
          </div>
          
          {/* Right side - Desktop Admin logout + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Desktop Admin Logout */}
            {isAdmin && (
              <button 
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
              >
                <User className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="w-6 h-0.5 bg-current"></div>
                  <div className="w-6 h-0.5 bg-current"></div>
                  <div className="w-6 h-0.5 bg-current"></div>
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white shadow-lg">
            <div className="py-4 space-y-2">
              <button
                onClick={() => handleNavigation('home')}
                className="flex items-center space-x-3 w-full px-6 py-4 text-left transition-all duration-300 text-gray-600 hover:bg-gray-100 border-b border-gray-100"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </button>
              
              <button
                onClick={() => handleNavigation('jobs')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left transition-all duration-300 border-b border-gray-100 ${
                  activeTab === 'jobs'
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search className="h-5 w-5" />
                <span className="font-medium">Find Jobs</span>
              </button>

              {/* Mobile AI Tools Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setShowAIToolsDropdown(!showAIToolsDropdown)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left transition-all duration-300 text-gray-600 hover:bg-gray-100 border-b border-gray-100"
                >
                  <span className="font-medium">AI Tools</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAIToolsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showAIToolsDropdown && (
                  <div className="bg-gray-50 space-y-1">
                    <button
                      onClick={() => handleNavigation('ats')}
                      className={`flex items-center space-x-3 w-full px-8 py-3 text-left transition-all duration-300 ${
                        activeTab === 'ats'
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <div>
                        <div className="font-medium">ATS Analyser</div>
                        <div className="text-xs text-gray-500">Resume scanner & builder</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('cover')}
                      className={`flex items-center space-x-3 w-full px-8 py-3 text-left transition-all duration-300 ${
                        activeTab === 'cover'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Mail className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Cover Letter Writer</div>
                        <div className="text-xs text-gray-500">AI-powered applications</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('salary')}
                      className={`flex items-center space-x-3 w-full px-8 py-3 text-left transition-all duration-300 ${
                        activeTab === 'salary'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Calculator className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Salary Checker</div>
                        <div className="text-xs text-gray-500">Fresher salary insights</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Admin Section */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleNavigation('admin')}
                    className={`flex items-center space-x-3 w-full px-6 py-4 text-left transition-all duration-300 border-b border-gray-100 ${
                      activeTab === 'admin'
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Admin Panel</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-6 py-4 text-left transition-all duration-300 text-red-600 hover:bg-red-50 border-b border-gray-100"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;