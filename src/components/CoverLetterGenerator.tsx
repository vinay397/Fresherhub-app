import React, { useState, useEffect, useRef } from 'react';
import { Mail, FileText, Download, Brain, Sparkles, User, Building, CheckCircle, Wand2, Upload, X } from 'lucide-react';
import AdvancedCreditDisplay from './auth/AdvancedCreditDisplay';
import { geminiService } from '../services/geminiService';
import { useAdvancedAuth } from '../hooks/useAdvancedAuth';

interface CoverLetterData {
  resumeText: string;
  jobDescription: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  generationType: 'cover' | 'email' | 'both';
}

interface GeneratedContent {
  coverLetter: string;
  coldEmail: string;
  emailSubject: string;
  keyHighlights: string[];
  matchedSkills: string[];
}

const CoverLetterGenerator: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CoverLetterData>({
    resumeText: '',
    jobDescription: '',
    candidateName: '',
    jobTitle: '',
    companyName: '',
    generationType: 'both'
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const { user, useCredit, canUseCredit, getCreditsInfo } = useAdvancedAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<'cover' | 'email'>('cover');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAiAvailability();
  }, []);



  const checkAiAvailability = async () => {
    const available = await geminiService.isAvailable();
    setAiAvailable(available);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.txt')) {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF, Word document, or text file');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.txt')) {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF, Word document, or text file');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setResumeFile(null);
    setFormData({ ...formData, resumeText: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const handleGenerate = async () => {
    console.log('🔥 Cover Letter Generate button clicked!');
    console.log('User:', user);
    console.log('Can use credit:', canUseCredit());
    
    let finalResumeText = formData.resumeText;

    // Extract text from uploaded file if available
    if (resumeFile && !formData.resumeText) {
      try {
        finalResumeText = await extractTextFromFile(resumeFile);
      } catch (error) {
        console.error('Error extracting text from file:', error);
        alert('Could not extract text from file. Please try uploading a text file or use the optional text field.');
        return;
      }
    }

    if (!finalResumeText || !formData.jobDescription || !formData.candidateName) {
      alert('Please provide: Resume (file or text), Job Description, and Your Name');
      return;
    }

    // Check and use credit
    const creditsInfo = getCreditsInfo();
    console.log('Credits info:', creditsInfo);
    console.log('Credits available:', creditsInfo.credits);
    
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
      console.log('🚀 Starting AI-powered content generation...');
      
      const dataToSend = {
        ...formData,
        resumeText: finalResumeText
      };
      
      const result = await geminiService.generateCoverLetterAndEmail(
        dataToSend,
        customPrompt.trim() || undefined
      );
      
      // Credit already used above
      
      setGeneratedContent(result);
      setShowPreview(true);
      
      // Set initial preview type based on generation type
      if (formData.generationType === 'cover') {
        setPreviewType('cover');
      } else if (formData.generationType === 'email') {
        setPreviewType('email');
      } else {
        setPreviewType('cover'); // Default to cover for 'both'
      }
      
      console.log('✅ Content generation complete!');
    } catch (error) {
      console.error('❌ Error generating content:', error);
      alert('Content generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: 'cover' | 'email' | 'both') => {
    if (!generatedContent) return;

    let content = '';
    let filename = '';

    if (type === 'cover') {
      content = createWordDocument(generatedContent.coverLetter, 'Cover Letter');
      filename = `${formData.candidateName.replace(/\s+/g, '_')}_Cover_Letter.doc`;
    } else if (type === 'email') {
      const emailContent = `Subject: ${generatedContent.emailSubject}\n\n${generatedContent.coldEmail}`;
      content = createWordDocument(emailContent, 'Cold Email');
      filename = `${formData.candidateName.replace(/\s+/g, '_')}_Cold_Email.doc`;
    } else {
      const combinedContent = `COVER LETTER\n\n${generatedContent.coverLetter}\n\n\n\nCOLD EMAIL\n\nSubject: ${generatedContent.emailSubject}\n\n${generatedContent.coldEmail}`;
      content = createWordDocument(combinedContent, 'Cover Letter & Cold Email Package');
      filename = `${formData.candidateName.replace(/\s+/g, '_')}_Application_Package.doc`;
    }

    // Create blob and download
    const blob = new Blob([content], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`✅ ${type === 'both' ? 'Application package' : type === 'cover' ? 'Cover letter' : 'Cold email'} downloaded successfully!`);
  };

  const createWordDocument = (content: string, title: string): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
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
        .title {
            font-size: 16pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 10pt;
            color: #666;
        }
        .content {
            margin-top: 20px;
            white-space: pre-wrap;
        }
        .ai-generated {
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
    <div class="header">
        <div class="title">${title}</div>
        <div class="subtitle">Generated by FresherHub AI</div>
    </div>
    
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
    
    <div class="ai-generated">
        <strong>🤖 AI-Generated Content</strong> - This ${title.toLowerCase()} has been created using FresherHub's advanced AI to maximize your job application success.
    </div>
</body>
</html>
    `;
  };

  const getGenerationTypeLabel = (type: string) => {
    switch (type) {
      case 'cover': return 'Cover Letter Only';
      case 'email': return 'Cold Email Only';
      case 'both': return 'Both Cover Letter & Email';
      default: return 'Both Cover Letter & Email';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-8 w-8" />
            <FileText className="h-8 w-8" />
            <Wand2 className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Cover Letter & Cold Email Generator
          </h1>
          <p className="text-xl text-indigo-100 mb-6 max-w-3xl">
            Create personalized cover letters and professional cold emails instantly. Our AI analyzes your resume and the job description to craft compelling, ATS-optimized application materials.
          </p>
          <div className="flex items-center space-x-6 text-indigo-100">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
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

      {/* Input Form */}
      {!generatedContent && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="h-6 w-6 mr-3 text-indigo-600" />
              Application Details
            </h2>
            <p className="text-gray-600 mt-1">Provide your information to generate personalized content</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>Your Full Name *</span>
                </label>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <Building className="h-5 w-5 text-green-500" />
                  <span>Job Title</span>
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g., Frontend Developer"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <Building className="h-5 w-5 text-purple-500" />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g., TechCorp Solutions"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Generation Type Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Wand2 className="h-5 w-5 text-pink-500" />
                <span>What would you like to generate? *</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'cover', label: 'Cover Letter Only', icon: FileText, color: 'blue' },
                  { value: 'email', label: 'Cold Email Only', icon: Mail, color: 'purple' },
                  { value: 'both', label: 'Both Cover Letter & Email', icon: Sparkles, color: 'pink' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, generationType: option.value as 'cover' | 'email' | 'both' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                      formData.generationType === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <option.icon className={`h-5 w-5 ${
                      formData.generationType === option.value ? `text-${option.color}-600` : 'text-gray-500'
                    }`} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Section */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>Custom Instructions (Optional)</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add any specific instructions for the AI generation (optional)..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Upload Your Resume *</span>
              </label>
              
              {!resumeFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-16 w-16 text-blue-400 mx-auto mb-4 group-hover:text-blue-600 transition-colors" />
                  <p className="text-gray-700 mb-2 text-lg">
                    <span className="font-semibold text-blue-600">Click to upload resume</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mb-4">PDF, Word documents, or text files (Max 10MB)</p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                    <span>✓ PDF</span>
                    <span>✓ DOC</span>
                    <span>✓ DOCX</span>
                    <span>✓ TXT</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-2 border-green-300 bg-green-50 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{resumeFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Ready for processing</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              )}

              {/* Optional Text Input */}
              <div className="mt-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
                  <span>Or paste resume text here (Optional - only if file upload doesn't work):</span>
                </label>
                <textarea
                  value={formData.resumeText}
                  onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                  placeholder="Only use this field if the file upload above doesn't work properly..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded-lg">
                  💡 Our AI can read your uploaded file directly. This field is only needed if file upload fails.
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Job Description *</span>
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder="Paste the complete job description here...

Example:
We are looking for a Frontend Developer to join our dynamic team.

Key Responsibilities:
- Develop responsive web applications using React.js
- Collaborate with designers and backend developers
- Write clean, maintainable code
- Participate in code reviews

Requirements:
- Bachelor's degree in Computer Science or related field
- 1-3 years of experience with React.js
- Strong knowledge of JavaScript, HTML5, CSS3
- Experience with Git version control
- Good communication skills

What We Offer:
- Competitive salary package
- Health insurance
- Flexible working hours
- Learning opportunities"
                rows={10}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2 bg-purple-50 p-2 rounded-lg">
                📝 Include the complete job posting with requirements and company information
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Cover Letter Generate button clicked!');
                  handleGenerate();
                }}
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>AI Generating {getGenerationTypeLabel(formData.generationType)}...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-6 w-6" />
                    <Brain className="h-5 w-5" />
                    <span>Generate {getGenerationTypeLabel(formData.generationType)}</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Status */}
            <div className="text-center">
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
                    : 'Smart Fallback Mode Active'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Content Results */}
      {generatedContent && (
        <div className="space-y-8">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-2xl font-bold text-green-900">
                  {getGenerationTypeLabel(formData.generationType)} Generated Successfully!
                </h3>
                <p className="text-green-700">Your personalized content is ready for download</p>
              </div>
            </div>

            {/* Content Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Matched Skills</div>
                <div className="text-sm text-green-700">{generatedContent.matchedSkills.length} skills highlighted</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {generatedContent.matchedSkills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                  {generatedContent.matchedSkills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{generatedContent.matchedSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Key Highlights</div>
                <div className="text-sm text-green-700">{generatedContent.keyHighlights.length} achievements featured</div>
                <div className="text-xs text-green-600 mt-1">Tailored to job requirements</div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Conditional based on generation type */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Preview Buttons */}
            {(formData.generationType === 'cover' || formData.generationType === 'both') && (
              <button
                onClick={() => {
                  setShowPreview(!showPreview || previewType !== 'cover');
                  setPreviewType('cover');
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FileText className="h-5 w-5" />
                <span>{showPreview && previewType === 'cover' ? 'Hide' : 'Preview'} Cover Letter</span>
              </button>
            )}

            {(formData.generationType === 'email' || formData.generationType === 'both') && (
              <button
                onClick={() => {
                  setShowPreview(!showPreview || previewType !== 'email');
                  setPreviewType('email');
                }}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Mail className="h-5 w-5" />
                <span>{showPreview && previewType === 'email' ? 'Hide' : 'Preview'} Cold Email</span>
              </button>
            )}

            {/* Download Buttons - Conditional based on generation type */}
            {(formData.generationType === 'cover' || formData.generationType === 'both') && (
              <button
                onClick={() => handleDownload('cover')}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Download Cover Letter</span>
              </button>
            )}

            {(formData.generationType === 'email' || formData.generationType === 'both') && (
              <button
                onClick={() => handleDownload('email')}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Download Cold Email</span>
              </button>
            )}

            {formData.generationType === 'both' && (
              <button
                onClick={() => handleDownload('both')}
                className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Download Both</span>
              </button>
            )}
          </div>

          {/* Content Preview */}
          {showPreview && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                {previewType === 'cover' ? (
                  <>
                    <FileText className="h-6 w-6 mr-2 text-blue-600" />
                    Cover Letter Preview
                  </>
                ) : (
                  <>
                    <Mail className="h-6 w-6 mr-2 text-purple-600" />
                    Cold Email Preview
                  </>
                )}
              </h3>
              
              <div className="bg-white rounded-lg p-6 border border-gray-300 max-h-96 overflow-y-auto">
                {previewType === 'email' && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-semibold text-gray-900 mb-1">Subject:</div>
                    <div className="text-gray-700">{generatedContent.emailSubject}</div>
                  </div>
                )}
                <pre className="whitespace-pre-wrap text-gray-800 font-sans text-sm leading-relaxed">
                  {previewType === 'cover' ? generatedContent.coverLetter : generatedContent.coldEmail}
                </pre>
              </div>
            </div>
          )}

          {/* Generate New Content */}
          <div className="text-center">
            <button
              onClick={() => {
                setGeneratedContent(null);
                setShowPreview(false);
                setResumeFile(null);
                setFormData({
                  resumeText: '',
                  customPrompt: '',
                  jobDescription: '',
                  candidateName: '',
                  jobTitle: '',
                  companyName: '',
                  generationType: 'both'
                });
              }}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Wand2 className="h-5 w-5" />
              <span>Generate New Content</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;