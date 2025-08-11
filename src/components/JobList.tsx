import React, { useState } from 'react';
import { FileText, Edit, Trash2, Eye, MapPin, Clock, DollarSign, Building } from 'lucide-react';
import { Job } from '../types/Job';

interface JobListProps {
  jobs: Job[];
  onDelete: (jobId: string) => void;
  onUpdate: (job: Job) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, onDelete, onUpdate }) => {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const handleEdit = (job: Job) => {
    setEditingJob({ ...job });
  };

  const handleSaveEdit = () => {
    if (editingJob) {
      onUpdate(editingJob);
      setEditingJob(null);
      alert('Job updated successfully!');
    }
  };

  const handleDelete = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      onDelete(jobId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Listed</h3>
        <p className="text-gray-500">Start by adding jobs manually or using the web scraper.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
            <p className="text-gray-600">{jobs.length} jobs currently listed</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewingJob(job)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(job)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Edit Job"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">{job.experience}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">{job.salary}</span>
              </div>
              <div className="text-sm text-gray-500">
                Posted: {formatDate(job.postedDate)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>

            <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={editingJob.company}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                  <input
                    type="text"
                    value={editingJob.salary}
                    onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editingJob.skills.join(', ')}
                  onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingJob(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{viewingJob.title}</h3>
                <p className="text-xl text-gray-600">{viewingJob.company}</p>
              </div>
              <button
                onClick={() => setViewingJob(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                <MapPin className="h-5 w-5 mr-3 text-red-500" />
                <span>{viewingJob.location}</span>
              </div>
              <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                <Clock className="h-5 w-5 mr-3 text-blue-500" />
                <span>{viewingJob.experience}</span>
              </div>
              <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                <DollarSign className="h-5 w-5 mr-3 text-green-500" />
                <span>{viewingJob.salary}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {viewingJob.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-700">{viewingJob.description}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;