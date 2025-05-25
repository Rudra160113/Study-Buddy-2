
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
  gradeLevel: z.string().describe('The grade level of the user (e.g., "Grade 5", "Grade 10", "College/Adult"). Indicates the target audience for the explanation complexity.'),
});
export type InterpretCodeInput = z.infer<typeof InterpretCodeInputSchema>;

const InterpretCodeOutputSchema = z.object({
  interpretation: z.string().describe('A concise, direct explanation of what the code does, or the direct output if the code simply prints a literal. This should be the primary output.'),
  suggestions: z.array(z.string()).optional().describe('Optional: 1-2 direct suggestions for improvement or next steps. Empty if none.'),
  warnings: z.array(z.string()).optional().describe('Optional: 1-2 direct warnings about potential errors or bad practices. Empty if none.'),
});
export type InterpretCodeOutput = z.infer<typeof InterpretCodeOutputSchema>;

export async function interpretCode(input: InterpretCodeInput): Promise<InterpretCodeOutput> {
  return interpretCodeFlow(input);
}

const interpretPrompt = ai.definePrompt({
  name: 'interpretCodePrompt',
  input: { schema: InterpretCodeInputSchema },
  output: { schema: InterpretCodeOutputSchema },
  prompt: `Act as a direct code analysis tool. Your output MUST be concise and to the point, like an IDE.
User Grade Level: "{{gradeLevel}}"
Language: "{{language}}"
Code:
\`\`\`{{language}}
{{{code}}}
\`\`\`

Analyze the code and provide the output ONLY in the specified JSON schema format containing 'interpretation', 'suggestions', and 'warnings'.

1.  **interpretation**:
    *   If the code's primary and obvious purpose is to output a simple literal value (e.g., a single \`print("text")\` or \`echo 123\` statement), the 'interpretation' field should primarily contain that literal value directly (e.g., "text" or "123"). Avoid meta-commentary about the print statement itself unless the language context absolutely requires it (e.g., for an SQL query, state what it selects).
    *   Otherwise, provide a concise, direct explanation of what the overall code snippet does.
    *   If "{{gradeLevel}}" is below "Grade 9" (e.g., "Grade 2" through "Grade 8"), explain concepts in a very simple, age-appropriate manner. Focus on the fundamental logic. Avoid jargon.
    *   If "{{gradeLevel}}" is "Grade 9" or above (e.g., "Grade 9", "College/Adult"), provide a more technical and detailed explanation, but maintain clarity and conciseness.
2.  **suggestions (optional array of strings)**: If applicable, provide 1-2 brief, direct suggestions for code improvement or what the user could try next. If none, provide an empty array. These should be actionable and specific.
3.  **warnings (optional array of strings)**: If there are any obvious simple errors, bad practices for a learner, or potential issues, mention them briefly and directly. If none, provide an empty array.

Do NOT include any conversational phrases, greetings, self-references, or any text outside the JSON structure requested by the output schema.
If the code is very short or simple, focus on explaining the core concept it demonstrates for the given language and grade level, or providing its direct literal output if applicable.
If the code is too complex to analyze meaningfully for the specified grade, or if it contains fundamental syntax errors preventing basic understanding, the 'interpretation' should state this briefly.
Do not explain the act of printing; if the code is \`print("hello")\`, the interpretation should strongly tend towards just "hello".
`,
});

const interpretCodeFlow = ai.defineFlow(
  {
    name: 'interpretCodeFlow',
    inputSchema: InterpretCodeInputSchema,
    outputSchema: InterpretCodeOutputSchema,
  },
  async (input) => {
    // Normalize grade level instruction for the AI, if needed, based on previous logic.
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
        interpretation: output.interpretation || "Could not interpret the code at this time.",
        suggestions: output.suggestions || [],
        warnings: output.warnings || [],
    };
  }
);

