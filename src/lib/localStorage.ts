import fs from 'fs/promises';
import path from 'path';
import { ProcessedCV } from './cvProcessor';

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
  created_at?: string;
}

export interface MatchingResult {
  resume_id: string;
  candidate_id: string;
  score: number;
  reasons: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Save processed CV to local storage
export async function saveResume(resume: ProcessedCV): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'resumes.json');

  let resumes: ProcessedCV[] = [];

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    resumes = JSON.parse(data);
  } catch {
    // File doesn't exist or is empty, start with empty array
  }

  resumes.push(resume);
  await fs.writeFile(filePath, JSON.stringify(resumes, null, 2));
}

// Save job to local storage
export async function saveJob(job: Job): Promise<Job> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'jobs.json');
  const job_id = `job_${Date.now()}`;
  const jobWithId = { ...job, job_id, created_at: new Date().toISOString() };

  let jobs: Job[] = [];

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    jobs = JSON.parse(data);
  } catch {
    // File doesn't exist or is empty, start with empty array
  }

  jobs.push(jobWithId);
  await fs.writeFile(filePath, JSON.stringify(jobs, null, 2));

  return jobWithId;
}

// Get all resumes with optional filtering and pagination
export async function getResumes(
  limit: number = 10,
  offset: number = 0,
  search?: string,
  skills?: string
): Promise<{ resumes: ProcessedCV[]; total: number; hasMore: boolean }> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'resumes.json');

  let resumes: ProcessedCV[] = [];

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    resumes = JSON.parse(data);
  } catch {
    // File doesn't exist or is empty, return empty result
    return { resumes: [], total: 0, hasMore: false };
  }

  // Apply search filter
  let filteredResumes = resumes;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredResumes = filteredResumes.filter(resume =>
      resume.json_data.nome?.toLowerCase().includes(searchLower) ||
      resume.json_data.email?.toLowerCase().includes(searchLower) ||
      resume.json_data.competencias?.some((skill: string) =>
        skill.toLowerCase().includes(searchLower)
      )
    );
  }

  // Apply skills filter
  if (skills) {
    const skillList = skills.split(',').map(s => s.trim().toLowerCase());
    filteredResumes = filteredResumes.filter(resume =>
      skillList.some(skill =>
        resume.json_data.competencias?.some((resumeSkill: string) =>
          resumeSkill.toLowerCase().includes(skill)
        )
      )
    );
  }

  // Apply pagination
  const paginatedResumes = filteredResumes.slice(offset, offset + limit);
  const hasMore = offset + limit < filteredResumes.length;

  return {
    resumes: paginatedResumes,
    total: filteredResumes.length,
    hasMore
  };
}

