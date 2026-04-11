import { tool } from 'ai';
import { z } from 'zod';
import { getAvailability as fetchAvailability } from '@/lib/content';

export const getAvailability = tool({
  description:
    "Show Nur's current availability for work, contracts, research collaborations, and full-time roles. Use when the user asks about hiring, availability, whether Nur is open to opportunities, or timezone.",
  inputSchema: z.object({}),
  execute: async () => {
    const a = await fetchAvailability();
    return {
      status: a.status,
      headline: a.headline,
      detailsMd: a.detailsMd,
      timezone: a.timezone,
    };
  },
});
