import { getBio, isBioCustomised } from '@/lib/bio';
import BioEditor from './BioEditor';

export default async function AdminBioPage() {
  const [content, customised] = await Promise.all([
    getBio(),
    isBioCustomised(),
  ]);
  return <BioEditor initialContent={content} customised={customised} />;
}
