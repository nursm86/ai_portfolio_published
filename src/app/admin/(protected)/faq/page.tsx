import { getFAQs } from '@/lib/content';
import FaqEditor from './FaqEditor';

export default async function AdminFaqPage() {
  const faqs = await getFAQs();
  return <FaqEditor initial={faqs} />;
}
