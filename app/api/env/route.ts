import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    googleApiKey: process.env.GOOGLE_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  });
}