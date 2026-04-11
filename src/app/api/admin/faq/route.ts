import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const FaqCreate = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(3000),
  order: z.number().int().min(0).max(9999).optional(),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ faqs });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = FaqCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.fAQ.create({ data: parsed.data });
  return NextResponse.json({ faq: created }, { status: 201 });
}
