// Central icon registry. Dynamic content stores icon NAMES as strings in the DB;
// components look them up here at render time. To add a new icon:
//   1) import it from lucide-react below
//   2) add it to the registry object
// The admin icon picker automatically shows everything in here.

import {
  Award,
  Bot,
  Brain,
  BriefcaseBusiness,
  Calendar,
  Car,
  Check,
  Cloud,
  Code,
  Code2,
  Cpu,
  Flag,
  Globe,
  GraduationCap,
  HelpCircle,
  Hexagon,
  Laugh,
  Layers,
  Lightbulb,
  Mail,
  MessageSquare,
  PenTool,
  Rocket,
  Sparkles,
  Target,
  Terminal,
  UserRoundSearch,
  UserSearch,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const iconRegistry = {
  Award,
  Bot,
  Brain,
  BriefcaseBusiness,
  Calendar,
  Car,
  Check,
  Cloud,
  Code,
  Code2,
  Cpu,
  Flag,
  Globe,
  GraduationCap,
  HelpCircle,
  Hexagon,
  Laugh,
  Layers,
  Lightbulb,
  Mail,
  MessageSquare,
  PenTool,
  Rocket,
  Sparkles,
  Target,
  Terminal,
  UserRoundSearch,
  UserSearch,
  Users,
  Wrench,
  Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;

export const iconNames = Object.keys(iconRegistry) as IconName[];

export function getIcon(name: string | null | undefined): LucideIcon {
  if (name && name in iconRegistry) {
    return iconRegistry[name as IconName];
  }
  return Sparkles; // safe fallback
}
