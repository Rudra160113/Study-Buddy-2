
// This file holds the Genkit flow for suggesting relevant study resources based on user-uploaded notes and specified topics.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview This file defines the Genkit flow for suggesting study resources.
 *
 * - suggestResources - A function that takes user notes and topics as input and suggests relevant study resources.
 * - SuggestResourcesInput - The input type for the suggestResources function.
 * - SuggestResourcesOutput - The return type for the suggestResources function.
 */

const SuggestResourcesInputSchema = z.object({
  notes: z.string().describe('The notes uploaded by the user.'),
  topics: z.string().describe('The specific topics the user is studying.'),
});
export type SuggestResourcesInput = z.infer<typeof SuggestResourcesInputSchema>;

const SuggestResourcesOutputSchema = z.object({
  suggestedResources: z
    .string()
    .describe('A list of suggested resources relevant to the notes and topics.'),
});
export type SuggestResourcesOutput = z.infer<typeof SuggestResourcesOutputSchema>;

export async function suggestResources(input: SuggestResourcesInput): Promise<SuggestResourcesOutput> {
  return suggestResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResourcesPrompt',
  input: {schema: SuggestResourcesInputSchema},
  output: {schema: SuggestResourcesOutputSchema},
  prompt: `You are a helpful study assistant. A student has uploaded their notes and specified topics they are studying.  Suggest relevant study resources based on the provided notes and topics.

Notes: {{{notes}}}
Topics: {{{topics}}}

Suggested Resources:`,
});

const suggestResourcesFlow = ai.defineFlow(
  {
    name: 'suggestResourcesFlow',
    inputSchema: SuggestResourcesInputSchema,
    outputSchema: SuggestResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
