import { getAvailability } from '@/lib/content';
import AvailabilityEditor from './AvailabilityEditor';

export default async function AdminAvailabilityPage() {
  const availability = await getAvailability();
  return (
    <AvailabilityEditor
      initial={{
        status: availability.status,
        headline: availability.headline,
        detailsMd: availability.detailsMd,
        timezone: availability.timezone,
        updatedAt: availability.updatedAt.toString(),
      }}
    />
  );
}
