export interface Candidate {
  candidate_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  location: {
    city: string | null;
    country: string | null;
  };
  consent_given_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  cargo: string | null;
  empresa: string | null;
  inicio: string | null;
  fim: string | null;
  descricao: string | null;
  duration_months?: number;
}

export interface Education {
  curso: string | null;
  instituicao: string | null;
  inicio: string | null;
  fim: string | null;
}

export interface Language {
  idioma: string | null;
  nivel: string | null;
}

export interface Professional {
  seniority: string | null;
  years_experience: number;
  experience_1?: Experience;
  experience_2?: Experience;
  experience_3?: Experience;
  education_1?: Education;
  education_2?: Education;
  education_3?: Education;
  skill_1?: string;
  skill_2?: string;
  skill_3?: string;
  skill_4?: string;
  skill_5?: string;
  language_1?: Language;
  language_2?: Language;
  language_3?: Language;
}

export interface Resume {
  resume_id: string;
  candidate_id: string;
  file_gcs_path: string | null;
  json_data: any;
  professional: Professional;
  raw_text_excerpt: string | null;
  overall_confidence: number;
  status: 'OK' | 'NEEDS_REVIEW';
  created_at: string;
  openai_request_id: string | null;
  cv_hash: string | null;
  score?: number;
  reasons?: string[];
}

export interface Job {
  job_id?: string;
  title: string;
  seniority: string;
  location: string;
  workMode: string;
  contractType: string;
  languages: string[];
  mustHave: string[];
  niceToHave: string[];
  salaryMin: number;
  salaryMax: number;
  currency: string;
  keywords: string[];
  rawText: string;
  webhookUrl?: string;
  executionMode?: string;
  created_at?: string;
}

export interface JobMatch {
  resume: Resume;
  score: number;
  reasons: string[];
}

export interface CVUploadResponse {
  success: boolean;
  message?: string;
  resume_id?: string;
  candidate_id?: string;
}

export interface JobPostResponse {
  success: boolean;
  message?: string;
  job_id?: string;
  top_resume?: {
    resume_id: string;
    candidate_id: string;
    score: number;
    reasons: string[];
  };
}