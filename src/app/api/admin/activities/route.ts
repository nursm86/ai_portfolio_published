import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ActivityCreate = z.object({
  label: z.string().min(1).max(200),
  iconName: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  href: z.string().max(200).nullable().optional(),
  chatPrompt: z.string().max(500).nullable().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const activities = await prisma.activity.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = ActivityCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.activity.create({ data: parsed.data });
  return NextResponse.json({ activity: created }, { status: 201 });
}
