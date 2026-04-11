import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const QuestionCreate = z.object({
  key: z.string().min(1).max(40),
  prompt: z.string().min(1).max(500),
  iconName: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  order: z.number().int().min(0).max(9999).optional(),
});

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const questions = await prisma.questionCard.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = QuestionCreate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.questionCard.create({ data: parsed.data });
  return NextResponse.json({ question: created }, { status: 201 });
}
