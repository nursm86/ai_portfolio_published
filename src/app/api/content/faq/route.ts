import { NextResponse } from 'next/server';
import { getFAQs } from '@/lib/content';

export async function GET() {
  const faqs = await getFAQs();
  return NextResponse.json({ faqs });
}
