// Student Profile Types for Career Launch Pack Generator

export type RoleType = 'hospital' | 'industry' | 'community';

export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  linkedinUrl?: string;
}

export interface Education {
  degree: 'PharmD' | 'BPharm' | 'MPharm' | 'Other';
  university: string;
  graduationDate: string;
  gpa?: string;
  coursework: string[];
  customCoursework?: string;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  department: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  achievements: string;
  type: 'internship' | 'rotation' | 'part-time';
}

export interface FYPResearch {
  title: string;
  objectives: string;
  methods: string;
  tools: string[];
  outcomes?: string;
}

export interface Skills {
  hardSkills: string[];
  customHardSkills?: string;
  softSkills: string[];
  customSoftSkills?: string;
  tools: string[];
  customTools?: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  year: string;
}

export interface Activity {
  id: string;
  description: string;
  type: 'volunteering' | 'society' | 'presentation' | 'leadership' | 'other';
}

export interface RolePreference {
  role: RoleType;
  interestArea: string;
  strengths: string;
  locationPreference?: string;
}

export interface StudentProfile {
  personal: PersonalInfo;
  education: Education;
  experience: ExperienceEntry[];
  fyp: FYPResearch;
  skills: Skills;
  certifications: Certification[];
  activities: Activity[];
  selectedRoles: RoleType[];
  rolePreferences: RolePreference[];
  jobDescription?: string;
}

export interface GeneratedOutputs {
  cv: string;
  linkedin: {
    headline: string;
    about: string;
    experienceBullets: string[];
    skills: string[];
    networkingMessage?: string;
    openToWork?: string;
  };
  coverLetters: {
    role: RoleType;
    content: string;
  }[];
  interviewPrep: {
    role: RoleType;
    behavioral: { question: string; answer: string }[];
    technical: { question: string; answer: string }[];
    tellMeAboutYourself: { short: string; long: string };
    questionsToAsk: string[];
  }[];
}

export interface EditedOutputs {
  cv?: string;
  linkedin?: Partial<GeneratedOutputs['linkedin']>;
  coverLetters?: { role: RoleType; content: string }[];
  interviewPrep?: GeneratedOutputs['interviewPrep'];
}

export interface SavedCase {
  version: string;
  savedAt: string;
  profile: StudentProfile;
  generatedOutputs: GeneratedOutputs | null;
  editedOutputs: EditedOutputs;
}

// Default empty profile
export const createEmptyProfile = (): StudentProfile => ({
  personal: {
    fullName: '',
    phone: '',
    email: '',
    city: '',
    country: '',
  },
  education: {
    degree: 'PharmD',
    university: '',
    graduationDate: '',
    coursework: [],
  },
  experience: [],
  fyp: {
    title: '',
    objectives: '',
    methods: '',
    tools: [],
  },
  skills: {
    hardSkills: [],
    softSkills: [],
    tools: [],
  },
  certifications: [],
  activities: [],
  selectedRoles: [],
  rolePreferences: [],
});

// Predefined options
export const COURSEWORK_OPTIONS = [
  'Clinical Pharmacy',
  'Pharmacology',
  'Pharmaceutical Chemistry',
  'Pharmacokinetics',
  'Drug Formulation',
  'Hospital Pharmacy Practice',
  'Community Pharmacy Practice',
  'Pharmaceutical Analysis',
  'Quality Assurance',
  'Regulatory Affairs',
  'Pharmacoeconomics',
  'Drug Information',
  'Therapeutics',
  'Toxicology',
  'Biopharmaceutics',
];

export const HARD_SKILLS_OPTIONS = [
  'Drug Dispensing',
  'Prescription Verification',
  'Drug-Drug Interaction Screening',
  'Patient Counseling',
  'Medication Therapy Management',
  'Compounding',
  'Sterile Preparation',
  'Clinical Documentation',
  'Adverse Drug Reaction Reporting',
  'Drug Utilization Review',
  'Quality Control Testing',
  'HPLC Analysis',
  'Dissolution Testing',
  'Stability Studies',
  'GMP Compliance',
];

export const SOFT_SKILLS_OPTIONS = [
  'Communication',
  'Teamwork',
  'Problem-Solving',
  'Critical Thinking',
  'Time Management',
  'Attention to Detail',
  'Patient Care',
  'Leadership',
  'Adaptability',
  'Empathy',
  'Conflict Resolution',
  'Organizational Skills',
];

export const TOOLS_OPTIONS = [
  'Microsoft Excel',
  'Microsoft Word',
  'Microsoft PowerPoint',
  'SPSS',
  'EndNote',
  'Mendeley',
  'Pharmacy Management Systems',
  'Electronic Health Records',
  'Drug Information Databases',
  'Clinical Decision Support Systems',
  'SAP',
  'Laboratory Information Systems',
];

export const FYP_TOOLS_OPTIONS = [
  'SPSS',
  'Microsoft Excel',
  'GraphPad Prism',
  'HPLC',
  'UV-Vis Spectrophotometry',
  'Dissolution Apparatus',
  'RevMan',
  'EndNote',
  'NVivo',
  'R Statistical Software',
];

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  hospital: 'Hospital/Clinical Pharmacy',
  industry: 'Pharmaceutical Industry (QA/QC/Regulatory)',
  community: 'Community/Retail Pharmacy',
};
