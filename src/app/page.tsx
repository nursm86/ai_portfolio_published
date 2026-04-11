import { getActivities, getHeroTitles, getQuestionCards } from '@/lib/content';
import HomeClient from './HomeClient';

// Content is DB-backed and editable via /admin at runtime — never cache.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [activities, questions, heroTitlesRows] = await Promise.all([
    getActivities(),
    getQuestionCards(),
    getHeroTitles(),
  ]);

  return (
    <HomeClient
      activities={activities.map((a) => ({
        id: a.id,
        label: a.label,
        iconName: a.iconName,
        color: a.color,
        href: a.href,
      }))}
      questions={questions.map((q) => ({
        id: q.id,
        key: q.key,
        prompt: q.prompt,
        iconName: q.iconName,
        color: q.color,
      }))}
      heroTitles={heroTitlesRows.map((h) => h.text)}
    />
  );
}
