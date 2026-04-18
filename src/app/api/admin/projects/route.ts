import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ProjectCreate = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(60),
  title: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  tagline: z.string().min(1).max(300),
  date: z.string().min(1).max(20),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { images: true, links: true } },
    },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = ProjectCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.project.create({ data: parsed.data });
  return NextResponse.json({ project: created }, { status: 201 });
}
