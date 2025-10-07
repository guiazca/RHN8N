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
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const jobData: Job = validationResult.data;

    try {
      // Forward to N8N webhook for processing
      const webhookUrl = process.env.N8N_JOBS_WEBHOOK_URL;
      if (!webhookUrl) {
        return NextResponse.json(
          { success: false, message: 'N8N jobs webhook URL not configured' },
          { status: 500 }
        );
      }

      console.log('Forwarding job to N8N webhook:', webhookUrl);

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('N8N jobs webhook error:', errorText);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to process job via N8N',
            error: errorText
          },
          { status: webhookResponse.status }
        );
      }

      const webhookData = await webhookResponse.json();
      console.log('N8N job processing completed:', webhookData);

      const response: JobPostResponse = {
        success: true,
        message: 'Job posted and processed successfully via N8N',
        job_id: webhookData.job_id || webhookData.id,
        top_resume: webhookData.top_resume,
        total_matches: webhookData.total_matches,
        matches: webhookData.matches,
      };

      return NextResponse.json(response);
    } catch (processingError) {
      console.error('Job processing error:', processingError);
      return NextResponse.json(
        {
          success: false,
          message: processingError instanceof Error ? processingError.message : 'Failed to process job via N8N'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Job posting error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}