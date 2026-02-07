// Submission types for the student form system

export type SubmissionStatus = 'pending' | 'in_review' | 'processing' | 'completed';

export interface StudentSubmission {
  id: string;
  reference_code: string;
  status: SubmissionStatus;
  
  // Personal Info
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  nationality?: string;
  
  // Education
  university: string;
  degree: string;
  graduation_year?: string;
  gpa?: string;
  coursework: string[];
  
  // Experience
  experience: ExperienceItem[];
  
  // FYP
  fyp_title?: string;
  fyp_supervisor?: string;
  fyp_objectives?: string;
  fyp_methods?: string;
  fyp_tools?: string;
  fyp_outcomes?: string;
  
  // Skills
  technical_skills: string[];
  soft_skills: string[];
  languages: LanguageItem[];
  
  // Certifications
  certifications: CertificationItem[];
  
  // Target Roles
  selected_roles: string[];
  job_description?: string;
  
  // Generated Outputs
  generated_outputs?: object;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  department: string;
  type: 'internship' | 'rotation' | 'part-time';
  start_date: string;
  end_date: string;
  responsibilities: string;
  achievements: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  provider: string;
  year: string;
}

export interface LanguageItem {
  language: string;
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pending Review',
  in_review: 'Under Review',
  processing: 'Generating Pack',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_review: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};
