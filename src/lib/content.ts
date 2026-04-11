// Server-only content helpers. Called by server components, API routes, and chat tools.
// Do NOT import this file from client components — it pulls in Prisma.

import 'server-only';
import { prisma } from './db';

export async function getActivities() {
  return prisma.activity.findMany({ orderBy: { order: 'asc' } });
}

export async function getQuestionCards() {
  return prisma.questionCard.findMany({ orderBy: { order: 'asc' } });
}

export async function getHeroTitles() {
  return prisma.heroTitle.findMany({ orderBy: { order: 'asc' } });
}

export async function getNowPage() {
  const row = await prisma.nowPage.findUnique({ where: { id: 1 } });
  return row ?? { id: 1, bodyMd: '_To be written._', updatedAt: new Date() };
}

export async function getFAQs() {
  return prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
}

export async function getAvailability() {
  const row = await prisma.availabilityEntry.findUnique({ where: { id: 1 } });
  return (
    row ?? {
      id: 1,
      status: 'unknown',
      headline: 'Availability not set yet.',
      detailsMd: '',
      timezone: 'AEST (UTC+10)',
      updatedAt: new Date(),
    }
  );
}

export async function getStackItems() {
  return prisma.stackItem.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}
