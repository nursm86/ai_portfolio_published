import {
  getActivities,
  getAvailability,
  getFAQs,
  getHeroTitles,
  getProjects,
  getQuestionCards,
  getStackItems,
} from '@/lib/content';
import { isBioCustomised } from '@/lib/bio';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [
    activities,
    questions,
    heroTitles,
    faqs,
    stack,
    availability,
    projects,
    bioCustomised,
  ] = await Promise.all([
    getActivities(),
    getQuestionCards(),
    getHeroTitles(),
    getFAQs(),
    getStackItems(),
    getAvailability(),
    getProjects(),
    isBioCustomised(),
  ]);

  const cards = [
    { href: '/admin/projects', label: 'Projects', count: projects.length },
    {
      href: '/admin/bio',
      label: 'Bio (chat prompt)',
      count: bioCustomised ? 'custom' : 'default',
    },
    { href: '/admin/activities', label: 'Activities', count: activities.length },
    { href: '/admin/questions', label: 'Question cards', count: questions.length },
    { href: '/admin/hero', label: 'Hero titles', count: heroTitles.length },
    { href: '/admin/faq', label: 'FAQ', count: faqs.length },
    { href: '/admin/stack', label: 'Stack items', count: stack.length },
    {
      href: '/admin/availability',
      label: 'Availability',
      count: availability.status,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
          >
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              {c.label}
            </div>
            <div className="mt-1 text-2xl font-semibold">{c.count}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
