import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Replace all elements on a slide (simple autosave model)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const slideId = params.id;
  const body = await req.json();
  const elements = (body?.elements as any[]) || [];

  // Remove existing and re-create for simplicity (MVP)
  await prisma.$transaction([
    prisma.element.deleteMany({ where: { slideId } }),
    prisma.element.createMany({
      data: elements.map((e) => ({ slideId, type: e.type, json: e.json, locked: !!e.locked }))
    }),
    prisma.slide.update({ where: { id: slideId }, data: { updatedAt: new Date() } })
  ]);

  return NextResponse.json({ ok: true });
}

