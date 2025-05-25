
'use server';
/**
 * @fileOverview A Genkit flow to handle user queries in a friendly and polite manner.
 *
 * - handleFriendlyQuery - A function that takes a user's query and returns a helpful answer.
 * - FriendlyQueryInput - The input type for the handleFriendlyQuery function.
 * - FriendlyQueryOutput - The return type for the handleFriendlyQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FriendlyQueryInputSchema = z.object({
  userQuery: z.string().describe("The user's question or doubt."),
});
export type FriendlyQueryInput = z.infer<typeof FriendlyQueryInputSchema>;

const FriendlyQueryOutputSchema = z.object({
  answer: z.string().describe('A friendly, polite, and helpful answer to the query.'),
});
export type FriendlyQueryOutput = z.infer<typeof FriendlyQueryOutputSchema>;

export async function handleFriendlyQuery(input: FriendlyQueryInput): Promise<FriendlyQueryOutput> {
  return friendlyQueryHandlerFlow(input);
}

const friendlyQueryPrompt = ai.definePrompt({
  name: 'friendlyQueryPrompt',
  input: { schema: FriendlyQueryInputSchema },
  output: { schema: FriendlyQueryOutputSchema },
  prompt: `You are a very friendly, patient, and understanding AI Study Buddy. Your main goal is to help students with their doubts, no matter how simple or complex they might seem.
A student is asking you a question because they might be hesitant to ask a teacher or feel unsure.
Please answer their query in a clear, encouraging, and polite way.
Break down complex topics into easily digestible parts if necessary.
Avoid jargon where possible, or explain it if essential.
Make the student feel comfortable and supported.

User's question: "{{userQuery}}"

Provide a helpful and encouraging answer.
`,
});

const friendlyQueryHandlerFlow = ai.defineFlow(
  {
    name: 'friendlyQueryHandlerFlow',
    inputSchema: FriendlyQueryInputSchema,
    outputSchema: FriendlyQueryOutputSchema,
  },
  async (input) => {
    const { output } = await friendlyQueryPrompt(input);

    if (!output || !output.answer) {
      console.error("AI failed to generate a friendly answer:", output);
      return {
        answer: "I'm sorry, I'm having a little trouble understanding that right now. Could you try rephrasing your question? I'm here to help!",
      };
    }
    return output;
  }
);
