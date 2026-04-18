import { prisma } from '@/lib/db';
import Link from 'next/link';
import ProjectsListClient from './ProjectsListClient';

export default async function AdminProjectsListPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { images: true, links: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No projects yet. Click &ldquo;New project&rdquo; to add one.
        </p>
      ) : (
        <ProjectsListClient
          initial={projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category,
            featured: p.featured,
            order: p.order,
            imageCount: p._count.images,
            linkCount: p._count.links,
          }))}
        />
      )}
    </div>
  );
}
