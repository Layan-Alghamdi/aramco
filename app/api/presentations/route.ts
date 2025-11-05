import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const list = await prisma.presentation.findMany({
    where: {
      isDeleted: false,
      OR: [
        { ownerId: userId },
        { permissions: { some: { userId } } }
      ]
    },
    orderBy: { updatedAt: 'desc' }
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const body = await req.json();
  const title = (body?.title as string) || 'Untitled';
  const created = await prisma.presentation.create({
    data: {
      title,
      ownerId: userId,
      slides: { create: [{ index: 0, background: { type: 'color', value: '#ffffff' } }] }
    }
  });
  return NextResponse.json(created);
}

