import React from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Target, Award, Lightbulb } from 'lucide-react';
import { ATSResult } from '../types/ATS';

interface ATSReportProps {
  result: ATSResult;
}

const ATSReport: React.FC<ATSReportProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 85) return 'Excellent! Your resume is highly ATS-compatible';
    if (score >= 70) return 'Good! Your resume has decent ATS compatibility';
    return 'Needs improvement for better ATS compatibility';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
        <div className="text-center">
          <Award className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">ATS Analysis Report</h2>
          <p className="text-blue-100">Comprehensive resume analysis with actionable insights</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Score Section */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(result.score)} mb-6 shadow-2xl`}>
            <span className="text-4xl font-bold text-white">
              {result.score}%
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${getScoreColor(result.score)} mb-2`}>
            {getScoreMessage(result.score)}
          </h3>
          <p className="text-gray-600 text-lg">
            Your resume scored {result.score}% in our ATS compatibility analysis
          </p>
        </div>

        {/* Keywords Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Matched Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-full font-medium border border-green-300"
                >
                  ✓ {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Missing Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-red-100 text-red-800 text-sm rounded-full font-medium border border-red-300"
                >
                  ✗ {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-900">Your Strengths</h3>
            </div>
            <ul className="space-y-3">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-800 font-medium">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-bold text-orange-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {result.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-800 font-medium">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-bold text-purple-900">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4 border border-purple-200">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <span className="text-purple-800 font-medium">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h4 className="text-xl font-bold mb-3 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            Next Steps to Success
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold mb-2">1. Update Resume</div>
              <div className="text-blue-100">Implement the suggested improvements and add missing keywords</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold mb-2">2. Re-analyze</div>
              <div className="text-blue-100">Run another analysis to see your improved score</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold mb-2">3. Apply Confidently</div>
              <div className="text-blue-100">Submit your optimized resume to job applications</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSReport;