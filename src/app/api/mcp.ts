import { NextResponse } from 'next/server';
import { githubMCPClient } from '../../lib/githubMCPClient';

export async function GET() {
  try {
    const response = await githubMCPClient.get('/example-endpoint');
    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'Unknown error occurred' }, { status: 500 });
  }
}