import { tool } from 'ai';
import { z } from 'zod';

export const getInternship = tool({
  description:
    "Returns a concise summary of the internship / ICT practicum placement Md. Nur Islam is seeking, plus contact info.",
  inputSchema: z.object({}),
  execute: async () => {
    return `Here’s what I’m looking for 👇

- 📅 **Format**: ICT Practicum placement (INFO7004, 120 hours, Spring 2026) or a 3–6 month internship
- 🗓️ **Availability**: Monday, Wednesday and Saturday on site; other days remote
- 🌍 **Location**: Sydney, Australia · open to remote/hybrid
- 🧑‍💻 **Focus**: AI and business workflow automation, plus full-stack development (Node.js/React/.NET)
- 🛠️ **Stack**: OpenAI API, Ollama (self-hosted LLMs), n8n, OpenClaw, function calling; TypeScript, Node.js, Express, React, Next.js, C#, ASP.NET MVC5, Python; MySQL, MS SQL Server, Prisma
- ✅ **What I bring**:
  • Production AI at my current job: customer chatbot with live order lookups, AI marketing emails, email-triage agents, one-click AI product descriptions
  • Self-hosted LLM (Ollama + Gemma 12B) behind Cloudflare Zero Trust — unlimited inference, no per-token cost
  • Nine production websites, n8n and Matomo running on an Ubuntu server I manage alone
  • Before that: Bangladesh's national online admission system (~350k users/yr; ~BDT 20M processed) as a .NET developer

📬 **Contact**
- Email: nursm86@gmail.com
- Phone: 0491 187 405
- LinkedIn: https://www.linkedin.com/in/md-nur-islam-00316015a/
- GitHub: https://github.com/nursm86
`;
  },
});
