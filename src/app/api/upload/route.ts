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

    // Forward to N8N webhook for processing
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    console.log('Forwarding CV to N8N webhook:', webhookUrl);

    const webhookFormData = new FormData();
    webhookFormData.append('file', file);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: webhookFormData,
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('N8N webhook error:', errorText);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to process CV via N8N',
          error: errorText
        },
        { status: webhookResponse.status }
      );
    }

    const webhookData = await webhookResponse.json();
    console.log('N8N processing completed:', webhookData);

    const response: CVUploadResponse = {
      success: true,
      message: 'CV uploaded and processed successfully via N8N',
      resume_id: webhookData.resume_id || webhookData.id,
      candidate_id: webhookData.candidate_id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}