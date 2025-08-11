import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, X, Database, Loader } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Job } from '../types/Job';

interface CSVUploaderProps {
  onJobsAdded: (count: number) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onJobsAdded }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setUploadResult(null);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setUploadResult(null);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setCsvFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseCSV = (csvText: string): Partial<Job>[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Handle CSV with proper parsing (including quoted fields)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
    const jobs: Partial<Job>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
      
      if (values.length < 3) continue; // Skip rows with too few columns

      const job: Partial<Job> = {
        title: '',
        company: '',
        location: '',
        experience: 'Fresher',
        salary: '',
        description: '',
        skills: [],
        postedDate: new Date().toISOString().split('T')[0],
        source: 'CSV Import',
        type: 'Full-time',
        remote: false
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'title':
          case 'job_title':
          case 'position':
          case 'job title':
            job.title = value;
            break;
          case 'company':
          case 'company_name':
          case 'employer':
          case 'company name':
            job.company = value;
            break;
          case 'location':
          case 'city':
          case 'place':
          case 'job_location':
            job.location = value;
            break;
          case 'experience':
          case 'experience_level':
          case 'exp':
          case 'experience level':
            job.experience = value || 'Fresher';
            break;
          case 'salary':
          case 'package':
          case 'compensation':
          case 'salary_range':
            job.salary = value;
            break;
          case 'description':
          case 'job_description':
          case 'details':
          case 'job description':
            job.description = value;
            break;
          case 'skills':
          case 'technologies':
          case 'tech_stack':
          case 'required_skills':
            if (value) {
              // Handle different separators
              const skillSeparators = [';', '|', ','];
              let skillArray = [value];
              
              for (const separator of skillSeparators) {
                if (value.includes(separator)) {
                  skillArray = value.split(separator);
                  break;
                }
              }
              
              job.skills = skillArray.map(s => s.trim()).filter(s => s);
            }
            break;
          case 'type':
          case 'job_type':
          case 'employment_type':
          case 'job type':
            job.type = value || 'Full-time';
            break;
          case 'remote':
          case 'work_from_home':
          case 'wfh':
          case 'is_remote':
            job.remote = value.toLowerCase() === 'true' || 
                        value.toLowerCase() === 'yes' || 
                        value === '1' ||
                        value.toLowerCase() === 'remote';
            break;
          case 'apply_url':
          case 'application_url':
          case 'url':
          case 'link':
          case 'apply url':
            job.applyUrl = value;
            break;
        }
      });

      // Validate required fields and clean up data
      if (job.title && job.company && job.location) {
        // Ensure description exists
        if (!job.description) {
          job.description = `Join ${job.company} as a ${job.title} in ${job.location}. This is an exciting opportunity to grow your career.`;
        }
        
        // Clean up and validate data
        job.title = job.title.trim();
        job.company = job.company.trim();
        job.location = job.location.trim();
        job.description = job.description.trim();
        
        jobs.push(job);
      }
    }

    return jobs;
  };

  const handleUpload = async () => {
    if (!csvFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      console.log('📄 Reading CSV file...');
      const csvText = await csvFile.text();
      
      console.log('🔍 Parsing CSV data...');
      const jobs = parseCSV(csvText);

      if (jobs.length === 0) {
        alert('❌ No valid jobs found in CSV. Please check the format and ensure you have the required columns: title, company, location.');
        setUploading(false);
        return;
      }

      console.log(`📊 Found ${jobs.length} jobs to upload`);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Upload jobs one by one with progress
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        
        try {
          console.log(`⬆️ Uploading job ${i + 1}/${jobs.length}: ${job.title} at ${job.company}`);
          
          const success = await supabaseService.addJob(job as Omit<Job, 'id'>);
          
          if (success) {
            successCount++;
            console.log(`✅ Successfully uploaded: ${job.title}`);
          } else {
            failedCount++;
            const errorMsg = `Failed to upload: ${job.title} at ${job.company}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        } catch (error) {
          failedCount++;
          const errorMsg = `Error uploading: ${job.title} at ${job.company} - ${error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`, error);
        }

        // Small delay to avoid overwhelming the database
        if (i < jobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`🎉 Upload complete! Success: ${successCount}, Failed: ${failedCount}`);

      setUploadResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show only first 10 errors
      });

      if (successCount > 0) {
        onJobsAdded(successCount);
        alert(`🎉 Successfully uploaded ${successCount} jobs! They are now live for all users.`);
      }

      if (failedCount > 0) {
        alert(`⚠️ ${failedCount} jobs failed to upload. Please check the errors below and fix the data.`);
      }

    } catch (error) {
      console.error('❌ Error processing CSV:', error);
      alert('❌ Error processing CSV file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,company,location,experience,salary,description,skills,type,remote,apply_url
"Frontend Developer","TechCorp Solutions","Bangalore, India","Fresher","₹3-5 LPA","We are looking for a passionate Frontend Developer to join our dynamic team. You will work with cutting-edge technologies and collaborate with experienced developers.","React;JavaScript;HTML;CSS;Git","Full-time","false","https://techcorp.com/careers"
"Backend Developer","StartupXYZ","Mumbai, India","0-1 years","₹4-6 LPA","Join our backend team to build scalable applications using modern technologies. Great opportunity for growth and learning.","Node.js;Python;MongoDB;API;Express","Full-time","true","https://startupxyz.com/jobs"
"Data Scientist","DataCorp","Hyderabad, India","1-2 years","₹6-8 LPA","Analyze data and build ML models for business insights. Work with large datasets and cutting-edge AI technologies.","Python;Machine Learning;SQL;Pandas;TensorFlow","Full-time","false","https://datacorp.com/apply"
"Full Stack Developer","InnovateTech","Pune, India","Fresher","₹3.5-5.5 LPA","Build end-to-end web applications using modern frameworks. Perfect opportunity for freshers to start their tech career.","React;Node.js;JavaScript;MongoDB;Git","Full-time","true","https://innovatetech.com/careers"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fresherhub_job_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('📥 Template downloaded! Fill in your job data and upload the CSV file.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Database className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bulk CSV Upload</h3>
            <p className="text-gray-600">Upload multiple jobs at once to the global database</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Download className="h-4 w-4" />
          <span>Download Template</span>
        </button>
      </div>

      {/* CSV Format Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          CSV Format Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <div className="font-medium mb-2">✅ Required Columns:</div>
            <ul className="space-y-1">
              <li>• <strong>title</strong> - Job Title</li>
              <li>• <strong>company</strong> - Company Name</li>
              <li>• <strong>location</strong> - Job Location</li>
            </ul>
            <div className="text-xs text-blue-600 mt-2">
              💡 Description will be auto-generated if missing
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">⚙️ Optional Columns:</div>
            <ul className="space-y-1">
              <li>• <strong>experience</strong> - Experience Level</li>
              <li>• <strong>salary</strong> - Salary Range</li>
              <li>• <strong>description</strong> - Job Description</li>
              <li>• <strong>skills</strong> - Skills (semicolon separated)</li>
              <li>• <strong>type</strong> - Job Type (Full-time, Part-time, etc.)</li>
              <li>• <strong>remote</strong> - true/false for remote work</li>
              <li>• <strong>apply_url</strong> - Application URL</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
          <div className="text-sm text-blue-900">
            <strong>📋 Tips for Best Results:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Use the downloaded template for proper formatting</li>
              <li>• Separate skills with semicolons (;) like: "React;JavaScript;CSS"</li>
              <li>• Use quotes around text that contains commas</li>
              <li>• Keep descriptions detailed but concise</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      {!csvFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-3 border-dashed border-orange-300 rounded-2xl p-12 text-center hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-16 w-16 text-orange-400 mx-auto mb-4 group-hover:text-orange-600 transition-colors" />
          <p className="text-gray-700 mb-2 text-lg">
            <span className="font-semibold text-orange-600">Click to upload CSV</span> or drag and drop
          </p>
          <p className="text-sm text-gray-500 mb-4">CSV files only (Max 5MB)</p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>✓ Bulk Import</span>
            <span>✓ Global Database</span>
            <span>✓ Real-time Updates</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border-2 border-green-300 bg-green-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{csvFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(csvFile.size / 1024).toFixed(2)} KB • Ready for upload
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">File validated</span>
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

          <div className="flex space-x-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {uploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Uploading to Database...</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  <span>Upload to Global Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Upload Results
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-600">{uploadResult.success}</div>
              <div className="text-sm text-green-700 font-medium">Jobs Successfully Added</div>
              <div className="text-xs text-green-600 mt-1">Now live for all users globally</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-3xl font-bold text-red-600">{uploadResult.failed}</div>
              <div className="text-sm text-red-700 font-medium">Jobs Failed to Upload</div>
              <div className="text-xs text-red-600 mt-1">Check errors below</div>
            </div>
          </div>

          {uploadResult.errors.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="font-medium text-yellow-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Upload Errors ({uploadResult.errors.length} shown):
              </div>
              <ul className="text-sm text-yellow-800 space-y-1 max-h-32 overflow-y-auto">
                {uploadResult.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
                {uploadResult.errors.length === 10 && uploadResult.failed > 10 && (
                  <li className="flex items-start space-x-2 font-medium">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>... and {uploadResult.failed - 10} more errors</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {uploadResult.success > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
              <div className="text-blue-900 font-medium flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                🎉 {uploadResult.success} jobs have been successfully added to the global database!
              </div>
              <div className="text-sm text-blue-700 mt-1">
                These jobs are now live and visible to all users visiting your website from any device or location.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Need Help?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <div className="font-medium mb-2">Common Issues:</div>
            <ul className="space-y-1">
              <li>• Make sure CSV has proper headers</li>
              <li>• Check for missing required fields</li>
              <li>• Use quotes for text with commas</li>
              <li>• Verify file is saved as CSV format</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Best Practices:</div>
            <ul className="space-y-1">
              <li>• Download and use the provided template</li>
              <li>• Test with a small batch first</li>
              <li>• Keep job descriptions detailed</li>
              <li>• Include application URLs when possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;