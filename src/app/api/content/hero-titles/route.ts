import { NextResponse } from 'next/server';
import { getHeroTitles } from '@/lib/content';

export async function GET() {
  const heroTitles = await getHeroTitles();
  return NextResponse.json({ heroTitles });
}
