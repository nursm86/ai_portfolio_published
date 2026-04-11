import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const StackCreate = z.object({
  category: z.string().min(1).max(60),
  name: z.string().min(1).max(120),
  note: z.string().max(500).nullable().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const stack = await prisma.stackItem.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
  return NextResponse.json({ stack });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = StackCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.stackItem.create({ data: parsed.data });
  return NextResponse.json({ item: created }, { status: 201 });
}
