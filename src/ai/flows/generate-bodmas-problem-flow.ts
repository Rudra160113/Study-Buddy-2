
'use server';
/**
 * @fileOverview A Genkit flow to generate complex BODMAS/PEMDAS math problems.
 *
 * - generateBodmasProblem - A function that takes a level and returns a math expression and its answer.
 * - GenerateBodmasProblemInput - The input type for the generateBodmasProblem function.
 * - GenerateBodmasProblemOutput - The return type for the generateBodmasProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBodmasProblemInputSchema = z.object({
  level: z.number().min(1).max(100).describe('The current game level, used to determine problem difficulty (1-100). Higher levels mean more complex expressions.'),
});
export type GenerateBodmasProblemInput = z.infer<typeof GenerateBodmasProblemInputSchema>;

const GenerateBodmasProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The complex mathematical expression string, e.g., "((15 + 5) * 3 - 10) / 5 + 2^3". It should be solvable using BODMAS/PEMDAS rules.'),
  answer: z.number().describe('The numerical answer to the expression. Should be an integer or a simple decimal if unavoidable.'),
});
export type GenerateBodmasProblemOutput = z.infer<typeof GenerateBodmasProblemOutputSchema>;

export async function generateBodmasProblem(input: GenerateBodmasProblemInput): Promise<GenerateBodmasProblemOutput> {
  return generateBodmasProblemFlow(input);
}

const bodmasProblemGenerationPrompt = ai.definePrompt({
  name: 'generateBodmasProblemPrompt',
  input: { schema: GenerateBodmasProblemInputSchema },
  output: { schema: GenerateBodmasProblemOutputSchema },
  prompt: `You are an expert math problem generator specializing in BODMAS/PEMDAS (Order of Operations) for a game called "BODMAS Masters".
The game has 100 levels. Your task is to create a complex mathematical expression and its numerical answer.
The difficulty of the expression MUST scale with the provided 'level'.

Current Level: {{level}}

Instructions for difficulty scaling:
-   **Levels 1-10 (Foundation):** 3-4 operations. Include parentheses. Basic arithmetic (+, -, *). Small integers (1-20). Example: "(7 + 3) * 2 - 5"
-   **Levels 11-25 (Intermediate):** 4-5 operations. Include division (ensure integer results or simple divisions like /2, /5, /10 if necessary). Nested parentheses (one level deep). Numbers up to 50. Example: "100 / ((6 - 2) * 5) + 3"
-   **Levels 26-50 (Challenging):** 5-7 operations. Introduce exponents (e.g., 2^3, 5^2). More complex nested parentheses. Numbers up to 100. Calculations should remain manageable. Example: "((15 + 5) * 3 - 10) / 5 + 2^3"
-   **Levels 51-75 (Advanced):** 6-8 operations. Combine exponents with multiple nested parentheses. Could involve slightly larger numbers but ensure the final answer isn't overly complex to calculate without a calculator for a skilled person. Example: "(4^2 + (20 - (6 * 2))) * (50 / 10) - 18"
-   **Levels 76-100 (Master):** 7-10 operations. Very complex expressions with multiple levels of nesting, exponents, and a mix of all operations. The expression should look intimidating but be solvable step-by-step. Example: "((3 + 2)^2 * (7 - 4) - (60 / (9+3))) / (2 * 5) + 11"

**Crucial Output Requirements:**
1.  **problemStatement:** The mathematical expression as a string. It MUST be solvable using standard BODMAS/PEMDAS rules (Brackets, Orders/Of, Division, Multiplication, Addition, Subtraction). Ensure correct syntax for use in display (e.g. use '*' for multiplication, '/' for division, '^' for exponents).
2.  **answer:** The single numerical answer to the expression. Aim for integer answers where possible. If decimals are unavoidable due to division, they should be simple (e.g., .5, .25).

Example for a low level:
Input: { level: 5 }
Output: { "problemStatement": "(8 - 3) * 4 + 7", "answer": 27 }

Example for a mid level:
Input: { level: 30 }
Output: { "problemStatement": "50 - (6 * 2^3) + (10 / 2)", "answer": 7 }

Example for a high level:
Input: { level: 80 }
Output: { "problemStatement": "((4+6)*2 - 5^2) / (12-9) + 7*3", "answer": 20 }


Make sure the problem is solvable and the answer is correct.
The problemStatement must be ONLY the expression itself.
Do NOT include "Calculate:", "Solve:", or the answer in the problemStatement.
The AI should generate a problem that can sometimes result in negative numbers as answers, especially at higher levels.
`,
});

const generateBodmasProblemFlow = ai.defineFlow(
  {
    name: 'generateBodmasProblemFlow',
    inputSchema: GenerateBodmasProblemInputSchema,
    outputSchema: GenerateBodmasProblemOutputSchema,
  },
  async (input) => {
    const saneLevel = Math.max(1, Math.min(input.level, 100));
    const { output } = await bodmasProblemGenerationPrompt({ level: saneLevel });

    if (!output || typeof output.answer !== 'number' || !output.problemStatement) {
      console.error("AI failed to generate a valid BODMAS problem or answer format:", output);
      // Provide a fallback problem
      return {
        problemStatement: "(10 + 5) * 2 - 3", // A simple fallback
        answer: 27,
      };
    }
    return output;
  }
);