// Find best matching resumes for a job
export async function findMatchingResumes(job: Job): Promise<MatchingResult[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'resumes.json');

  let resumes: ProcessedCV[] = [];

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    resumes = JSON.parse(data);
  } catch {
    return [];
  }

  const results: MatchingResult[] = [];

  for (const resume of resumes) {
    const score = calculateMatchScore(job, resume);
    if (score > 0) {
      results.push({
        resume_id: resume.resume_id,
        candidate_id: resume.candidate_id,
        score,
        reasons: generateMatchReasons(job, resume, score)
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

function calculateMatchScore(job: Job, resume: ProcessedCV): number {
  let score = 0;
  const skills = resume.json_data.competencias || [];
  const experiences = resume.json_data.experiencias || [];

  // Check must-have skills
  if (job.mustHave && job.mustHave.length > 0) {
    const mustHaveMatches = job.mustHave.filter(mustHave =>
      skills.some(skill =>
        skill.toLowerCase().includes(mustHave.toLowerCase())
      )
    );
    score += (mustHaveMatches.length / job.mustHave.length) * 50; // 50% weight
  }

  // Check nice-to-have skills
  if (job.niceToHave && job.niceToHave.length > 0) {
    const niceToHaveMatches = job.niceToHave.filter(niceToHave =>
      skills.some(skill =>
        skill.toLowerCase().includes(niceToHave.toLowerCase())
      )
    );
    score += (niceToHaveMatches.length / job.niceToHave.length) * 20; // 20% weight
  }

  // Check experience relevance
  const totalExperience = experiences.reduce((acc, exp) => {
    if (exp.descricao) {
      const desc = exp.descricao.toLowerCase();
      const relevantKeywords = [...(job.mustHave || []), ...(job.niceToHave || []), ...(job.keywords || [])];
      const matches = relevantKeywords.filter(keyword => desc.includes(keyword.toLowerCase()));
      return acc + matches.length;
    }
    return acc;
  }, 0);
  score += Math.min(totalExperience * 2, 20); // Up to 20% weight

  // Check seniority match
  if (job.seniority && resume.professional.seniority) {
    const seniorityLevels = ['junior', 'mid-level', 'senior', 'lead', 'principal'];
    const jobLevel = seniorityLevels.indexOf(job.seniority.toLowerCase());
    const resumeLevel = seniorityLevels.indexOf(resume.professional.seniority.toLowerCase());

    if (jobLevel !== -1 && resumeLevel !== -1) {
      const levelDiff = Math.abs(jobLevel - resumeLevel);
      score += Math.max(0, 10 - levelDiff * 3); // Up to 10% weight
    }
  }

  return Math.min(100, Math.round(score));
}

function generateMatchReasons(job: Job, resume: ProcessedCV, score: number): string[] {
  const reasons: string[] = [];
  const skills = resume.json_data.competencias || [];

  // Check must-have matches
  if (job.mustHave && job.mustHave.length > 0) {
    const mustHaveMatches = job.mustHave.filter(mustHave =>
      skills.some(skill =>
        skill.toLowerCase().includes(mustHave.toLowerCase())
      )
    );
    if (mustHaveMatches.length > 0) {
      reasons.push(`Matches ${mustHaveMatches.length} required skills: ${mustHaveMatches.join(', ')}`);
    }
  }

  // Check nice-to-have matches
  if (job.niceToHave && job.niceToHave.length > 0) {
    const niceToHaveMatches = job.niceToHave.filter(niceToHave =>
      skills.some(skill =>
        skill.toLowerCase().includes(niceToHave.toLowerCase())
      )
    );
    if (niceToHaveMatches.length > 0) {
      reasons.push(`Has ${niceToHaveMatches.length} preferred skills: ${niceToHaveMatches.join(', ')}`);
    }
  }

  // Experience-based reasons
  const experiences = resume.json_data.experiencias || [];
  const relevantExperience = experiences.filter(exp => {
    if (!exp.descricao) return false;
    const desc = exp.descricao.toLowerCase();
    const keywords = [...(job.mustHave || []), ...(job.niceToHave || []), ...(job.keywords || [])];
    return keywords.some(keyword => desc.includes(keyword.toLowerCase()));
  });

  if (relevantExperience.length > 0) {
    reasons.push(`${relevantExperience.length} relevant experience(s) found`);
  }

  // High score reasons
  if (score >= 80) {
    reasons.push('Excellent overall match');
  } else if (score >= 60) {
    reasons.push('Good match');
  }

  return reasons.length > 0 ? reasons : ['Some relevant skills found'];
}

// Delete resume by ID
export async function deleteResume(resume_id: string): Promise<boolean> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'resumes.json');

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    let resumes: ProcessedCV[] = JSON.parse(data);

    const initialLength = resumes.length;
    resumes = resumes.filter(resume => resume.resume_id !== resume_id);

    if (resumes.length < initialLength) {
      await fs.writeFile(filePath, JSON.stringify(resumes, null, 2));
      return true;
    }
  } catch {
    // File doesn't exist or error reading
  }

  return false;
}

// Get all jobs
export async function getJobs(): Promise<Job[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'jobs.json');

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}