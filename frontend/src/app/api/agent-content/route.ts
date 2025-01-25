import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const userId = searchParams.get('userId');

  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  try {
    console.log(`API_BASE_URL: ${API_BASE_URL}`);
    console.log(`Fetching from: ${API_BASE_URL}/agent/agent_content/${agentId}`);
    
    const response = await fetch(`${API_BASE_URL}/agent/agent_content/${agentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId || '',
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend response error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch agent content: ${response.status} ${response.statusText}`);
    }

    const content = await response.json();
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error('Error fetching agent content:', error);
    return NextResponse.json({ 
      error: 'Failed to load agent content', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
