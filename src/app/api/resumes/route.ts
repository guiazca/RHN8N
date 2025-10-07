import { NextRequest, NextResponse } from 'next/server';
import { getResumes } from '@/lib/localStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const skills = searchParams.get('skills') || '';

    // Get resumes from local storage
    const result = await getResumes(limit, offset, search, skills);

    return NextResponse.json({
      success: true,
      resumes: result.resumes,
      total: result.total,
      limit: limit,
      offset: offset,
      hasMore: result.hasMore
    });

  } catch (error) {
    console.error('Resumes fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get webhook URL from environment variables
    const webhookUrl = process.env.RESUMES_WEBHOOK;

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'Resumes webhook not configured' },
        { status: 501 }
      );
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();

    return NextResponse.json({
      success: true,
      data: webhookData
    });

  } catch (error) {
    console.error('Resumes POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}