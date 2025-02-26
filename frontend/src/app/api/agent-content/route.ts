import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  try {
    const { getToken } = auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/agent/agent_content/${agentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
