import { NextResponse } from 'next/server';
import { analyzeDesign, suggestLayout } from '@/lib/ai';

export async function POST(req: Request) {
  const body = await req.json();
  const issues = await analyzeDesign(body?.slideJSON || {});
  const suggestion = await suggestLayout(body?.summary || '');
  return NextResponse.json({ issues, suggestion });
}

