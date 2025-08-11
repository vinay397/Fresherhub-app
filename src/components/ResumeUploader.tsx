import React, { useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface ResumeUploaderProps {
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ resumeFile, setResumeFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word')) {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF or Word document');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word')) {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF or Word document');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center">
        <FileText className="h-6 w-6 mr-2 text-blue-600" />
        Upload Your Resume
      </h3>
      
      {!resumeFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-16 w-16 text-blue-400 mx-auto mb-4 group-hover:text-blue-600 transition-colors" />
          <p className="text-gray-700 mb-2 text-lg">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-gray-500 mb-4">PDF or Word documents only (Max 10MB)</p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>✓ PDF</span>
            <span>✓ DOC</span>
            <span>✓ DOCX</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
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
                <span className="text-sm text-green-600 font-medium">Ready for analysis</span>
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
    </div>
  );
};

export default ResumeUploader;