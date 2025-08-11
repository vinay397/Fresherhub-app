export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  description: string;
  skills: string[];
  postedDate: string;
  source: string;
  type: string;
  remote: boolean;
  applyUrl?: string;
  // Extended fields for detailed view
  fullDescription?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  companySize?: string;
  industry?: string;
  workingHours?: string;
  applicationDeadline?: string;
  contactEmail?: string;
  companyWebsite?: string;
  jobLevel?: string;
  department?: string;
}