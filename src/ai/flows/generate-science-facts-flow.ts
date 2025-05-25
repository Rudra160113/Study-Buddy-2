
'use server';
/**
 * @fileOverview A Genkit flow to generate a list of interesting science facts with explanations.
 *
 * - generateScienceFacts - A function that returns an array of science facts.
 * - GenerateScienceFactsOutput - The return type for the generateScienceFacts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScienceFactSchema = z.object({
  fact: z.string().describe('A concise and interesting science fact.'),
  explanation: z.string().describe('A brief explanation of the science fact, making it understandable for a general audience.'),
});

const GenerateScienceFactsOutputSchema = z.object({
  facts: z.array(ScienceFactSchema).length(5).describe('An array of 5 unique and verifiable science facts, each with an explanation. The facts should cover diverse scientific fields.'),
});
export type GenerateScienceFactsOutput = z.infer<typeof GenerateScienceFactsOutputSchema>;

export async function generateScienceFacts(): Promise<GenerateScienceFactsOutput> {
  return generateScienceFactsFlow();
}

const scienceFactsGenerationPrompt = ai.definePrompt({
  name: 'generateScienceFactsPrompt',
  output: { schema: GenerateScienceFactsOutputSchema },
  prompt: `You are an expert science communicator. Your task is to generate a list of 5 unique and verifiable science facts.
Each fact must be accompanied by a brief, clear, and engaging explanation suitable for a general audience.
Aim for facts from diverse scientific fields (e.g., physics, biology, chemistry, astronomy, earth science).
Ensure the facts are interesting and not overly common.
Provide the output as a JSON object containing a 'facts' array, where each element is an object with 'fact' and 'explanation' strings.

Example of a single fact object:
{
  "fact": "Honey never spoils.",
  "explanation": "Due to its low moisture content and acidic pH, honey creates an inhospitable environment for bacteria and microorganisms, allowing it to last indefinitely."
}

Generate 5 such facts. Ensure variety if this prompt is called multiple times.
`,
});

const generateScienceFactsFlow = ai.defineFlow(
  {
    name: 'generateScienceFactsFlow',
    outputSchema: GenerateScienceFactsOutputSchema,
  },
  async () => {
    const { output } = await scienceFactsGenerationPrompt({}); 

    if (!output || !output.facts || output.facts.length !== 5) {
      console.error("AI failed to generate valid science facts:", output);
      // Provide fallback facts
      return {
        facts: [
          { fact: "The Earth is not perfectly round.", explanation: "It's an oblate spheroid, meaning it bulges at the equator and is flatter at the poles due to centrifugal force from its rotation." },
          { fact: "A single day on Venus is longer than its year.", explanation: "Venus rotates very slowly on its axis (one rotation takes about 243 Earth days) but orbits the Sun faster (one orbit takes about 225 Earth days)." },
          { fact: "Octopuses have three hearts.", explanation: "Two hearts pump blood through the gills, and the third circulates blood to the rest of the body." },
          { fact: "Bananas are berries, but strawberries are not.", explanation: "Botanically, berries are simple fruits stemming from one flower with one ovary and typically have many seeds. Bananas fit this, while strawberries are aggregate accessory fruits." },
          { fact: "It's impossible to hum while holding your nose.", explanation: "Humming requires expelling air through your nose. If your nose is closed, the air cannot escape, making humming impossible." },
        ],
      };
    }
    return output;
  }
);
