import React, { useState } from 'react';
import { RefreshCw, Download, Sparkles, Brain, FileText, Zap, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import { usageLimitService } from '../services/usageLimitService';
import { geminiService } from '../services/geminiService';
import { ATSResult } from '../types/ATS';

interface ResumeRebuilderProps {
  originalResume: string;
  jobDescription: string;
  atsResult: ATSResult;
}

interface RebuiltResume {
  content: string;
  improvements: string[];
  addedKeywords: string[];
  optimizations: string[];
}

const ResumeRebuilder: React.FC<ResumeRebuilderProps> = ({ 
  originalResume, 
  jobDescription, 
  atsResult 
}) => {
  const [rebuiltResume, setRebuiltResume] = useState<RebuiltResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [canUseAI, setCanUseAI] = useState(true);

  React.useEffect(() => {
    const unsubscribe = usageLimitService.subscribe(({ isLimited }) => {
      setCanUseAI(!isLimited);
    });

    return unsubscribe;
  }, []);

  const handleRebuildResume = async () => {
    if (!originalResume) {
      alert('Please provide your original resume content');
      return;
    }

    // Check usage limit
    if (!usageLimitService.canUseAI()) {
      alert('You have reached your free usage limit. Please wait for the reset time.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting AI-powered resume rebuilding...');
      
      const result = await geminiService.rebuildResume(originalResume, jobDescription, atsResult, customPrompt.trim() || undefined);
      
      // Use AI quota
      usageLimitService.useAI();
      setRebuiltResume(result);
      setShowPreview(true);
      
      console.log('✅ Resume rebuilding complete!');
    } catch (error) {
      console.error('❌ Error rebuilding resume:', error);
      alert('Resume rebuilding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = () => {
    if (!rebuiltResume) return;

    // Create a more professional Word document format
    const wordContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Optimized Resume</title>
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0.5in;
            color: #333;
            font-size: 11pt;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
        }
        .name {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .contact {
            font-size: 10pt;
            color: #666;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .content {
            margin-left: 10px;
        }
        .job-title {
            font-weight: bold;
            color: #374151;
        }
        .company {
            font-style: italic;
            color: #6b7280;
        }
        .date {
            float: right;
            color: #6b7280;
            font-size: 10pt;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .skill {
            background-color: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10pt;
        }
        ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 3px;
        }
        .ai-optimized {
            background-color: #dbeafe;
            border-left: 3px solid #3b82f6;
            padding: 10px;
            margin: 20px 0;
            font-size: 9pt;
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="ai-optimized">
        <strong>🤖 AI-Optimized Resume</strong> - This resume has been enhanced with AI recommendations for better ATS compatibility and keyword optimization.
    </div>
    
    ${rebuiltResume.content.replace(/\n/g, '<br>')}
    
    <div class="ai-optimized">
        <strong>AI Optimizations Applied:</strong><br>
        ${rebuiltResume.optimizations.map(opt => `• ${opt}`).join('<br>')}
    </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([wordContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AI_Optimized_Resume.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    alert('✅ Resume downloaded successfully! Your AI-optimized resume is ready to use.');
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wand2 className="h-8 w-8" />
            <div>
              <h2 className="text-3xl font-bold mb-2">AI Resume Rebuilder</h2>
              <p className="text-emerald-100">Transform your resume with AI-powered optimizations</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Score: {atsResult.score}%</div>
            <div className="text-emerald-100 text-sm">Current ATS Score</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Action Button */}
        {!rebuiltResume && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-3 flex items-center justify-center">
                <Brain className="h-6 w-6 mr-2" />
                Ready to Optimize Your Resume?
              </h3>
              <p className="text-emerald-700 mb-4">
                Our AI will rebuild your resume by incorporating missing keywords, improving formatting, 
                and optimizing content based on the job description and ATS analysis.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="font-semibold text-emerald-900 mb-1">✨ Add Keywords</div>
                  <div className="text-emerald-700">Include {atsResult.missingKeywords.length} missing keywords</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="font-semibold text-emerald-900 mb-1">🎯 Optimize Content</div>
                  <div className="text-emerald-700">Enhance based on {atsResult.suggestions.length} AI suggestions</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="font-semibold text-emerald-900 mb-1">📄 ATS Format</div>
                  <div className="text-emerald-700">Structure for maximum ATS compatibility</div>
                </div>
              </div>
            </div>

            {/* Custom Prompt Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-200">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>Custom Instructions (Optional)</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add any specific instructions for the AI resume rebuilding (optional)..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            <button
              onClick={handleRebuildResume}
              disabled={loading || !canUseAI}
              className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none text-lg font-semibold mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>AI Rebuilding Resume...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-6 w-6" />
                  <Brain className="h-5 w-5" />
                  <span>Rebuild Resume with AI</span>
                </>
              )}
            </button>

            {/* AI Status */}
            <div className="mt-4">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm ${
                geminiService.isAvailable() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  geminiService.isAvailable() ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span>
                  {geminiService.isAvailable() 
                    ? 'Google Gemini AI Ready' 
                    : 'Smart Fallback Mode Active'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Rebuilt Resume Results */}
        {rebuiltResume && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-2xl font-bold text-green-900">Resume Successfully Rebuilt!</h3>
                  <p className="text-green-700">Your resume has been optimized with AI recommendations</p>
                </div>
              </div>

              {/* Optimization Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">Keywords Added</div>
                  <div className="text-2xl font-bold text-green-600">{rebuiltResume.addedKeywords.length}</div>
                  <div className="text-sm text-green-700">Missing keywords integrated</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">Improvements Made</div>
                  <div className="text-2xl font-bold text-green-600">{rebuiltResume.improvements.length}</div>
                  <div className="text-sm text-green-700">Content enhancements</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">Optimizations</div>
                  <div className="text-2xl font-bold text-green-600">{rebuiltResume.optimizations.length}</div>
                  <div className="text-sm text-green-700">ATS improvements</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FileText className="h-5 w-5" />
                <span>{showPreview ? 'Hide Preview' : 'Preview Resume'}</span>
              </button>

              <button
                onClick={handleDownloadResume}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Download Word Document</span>
              </button>

              <button
                onClick={() => {
                  setRebuiltResume(null);
                  setShowPreview(false);
                }}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Rebuild Again</span>
              </button>
            </div>

            {/* Resume Preview */}
            {showPreview && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-blue-600" />
                  Optimized Resume Preview
                </h3>
                <div className="bg-white rounded-lg p-6 border border-gray-300 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
                    {rebuiltResume.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Detailed Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Added Keywords */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <Zap className="h-6 w-6 mr-2" />
                  Keywords Added
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rebuiltResume.addedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium border border-blue-300"
                    >
                      + {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Improvements */}
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2" />
                  Content Improvements
                </h3>
                <ul className="space-y-2">
                  {rebuiltResume.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2 text-purple-800">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ATS Optimizations */}
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center">
                <Brain className="h-6 w-6 mr-2" />
                ATS Optimizations Applied
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rebuiltResume.optimizations.map((optimization, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4 border border-emerald-200">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-emerald-800 font-medium text-sm">{optimization}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <h4 className="text-xl font-bold mb-3 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Next Steps for Success
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-2">1. Download & Review</div>
                  <div className="text-emerald-100">Download your optimized resume and review all changes</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-2">2. Customize Further</div>
                  <div className="text-emerald-100">Tailor specific sections for each job application</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-2">3. Apply Confidently</div>
                  <div className="text-emerald-100">Submit your ATS-optimized resume to job applications</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeRebuilder;