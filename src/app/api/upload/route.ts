import { NextRequest, NextResponse } from 'next/server';
import { CVUploadResponse } from '@/types';
import { extractPDFText, processCVWithAI, createProcessedCV } from '@/lib/cvProcessor';
import { saveResume } from '@/lib/localStorage';

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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // Extract text from PDF
      const text = await extractPDFText(buffer);
      console.log('Text extracted successfully:', text.length, 'characters');

      // Process with AI
      const { data, confidence, requestId } = await processCVWithAI(text);
      console.log('AI processing completed with confidence:', confidence);

      // Create processed CV object
      const processedCV = createProcessedCV(data, text, confidence, requestId, file.name);

      // Save to local storage
      await saveResume(processedCV);
      console.log('CV saved to local storage');

      const response: CVUploadResponse = {
        success: true,
        message: 'CV uploaded and processed successfully',
        resume_id: processedCV.resume_id,
        candidate_id: processedCV.candidate_id,
      };

      return NextResponse.json(response);
    } catch (processingError) {
      console.error('CV processing error:', processingError);

      // Check if we should fallback to webhook
      const webhookUrl = process.env.CV_UPLOAD_WEBHOOK;
      if (webhookUrl) {
        console.log('Falling back to webhook processing');
        const webhookFormData = new FormData();
        webhookFormData.append('file', file);

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          body: webhookFormData,
        });

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          return NextResponse.json({
            success: true,
            message: 'CV uploaded successfully (via webhook)',
            resume_id: webhookData.resume_id,
            candidate_id: webhookData.candidate_id,
          });
        }
      }

      // If no webhook or webhook failed, return error
      return NextResponse.json(
        {
          success: false,
          message: processingError instanceof Error ? processingError.message : 'Failed to process CV'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}