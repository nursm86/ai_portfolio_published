import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const AvailabilityUpdate = z.object({
  status: z.enum(['available', 'limited', 'not_available', 'unknown']),
  headline: z.string().min(1).max(200),
  detailsMd: z.string().max(5000),
  timezone: z.string().min(1).max(60),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const availability = await prisma.availabilityEntry.findUnique({
    where: { id: 1 },
  });
  return NextResponse.json({ availability });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = AvailabilityUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.availabilityEntry.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  });
  return NextResponse.json({ availability: updated });
}
