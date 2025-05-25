
'use server';
/**
 * @fileOverview A Genkit flow to interpret user-provided code using AI.
 *
 * - interpretCode - A function that takes code, language, and grade level to provide an AI-driven explanation.
 * - InterpretCodeInput - The input type for the interpretCode function.
 * - InterpretCodeOutput - The return type for the interpretCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterpretCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to be interpreted.'),
  language: z.string().describe('The programming language of the code snippet (e.g., javascript, python, html, sql).'),
  gradeLevel: z.string().describe('The grade level of the user (e.g., "Grade 5", "Grade 10", "College/Adult").'),
});
export type InterpretCodeInput = z.infer<typeof InterpretCodeInputSchema>;

const InterpretCodeOutputSchema = z.object({
  interpretation: z.string().describe('The AI-generated explanation and interpretation of the code.'),
  suggestions: z.array(z.string()).optional().describe('Optional suggestions for improving the code or learning next steps.'),
  warnings: z.array(z.string()).optional().describe('Optional warnings about potential issues in the code.'),
});
export type InterpretCodeOutput = z.infer<typeof InterpretCodeOutputSchema>;

export async function interpretCode(input: InterpretCodeInput): Promise<InterpretCodeOutput> {
  return interpretCodeFlow(input);
}

const interpretPrompt = ai.definePrompt({
  name: 'interpretCodePrompt',
  input: { schema: InterpretCodeInputSchema },
  output: { schema: InterpretCodeOutputSchema },
  prompt: `You are an expert Code Explainer AI. Your goal is to help students understand code.
The user is at grade level: "{{gradeLevel}}".
The code is written in: "{{language}}".
The code to interpret is:
\`\`\`{{language}}
{{{code}}}
\`\`\`

Please provide:
1.  **Interpretation**: A clear explanation of what the code does.
    *   If "{{gradeLevel}}" is below "Grade 9" (e.g., "Grade 2" through "Grade 8"), explain concepts in a very simple, age-appropriate manner. Avoid advanced programming paradigms, jargon, or overly complex details unless the code itself explicitly uses them or the user's prompt (within the code block if they added comments) specifically asks for it. Focus on the fundamental logic.
    *   If "{{gradeLevel}}" is "Grade 9" or above, you can provide a more detailed and technical explanation, but still aim for clarity.
2.  **Suggestions (Optional)**: If applicable, provide 1-2 brief suggestions for improvement, or what the user could try next with this code.
3.  **Warnings (Optional)**: If there are any obvious simple errors or bad practices for a learner, mention them briefly.

Keep the entire response concise and helpful for a student.
Structure your output as a JSON object matching the defined schema.
If the code is very short or simple, focus on explaining the core concept it demonstrates for the given language.
If no specific warnings or suggestions are apparent, return empty arrays for those fields.
`,
});

const interpretCodeFlow = ai.defineFlow(
  {
    name: 'interpretCodeFlow',
    inputSchema: InterpretCodeInputSchema,
    outputSchema: InterpretCodeOutputSchema,
  },
  async (input) => {
    // Basic check for grade level string format to help the AI a little
    let gradeInstruction = input.gradeLevel;
    if (input.gradeLevel.toLowerCase().includes("grade")) {
        const gradeNum = parseInt(input.gradeLevel.replace(/\D/g, ''), 10);
        if (!isNaN(gradeNum)) {
            if (gradeNum < 9) {
                gradeInstruction = `Below Grade 9 (Specifically ${input.gradeLevel})`;
            } else {
                gradeInstruction = `Grade 9 or above (Specifically ${input.gradeLevel})`;
            }
        }
    }


    const { output } = await interpretPrompt({ ...input, gradeLevel: gradeInstruction });

    if (!output) {
      throw new Error("AI failed to generate code interpretation.");
    }
    return {
        interpretation: output.interpretation || "Could not interpret the code.",
        suggestions: output.suggestions || [],
        warnings: output.warnings || [],
    };
  }
);
