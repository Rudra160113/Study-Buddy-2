
'use server';
/**
 * @fileOverview A Genkit flow to generate a highlight of a recent scientific discovery or development.
 *
 * - generateScienceHighlight - A function that returns a science highlight.
 * - GenerateScienceHighlightOutput - The return type for the generateScienceHighlight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// No input schema needed for a general highlight request for now.
// Could be extended to take a category in the future.

const GenerateScienceHighlightOutputSchema = z.object({
  title: z.string().describe('A concise and engaging title for the science highlight.'),
  summary: z.string().describe('A brief summary (1-2 sentences) of the scientific discovery or development.'),
  explanation: z.string().describe('A more detailed explanation of the highlight, suitable for a general audience (2-4 paragraphs).'),
  field: z.string().describe('The general scientific field this highlight relates to (e.g., Astrophysics, Particle Physics, Biology, Medicine, Chemistry).'),
});
export type GenerateScienceHighlightOutput = z.infer<typeof GenerateScienceHighlightOutputSchema>;

export async function generateScienceHighlight(): Promise<GenerateScienceHighlightOutput> {
  return generateScienceHighlightFlow();
}

const scienceHighlightGenerationPrompt = ai.definePrompt({
  name: 'generateScienceHighlightPrompt',
  output: { schema: GenerateScienceHighlightOutputSchema },
  prompt: `You are a science journalist AI. Your task is to provide a highlight of one recent and significant scientific discovery or development.
Focus on something noteworthy that would be understandable and interesting to a general audience.
The information should be presented as if it's a recent highlight, but acknowledge that "recent" is relative to your last knowledge update.
Avoid highly speculative or unconfirmed findings unless clearly stated as such.

Provide the output as a JSON object with the following fields:
-   "title": A concise and engaging title for the science highlight.
-   "summary": A brief summary (1-2 sentences) of the discovery or development.
-   "explanation": A more detailed explanation (2-4 paragraphs) suitable for a general audience. Explain key concepts simply.
-   "field": The general scientific field this highlight primarily relates to (e.g., Astrophysics, Particle Physics, Biology, Medicine, Chemistry, Earth Science).

Example of a desired output structure:
{
  "title": "New Exoplanet with Water Vapor Detected",
  "summary": "Astronomers have discovered a new exoplanet, K2-18b, within the habitable zone of its star, and have detected water vapor in its atmosphere.",
  "explanation": "K2-18b is an exoplanet orbiting a red dwarf star about 124 light-years away. Using data from space telescopes, scientists analyzed the starlight filtered through the planet's atmosphere. This analysis revealed the distinct signature of water vapor, a key ingredient for life as we know it. \n\nWhile the presence of water vapor doesn't guarantee life, it makes K2-18b a prime candidate for further study. The planet is significantly larger than Earth, classified as a 'Super-Earth' or 'mini-Neptune'. Future observations will aim to understand more about its atmospheric composition and surface conditions to assess its potential habitability.",
  "field": "Astrophysics"
}

Generate a new science highlight. Do not just repeat the example.
If you are discussing a discovery about a new element, for instance, ensure the information is presented clearly and accurately according to scientific consensus.
`,
});

const generateScienceHighlightFlow = ai.defineFlow(
  {
    name: 'generateScienceHighlightFlow',
    outputSchema: GenerateScienceHighlightOutputSchema,
  },
  async () => {
    const { output } = await scienceHighlightGenerationPrompt({}); 

    if (!output || !output.title || !output.summary || !output.explanation || !output.field) {
      console.error("AI failed to generate a valid science highlight:", output);
      // Provide a fallback highlight
      return {
        title: "AI Could Not Fetch a Live Highlight",
        summary: "The AI is currently unable to fetch a specific live science highlight.",
        explanation: "Please try again later. In the meantime, many fascinating scientific discoveries are constantly being made across various fields such as space exploration, medical research, and technological advancements. Keeping up with reputable science news sources is a great way to stay informed.",
        field: "General Science",
      };
    }
    return output;
  }
);

