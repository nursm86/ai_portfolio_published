import { NextResponse } from 'next/server';
import { getStackItems } from '@/lib/content';

export async function GET() {
  const stack = await getStackItems();
  return NextResponse.json({ stack });
}
