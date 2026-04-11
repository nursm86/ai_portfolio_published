import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const NowUpdate = z.object({
  bodyMd: z.string().min(1).max(20000),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const now = await prisma.nowPage.findUnique({ where: { id: 1 } });
  return NextResponse.json({ now });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = NowUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.nowPage.upsert({
    where: { id: 1 },
    create: { id: 1, bodyMd: parsed.data.bodyMd },
    update: { bodyMd: parsed.data.bodyMd },
  });
  return NextResponse.json({ now: updated });
}
