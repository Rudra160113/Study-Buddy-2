
'use server';
/**
 * @fileOverview A Genkit flow to generate a simple image based on a text prompt.
 *
 * - generatePatternImage - A function that takes a text prompt and returns an image data URI.
 * - GeneratePatternImageInput - The input type for the generatePatternImage function.
 * - GeneratePatternImageOutput - The return type for the generatePatternImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePatternImageInputSchema = z.object({
  prompt: z.string().describe('A simple text prompt for image generation (e.g., "a red apple", "a blue ball").'),
});
export type GeneratePatternImageInput = z.infer<typeof GeneratePatternImageInputSchema>;

const GeneratePatternImageOutputSchema = z.object({
  imageUrl: z.string().describe("A data URI of the generated image. Format: data:image/png;base64,..."),
});
export type GeneratePatternImageOutput = z.infer<typeof GeneratePatternImageOutputSchema>;

export async function generatePatternImage(input: GeneratePatternImageInput): Promise<GeneratePatternImageOutput> {
  return generatePatternImageFlow(input);
}

const generatePatternImageFlow = ai.defineFlow(
  {
    name: 'generatePatternImageFlow',
    inputSchema: GeneratePatternImageInputSchema,
    outputSchema: GeneratePatternImageOutputSchema,
  },
  async ({ prompt }) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a very simple, clear, iconic image of: ${prompt}. Solid background. Distinguishable silhouette. Good for a memory game.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
          // Attempt to guide towards smaller, simpler images if possible (model dependent)
          // generationConfig: { // This is a hypothetical config, actual options vary by model/API
          //   candidateCount: 1,
          //   imageDetails: { width: 128, height: 128 }, // Example, may not be supported
          // },
        },
      });

      if (media && media.url) {
        return { imageUrl: media.url };
      } else {
        console.error('Image generation did not return a media URL for prompt:', prompt);
        // Fallback or error image
        return { imageUrl: `https://placehold.co/128x128.png?text=Error` };
      }
    } catch (e) {
      console.error("Image generation failed for prompt:", prompt, e);
       // Fallback or error image
      return { imageUrl: `https://placehold.co/128x128.png?text=Failed` };
    }
  }
);
