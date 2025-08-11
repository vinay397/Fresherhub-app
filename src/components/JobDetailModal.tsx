import React, { useEffect } from 'react';
import { X, MapPin, Clock, DollarSign, Building, ExternalLink, Briefcase, Users, Wifi, CheckCircle, Star } from 'lucide-react';
import { Job } from '../types/Job';

interface JobDetailModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleApplyClick = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50 z-[9999]">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
        </div>
        
        {job.applyUrl && (
          <button
            onClick={handleApplyClick}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Apply
          </button>
        )}
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Job Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex items-center gap-3 text-xl text-gray-700 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-semibold">{job.company}</span>
                  {job.remote && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <Wifi className="h-4 w-4 mr-1" />
                      Remote
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 font-medium">{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-semibold">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">{job.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Posted {formatDate(job.postedDate)}
                  </span>
                  {job.applicationDeadline && (
                    <span className="flex items-center gap-2 text-red-600 font-medium">
                      <Clock className="h-4 w-4" />
                      Apply by {formatDate(job.applicationDeadline)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Company Info Cards */}
            {(job.companySize || job.industry || job.workingHours) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {job.companySize && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Company Size</span>
                    </div>
                    <p className="text-gray-700 font-medium">{job.companySize}</p>
                  </div>
                )}
                {job.industry && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Industry</span>
                    </div>
                    <p className="text-gray-700 font-medium">{job.industry}</p>
                  </div>
                )}
                {job.workingHours && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Working Hours</span>
                    </div>
                    <p className="text-gray-700 font-medium">{job.workingHours}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Job Description */}
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-8 bg-blue-600 rounded-full mr-4"></div>
                  About the job
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {job.fullDescription || job.description}
                  </p>
                </div>
              </section>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-8 bg-red-500 rounded-full mr-4"></div>
                    Requirements
                  </h2>
                  <ul className="space-y-4">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <CheckCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
                    Responsibilities
                  </h2>
                  <ul className="space-y-4">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Skills */}
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-8 bg-purple-500 rounded-full mr-4"></div>
                  Skills & Technologies
                </h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-semibold border border-purple-300 hover:from-purple-200 hover:to-purple-300 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-8 bg-green-500 rounded-full mr-4"></div>
                    Benefits & Perks
                  </h2>
                  <ul className="space-y-4">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
              
              {/* Apply Card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-xl font-bold mb-3">Ready to apply?</h3>
                <p className="text-blue-100 mb-6">
                  Take the next step in your career journey
                </p>
                {job.applyUrl ? (
                  <button
                    onClick={handleApplyClick}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <span>Apply now</span>
                    <ExternalLink className="h-5 w-5" />
                  </button>
                ) : (
                  <p className="text-blue-200 text-center">Contact company directly</p>
                )}
              </div>

              {/* Job Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-gray-600 rounded-full mr-3"></div>
                  Job details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Posted</span>
                    <span className="text-gray-900 font-semibold">{formatDate(job.postedDate)}</span>
                  </div>
                  {job.jobLevel && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Level</span>
                      <span className="text-gray-900 font-semibold">{job.jobLevel}</span>
                    </div>
                  )}
                  {job.department && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Department</span>
                      <span className="text-gray-900 font-semibold">{job.department}</span>
                    </div>
                  )}
                  {job.workingHours && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Hours</span>
                      <span className="text-gray-900 font-semibold">{job.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              {(job.companyWebsite || job.contactEmail) && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                    Contact
                  </h3>
                  <div className="space-y-3">
                    {job.companyWebsite && (
                      <a 
                        href={job.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 group"
                      >
                        <span className="font-medium">Company website</span>
                        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {job.contactEmail && (
                      <a 
                        href={`mailto:${job.contactEmail}`}
                        className="block p-3 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-all duration-200 font-medium"
                      >
                        {job.contactEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;