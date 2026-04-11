import { NextResponse } from 'next/server';
import { getNowPage } from '@/lib/content';

export async function GET() {
  const now = await getNowPage();
  return NextResponse.json({ now });
}
