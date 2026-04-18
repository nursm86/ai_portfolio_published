'use client';

import ProjectChatCTA from '@/components/projects/story/ProjectChatCTA';
import ProjectHero from '@/components/projects/story/ProjectHero';
import ProjectImageGallery from '@/components/projects/story/ProjectImageGallery';
import ProjectLinkList from '@/components/projects/story/ProjectLinkList';
import ProjectMarkdown from '@/components/projects/story/ProjectMarkdown';
import ProjectSection from '@/components/projects/story/ProjectSection';
import TechChips from '@/components/projects/story/TechChips';

export type ProjectViewData = {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  coverImage: string | null;
  date: string;
  techStack: string; // JSON string
  chatPrompt: string | null;
  problemMd: string;
  solutionMd: string;
  architectureMd: string;
  impactMd: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
    caption: string | null;
    layout: string;
  }>;
  links: Array<{
    id: number;
    label: string;
    url: string;
    iconName: string | null;
  }>;
};

function parseStack(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProjectStoryView({ project }: { project: ProjectViewData }) {
  const stack = parseStack(project.techStack);
  const hasProblem = project.problemMd.trim().length > 0;
  const hasSolution = project.solutionMd.trim().length > 0;
  const hasArchitecture = project.architectureMd.trim().length > 0 || stack.length > 0;
  const hasImages = project.images.length > 0;
  const hasImpact = project.impactMd.trim().length > 0;
  const hasLinks = project.links.length > 0;

  // Section numbering — skip numbers for sections that don't render.
  let n = 0;
  const num = () => String(++n).padStart(2, '0');

  return (
    <article className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <ProjectHero
        title={project.title}
        tagline={project.tagline}
        category={project.category}
        date={project.date}
        coverImage={project.coverImage}
      />

      {hasProblem && (
        <ProjectSection number={num()} title="The problem">
          <ProjectMarkdown>{project.problemMd}</ProjectMarkdown>
        </ProjectSection>
      )}

      {hasSolution && (
        <ProjectSection number={num()} title="The solution">
          <ProjectMarkdown>{project.solutionMd}</ProjectMarkdown>
        </ProjectSection>
      )}

      {hasArchitecture && (
        <ProjectSection number={num()} title="Architecture">
          <TechChips stack={stack} />
          <ProjectMarkdown>{project.architectureMd}</ProjectMarkdown>
        </ProjectSection>
      )}

      {hasImages && (
        <ProjectSection number={num()} title="Screenshots">
          <ProjectImageGallery images={project.images} />
        </ProjectSection>
      )}

      {hasImpact && (
        <ProjectSection number={num()} title="By the numbers">
          <ProjectMarkdown>{project.impactMd}</ProjectMarkdown>
        </ProjectSection>
      )}

      {hasLinks && (
        <ProjectSection number={num()} title="Links">
          <ProjectLinkList links={project.links} />
        </ProjectSection>
      )}

      <ProjectChatCTA title={project.title} chatPrompt={project.chatPrompt} />
    </article>
  );
}
