/* eslint-disable no-console */
/**
 * One-off seed for the Invyt project — creates the Project row + ProjectImage
 * rows for the screenshots captured to public/projects/invyt/.
 *
 * Idempotent: upserts the project and re-inserts images only if there are none.
 * Run: npx tsx scripts/seed-invyt.ts
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    where: { slug: 'invyt' },
    create: {
      slug: 'invyt',
      title: 'Invyt',
      category: 'SaaS platform',
      tagline:
        'Beautiful digital invitations for weddings, birthdays, and events — with animated themes, seating charts, and QR-code guest check-in.',
      coverImage: '/projects/invyt/1-desktop.png',
      date: '2026',
      order: 0,
      featured: true,
      techStack: JSON.stringify([
        'Next.js',
        'React',
        'TypeScript',
        'Tailwind CSS',
        'Node.js',
        'Prisma',
        'Stripe',
      ]),
      problemMd: `Traditional wedding and event invitations are expensive, slow to produce, and easy to lose track of — guests forget to RSVP, seating gets re-planned on paper at the last minute, and there's no way to share updates after the invites go out.

Couples planning a celebration wanted something **beautiful enough to feel special**, but **functional enough to solve the operational problems** of hosting a real event: who's coming, who sits where, how do we share directions on the day, and how do we check guests in without a clipboard.`,
      solutionMd: `Invyt is a full-stack SaaS platform for digital invitations. Hosts pick from 60+ animated themes, customize their event details, and share a link. Guests RSVP, get directions, see the seating plan, and check in via QR code on the day.

Key features shipped:

- **60+ animated themes** — scroll-triggered animations, custom typography, theme previews
- **Visual seating charts** — drag-and-drop table layout builder with guest assignment
- **QR-code check-in** — each guest gets a unique code scanned on the day
- **RSVP management** — real-time guest list with dietary + plus-one tracking
- **Unlimited events + guests** — flat pricing, no per-guest surcharges
- **Multi-language** — English + localized date/time rendering
- **Pay-once model** — single purchase per event, no subscriptions`,
      architectureMd: `Built on Next.js with a Node.js backend and Prisma ORM. The theme engine is a reusable component library — each theme is a React component that receives event data as props and composes its own layout, animations, and typography. Stripe handles the one-time payment; QR codes are generated server-side and embedded in guest emails.`,
      impactMd: '',
      chatPrompt: 'Tell me about the Invyt digital invitations platform.',
    },
    update: {
      // Keep coverImage + tagline fresh on re-run; leave story markdown alone
      // so admin edits aren't clobbered.
      coverImage: '/projects/invyt/1-desktop.png',
    },
  });

  // Seed images only if none exist yet.
  const existingImages = await prisma.projectImage.count({
    where: { projectId: project.id },
  });
  if (existingImages === 0) {
    await prisma.projectImage.createMany({
      data: [
        {
          projectId: project.id,
          src: '/projects/invyt/2-desktop.png',
          alt: 'Invyt pricing page — flat pricing with unlimited events',
          caption:
            'Simple, honest pricing — pay once per event, unlimited guests.',
          layout: 'wide',
          order: 0,
        },
        {
          projectId: project.id,
          src: '/projects/invyt/3-desktop.png',
          alt: 'Invyt host dashboard — events list with RSVP counts',
          caption: 'Host dashboard — manage all your events in one place.',
          layout: 'wide',
          order: 1,
        },
        {
          projectId: project.id,
          src: '/projects/invyt/1-mobile.png',
          alt: 'Invyt marketing home on mobile',
          caption: 'Mobile-first marketing experience.',
          layout: 'mobile',
          order: 2,
        },
      ],
    });
  }

  // Seed links only if none exist yet.
  const existingLinks = await prisma.projectLink.count({
    where: { projectId: project.id },
  });
  if (existingLinks === 0) {
    await prisma.projectLink.create({
      data: {
        projectId: project.id,
        label: 'Live site',
        url: 'https://invyt.com.au',
        iconName: 'Globe',
        order: 0,
      },
    });
  }

  console.log(`Invyt project seeded: /projects/${project.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
