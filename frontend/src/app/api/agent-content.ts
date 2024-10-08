import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const userId = searchParams.get('userId');

  if (!agentId || !userId) {
    return NextResponse.json({ error: 'Missing agentId or userId' }, { status: 400 });
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL}/agents/${agentId}/content?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent content');
    }

    const htmlContent = await response.text();
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error fetching agent content:', error);
    return NextResponse.json({ error: 'Failed to load agent content' }, { status: 500 });
  }
}