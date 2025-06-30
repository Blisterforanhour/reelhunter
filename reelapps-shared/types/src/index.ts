// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'candidate' | 'recruiter' | 'admin';
  avatar_url?: string;
  headline?: string;
  location?: string;
  availability?: 'available' | 'open' | 'not_looking';
  skills?: string[];
  created_at: string;
  updated_at: string;
}

// Job and Recruitment Types
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  remote_allowed: boolean;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  status: 'draft' | 'active' | 'paused' | 'closed';
  recruiter_id: string;
  ai_analysis_score?: any;
  created_at: string;
  updated_at: string;
}

export interface CandidateMatch {
  candidate_id: string;
  job_id: string;
  overall_score: number;
  skills_match: number;
  culture_match: number;
  experience_match: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}