import { tool } from 'ai';
import { z } from 'zod';
import { getStackItems } from '@/lib/content';

export const getStack = tool({
  description:
    "Show the tools Nur actually reaches for day-to-day — editor, AI tooling, frameworks, runtime, infra. This is distinct from the full getSkills dump; this is 'what I actually use'. Use when the user asks what Nur's daily stack, tools, or dev setup looks like.",
  inputSchema: z.object({}),
  execute: async () => {
    const items = await getStackItems();
    const byCategory: Record<string, { name: string; note: string | null }[]> =
      {};
    for (const i of items) {
      (byCategory[i.category] ??= []).push({ name: i.name, note: i.note });
    }
    return { stack: byCategory };
  },
});
