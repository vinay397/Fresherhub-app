import React, { useState, useEffect } from 'react';
import { DollarSign, MapPin, Clock, Briefcase, TrendingUp, Brain, Calculator, Sparkles, Target, Building, GraduationCap, Award } from 'lucide-react';
import CreditDisplay from './CreditDisplay';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';

interface SalaryData {
  jobRole: string;
  location: string;
  experience: string;
  education: string;
  skills: string;
  companySize: string;
  industry: string;
  workType: string;
}

interface SalaryResult {
  averageSalary: string;
  salaryRange: {
    min: string;
    max: string;
  };
  factors: {
    location: string;
    experience: string;
    skills: string;
    education: string;
    industry: string;
  };
  recommendations: string[];
  marketTrends: string[];
  comparison: {
    national: string;
    regional: string;
  };
}

const SalaryCalculator: React.FC = () => {
  const [formData, setFormData] = useState<SalaryData>({
    jobRole: '',
    location: '',
    experience: 'Fresher',
    education: 'Bachelor\'s Degree',
    skills: '',
    companySize: 'Medium (100-1000)',
    industry: 'Technology',
    workType: 'Full-time'
  });

  const [result, setResult] = useState<SalaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const { user, useCredit } = useAuth();

  const experienceLevels = [
    'Fresher',
    '0-1 years',
    '1-2 years',
    '2-3 years',
    '3-5 years',
    '5-7 years',
    '7-10 years',
    '10+ years'
  ];

  const educationLevels = [
    'High School',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Certification'
  ];

  const companySizes = [
    'Startup (1-50)',
    'Small (50-100)',
    'Medium (100-1000)',
    'Large (1000-5000)',
    'Enterprise (5000+)'
  ];

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Media & Entertainment',
    'Government',
    'Non-profit'
  ];

  const workTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Remote',
    'Hybrid'
  ];

  useEffect(() => {
    // Check AI availability on component mount
    checkAiAvailability();
  }, []);



  const checkAiAvailability = async () => {
    const available = await geminiService.isAvailable();
    setAiAvailable(available);
  };

  const handleCalculate = async () => {
    if (!formData.jobRole || !formData.location) {
      alert('Please fill in at least the job role and location');
      return;
    }

    // Allow guest users to use free credit
    if (user) {
      const success = await useCredit();
      if (!success) {
        alert('❌ No credits remaining.');
        return;
      }
    } else {
      // Guest user - allow one free usage
      const guestUsed = localStorage.getItem('fresherhub_guest_used');
      if (guestUsed) {
        alert('❌ Free credit already used. Sign in to get 5 credits!');
        return;
      }
      localStorage.setItem('fresherhub_guest_used', 'true');
    }

    setLoading(true);

    try {
      console.log('🚀 Starting AI-powered salary analysis...');
      
      const salaryResult = await geminiService.calculateSalary(formData);
      
      // Credit already used above
      setResult(salaryResult);
      
      console.log('✅ Salary analysis complete!');
    } catch (error) {
      console.error('❌ Error calculating salary:', error);
      alert('Salary calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SalaryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Calculator className="h-8 w-8" />
            <DollarSign className="h-8 w-8" />
            <Brain className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Salary Calculator
          </h1>
          <p className="text-xl text-green-100 mb-6 max-w-3xl">
            Get accurate salary estimates powered by FresherHub's advanced AI. Analyze market trends, location factors, and skill premiums to know your worth in today's job market.
          </p>
          <div className="flex items-center space-x-6 text-green-100">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>FresherHub AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${aiAvailable ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span>Real-time Market Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Display */}
      <CreditDisplay />

      {/* Calculator Form */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Briefcase className="h-6 w-6 mr-3 text-green-600" />
            Job Details
          </h2>
          <p className="text-gray-600 mt-1">Enter your job information for accurate salary estimation</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Role */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <span>Job Role / Position *</span>
              </label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={(e) => handleInputChange('jobRole', e.target.value)}
                placeholder="e.g., Frontend Developer, Data Scientist, Product Manager, Marketing Specialist"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <span>Location *</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Bangalore, Mumbai, Delhi, Hyderabad, Pune"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Experience Level</span>
              </label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                <span>Education Level</span>
              </label>
              <select
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Building className="h-5 w-5 text-indigo-500" />
                <span>Industry</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Building className="h-5 w-5 text-orange-500" />
                <span>Company Size</span>
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Award className="h-5 w-5 text-green-500" />
                <span>Work Type</span>
              </label>
              <select
                value={formData.workType}
                onChange={(e) => handleInputChange('workType', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {workTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>Key Skills (comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder="e.g., React, Python, AWS, Machine Learning, Project Management, SQL"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCalculate}
              disabled={loading || !formData.jobRole || !formData.location}
              className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Calculating Salary...</span>
                </>
              ) : (
                <>
                  <Calculator className="h-6 w-6" />
                  <Brain className="h-5 w-5" />
                  <span>Calculate with AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Status Indicator */}
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm ${
              aiAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                aiAvailable ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>
                {aiAvailable 
                  ? 'FresherHub AI Active' 
                  : 'Smart Fallback Analysis Active'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Salary Analysis Report</h2>
              <p className="text-green-100">AI-powered salary insights for {formData.jobRole} in {formData.location}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Main Salary Info */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-6 shadow-2xl">
                <span className="text-3xl font-bold text-white">
                  {result.averageSalary}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Average Annual Salary
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                Range: {result.salaryRange.min} - {result.salaryRange.max}
              </p>
            </div>

            {/* Salary Factors */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2" />
                Salary Factors Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-1">Location Impact</div>
                  <div className="text-blue-700">{result.factors.location}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-1">Experience Premium</div>
                  <div className="text-blue-700">{result.factors.experience}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-1">Skills Bonus</div>
                  <div className="text-blue-700">{result.factors.skills}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-1">Education Factor</div>
                  <div className="text-blue-700">{result.factors.education}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-1">Industry Standard</div>
                  <div className="text-blue-700">{result.factors.industry}</div>
                </div>
              </div>
            </div>

            {/* Market Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                  <Target className="h-6 w-6 mr-2" />
                  Market Comparison
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="font-medium text-gray-900">National Average</span>
                    <span className="text-purple-700 font-semibold">{result.comparison.national}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="font-medium text-gray-900">Regional Average</span>
                    <span className="text-purple-700 font-semibold">{result.comparison.regional}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  Market Trends
                </h3>
                <ul className="space-y-2">
                  {result.marketTrends.map((trend, index) => (
                    <li key={index} className="flex items-start space-x-2 text-orange-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <Brain className="h-6 w-6 mr-2" />
                AI Recommendations to Increase Salary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-green-800 font-medium text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;