import React, { useState, useEffect } from 'react';
import { Shield, Plus, Link, FileText, Globe, Loader, CheckCircle, AlertCircle, Database } from 'lucide-react';
import ManualJobEntry from './ManualJobEntry';
import JobScraper from './JobScraper';
import JobList from './JobList';
import CSVUploader from './CSVUploader';
import { Job } from '../types/Job';
import { supabaseService } from '../services/supabaseService';

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'manual' | 'scraper' | 'list' | 'csv'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    
    // Subscribe to real-time job updates
    const subscription = supabaseService.subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsFromDb = await supabaseService.getAllJobs();
      setJobs(jobsFromDb);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error loading jobs. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (job: Omit<Job, 'id'>) => {
    try {
      const success = await supabaseService.addJob(job);
      if (success) {
        alert('✅ Job added successfully and is now live for all users!');
        // Jobs will be updated automatically via subscription
      } else {
        alert('❌ Failed to add job. Please try again.');
      }
    } catch (error) {
      console.error('Error adding job:', error);
      alert('❌ Error adding job. Please check your connection.');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This will remove it for all users.')) {
      return;
    }

    try {
      const success = await supabaseService.deleteJob(jobId);
      if (success) {
        alert('✅ Job deleted successfully!');
        // Jobs will be updated automatically via subscription
      } else {
        alert('❌ Failed to delete job. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('❌ Error deleting job. Please check your connection.');
    }
  };

  const updateJob = async (updatedJob: Job) => {
    try {
      const success = await supabaseService.updateJob(updatedJob);
      if (success) {
        alert('✅ Job updated successfully!');
        // Jobs will be updated automatically via subscription
      } else {
        alert('❌ Failed to update job. Please try again.');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('❌ Error updating job. Please check your connection.');
    }
  };

  const handleJobsAdded = (count: number) => {
    // Jobs will be updated automatically via subscription
    // This is just for user feedback
    console.log(`${count} jobs added successfully`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Global Admin Dashboard
          </h1>
          <p className="text-xl text-red-100 mb-6 max-w-3xl">
            Manage job listings globally with real-time updates. Add jobs manually, scrape from websites, or upload CSV files for bulk import.
          </p>
          <div className="flex items-center space-x-6 text-red-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{jobs.length} Global Jobs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Real-time Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Cloud Database</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('list')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeSection === 'list'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Global Jobs ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('manual')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeSection === 'manual'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Job</span>
          </button>
          <button
            onClick={() => setActiveSection('csv')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeSection === 'csv'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Database className="h-5 w-5" />
            <span className="font-medium">CSV Upload</span>
          </button>
          <button
            onClick={() => setActiveSection('scraper')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeSection === 'scraper'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Link className="h-5 w-5" />
            <span className="font-medium">Web Scraper</span>
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading global job database...</p>
          </div>
        ) : (
          <div className="p-8">
            {activeSection === 'list' && (
              <JobList jobs={jobs} onDelete={deleteJob} onUpdate={updateJob} />
            )}
            {activeSection === 'manual' && (
              <ManualJobEntry onAddJob={addJob} />
            )}
            {activeSection === 'csv' && (
              <CSVUploader onJobsAdded={handleJobsAdded} />
            )}
            {activeSection === 'scraper' && (
              <JobScraper onAddJob={addJob} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;