
'use server';
/**
 * @fileOverview A Genkit flow to analyze an image based on a user's query.
 *
 * - analyzeImage - A function that takes an image data URI and a user query, returning an AI analysis.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userQuery: z.string().describe("The user's question or prompt about the image."),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  analysis: z.string().describe('The AI-generated textual analysis or answer based on the image and query.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const imageAnalysisPrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: { schema: AnalyzeImageInputSchema },
  output: { schema: AnalyzeImageOutputSchema },
  prompt: `You are an expert image analyst. Analyze the provided image based on the user's query.
Provide a clear, concise, and relevant response. If the query is open-ended (e.g., "describe this image"), provide a general description.
If the query is specific, focus on answering that specific question in relation to the image.

User's query: "{{userQuery}}"
Image:
{{media url=imageDataUri}}

Analysis:`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    const { output } = await imageAnalysisPrompt(input);

    if (!output || !output.analysis) {
      console.error("AI failed to generate image analysis:", output);
      return {
        analysis: "I'm sorry, I couldn't analyze the image with that query. Please try rephrasing or provide a different image.",
      };
    }
    return output;
  }
);
