import { getActivities } from '@/lib/content';
import ActivitiesEditor from './ActivitiesEditor';

export default async function ActivitiesPage() {
  const activities = await getActivities();
  return <ActivitiesEditor initial={activities} />;
}
