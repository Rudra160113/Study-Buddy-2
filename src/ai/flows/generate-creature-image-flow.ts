
'use server';
/**
 * @fileOverview A Genkit flow to generate an image of a Jurassic creature.
 *
 * - generateCreatureImage - A function that takes a creature name and returns an image data URI.
 * - GenerateCreatureImageInput - The input type for the generateCreatureImage function.
 * - GenerateCreatureImageOutput - The return type for the generateCreatureImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCreatureImageInputSchema = z.object({
  creatureName: z.string().describe('The name of the Jurassic creature for which to generate an image (e.g., "Tyrannosaurus Rex").'),
});
export type GenerateCreatureImageInput = z.infer<typeof GenerateCreatureImageInputSchema>;

const GenerateCreatureImageOutputSchema = z.object({
  imageUrl: z.string().describe("A data URI of the generated image. Format: data:image/png;base64,..."),
});
export type GenerateCreatureImageOutput = z.infer<typeof GenerateCreatureImageOutputSchema>;

export async function generateCreatureImage(input: GenerateCreatureImageInput): Promise<GenerateCreatureImageOutput> {
  return generateCreatureImageFlow(input);
}

const generateCreatureImageFlow = ai.defineFlow(
  {
    name: 'generateCreatureImageFlow',
    inputSchema: GenerateCreatureImageInputSchema,
    outputSchema: GenerateCreatureImageOutputSchema,
  },
  async ({ creatureName }) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a realistic image of a ${creatureName} from the Jurassic period. The creature should be the main focus, clearly visible, and well-framed. Aim for a full body shot or a significant portion of the creature. The creature should ideally be facing the viewer or in profile, not primarily showing its back. Use a simple natural environment or a white background.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (media && media.url) {
        return { imageUrl: media.url };
      } else {
        console.error('Image generation did not return a media URL for creature:', creatureName);
        return { imageUrl: `https://placehold.co/300x200.png?text=Error:${creatureName.substring(0,10)}` };
      }
    } catch (e) {
      console.error("Image generation failed for creature:", creatureName, e);
      return { imageUrl: `https://placehold.co/300x200.png?text=Failed:${creatureName.substring(0,10)}` };
    }
  }
);
