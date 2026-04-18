import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ImageUpdate = z.object({
  src: z.string().min(1).max(300).optional(),
  alt: z.string().min(1).max(200).optional(),
  caption: z.string().max(500).nullable().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  layout: z.enum(['wide', 'half', 'mobile']).optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

function parseId(param: string): number | null {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { imageId: imageIdStr } = await params;
  const imageId = parseId(imageIdStr);
  if (!imageId) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const body = await req.json().catch(() => null);
  const parsed = ImageUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.projectImage.update({
    where: { id: imageId },
    data: parsed.data,
  });
  return NextResponse.json({ image: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { imageId: imageIdStr } = await params;
  const imageId = parseId(imageIdStr);
  if (!imageId) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await prisma.projectImage.delete({ where: { id: imageId } });
  return NextResponse.json({ ok: true });
}
