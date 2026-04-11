import { getStackItems } from '@/lib/content';
import StackEditor from './StackEditor';

export default async function AdminStackPage() {
  const stack = await getStackItems();
  return <StackEditor initial={stack} />;
}
