import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const HeroCreate = z.object({
  text: z.string().min(1).max(120),
  order: z.number().int().min(0).max(9999).optional(),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const heroTitles = await prisma.heroTitle.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ heroTitles });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = HeroCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.heroTitle.create({ data: parsed.data });
  return NextResponse.json({ heroTitle: created }, { status: 201 });
}
