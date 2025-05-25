
'use server';
/**
 * @fileOverview A Genkit flow to generate dice probability problems.
 *
 * - generateDiceProbabilityProblem - A function that takes a level and returns a probability question, options, and the correct answer.
 * - GenerateDiceProbabilityProblemInput - The input type for the generateDiceProbabilityProblem function.
 * - GenerateDiceProbabilityProblemOutput - The return type for the generateDiceProbabilityProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDiceProbabilityProblemInputSchema = z.object({
  level: z.number().min(1).max(100).describe('The current game level, used to determine problem difficulty (1-100).'),
});
export type GenerateDiceProbabilityProblemInput = z.infer<typeof GenerateDiceProbabilityProblemInputSchema>;

const GenerateDiceProbabilityProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The dice probability problem text. e.g., "What is the probability of rolling a sum of 7 with two standard six-sided dice?"'),
  options: z.array(z.string()).describe('An array of 4 string options for the multiple-choice answer. Answers should be in simplest fraction form (e.g., "1/6", "5/36") or decimal form rounded to 3 places if a fraction is too complex (e.g., "0.167").'),
  correctAnswer: z.string().describe('The correct answer string, which must be one of the provided options.'),
});
export type GenerateDiceProbabilityProblemOutput = z.infer<typeof GenerateDiceProbabilityProblemOutputSchema>;

export async function generateDiceProbabilityProblem(input: GenerateDiceProbabilityProblemInput): Promise<GenerateDiceProbabilityProblemOutput> {
  return generateDiceProbabilityProblemFlow(input);
}

const diceProblemGenerationPrompt = ai.definePrompt({
  name: 'generateDiceProbabilityProblemPrompt',
  input: { schema: GenerateDiceProbabilityProblemInputSchema },
  output: { schema: GenerateDiceProbabilityProblemOutputSchema },
  prompt: `You are a probability problem generator for a game called "Dice Probability Challenge".
The game has 100 levels. Your task is to create a dice-related probability question, 4 multiple-choice options, and identify the correct answer.
The difficulty of the problem MUST scale with the provided 'level'.

Current Level: {{level}}

Instructions for difficulty scaling:
-   **Levels 1-10 (Beginner):** Single standard six-sided die. Simple probabilities (e.g., probability of rolling a 4, probability of rolling an even number).
    Example: "What is the probability of rolling a 3 on a standard six-sided die?" Options: ["1/6", "1/3", "1/2", "1"], Correct: "1/6"
-   **Levels 11-25 (Easy):** Two standard six-sided dice. Probabilities of specific sums (e.g., sum of 7, sum of 2), or simple combined events (e.g., both dice showing an even number).
    Example: "What is the probability of rolling a sum of 5 with two standard six-sided dice?" Options: ["1/9", "1/12", "1/6", "5/36"], Correct: "1/9" (4/36)
-   **Levels 26-50 (Medium):** Two or three standard six-sided dice. More complex sum probabilities, probabilities of "at least one" type events, or simple comparisons. Introduction of basic concepts like "greater than X".
    Example: "If you roll two dice, what is the probability that the sum is greater than 9?" Options: ["1/6", "5/36", "1/4", "1/3"], Correct: "1/6" (6/36)
-   **Levels 51-75 (Hard):** Three standard six-sided dice, or problems involving non-standard dice (e.g., 4-sided, 8-sided - clearly specify the type of dice). Conditional probability basics.
    Example: "You roll two standard dice. If the first die shows a 4, what is the probability the sum is 7?" Options: ["1/6", "1/36", "1/12", "1/3"], Correct: "1/6"
-   **Levels 76-100 (Expert):** Complex scenarios with multiple dice (could be mixed types). Basic expected value questions. More challenging conditional probabilities or combinations.
    Example: "What is the expected value of a single roll of a fair 8-sided die with faces numbered 1 to 8?" Options: ["3.5", "4", "4.5", "5"], Correct: "4.5"

**Crucial Output Requirements:**
1.  **problemStatement:** The text of the probability question. Be clear about the number and type of dice.
2.  **options:** An array of exactly 4 string options. Ensure one option is the correct answer. Options should be plausible distractors. Format answers as simplified fractions (e.g., "1/6", "2/3") or decimals rounded to 3 places if fractions are too complex or for expected value (e.g., "0.167", "3.5"). All options for a given question should use a consistent format (all fractions or all decimals).
3.  **correctAnswer:** The string representing the correct answer, which MUST exactly match one of the strings in the 'options' array.

Ensure the problem is solvable and the answer is mathematically correct.
Do NOT include the answer in the problemStatement.
The AI should generate a problem and options that are appropriate for the game context.
Verify that `correctAnswer` is indeed present in the `options` array.
Provide a good spread of difficulties for the options.
Ensure options are distinct.
For probability answers, simplest fraction form is preferred. For expected value, decimal is fine.
`,
});

const generateDiceProbabilityProblemFlow = ai.defineFlow(
  {
    name: 'generateDiceProbabilityProblemFlow',
    inputSchema: GenerateDiceProbabilityProblemInputSchema,
    outputSchema: GenerateDiceProbabilityProblemOutputSchema,
  },
  async (input) => {
    const saneLevel = Math.max(1, Math.min(input.level, 100));
    const { output } = await diceProblemGenerationPrompt({ level: saneLevel });

    if (!output || !output.problemStatement || !output.options || output.options.length !== 4 || !output.correctAnswer || !output.options.includes(output.correctAnswer)) {
      console.error("AI failed to generate a valid dice probability problem or options:", output);
      // Provide a fallback problem
      return {
        problemStatement: "What is the probability of rolling a 1 on a standard six-sided die?",
        options: ["1/6", "1/3", "1/2", "1"],
        correctAnswer: "1/6",
      };
    }
    return output;
  }
);

