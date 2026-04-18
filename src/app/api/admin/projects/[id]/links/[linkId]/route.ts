import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const LinkUpdate = z.object({
  label: z.string().min(1).max(60).optional(),
  url: z.string().url().max(500).optional(),
  iconName: z.string().max(64).nullable().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

function parseId(param: string): number | null {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { linkId: linkIdStr } = await params;
  const linkId = parseId(linkIdStr);
  if (!linkId) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const body = await req.json().catch(() => null);
  const parsed = LinkUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.projectLink.update({
    where: { id: linkId },
    data: parsed.data,
  });
  return NextResponse.json({ link: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { linkId: linkIdStr } = await params;
  const linkId = parseId(linkIdStr);
  if (!linkId) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await prisma.projectLink.delete({ where: { id: linkId } });
  return NextResponse.json({ ok: true });
}
