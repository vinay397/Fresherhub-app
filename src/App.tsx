import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/Navigation';
import Homepage from './components/Homepage';
import JobBoard from './components/JobBoard';
import ATSAnalyzer from './components/ATSAnalyzer';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import SalaryCalculator from './components/SalaryCalculator';
import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'ats' | 'cover' | 'salary'>('home');
  const [searchParams, setSearchParams] = useState<{ query?: string; location?: string }>({});
  const { loading, initialized } = useAuth();

  const handleNavigate = (tab: 'home' | 'jobs' | 'ats' | 'cover' | 'salary', params?: { query?: string; location?: string }) => {
    setActiveTab(tab);
    if (params) {
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FresherHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation onNavigate={handleNavigate} currentTab={activeTab} />
      
      <main className={activeTab === 'home' ? '' : 'container mx-auto px-4 py-8'}>
        {activeTab === 'home' && <Homepage onNavigate={handleNavigate} />}
        {activeTab === 'jobs' && <JobBoard searchParams={searchParams} />}
        {activeTab === 'ats' && <ATSAnalyzer />}
        {activeTab === 'cover' && <CoverLetterGenerator />}
        {activeTab === 'salary' && <SalaryCalculator />}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;