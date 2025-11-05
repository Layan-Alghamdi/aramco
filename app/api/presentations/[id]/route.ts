import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = params.id;
  const pres = await prisma.presentation.findUnique({
    where: { id },
    include: { slides: { include: { elements: true }, orderBy: { index: 'asc' } } }
  });
  if (!pres || pres.isDeleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pres);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = params.id;
  const body = await req.json();
  const updated = await prisma.presentation.update({
    where: { id },
    data: { title: body?.title ?? undefined, version: { increment: 1 } }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = params.id;
  const updated = await prisma.presentation.update({ where: { id }, data: { isDeleted: true } });
  return NextResponse.json(updated);
}

