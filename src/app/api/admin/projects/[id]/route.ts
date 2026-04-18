import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ProjectUpdate = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(60)
    .optional(),
  title: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(60).optional(),
  tagline: z.string().min(1).max(300).optional(),
  date: z.string().min(1).max(20).optional(),
  coverImage: z.string().max(300).nullable().optional(),
  order: z.number().int().min(0).max(9999).optional(),
  featured: z.boolean().optional(),
  problemMd: z.string().max(20000).optional(),
  solutionMd: z.string().max(20000).optional(),
  architectureMd: z.string().max(20000).optional(),
  impactMd: z.string().max(20000).optional(),
  techStack: z.string().max(2000).optional(),
  chatPrompt: z.string().max(500).nullable().optional(),
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
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      links: { orderBy: { order: 'asc' } },
    },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const body = await req.json().catch(() => null);
  const parsed = ProjectUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.project.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ project: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
