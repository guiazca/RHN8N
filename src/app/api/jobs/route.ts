import { NextRequest, NextResponse } from 'next/server';
import { Job, JobPostResponse } from '@/types';
import { z } from 'zod';

const JobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  seniority: z.string().min(1, 'Seniority is required'),
  location: z.string().min(1, 'Location is required'),
  workMode: z.string().min(1, 'Work mode is required'),
  contractType: z.string().min(1, 'Contract type is required'),
  languages: z.array(z.string()),
  mustHave: z.array(z.string()),
  niceToHave: z.array(z.string()),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
  currency: z.string(),
  keywords: z.array(z.string()),
  rawText: z.string(),
  webhookUrl: z.string().optional(),
  executionMode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = JobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid job data',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const jobData: Job = validationResult.data;

    // Get webhook URL from environment variables
    const webhookUrl = process.env.JOB_POST_WEBHOOK;

    if (!webhookUrl) {
      // For demo purposes, simulate a successful response with mock matching
      // In production, this would call the actual n8n webhook
      const mockResponse: JobPostResponse = {
        success: true,
        message: 'Job posted successfully (demo mode)',
        job_id: `job_${Date.now()}`,
        top_resume: {
          resume_id: `demo_resume_${Date.now()}`,
          candidate_id: `demo_candidate_${Date.now()}`,
          score: 85,
          reasons: ['Strong relevant experience', 'Required skills match', 'Good cultural fit indicators'],
        },
      };

      return NextResponse.json(mockResponse);
    }

    // Forward the job data to the n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();

    const response: JobPostResponse = {
      success: true,
      message: 'Job posted successfully',
      job_id: webhookData.job_id,
      top_resume: webhookData.top_resume,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Job posting error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}