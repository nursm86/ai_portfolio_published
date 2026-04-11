import { NextResponse } from 'next/server';
import { getQuestionCards } from '@/lib/content';

export async function GET() {
  const questions = await getQuestionCards();
  return NextResponse.json({ questions });
}
