import { defineGenkit } from '@genkit-ai/next';
import { init } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

init({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  // Set your project ID here. If you don't have one, see
  // https://cloud.google.com/gemini/docs/genkit-project-setup
  // projectId: 'your-project-id',
});

// Import all the flows that should be exposed via the API route.
import '@/ai/flows/suggest-resources.ts';
import '@/ai/flows/study-buddy-search-flow.ts';
import '@/ai/flows/generate-coding-lesson-flow.ts';
import '@/ai/flows/interpret-code-flow.ts';
import '@/ai/flows/suggest-code-correction-flow.ts';
import '@/ai/flows/generate-math-word-problem-flow.ts';
import '@/ai/flows/generate-bodmas-problem-flow.ts';
import '@/ai/flows/generate-dice-probability-problem-flow.ts';
import '@/ai/flows/generate-pattern-image-flow.ts';
import '@/ai/flows/generate-hindi-riddle-flow.ts';
import '@/ai/flows/generate-logic-riddle-flow.ts';
import '@/ai/flows/generate-k12-quiz-question-flow.ts';
import '@/ai/flows/generate-hindi-joke-flow.ts';
import '@/ai/flows/generate-science-facts-flow.ts';
import '@/ai/flows/generate-science-highlight-flow.ts';
import '@/ai/flows/generate-custom-questions-flow.ts';
import '@/ai/flows/friendly-query-handler-flow.ts';
import '@/ai/flows/generate-creature-image-flow.ts';
import '@/ai/flows/analyze-image-flow.ts';

// Expose the flows using the Genkit Next.js plugin.
export const { GET, POST } = defineGenkit();
