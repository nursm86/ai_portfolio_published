import Image from 'next/image';
import { Image as Img } from 'lucide-react';
import { ChevronRight, Link } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
// Project content array — add your own projects here
export const PROJECT_CONTENT: {
  title: string;
  description: string;
  techStack: string[];
  date: string;
  links: { name: string; url: string }[];
  images: { src: string; alt: string }[];
}[] = [
  {
    title: 'GPA Platform',
    description:
      'Full-stack digital marketplace and service delivery platform for the Global Psychics Association. A monolithic full-stack application with modular architecture featuring 208 database models, 100+ API endpoints, and 48+ route modules. Includes real-time service delivery (paid chat readings, phone readings via Twilio IVR), live events with video integration, e-commerce engine, courses & academy, wallet & financial system, CMS with page builder, NFC keyring tracking, and a full admin suite.',
    techStack: [
      'Node.js',
      'Express.js',
      'TypeScript',
      'React 18',
      'Vite',
      'Prisma ORM',
      'MySQL',
      'Zustand',
      'Tailwind CSS',
      'Stripe',
      'Twilio',
      'WebRTC',
      'Framer Motion',
    ],
    date: '2025',
    links: [],
    images: [],
  },
  {
    title: 'V2V Negotiation',
    description:
      'Automated Negotiation between Autonomous Vehicles — a research project at Western Sydney University supervised by Professor Dongmo Zhang. Using SUMO simulation and OpenDRIVE to model vehicle-to-vehicle communication. Currently focused on the narrow bridge problem where two autonomous vehicles must negotiate right-of-way through natural language-inspired protocols.',
    techStack: ['Python', 'SUMO', 'OpenDRIVE', 'TraCI'],
    date: '2025',
    links: [
      {
        name: 'Supervisor - Prof. Dongmo Zhang',
        url: 'https://scholar.google.com/citations?user=Mgqp7NMAAAAJ&hl=en',
      },
    ],
    images: [],
  },
];

// Define interface for project prop
interface ProjectProps {
  title: string;
  description?: string;
  techStack?: string[];
  date?: string;
  links?: { name: string; url: string }[];
  images?: { src: string; alt: string }[];
}

const ProjectContent = ({ project }: { project: ProjectProps }) => {
  // Find the matching project data
  const projectData = PROJECT_CONTENT.find((p) => p.title === project.title);

  if (!projectData) {
    return <div>Project details not available</div>;
  }

  return (
    <div className="space-y-10">
      {/* Header section with description */}
      <div className="rounded-3xl bg-[#F5F5F7] p-8 dark:bg-[#1D1D1F]">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>{projectData.date}</span>
          </div>

          <p className="text-secondary-foreground font-sans text-base leading-relaxed md:text-lg">
            {projectData.description}
          </p>

          {/* Tech stack */}
          <div className="pt-4">
            <h3 className="mb-3 text-sm tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {projectData.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Links section */}
      {projectData.links && projectData.links.length > 0 && (
        <div className="mb-24">
          <div className="px-6 mb-4 flex items-center gap-2">
            <h3 className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
              Links
            </h3>
            <Link className="text-muted-foreground w-4" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {projectData.links.map((link, index) => (
                <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F5F5F7] flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-[#E5E5E7] dark:bg-neutral-800 dark:hover:bg-neutral-700"
                >
                <span className="font-light capitalize">{link.name}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
            ))}
          </div>
        </div>
      )}

      {/* Images gallery */}
      {projectData.images && projectData.images.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {projectData.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-2xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main data export — add your own projects here
export const data: {
  category: string;
  title: string;
  src: string;
  content: React.ReactNode;
}[] = [
  {
    category: 'Full-Stack Platform',
    title: 'GPA Platform',
    src: '',
    content: (
      <ProjectContent
        project={{ title: 'GPA Platform' }}
      />
    ),
  },
  {
    category: 'Research Project',
    title: 'V2V Negotiation',
    src: '',
    content: (
      <ProjectContent
        project={{ title: 'V2V Negotiation' }}
      />
    ),
  },
];
