
'use server';
/**
 * @fileOverview A Genkit flow to generate math word problems with increasing difficulty.
 *
 * - generateMathWordProblem - A function that takes a level and returns a word problem and its answer.
 * - GenerateMathWordProblemInput - The input type for the generateMathWordProblem function.
 * - GenerateMathWordProblemOutput - The return type for the generateMathWordProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMathWordProblemInputSchema = z.object({
  level: z.number().min(1).max(100).describe('The current game level, used to determine problem difficulty (1-100).'),
});
export type GenerateMathWordProblemInput = z.infer<typeof GenerateMathWordProblemInputSchema>;

const GenerateMathWordProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The math word problem text.'),
  answer: z.number().describe('The numerical answer to the word problem.'),
});
export type GenerateMathWordProblemOutput = z.infer<typeof GenerateMathWordProblemOutputSchema>;

export async function generateMathWordProblem(input: GenerateMathWordProblemInput): Promise<GenerateMathWordProblemOutput> {
  return generateMathWordProblemFlow(input);
}

const problemGenerationPrompt = ai.definePrompt({
  name: 'generateMathWordProblemPrompt',
  input: { schema: GenerateMathWordProblemInputSchema },
  output: { schema: GenerateMathWordProblemOutputSchema },
  prompt: `You are a math problem generator for a game called "Super Sums: Word Challenge".
The game has 100 levels. Your task is to create a math word problem and its numerical answer.
The difficulty of the problem MUST scale with the provided 'level'.

Current Level: {{level}}

Instructions for difficulty scaling:
-   **Levels 1-10 (Beginner):** Single-step addition or subtraction. Small numbers (e.g., 1-20). Very simple scenarios. Example: "Sarah has 5 apples. Tom gives her 3 more. How many apples does Sarah have now?"
-   **Levels 11-25 (Easy):** Two-step problems involving addition and subtraction, or single-step multiplication (small numbers, e.g., 2x3, 5x4) or division (e.g., 10/2, 12/3). Numbers up to 50. Slightly more complex scenarios. Example: "A bus has 15 passengers. 7 passengers get off at the first stop, and 4 new passengers get on. How many passengers are on the bus?" or "If a box contains 6 crayons, how many crayons are in 4 boxes?"
-   **Levels 26-50 (Medium):** Multi-step problems (2-3 steps) involving addition, subtraction, multiplication, and division. Numbers up to 100. Problems might involve simple fractions (e.g., half of 20) or decimals in a currency context (e.g., $2.50 + $1.25). Example: "John bought 3 packs of pencils. Each pack has 12 pencils. He then gave 8 pencils to his friend. How many pencils does John have left?"
-   **Levels 51-75 (Hard):** More complex multi-step problems (3+ steps). May involve percentages (e.g., 10% of 50), ratios, or interpreting simple charts/data (if you can describe it in text). Larger numbers, but keep calculations manageable without a calculator. Example: "A shop sells t-shirts for $15 each. There's a 20% discount today. If Maria buys 2 t-shirts, how much does she pay in total?"
-   **Levels 76-100 (Expert):** Challenging multi-step problems that require careful reading and logical thinking. May involve more abstract concepts or require setting up simple equations (though the answer should still be a single number). Ensure the math itself is solvable. Example: "A train travels 240 km in 3 hours. A car travels at a speed that is 10 km/h slower than the train. How far will the car travel in 5 hours?"

**Crucial Output Requirements:**
1.  **problemStatement:** The text of the word problem. It should be engaging and clear.
2.  **answer:** The single numerical answer to the problem. Ensure this answer is an integer or a simple decimal if appropriate for the context (e.g. money). Do NOT include units in the 'answer' field, just the number.

Example for a low level:
Input: { level: 3 }
Output: { "problemStatement": "A cat has 4 legs. A bird has 2 legs. How many legs do they have in total?", "answer": 6 }

Example for a mid level:
Input: { level: 40 }
Output: { "problemStatement": "A bakery made 120 cookies. They sold 3/4 of them in the morning and 25 cookies in the afternoon. How many cookies were left at the end of the day?", "answer": 5 }

Make sure the problem is solvable and the answer is correct.
The problem statement should NOT explicitly state the operations needed (e.g., don't say "Add 5 and 3"). The user needs to figure that out from the word problem.
Do NOT include the answer in the problemStatement.
`,
});

const generateMathWordProblemFlow = ai.defineFlow(
  {
    name: 'generateMathWordProblemFlow',
    inputSchema: GenerateMathWordProblemInputSchema,
    outputSchema: GenerateMathWordProblemOutputSchema,
  },
  async (input) => {
    // Ensure level is within a reasonable range for the prompt's design, e.g. if prompt handles up to 100.
    const saneLevel = Math.max(1, Math.min(input.level, 100));

    const { output } = await problemGenerationPrompt({ level: saneLevel });

    if (!output || typeof output.answer !== 'number' || !output.problemStatement) {
      console.error("AI failed to generate a valid word problem or answer format:", output);
      // Provide a fallback problem to prevent game from breaking
      return {
        problemStatement: "The AI is taking a nap! If you have 2 apples and get 2 more, how many do you have?",
        answer: 4,
      };
    }
    return output;
  }
);

    