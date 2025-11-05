import { NextResponse } from 'next/server';
import { extractBrandColors } from '@/lib/ai';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof Blob)) return NextResponse.json({ error: 'No file' }, { status: 400 });
  const colors = await extractBrandColors(file);
  return NextResponse.json({ colors });
}

