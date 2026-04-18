import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProjectEditor from './ProjectEditor';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      links: { orderBy: { order: 'asc' } },
    },
  });
  if (!project) notFound();

  return <ProjectEditor initial={project} />;
}
