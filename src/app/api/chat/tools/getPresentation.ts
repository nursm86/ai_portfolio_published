import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Md. Nur Islam. Use it to answer “Who are you?” or “Tell me about yourself”.',
  inputSchema: z.object({}),
  execute: async () => {
    return {
      presentation:
        "I'm Md. Nur Islam — a full-stack developer focused on AI, based in Sydney (from Dhaka). I’m doing a Master’s in AI (Cybersecurity) at Western Sydney University with 4+ years of software engineering experience. For my current workspace, I build WordPress plugins, manage servers,obsessed with AI-powered products.",
    };
  },
});
