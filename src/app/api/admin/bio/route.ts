import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { getBio, isBioCustomised, setBio } from '@/lib/bio';

const BioUpdate = z.object({
  content: z.string().min(1).max(50000),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const [content, customised] = await Promise.all([
    getBio(),
    isBioCustomised(),
  ]);
  return NextResponse.json({ content, customised });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = BioUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await setBio(parsed.data.content);
  return NextResponse.json({ ok: true });
}
