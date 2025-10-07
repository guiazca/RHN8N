import OpenAI from 'openai';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CVData {
  nome?: string | null;
  name?: string | null;
  email?: string | null;
  telefone?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  localizacao?: {
    city?: string | null;
    country?: string | null;
  } | null;
  formacao?: Array<{
    curso?: string | null;
    instituicao?: string | null;
    inicio?: string | null;
    fim?: string | null;
  }>;
  experiencias?: Array<{
    empresa?: string | null;
    cargo?: string | null;
    inicio?: string | null;
    fim?: string | null;
    local?: string | null;
    descricao?: string | null;
  }>;
  competencias?: string[];
  idiomas?: Array<{
    idioma?: string;
    nivel?: string;
  }>;
}

export interface ProcessedCV {
  resume_id: string;
  candidate_id: string;
  file_gcs_path?: string | null;
  json_data: CVData;
  professional: {
    seniority?: string | null;
    years_experience?: number;
    [key: string]: unknown;
  };
  raw_text_excerpt?: string | null;
  overall_confidence?: number;
  status: 'OK' | 'NEEDS_REVIEW';
  created_at: string;
  openai_request_id?: string | null;
  cv_hash?: string | null;
}

export async function extractPDFText(fileBuffer: Buffer): Promise<string> {
  // For now, return a placeholder text since PDF processing is complex
  // In production, you would integrate a proper PDF parsing service
  console.log('PDF processing temporarily disabled - using placeholder text');

  // Return a sample text for testing
  return `Sample CV content from uploaded PDF file.

This is a placeholder for actual PDF text extraction. In a production environment,
you would integrate with a proper PDF parsing service like:
- Adobe PDF Services API
- Google Cloud Vision API
- AWS Textract
- Or a self-hosted PDF processing solution

The uploaded file appears to be ${fileBuffer.length} bytes in size.
To implement real PDF processing, replace this function with actual text extraction.`;
}

export async function processCVWithAI(text: string): Promise<{
  data: CVData;
  confidence: number;
  requestId: string;
}> {
  const systemPrompt = `És um extrator de informações de currículos. Devolve SEMPRE um JSON válido (sem texto fora do JSON), no seguinte esquema:
  {
    "nome": "string|null",
    "email": "string|null",
    "telefone": "string|null",
    "linkedin": "string|null",
    "localizacao": {"city":"string|null","country":"string|null"},
    "formacao": [{"curso":"string|null","instituicao":"string|null","inicio":"YYYY-MM|null","fim":"YYYY-MM|null"}],
    "experiencias": [{"empresa":"string|null","cargo":"string|null","inicio":"YYYY-MM|null","fim":"YYYY-MM|null","local":"string|null","descricao":"string|null"}],
    "competencias": ["string", "..."],
    "idiomas": [{"idioma":"string","nivel":"string"}]
  }
  Regras:
  - Se não houver um campo, usa null ou [] (nunca inventes).
  - Datas no formato "YYYY-MM" quando conseguires; senão null.
  - Normaliza email/telefone/LinkedIn quando possível.
  - Texto de entrada pode estar em PT/EN/ES.
  - Responde **apenas** com o JSON (sem backticks nem comentários).`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const requestId = completion.id;

    // Parse JSON response
    const data = parseJSONResponse(content);

    // Calculate confidence based on completeness
    const confidence = calculateConfidence(data);

    return { data, confidence, requestId };
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error('Failed to process CV with AI');
  }
}

function parseJSONResponse(content: string): CVData {
  try {
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/\`\`\`(?:json|text)?\s*/gi, '').replace(/\`\`\`/g, '').trim();

    // Try to parse JSON
    const parsed = JSON.parse(cleanContent);
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);

    // Try to extract JSON from the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // If still fails, return empty object
        return {};
      }
    }

    return {};
  }
}

function calculateConfidence(data: CVData): number {
  const fields = Object.keys(data);
  const filledFields = fields.filter(key => {
    const value = data[key as keyof CVData];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== '';
  });

  return Math.min(0.99, filledFields.length / fields.length);
}

export function generateCVHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}


function normalizeDate(date?: string | null): string | null {
  if (!date) return null;
  const cleaned = String(date).trim();

  if (/^\d{4}-\d{2}$/.test(cleaned)) return cleaned;
  if (/^\d{4}$/.test(cleaned)) return cleaned;

  const parsed = Date.parse(cleaned);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 7);
  }

  return null;
}

function canonicalSkill(skill?: string): string | null {
  if (!skill) return null;
  const normalized = String(skill).toLowerCase().trim();

  const skillMap: { [key: string]: string } = {
    "js": "javascript",
    "nodejs": "javascript",
    "node.js": "javascript",
    "py": "python",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "sqlserver": "mssql",
    "c#": "csharp",
    ".net": "dotnet"
  };

  // Remove accents
  const accentedRemoved = normalized
    .replace(/[à-å]/g, 'a')
    .replace(/[è-ë]/g, 'e')
    .replace(/[ì-ï]/g, 'i')
    .replace(/[ò-ö]/g, 'o')
    .replace(/[ù-ü]/g, 'u');

  return skillMap[accentedRemoved] || accentedRemoved;
}

export function createProcessedCV(
  cvData: CVData,
  text: string,
  confidence: number,
  requestId: string,
  filePath?: string
): ProcessedCV {
  const now = new Date().toISOString();
  const candidate_id = uuidv4();
  const resume_id = uuidv4();
  const cv_hash = generateCVHash(text);

  
  // Create flattened professional fields
  const professional: Record<string, unknown> = {
    seniority: null,
    years_experience: 0
  };

  // Add experiences
  if (cvData.experiencias && Array.isArray(cvData.experiencias)) {
    cvData.experiencias.forEach((exp, index) => {
      const key = 'experience_' + (index + 1);
      professional[key] = {
        cargo: exp.cargo || null,
        empresa: exp.empresa || null,
        inicio: normalizeDate(exp.inicio),
        fim: normalizeDate(exp.fim),
        descricao: exp.descricao || null,
        local: exp.local || null
      };
    });
  }

  // Add education
  if (cvData.formacao && Array.isArray(cvData.formacao)) {
    cvData.formacao.forEach((edu, index) => {
      const key = 'education_' + (index + 1);
      professional[key] = {
        curso: edu.curso || null,
        instituicao: edu.instituicao || null,
        inicio: normalizeDate(edu.inicio),
        fim: normalizeDate(edu.fim)
      };
    });
  }

  // Add skills
  if (cvData.competencias && Array.isArray(cvData.competencias)) {
    cvData.competencias.forEach((skill, index) => {
      const normalizedSkill = canonicalSkill(skill);
      if (normalizedSkill) {
        const key = 'skill_' + (index + 1);
        professional[key] = normalizedSkill;
      }
    });
  }

  // Add languages
  if (cvData.idiomas && Array.isArray(cvData.idiomas)) {
    cvData.idiomas.forEach((lang, index) => {
      const key = 'language_' + (index + 1);
      professional[key] = {
        idioma: lang.idioma || null,
        nivel: lang.nivel || null
      };
    });
  }

  
  return {
    resume_id,
    candidate_id,
    file_gcs_path: filePath || null,
    json_data: cvData,
    professional,
    raw_text_excerpt: text.slice(0, 2000),
    overall_confidence: confidence,
    status: confidence >= 0.6 ? 'OK' : 'NEEDS_REVIEW',
    created_at: now,
    openai_request_id: requestId,
    cv_hash
  };
}