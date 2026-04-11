import { NextResponse } from 'next/server';
import { getActivities } from '@/lib/content';

export async function GET() {
  const activities = await getActivities();
  return NextResponse.json({ activities });
}
