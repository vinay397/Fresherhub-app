import React, { useState, useEffect } from 'react';
import ResumeUploader from './ResumeUploader';
import AdvancedCreditDisplay from './auth/AdvancedCreditDisplay';
import ATSReport from './ATSReport';
import ResumeRebuilder from './ResumeRebuilder';
import { ATSResult } from '../types/ATS';
import { Brain, Target, Sparkles, Cpu } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useAdvancedAuth } from '../hooks/useAdvancedAuth';

const ATSAnalyzer: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const { user, useCredit, canUseCredit, getCreditsInfo, testDatabaseConnection } = useAdvancedAuth();
  
  useEffect(() => {
    checkAiAvailability();
  }, []);

  const checkAiAvailability = async () => {
    const available = await geminiService.isAvailable();
    setAiAvailable(available);
  };

  const handleAnalyze = async () => {
    console.log('🔥 ATS Analyze button clicked! Starting analysis...');
    console.log('User:', user);
    console.log('Can use credit:', canUseCredit());
    let finalResumeText = resumeText;

    // If file is uploaded, try to extract text from it
    if (resumeFile && !resumeText) {
      try {
        finalResumeText = await extractTextFromFile(resumeFile);
        // Don't set the resumeText state to avoid showing extracted content in the textarea
      } catch (error) {
        console.error('Error extracting text from file:', error);
        alert('Could not extract text from file. Please paste your resume text manually.');
        return;
      }
    }

    if (!finalResumeText) {
      alert('Please upload a resume file or enter resume text');
      return;
    }

    if (!jobDescription) {
      alert('Please provide job description');
      return;
    }

    // Check and use credit
    const creditsInfo = getCreditsInfo();
    console.log('Credits info:', creditsInfo);
    console.log('Credits available:', creditsInfo.credits);
    
    // Test database connection
    const dbTest = await testDatabaseConnection();
    console.log('Database connection test:', dbTest);
    
    if (creditsInfo.credits <= 0) {
      if (creditsInfo.isGuest) {
        if (creditsInfo.timeUntilReset) {
          alert(`❌ Free credit used. Resets in ${creditsInfo.timeUntilReset}. Sign in to get 5 credits!`);
        } else {
          alert('❌ No free credits. Sign in to get 5 credits!');
        }
      } else {
        if (creditsInfo.timeUntilReset) {
          alert(`❌ No credits remaining. Resets in ${creditsInfo.timeUntilReset}.`);
        } else {
          alert('❌ No credits remaining. Credits reset 24 hours after exhaustion.');
        }
      }
      return;
    }

    // Use credit
    const success = await useCredit();
    if (!success) {
      alert('❌ Failed to use credit. Please try again.');
      return;
    }
    
    console.log('Credit used successfully');

    setLoading(true);
    
    try {
      console.log('🚀 Starting AI-powered ATS analysis...');
      
      // Call AI service
      const result = await geminiService.analyzeResume(
        finalResumeText, 
        jobDescription, 
        customPrompt.trim() || undefined
      );
      
      // Credit already used above
      
      console.log('✅ Analysis complete!');
      setAtsResult(result);
    } catch (error) {
      console.error('❌ Error analyzing resume:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          resolve(text);
        } else {
          reject(new Error('Could not read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8" />
            <Sparkles className="h-6 w-6" />
            <Cpu className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI-Powered ATS Scanner & Resume Builder
          </h1>
          <p className="text-xl text-purple-100 mb-6 max-w-3xl">
            Get your resume analyzed by FresherHub's advanced AI. Receive intelligent feedback, compatibility scores, and get an optimized resume built automatically from your uploaded document.
          </p>
          <div className="flex items-center space-x-6 text-purple-100">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>FresherHub AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${aiAvailable ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span>{aiAvailable ? 'AI Active' : 'Fallback Mode'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Display */}
      <AdvancedCreditDisplay />

      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ResumeUploader 
              resumeFile={resumeFile} 
              setResumeFile={setResumeFile}
            />
            
            {/* Optional Manual Resume Text Input */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Or paste your resume text here (Optional):</span>
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="This field is optional if you've uploaded a file above. Our AI can read your uploaded document directly.

If you prefer, you can paste your resume content here:

John Doe
Frontend Developer

Skills: React, JavaScript, HTML, CSS, Git, TypeScript
Experience: 
- Built 3 responsive web applications using React and TypeScript
- Collaborated with UI/UX team to implement pixel-perfect designs
- Optimized application performance resulting in 40% faster load times

Education: Bachelor's in Computer Science"
                rows={10}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2 bg-purple-50 p-2 rounded-lg">
                💡 Our AI can extract text from your uploaded PDF/Word document automatically. This field is only needed if you want to override the extracted content.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Custom Prompt Section */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>Custom Instructions (Optional)</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add any specific instructions for the AI analysis (optional)..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="h-6 w-6 mr-2 text-purple-600" />
              Job Description
            </h3>
            
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Job Description *</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here...

Example:
We are looking for a Frontend Developer with experience in:
- React.js and modern JavaScript
- HTML5, CSS3, and responsive design
- Git version control
- RESTful API integration
- Testing frameworks like Jest

Requirements:
- Bachelor's degree in Computer Science
- 0-2 years of experience
- Strong problem-solving skills"
                rows={12}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2 bg-purple-50 p-2 rounded-lg">
                📝 Include the complete job description with requirements, skills, and qualifications for the most accurate analysis
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('ATS Analyze button clicked!');
              handleAnalyze();
            }}
            disabled={loading}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none text-lg font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>AI Analyzing Resume...</span>
              </>
            ) : (
              <>
                <Brain className="h-6 w-6" />
                <Sparkles className="h-5 w-5" />
                <span>Analyze with AI</span>
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

      {atsResult && <ATSReport result={atsResult} />}
      
      {/* Resume Rebuilder Section */}
      {atsResult && (resumeText || resumeFile) && (
        <ResumeRebuilder
          originalResume={resumeText}
          jobDescription={jobDescription}
          atsResult={atsResult}
        />
      )}
    </div>
  );
};

export default ATSAnalyzer;