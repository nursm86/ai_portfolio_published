import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const HeroUpdate = z.object({
  text: z.string().min(1).max(120).optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

function parseId(param: string): number | null {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
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
  const parsed = HeroUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.heroTitle.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ heroTitle: updated });
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
  await prisma.heroTitle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
