import React, { useState } from 'react';
import { Link, Globe, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Job } from '../types/Job';

interface JobScraperProps {
  onAddJob: (job: Job) => void;
}

const JobScraper: React.FC<JobScraperProps> = ({ onAddJob }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<Partial<Job> | null>(null);
  const [error, setError] = useState('');

  const detectJobSite = (url: string) => {
    if (url.includes('indeed.com')) return 'Indeed';
    if (url.includes('naukri.com')) return 'Naukri';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('glassdoor.com')) return 'Glassdoor';
    return 'Unknown';
  };

  const scrapeJob = async () => {
    if (!url) {
      setError('Please enter a job URL');
      return;
    }

    setLoading(true);
    setError('');
    setScrapedData(null);

    try {
      // Simulate web scraping with realistic data based on URL
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const jobSite = detectJobSite(url);
      
      // Mock scraped data - in real implementation, this would come from actual scraping
      const mockScrapedData: Partial<Job> = {
        title: 'Frontend Developer',
        company: 'TechCorp Solutions',
        location: 'Bangalore, India',
        experience: 'Fresher',
        salary: '₹3-5 LPA',
        description: `We are looking for a passionate Frontend Developer to join our dynamic team. 

Key Responsibilities:
• Develop responsive web applications using React.js
• Collaborate with UI/UX designers to implement pixel-perfect designs
• Write clean, maintainable, and efficient code
• Participate in code reviews and team meetings
• Stay updated with latest frontend technologies

Requirements:
• Bachelor's degree in Computer Science or related field
• Strong knowledge of HTML5, CSS3, and JavaScript
• Experience with React.js and modern JavaScript frameworks
• Understanding of responsive design principles
• Knowledge of version control systems (Git)
• Good problem-solving skills and attention to detail

What We Offer:
• Competitive salary package
• Health insurance and other benefits
• Flexible working hours
• Learning and development opportunities
• Friendly and collaborative work environment`,
        skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Responsive Design'],
        source: jobSite,
        type: 'Full-time',
        remote: Math.random() > 0.5,
        applyUrl: url // Use the scraped URL as the application URL
      };

      setScrapedData(mockScrapedData);
    } catch (err) {
      setError('Failed to scrape job data. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = () => {
    if (!scrapedData) return;

    const newJob: Job = {
      id: Date.now().toString(),
      title: scrapedData.title || '',
      company: scrapedData.company || '',
      location: scrapedData.location || '',
      experience: scrapedData.experience || 'Fresher',
      salary: scrapedData.salary || '',
      description: scrapedData.description || '',
      skills: scrapedData.skills || [],
      postedDate: new Date().toISOString().split('T')[0],
      source: scrapedData.source || 'Scraped',
      type: scrapedData.type || 'Full-time',
      remote: scrapedData.remote || false,
      applyUrl: scrapedData.applyUrl
    };

    onAddJob(newJob);
    setScrapedData(null);
    setUrl('');
    alert('Job scraped and added successfully!');
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-purple-100 rounded-xl">
          <Globe className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Web Scraper</h2>
          <p className="text-gray-600">Automatically extract job details from job portals</p>
        </div>
      </div>

      {/* Supported Sites */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Supported Job Portals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <ExternalLink className="h-4 w-4" />
            <span>Indeed.com</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-700">
            <ExternalLink className="h-4 w-4" />
            <span>Naukri.com</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-700">
            <ExternalLink className="h-4 w-4" />
            <span>LinkedIn.com</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-700">
            <ExternalLink className="h-4 w-4" />
            <span>Glassdoor.com</span>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Job URL
          </label>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.indeed.com/viewjob?jk=..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <button
              onClick={scrapeJob}
              disabled={loading || !url}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Scraping...</span>
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5" />
                  <span>Scrape Job</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Scraped Data Preview */}
        {scrapedData && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-900 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Job Data Scraped Successfully
              </h3>
              <button
                onClick={handleSaveJob}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Save Job
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Job Title</h4>
                <p className="text-gray-700 bg-white p-3 rounded-lg">{scrapedData.title}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Company</h4>
                <p className="text-gray-700 bg-white p-3 rounded-lg">{scrapedData.company}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                <p className="text-gray-700 bg-white p-3 rounded-lg">{scrapedData.location}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                <p className="text-gray-700 bg-white p-3 rounded-lg">{scrapedData.experience}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Salary</h4>
                <p className="text-gray-700 bg-white p-3 rounded-lg">{scrapedData.salary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Source</h4>
                <p className="text-gray-700 bg-white p-3 rounded-lg">{scrapedData.source}</p>
              </div>
            </div>

            {/* Application URL Display */}
            {scrapedData.applyUrl && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Application URL</h4>
                <div className="bg-white p-3 rounded-lg">
                  <a 
                    href={scrapedData.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {scrapedData.applyUrl}
                  </a>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {scrapedData.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <div className="bg-white p-4 rounded-lg max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-700 text-sm">{scrapedData.description}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">How to Use:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Go to Indeed, Naukri, LinkedIn, or Glassdoor</li>
            <li>Search for entry-level or fresher positions</li>
            <li>Copy the URL of a specific job posting</li>
            <li>Paste the URL above and click "Scrape Job"</li>
            <li>Review the extracted data and click "Save Job"</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The scraped URL will automatically be used as the application link, so candidates can apply directly to the original job posting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobScraper;