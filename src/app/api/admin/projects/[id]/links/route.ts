import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const LinkCreate = z.object({
  label: z.string().min(1).max(60),
  url: z.string().url().max(500),
  iconName: z.string().max(64).nullable().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

function parseId(param: string): number | null {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const projectId = parseId(idStr);
  if (!projectId) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const links = await prisma.projectLink.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ links });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const projectId = parseId(idStr);
  if (!projectId) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const body = await req.json().catch(() => null);
  const parsed = LinkCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.projectLink.create({
    data: { ...parsed.data, projectId },
  });
  return NextResponse.json({ link: created }, { status: 201 });
}
