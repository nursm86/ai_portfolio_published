import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getCrazy } from './tools/getCrazy';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSport';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getSports,
      getCrazy,
      getInternship,
    };

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT.content,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(2),
      temperature: 1,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('Global error:', err);
    return new Response(
      err instanceof Error ? err.message : String(err),
      { status: 500 }
    );
  }
}
