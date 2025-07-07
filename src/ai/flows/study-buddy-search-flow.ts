
'use server';
/**
 * @fileOverview A Genkit flow to answer user queries and generate relevant images with conversation history.
 *
 * - studyBuddySearch - A function that takes a user query and returns a textual answer and an image URL.
 * - StudyBuddySearchInput - The input type for the studyBuddySearch function.
 * - StudyBuddySearchOutput - The return type for the studyBuddySearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyBuddySearchInputSchema = z.object({
  query: z.string().describe("The user's search query or question."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe("The conversation history."),
});
export type StudyBuddySearchInput = z.infer<typeof StudyBuddySearchInputSchema>;

const StudyBuddySearchOutputSchema = z.object({
  answer: z.string().describe("The textual answer to the user's query."),
  imageUrl: z.string().optional().describe("A data URI of a generated image relevant to the query or answer. Format: data:image/png;base64,..."),
});
export type StudyBuddySearchOutput = z.infer<typeof StudyBuddySearchOutputSchema>;

export async function studyBuddySearch(input: StudyBuddySearchInput): Promise<StudyBuddySearchOutput> {
  return studyBuddySearchFlow(input);
}

// Prompt for text generation
const textGenerationPrompt = ai.definePrompt({
  name: 'studyBuddyTextPrompt',
  input: { schema: StudyBuddySearchInputSchema },
  output: { schema: z.object({ answer: z.string() }) },
  system: `You are Study Buddy, a helpful AI assistant. Your primary goal is to provide clear, concise, and accurate information to help students with their studies.
  When a user asks a question, provide a comprehensive yet easy-to-understand answer.
  Use the context from the conversation history to answer follow-up questions. For example, if you just explained the "respiratory system" and the user asks "what are its functions", you must understand that "it" refers to the respiratory system.
  If the question is ambiguous, ask for clarification.
  If the query is very broad, try to narrow down the scope or provide a general overview with pointers to more specific topics.
  Always maintain a positive and encouraging tone.`,
  prompt: `{{{query}}}`,
});

// Flow definition
const studyBuddySearchFlow = ai.defineFlow(
  {
    name: 'studyBuddySearchFlow',
    inputSchema: StudyBuddySearchInputSchema,
    outputSchema: StudyBuddySearchOutputSchema,
  },
  async (input) => {
    // Generate text answer
    const { output: textOutput } = await textGenerationPrompt(input);
    const answer = textOutput!.answer;

    let imageUrl: string | undefined = undefined;
    try {
      // Generate image based on the answer or query.
      // Using a concise version of the answer for the image prompt.
      const imagePromptText = `Generate an educational and visually appealing image that illustrates the core concept of: "${answer.substring(0, 150)}${answer.length > 150 ? '...' : ''}". The image should be suitable for a study aid.`;
      
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
        prompt: imagePromptText,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must include TEXT
           safetySettings: [ // Relax safety settings for broader image generation
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (media && media.url) {
        imageUrl = media.url;
      }
    } catch (e) {
      console.error("Image generation failed:", e);
      // Optionally, you could set a default placeholder or leave imageUrl undefined
      // imageUrl = "https://placehold.co/500x300.png?text=Image+Generation+Failed";
    }

    return {
      answer,
      imageUrl,
    };
  }
);
