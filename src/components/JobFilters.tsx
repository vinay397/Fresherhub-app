import React from 'react';
import { Filter, MapPin, Clock } from 'lucide-react';

interface JobFiltersProps {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedExperience: string;
  setSelectedExperience: (experience: string) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  selectedLocation,
  setSelectedLocation,
  selectedExperience,
  setSelectedExperience,
}) => {
  const locations = ['', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi', 'Gurgaon', 'Noida'];
  const experiences = ['', 'Fresher', '0-1 years', '1-2 years'];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Filter className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
            <MapPin className="h-4 w-4 text-red-500" />
            <span>Location</span>
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location || 'All Locations'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Experience Level</span>
          </label>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
          >
            {experiences.map((experience) => (
              <option key={experience} value={experience}>
                {experience || 'All Experience Levels'}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSelectedLocation('');
            setSelectedExperience('');
          }}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
        >
          Clear All Filters
        </button>
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-gray-600">
          Use specific keywords in your search to find the most relevant opportunities for your skills.
        </p>
      </div>
    </div>
  );
};

export default JobFilters;