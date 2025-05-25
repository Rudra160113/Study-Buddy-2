
'use server';
/**
 * @fileOverview A Genkit flow to generate English logic riddles/brain teasers.
 *
 * - generateLogicRiddle - A function that returns a logic riddle, options, and the correct answer.
 * - GenerateLogicRiddleInput - The input type for the generateLogicRiddle function.
 * - GenerateLogicRiddleOutput - The return type for the generateLogicRiddle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLogicRiddleInputSchema = z.object({
  level: z.number().min(1).max(50).describe('The current game level, used to potentially vary riddle type or difficulty (1-50).'),
});
export type GenerateLogicRiddleInput = z.infer<typeof GenerateLogicRiddleInputSchema>;

const GenerateLogicRiddleOutputSchema = z.object({
  riddle: z.string().describe('The English logic riddle or brain teaser text.'),
  options: z.array(z.string()).length(4).describe('An array of 4 string options (potential answers) in English.'),
  correctAnswer: z.string().describe('The correct answer string, which must be one of the provided options.'),
});
export type GenerateLogicRiddleOutput = z.infer<typeof GenerateLogicRiddleOutputSchema>;

export async function generateLogicRiddle(input: GenerateLogicRiddleInput): Promise<GenerateLogicRiddleOutput> {
  return generateLogicRiddleFlow(input);
}

const logicRiddleGenerationPrompt = ai.definePrompt({
  name: 'generateLogicRiddlePrompt',
  input: { schema: GenerateLogicRiddleInputSchema },
  output: { schema: GenerateLogicRiddleOutputSchema },
  prompt: `You are an expert creator of English logic riddles and brain teasers suitable for a general audience.
Your task is to generate a logic riddle, along with 4 multiple-choice options and the correct answer.
The riddles should be "slightly difficult" - they should require some thought and cleverness to solve, but not rely on obscure specific knowledge or be overly complex.

Current Level: {{level}} (You can use this to subtly vary the style or theme of the riddle if you wish, but maintain the 'slightly difficult' characteristic across all levels).

Instructions:
1.  **Riddle (riddle):** Create a clear, engaging, and solvable logic riddle or brain teaser in English.
    Example Riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?"
2.  **Options (options):** Provide an array of exactly 4 string options in English.
    *   One option must be the correct answer.
    *   The other three options should be plausible but incorrect distractors.
    Example Options for above riddle: ["A dream", "A map", "A photograph", "A storybook"]
3.  **Correct Answer (correctAnswer):** Specify the correct answer string, ensuring it exactly matches one of the items in the 'options' array.
    Example Correct Answer: "A map"

Output Format:
Ensure your output is a JSON object matching the defined schema, with fields "riddle", "options", and "correctAnswer".

Example of a complete desired output structure for a different riddle:
{
  "riddle": "What has an eye, but cannot see?",
  "options": ["A needle", "A storm", "A potato", "A cyclops"],
  "correctAnswer": "A needle"
}

Ensure the generated riddle is thoughtful and the distractors are reasonable.
Do not include any extra text, explanations, or labels like "Riddle:", "Options:", "Answer:" in the output fields themselves. Just the direct values.
The correctAnswer must be one of the strings present in the options array.
Focus on riddles that test logical deduction or lateral thinking.
`,
});

const generateLogicRiddleFlow = ai.defineFlow(
  {
    name: 'generateLogicRiddleFlow',
    inputSchema: GenerateLogicRiddleInputSchema,
    outputSchema: GenerateLogicRiddleOutputSchema,
  },
  async (input) => {
    const saneLevel = Math.max(1, Math.min(input.level, 50)); // Ensure level is within a defined range
    const { output } = await logicRiddleGenerationPrompt({ level: saneLevel });

    if (!output || !output.riddle || !output.options || output.options.length !== 4 || !output.correctAnswer || !output.options.includes(output.correctAnswer)) {
      console.error("AI failed to generate a valid logic riddle or options:", output);
      // Provide a fallback riddle
      return {
        riddle: "What is full of holes but still holds water?",
        options: ["A sponge", "A net", "A strainer", "A cloud"],
        correctAnswer: "A sponge",
      };
    }
    return output;
  }
);

