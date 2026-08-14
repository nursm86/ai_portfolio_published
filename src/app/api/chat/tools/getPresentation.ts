import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Md. Nur Islam. Use it to answer “Who are you?” or “Tell me about yourself”.',
  inputSchema: z.object({}),
  execute: async () => {
    return {
      presentation:
        "I'm Md. Nur Islam — a full-stack developer focused on AI, based in Sydney (from Dhaka). I'm doing a Master's in AI (Cybersecurity) at Western Sydney University, and I work as an Automation & DevOps Engineer at a Sydney company where I run nine production websites and build AI that ships: customer chatbots, marketing automation in n8n, email-triage agents, and a self-hosted LLM behind Cloudflare Zero Trust. Before Sydney I spent 3 years as a .NET developer building Bangladesh's national online admission system.",
    };
  },
});
