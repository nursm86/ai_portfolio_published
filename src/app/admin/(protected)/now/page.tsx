import { getNowPage } from '@/lib/content';
import NowEditor from './NowEditor';

export default async function AdminNowPage() {
  const now = await getNowPage();
  return (
    <NowEditor
      initial={{ bodyMd: now.bodyMd, updatedAt: now.updatedAt.toString() }}
    />
  );
}
