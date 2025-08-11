import React, { useState } from 'react';
import { Plus, Save, X, Link } from 'lucide-react';
import { Job } from '../types/Job';

interface ManualJobEntryProps {
  onAddJob: (job: Job) => void;
}

const ManualJobEntry: React.FC<ManualJobEntryProps> = ({ onAddJob }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    experience: 'Fresher',
    salary: '',
    description: '',
    skills: '',
    source: 'Manual',
    type: 'Full-time',
    remote: false,
    applyUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newJob: Job = {
      id: Date.now().toString(),
      title: formData.title,
      company: formData.company,
      location: formData.location,
      experience: formData.experience,
      salary: formData.salary,
      description: formData.description,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      postedDate: new Date().toISOString().split('T')[0],
      source: formData.source,
      type: formData.type,
      remote: formData.remote,
      applyUrl: formData.applyUrl || undefined
    };

    onAddJob(newJob);
    
    // Reset form
    setFormData({
      title: '',
      company: '',
      location: '',
      experience: 'Fresher',
      salary: '',
      description: '',
      skills: '',
      source: 'Manual',
      type: 'Full-time',
      remote: false,
      applyUrl: ''
    });

    alert('Job added successfully!');
  };

  const handleReset = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      experience: 'Fresher',
      salary: '',
      description: '',
      skills: '',
      source: 'Manual',
      type: 'Full-time',
      remote: false,
      applyUrl: ''
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-green-100 rounded-xl">
          <Plus className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manual Job Entry</h2>
          <p className="text-gray-600">Add job listings manually with complete details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Frontend Developer"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., TechCorp Solutions"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Bangalore, India"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Fresher">Fresher</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-2 years">1-2 years</option>
              <option value="2-3 years">2-3 years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary Range
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g., ₹3-5 LPA"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Application URL Field */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <Link className="h-4 w-4 text-blue-500" />
            <span>Application URL</span>
          </label>
          <input
            type="url"
            value={formData.applyUrl}
            onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
            placeholder="e.g., https://company.com/careers/apply/job-id"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded-lg">
            💡 Enter the direct link where candidates can apply for this job. If left empty, the Apply button will show a generic message.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="e.g., React, JavaScript, CSS, HTML, Git"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter the complete job description..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            required
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="remote"
            checked={formData.remote}
            onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
            className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="remote" className="text-sm font-medium text-gray-700">
            Remote Work Available
          </label>
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Save className="h-5 w-5" />
            <span className="font-semibold">Save Job</span>
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            <X className="h-5 w-5" />
            <span className="font-semibold">Reset Form</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualJobEntry;