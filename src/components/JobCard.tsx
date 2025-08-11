import React from 'react';
import { MapPin, Clock, DollarSign, Building, ExternalLink, Tag, Wifi, AlertCircle, Eye } from 'lucide-react';
import { Job } from '../types/Job';

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleApplyClick = () => {
    if (job.applyUrl) {
      // Open the application URL in a new tab
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Show a message if no application URL is provided
      alert('Application link not available. Please contact the company directly or visit their careers page.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            {job.remote && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Wifi className="h-3 w-3" />
                <span>Remote</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-gray-600 mb-2">
            <Building className="h-5 w-5 mr-2 text-blue-500" />
            <span className="font-semibold text-lg">{job.company}</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
            {job.type}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
          <MapPin className="h-5 w-5 mr-3 text-red-500" />
          <span className="font-medium">{job.location}</span>
        </div>
        <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
          <Clock className="h-5 w-5 mr-3 text-blue-500" />
          <span className="font-medium">{job.experience}</span>
        </div>
        <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
          <DollarSign className="h-5 w-5 mr-3 text-green-500" />
          <span className="font-medium">{job.salary}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills.map((skill, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 text-sm rounded-full flex items-center border border-blue-100 hover:border-blue-300 transition-colors"
          >
            <Tag className="h-3 w-3 mr-2 text-blue-500" />
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 font-medium">{formatDate(job.postedDate)}</span>
        <div className="flex items-center space-x-3">
          {/* Application URL Status Indicator */}
          {!job.applyUrl && (
            <div className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <AlertCircle className="h-3 w-3" />
              <span>Contact directly</span>
            </div>
          )}
          
          <button 
            onClick={() => onViewDetails(job)}
            className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-300 font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>Learn More</span>
          </button>
          
          <button 
            onClick={handleApplyClick}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              job.applyUrl 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
            }`}
          >
            <span className="font-semibold">
              {job.applyUrl ? 'Apply Now' : 'Contact Company'}
            </span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;