import { getHeroTitles } from '@/lib/content';
import HeroEditor from './HeroEditor';

export default async function HeroPage() {
  const heroTitles = await getHeroTitles();
  return <HeroEditor initial={heroTitles} />;
}
