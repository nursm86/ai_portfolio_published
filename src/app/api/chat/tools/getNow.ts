import { tool } from 'ai';
import { z } from 'zod';
import { getNowPage } from '@/lib/content';

export const getNow = tool({
  description:
    "Show what Nur is focused on right now — current projects, this month's priorities, active research. Use when the user asks 'what are you working on', 'what's new', 'current focus', or similar.",
  inputSchema: z.object({}),
  execute: async () => {
    const now = await getNowPage();
    return {
      bodyMd: now.bodyMd,
      updatedAt:
        now.updatedAt instanceof Date
          ? now.updatedAt.toISOString()
          : String(now.updatedAt),
    };
  },
});
