import { tool } from 'ai';
import { z } from 'zod';

export const getInternship = tool({
  description:
    "Returns a concise summary of the internship Md. Nur Islam is seeking, plus contact info.",
  parameters: z.object({}),
  execute: async () => {
    return `Here’s what I’m looking for 👇

- 📅 **Duration**: 3–6 months — available from **October 2025**
- 🌍 **Location**: **Sydney, Australia** · open to **remote/hybrid**
- 🧑‍💻 **Focus**: Full-stack web development (.NET/Angular), API integrations, databases; AI features welcome
- 🛠️ **Stack**: C#, ASP.NET MVC5, Entity Framework, LINQ, REST APIs, Node.js, PHP (Laravel); MS SQL Server, MySQL, Oracle; Frontend: HTML5, CSS3, JavaScript, TypeScript, Angular/AngularJS, jQuery, Bootstrap
- ✅ **What I bring**:
  • Bangladesh National Online Admission System (~350k users/yr; ~BDT 20M processed)  
  • ZKTeco attendance device → server API (no PC relay)  
  • Payment gateway integrations (Bangladesh), SMS & Education Board APIs  
  • Server & security management (Ubuntu/WHM/cPanel) for e-commerce & paid platforms

📬 **Contact**
- Email: nursm86@gmail.com
- LinkedIn: https://www.linkedin.com/in/md-nur-islam-00316015a/
- GitHub: https://github.com/nursm86
`;
  },
});
