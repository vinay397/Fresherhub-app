import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface JobDescriptionProps {
  jobDescription: string;
  setJobDescription: (description: string) => void;
}

const JobDescription: React.FC<JobDescriptionProps> = ({
  jobDescription,
  setJobDescription,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center">
        <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
        Job Description
      </h3>
      
      <div>
        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
          <FileText className="h-5 w-5 text-purple-500" />
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
  );
};

export default JobDescription;