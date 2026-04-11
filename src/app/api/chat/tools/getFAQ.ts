import { tool } from 'ai';
import { z } from 'zod';
import { getFAQs } from '@/lib/content';

export const getFAQ = tool({
  description:
    "Show Nur's frequently asked questions and answers — meta/process questions like 'why this stack', 'why Ubuntu VPS', 'why a chat-first portfolio'. Use when the user asks about how the site works, why choices were made, or general FAQ topics.",
  inputSchema: z.object({}),
  execute: async () => {
    const faqs = await getFAQs();
    return {
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    };
  },
});
