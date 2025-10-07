import { NextRequest, NextResponse } from 'next/server';
import { Job, JobPostResponse } from '@/types';
import { z } from 'zod';
import { saveJob, findMatchingResumes } from '@/lib/localStorage';

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
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const jobData: Job = validationResult.data;

    try {
      // Save job to local storage
      const savedJob = await saveJob(jobData);
      console.log('Job saved to local storage:', savedJob.job_id);

      // Find matching resumes
      const matchingResults = await findMatchingResumes(savedJob);
      console.log(`Found ${matchingResults.length} matching resumes`);

      // Get the top match if available
      const topMatch = matchingResults.length > 0 ? matchingResults[0] : null;

      const response: JobPostResponse = {
        success: true,
        message: 'Job posted and matched successfully',
        job_id: savedJob.job_id!,
        top_resume: topMatch ? {
          resume_id: topMatch.resume_id,
          candidate_id: topMatch.candidate_id,
          score: topMatch.score,
          reasons: topMatch.reasons,
        } : undefined,
        total_matches: matchingResults.length,
        matches: matchingResults.slice(0, 10), // Return top 10 matches
      };

      return NextResponse.json(response);
    } catch (processingError) {
      console.error('Job processing error:', processingError);

      // Check if we should fallback to webhook
      const webhookUrl = process.env.JOB_POST_WEBHOOK;
      if (webhookUrl) {
        console.log('Falling back to webhook processing');
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        });

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          return NextResponse.json({
            success: true,
            message: 'Job posted successfully (via webhook)',
            job_id: webhookData.job_id,
            top_resume: webhookData.top_resume,
          });
        }
      }

      // If no webhook or webhook failed, return error
      return NextResponse.json(
        {
          success: false,
          message: processingError instanceof Error ? processingError.message : 'Failed to process job'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Job posting error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}