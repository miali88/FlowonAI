import { NextResponse } from 'next/server';
import { fetchAgentsFromDatabase } from '@/utils/db';

export async function GET() {
  try {
    const agents = await fetchAgentsFromDatabase();
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
