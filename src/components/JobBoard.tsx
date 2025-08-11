import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import SearchBar from './SearchBar';
import JobDetailModal from './JobDetailModal';
import { Job } from '../types/Job';
import { Briefcase, TrendingUp } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

interface JobBoardProps {
  searchParams?: { query?: string; location?: string };
}

const JobBoard: React.FC<JobBoardProps> = ({ searchParams }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.query || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams?.location || '');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Set initial search parameters from homepage
  useEffect(() => {
    if (searchParams?.query) {
      setSearchQuery(searchParams.query);
    }
    if (searchParams?.location) {
      setSelectedLocation(searchParams.location);
    }
  }, [searchParams]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedLocation, selectedExperience]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Get jobs from Supabase (centralized storage)
      const supabaseJobs = await supabaseService.getAllJobs();
      
      // Add some demo jobs if no jobs exist in database
      const demoJobs = supabaseJobs.length === 0 ? getDemoJobs() : [];
      
      setJobs([...supabaseJobs, ...demoJobs]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs(getDemoJobs());
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedExperience) {
      filtered = filtered.filter(job =>
        job.experience.toLowerCase() === selectedExperience.toLowerCase()
      );
    }

    setFilteredJobs(filtered);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const getDemoJobs = (): Job[] => [
    {
      id: 'demo-1',
      title: 'Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'Bangalore, India',
      experience: 'Fresher',
      salary: '₹3-5 LPA',
      description: 'Join our dynamic team as a Frontend Developer! We are looking for passionate individuals who love creating beautiful, responsive web applications.',
      fullDescription: `We are seeking a talented and motivated Frontend Developer to join our growing development team. As a Frontend Developer at TechCorp Solutions, you will be responsible for creating engaging and user-friendly web applications using modern technologies.

You will work closely with our design and backend teams to implement pixel-perfect designs and ensure seamless user experiences across all devices. This is an excellent opportunity for a fresher to grow their career in a supportive and innovative environment.`,
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Tailwind CSS'],
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        'Strong understanding of HTML5, CSS3, and JavaScript',
        'Experience with React.js and modern JavaScript frameworks',
        'Knowledge of responsive design principles',
        'Familiarity with version control systems (Git)',
        'Good problem-solving skills and attention to detail'
      ],
      responsibilities: [
        'Develop responsive web applications using React.js',
        'Collaborate with UI/UX designers to implement designs',
        'Write clean, maintainable, and efficient code',
        'Participate in code reviews and team meetings',
        'Debug and troubleshoot application issues',
        'Stay updated with latest frontend technologies'
      ],
      benefits: [
        'Competitive salary package',
        'Health insurance coverage',
        'Flexible working hours',
        'Learning and development opportunities',
        'Modern office environment',
        'Team outings and events'
      ],
      postedDate: '2024-01-15',
      source: 'LinkedIn',
      type: 'Full-time',
      remote: false,
      applyUrl: 'https://techcorp.com/careers/frontend-developer',
      companySize: '50-200 employees',
      industry: 'Technology',
      workingHours: '9 AM - 6 PM',
      applicationDeadline: '2024-02-15',
      contactEmail: 'careers@techcorp.com',
      companyWebsite: 'https://techcorp.com',
      jobLevel: 'Entry Level',
      department: 'Engineering'
    },
    {
      id: 'demo-2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Hyderabad, India',
      experience: '0-1 years',
      salary: '₹4-6 LPA',
      description: 'Exciting opportunity to join our growing startup as a Full Stack Developer. Work with modern technologies and build scalable applications.',
      fullDescription: `Join our dynamic startup as a Full Stack Developer and be part of building the next generation of web applications. We're looking for passionate developers who want to work with cutting-edge technologies and make a real impact.

As a Full Stack Developer, you'll work on both frontend and backend development, contributing to our product's growth and success. This role offers excellent learning opportunities and the chance to work directly with founders and senior developers.`,
      skills: ['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript', 'AWS'],
      requirements: [
        'Bachelor\'s degree in Computer Science or equivalent experience',
        'Proficiency in JavaScript and modern web technologies',
        'Experience with React.js and Node.js',
        'Understanding of database concepts (MongoDB preferred)',
        'Knowledge of RESTful API development',
        'Familiarity with cloud platforms (AWS preferred)'
      ],
      responsibilities: [
        'Develop and maintain web applications using MERN stack',
        'Design and implement RESTful APIs',
        'Work with databases and optimize queries',
        'Collaborate with cross-functional teams',
        'Participate in product planning and feature development',
        'Ensure application security and performance'
      ],
      benefits: [
        'Competitive salary with equity options',
        'Remote work flexibility',
        'Health and wellness benefits',
        'Professional development budget',
        'Startup environment with growth opportunities',
        'Direct mentorship from senior developers'
      ],
      postedDate: '2024-01-14',
      source: 'Indeed',
      type: 'Full-time',
      remote: true,
      applyUrl: 'https://startupxyz.com/jobs/fullstack-developer',
      companySize: '10-50 employees',
      industry: 'Technology Startup',
      workingHours: 'Flexible',
      applicationDeadline: '2024-02-14',
      contactEmail: 'hiring@startupxyz.com',
      companyWebsite: 'https://startupxyz.com',
      jobLevel: 'Entry to Mid Level',
      department: 'Product Development'
    },
    {
      id: 'demo-3',
      title: 'Software Engineer',
      company: 'MegaTech Solutions',
      location: 'Pune, India',
      experience: 'Fresher',
      salary: '₹3.5-5.5 LPA',
      description: 'Entry-level Software Engineer position with excellent growth opportunities. Work alongside experienced mentors and contribute to large-scale projects.',
      fullDescription: `We are looking for a motivated Software Engineer to join our development team. This is an excellent opportunity for fresh graduates to start their career in software development with a well-established company.

You will work on enterprise-level applications, learn industry best practices, and receive mentorship from senior engineers. Our comprehensive training program will help you develop both technical and professional skills.`,
      skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Git', 'Docker'],
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        'Strong programming fundamentals in Java',
        'Understanding of object-oriented programming concepts',
        'Basic knowledge of databases and SQL',
        'Familiarity with web development concepts',
        'Good analytical and problem-solving skills'
      ],
      responsibilities: [
        'Develop and maintain Java-based applications',
        'Write unit tests and participate in code reviews',
        'Collaborate with senior developers on project requirements',
        'Debug and resolve software defects',
        'Participate in agile development processes',
        'Learn and apply new technologies as needed'
      ],
      benefits: [
        'Comprehensive health insurance',
        'Provident fund and gratuity',
        'Annual performance bonuses',
        'Training and certification programs',
        'Career advancement opportunities',
        'Employee recreation facilities'
      ],
      postedDate: '2024-01-13',
      source: 'Naukri',
      type: 'Full-time',
      remote: false,
      applyUrl: 'https://megatech.com/careers/software-engineer-fresher',
      companySize: '500+ employees',
      industry: 'Software Development',
      workingHours: '9:30 AM - 6:30 PM',
      applicationDeadline: '2024-02-13',
      contactEmail: 'recruitment@megatech.com',
      companyWebsite: 'https://megatech.com',
      jobLevel: 'Entry Level',
      department: 'Software Development'
    },
    {
      id: 'demo-4',
      title: 'Data Analyst',
      company: 'DataCorp Analytics',
      location: 'Hyderabad, India',
      experience: 'Fresher',
      salary: '₹3-4.5 LPA',
      description: 'Join our data analytics team as a fresher Data Analyst. Learn to work with large datasets and create insightful reports.',
      fullDescription: `We are seeking a motivated Data Analyst to join our analytics team. This role is perfect for fresh graduates who are passionate about data and want to start their career in data analytics.

You will work with large datasets, create meaningful visualizations, and help stakeholders make data-driven decisions. Our team provides excellent mentorship and training opportunities to help you grow in the field of data analytics.`,
      skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics', 'Data Visualization'],
      requirements: [
        'Bachelor\'s degree in Statistics, Mathematics, or related field',
        'Strong analytical and problem-solving skills',
        'Proficiency in SQL and Excel',
        'Basic knowledge of Python or R',
        'Understanding of statistical concepts',
        'Good communication and presentation skills'
      ],
      responsibilities: [
        'Analyze large datasets to identify trends and patterns',
        'Create reports and dashboards using Tableau',
        'Perform statistical analysis and data modeling',
        'Collaborate with business teams to understand requirements',
        'Present findings to stakeholders',
        'Maintain data quality and integrity'
      ],
      benefits: [
        'Competitive salary package',
        'Health and life insurance',
        'Professional development opportunities',
        'Access to latest analytics tools',
        'Flexible work arrangements',
        'Performance-based incentives'
      ],
      postedDate: '2024-01-12',
      source: 'LinkedIn',
      type: 'Full-time',
      remote: false,
      applyUrl: 'https://datacorp.com/careers/data-analyst',
      companySize: '200-500 employees',
      industry: 'Data Analytics',
      workingHours: '9 AM - 6 PM',
      applicationDeadline: '2024-02-12',
      contactEmail: 'careers@datacorp.com',
      companyWebsite: 'https://datacorp.com',
      jobLevel: 'Entry Level',
      department: 'Analytics'
    },
    {
      id: 'demo-5',
      title: 'UI/UX Designer',
      company: 'DesignStudio Pro',
      location: 'Mumbai, India',
      experience: '0-1 years',
      salary: '₹2.5-4 LPA',
      description: 'Creative UI/UX Designer position for freshers passionate about creating beautiful and intuitive user experiences.',
      fullDescription: `We are looking for a creative and passionate UI/UX Designer to join our design team. This is an excellent opportunity for fresh graduates or junior designers to work on exciting projects and learn from experienced designers.

You will be involved in the entire design process, from user research to final implementation. Our collaborative environment encourages creativity and innovation while providing mentorship to help you grow as a designer.`,
      skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'User Research', 'Prototyping'],
      requirements: [
        'Bachelor\'s degree in Design, HCI, or related field',
        'Portfolio showcasing UI/UX design projects',
        'Proficiency in design tools (Figma, Adobe XD)',
        'Understanding of user-centered design principles',
        'Basic knowledge of HTML/CSS is a plus',
        'Strong communication and collaboration skills'
      ],
      responsibilities: [
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Collaborate with developers and product managers',
        'Maintain design systems and style guides',
        'Present design concepts to stakeholders',
        'Stay updated with design trends and best practices'
      ],
      benefits: [
        'Creative and inspiring work environment',
        'Access to latest design tools and software',
        'Mentorship from senior designers',
        'Flexible working hours',
        'Health insurance coverage',
        'Professional development opportunities'
      ],
      postedDate: '2024-01-11',
      source: 'Behance',
      type: 'Full-time',
      remote: true,
      applyUrl: 'https://designstudio.com/careers/ui-ux-designer',
      companySize: '20-50 employees',
      industry: 'Design Agency',
      workingHours: 'Flexible',
      applicationDeadline: '2024-02-11',
      contactEmail: 'careers@designstudio.com',
      companyWebsite: 'https://designstudio.com',
      jobLevel: 'Entry Level',
      department: 'Design'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="h-8 w-8" />
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl">
            Discover thousands of fresher opportunities from top companies. Start your career journey with the perfect role.
          </p>
          <div className="flex items-center space-x-6 text-blue-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{jobs.length}+ Active Jobs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Updated in Real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <JobFilters
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
          />
        </aside>

        <main className="lg:w-3/4">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading amazing opportunities...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredJobs.length} Jobs Found
                  {(searchQuery || selectedLocation) && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      {searchQuery && `for "${searchQuery}"`}
                      {searchQuery && selectedLocation && ' '}
                      {selectedLocation && `in ${selectedLocation}`}
                    </span>
                  )}
                </h2>
                <div className="text-sm text-gray-500">
                  Real-time updates from global database
                </div>
              </div>
              
              <div className="grid gap-6">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />
                ))}
              </div>
              
              {filteredJobs.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || selectedLocation 
                      ? `No jobs found ${searchQuery ? `for "${searchQuery}"` : ''} ${selectedLocation ? `in ${selectedLocation}` : ''}. Try adjusting your search criteria.`
                      : 'Try adjusting your search criteria or filters.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLocation('');
                      setSelectedExperience('');
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default JobBoard;