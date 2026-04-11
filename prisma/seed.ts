/* eslint-disable no-console */
// Seed the portfolio database with the values that were previously hardcoded
// in src/app/page.tsx, src/components/HeroTitle.tsx, etc.
//
// Run with: npm run db:seed (or: npx prisma db seed)
// Idempotent: uses upsert where possible so re-running is safe.

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- Activities (landing "What I'm up to" cards) ---
  // chatPrompt is the query sent into /chat?query= when the chip is clicked.
  // href is only for external-app routes (e.g. /hex); everything else is
  // chat-first to stay on the single conversational surface.
  await prisma.activity.deleteMany();
  await prisma.activity.createMany({
    data: [
      {
        label: 'Preparing for AWS Solutions Architect Associate exam',
        iconName: 'Cloud',
        color: '#F59E0B',
        chatPrompt: 'What are you learning about AWS right now?',
        order: 0,
      },
      {
        label: 'Building globalpsychicsassociation.com platform',
        iconName: 'Globe',
        color: '#3B82F6',
        chatPrompt: 'Tell me about the GPA platform you are building.',
        order: 1,
      },
      {
        label: 'Working with open source AI models',
        iconName: 'Sparkles',
        color: '#A855F7',
        chatPrompt: 'Which open source AI models are you working with?',
        order: 2,
      },
      {
        label: 'V2V Negotiation research for autonomous vehicles at WSU',
        iconName: 'Car',
        color: '#10B981',
        chatPrompt: 'Tell me about your V2V negotiation research.',
        order: 3,
      },
      {
        label: 'Play Hex against my AI',
        iconName: 'Hexagon',
        color: '#EF4444',
        href: '/hex',
        order: 4,
      },
    ],
  });

  // --- Question cards (Me / Projects / Skills / Contact) ---
  const questions = [
    {
      key: 'Me',
      prompt: 'Who are you? I want to know more about you.',
      iconName: 'Laugh',
      color: '#329696',
      order: 0,
    },
    {
      key: 'Projects',
      prompt: 'What are your projects? What are you working on right now?',
      iconName: 'BriefcaseBusiness',
      color: '#3E9858',
      order: 1,
    },
    {
      key: 'Skills',
      prompt: 'What are your skills? Give me a list of your soft and hard skills.',
      iconName: 'Layers',
      color: '#856ED9',
      order: 2,
    },
    {
      key: 'Contact',
      prompt: 'How can I contact you?',
      iconName: 'UserRoundSearch',
      color: '#C19433',
      order: 3,
    },
  ];
  for (const q of questions) {
    await prisma.questionCard.upsert({
      where: { key: q.key },
      create: q,
      update: q,
    });
  }

  // --- Hero rotating titles ---
  await prisma.heroTitle.deleteMany();
  await prisma.heroTitle.createMany({
    data: [
      { text: 'Full-Stack Developer', order: 0 },
      { text: 'AI Enthusiast', order: 1 },
      { text: 'Problem Solver', order: 2 },
    ],
  });

  // --- Availability (singleton placeholder) ---
  await prisma.availabilityEntry.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      status: 'limited',
      headline: 'Open to the right opportunity.',
      detailsMd:
        'Currently focused on research + the GPA platform. Open to short contracts, research collabs, and interesting full-time offers.',
      timezone: 'AEST (UTC+10)',
    },
    update: {},
  });

  // --- FAQ placeholders ---
  await prisma.fAQ.deleteMany();
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'Why a chat-first portfolio?',
        answer:
          'Recruiters and collaborators ask the same questions over and over. A chat interface lets them get exactly the answer they want instead of scrolling past irrelevant sections.',
        order: 0,
      },
      {
        question: 'Why Ubuntu VPS instead of Vercel?',
        answer:
          'I wanted full control over the runtime, and I already manage a VPS for other projects. Nectar Cloud gives me a free tier that handles this traffic comfortably.',
        order: 1,
      },
      {
        question: 'Why Next.js 16 + React 19?',
        answer:
          'Server components keep the bundle small, the App Router matches how I think about pages, and AI SDK integration is first-class.',
        order: 2,
      },
    ],
  });

  // --- Stack items (day-to-day tools) ---
  await prisma.stackItem.deleteMany();
  await prisma.stackItem.createMany({
    data: [
      { category: 'Editor', name: 'VS Code', note: 'With Claude Code extension', order: 0 },
      { category: 'Editor', name: 'Claude Code', note: 'Terminal + VS Code agent', order: 1 },
      { category: 'Runtime', name: 'Node.js', order: 0 },
      { category: 'Runtime', name: 'Bun', note: 'For scripts and one-offs', order: 1 },
      { category: 'Framework', name: 'Next.js', note: 'App Router, server components', order: 0 },
      { category: 'Framework', name: 'React', order: 1 },
      { category: 'Database', name: 'Prisma + SQLite', note: 'This portfolio', order: 0 },
      { category: 'Database', name: 'MySQL + Prisma', note: 'GPA platform', order: 1 },
      { category: 'AI', name: 'Vercel AI SDK', order: 0 },
      { category: 'AI', name: 'OpenAI API', order: 1 },
      { category: 'Infra', name: 'Ubuntu + systemd', note: 'Nectar Cloud VPS', order: 0 },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
