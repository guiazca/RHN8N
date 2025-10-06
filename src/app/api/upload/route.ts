import { NextRequest, NextResponse } from 'next/server';
import { CVUploadResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get webhook URL from environment variables
    const webhookUrl = process.env.CV_UPLOAD_WEBHOOK;

    if (!webhookUrl) {
      // For demo purposes, simulate a successful response
      // In production, this would call the actual n8n webhook
      const mockResponse: CVUploadResponse = {
        success: true,
        message: 'CV uploaded successfully (demo mode)',
        resume_id: `demo_${Date.now()}`,
        candidate_id: `candidate_${Date.now()}`
      };

      return NextResponse.json(mockResponse);
    }

    // Forward the file to the n8n webhook
    const webhookFormData = new FormData();
    webhookFormData.append('file', file);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: webhookFormData,
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();

    const response: CVUploadResponse = {
      success: true,
      message: 'CV uploaded successfully',
      resume_id: webhookData.resume_id,
      candidate_id: webhookData.candidate_id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}