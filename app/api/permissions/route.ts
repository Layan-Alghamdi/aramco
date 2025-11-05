import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { presentationId, email, role } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const perm = await prisma.permission.upsert({
    where: { presentationId_userId: { presentationId, userId: user.id } },
    update: { role },
    create: { presentationId, userId: user.id, role: role as Role }
  });
  return NextResponse.json(perm);
}

