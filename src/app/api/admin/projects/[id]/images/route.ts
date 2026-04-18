import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ImageCreate = z.object({
  src: z.string().min(1).max(300),
  alt: z.string().min(1).max(200),
  caption: z.string().max(500).nullable().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  layout: z.enum(['wide', 'half', 'mobile']).default('wide'),
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
  const images = await prisma.projectImage.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ images });
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
  const parsed = ImageCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.projectImage.create({
    data: { ...parsed.data, projectId },
  });
  return NextResponse.json({ image: created }, { status: 201 });
}
