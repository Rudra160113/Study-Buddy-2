
'use server';
/**
 * @fileOverview A Genkit flow to suggest corrections or improvements for user-provided code.
 *
 * - suggestCodeCorrection - A function that takes code, language, grade level, and optional error context to provide AI-driven correction suggestions.
 * - SuggestCodeCorrectionInput - The input type for the suggestCodeCorrection function.
 * - SuggestCodeCorrectionOutput - The return type for the suggestCodeCorrection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestCodeCorrectionInputSchema = z.object({
  code: z.string().describe('The code snippet to be corrected or improved.'),
  language: z.string().describe('The programming language of the code snippet (e.g., javascript, python, html, sql).'),
  gradeLevel: z.string().describe('The grade level of the user (e.g., "Grade 5", "Grade 10", "College/Adult"). Indicates the target audience for the explanation complexity.'),
  errorContext: z.string().optional().describe('Optional: Any error message or specific context about why the code needs correction or review (e.g., "Syntax error on line 5", "Logic seems off for calculating sum", "User requests code review.").'),
});
export type SuggestCodeCorrectionInput = z.infer<typeof SuggestCodeCorrectionInputSchema>;

const SuggestCodeCorrectionOutputSchema = z.object({
  suggestedCode: z.string().describe('The corrected or improved version of the code. If no correction is deemed necessary or possible, this might be the original code or an empty string if the input was too problematic.'),
  explanation: z.string().describe('A brief explanation of the changes made, why no changes were made, or general feedback. Tailored to the grade level.'),
  hasCorrection: z.boolean().describe('Indicates if a meaningful correction or improvement was actually suggested in `suggestedCode` different from the original.'),
});
export type SuggestCodeCorrectionOutput = z.infer<typeof SuggestCodeCorrectionOutputSchema>;

export async function suggestCodeCorrection(input: SuggestCodeCorrectionInput): Promise<SuggestCodeCorrectionOutput> {
  return suggestCodeCorrectionFlow(input);
}

const correctionPrompt = ai.definePrompt({
  name: 'suggestCodeCorrectionPrompt',
  input: { schema: SuggestCodeCorrectionInputSchema },
  output: { schema: SuggestCodeCorrectionOutputSchema },
  prompt: `You are an expert Code Assistant. Your task is to analyze the provided code snippet, identify any errors or areas for improvement, and suggest a corrected version.
User Grade Level: "{{gradeLevel}}" (Adjust explanation complexity accordingly. For below Grade 9, keep it very simple.)
Programming Language: "{{language}}"

{{#if errorContext}}
The user has provided the following context/error or request:
"{{errorContext}}"
{{else}}
The user has not provided specific error context. Perform a general review for correctness and improvements.
{{/if}}

Original Code:
\`\`\`{{language}}
{{{code}}}
\`\`\`

Please provide your response ONLY in the specified JSON output schema.
1.  **suggestedCode**: Provide the corrected or improved code.
    *   If the original code is already good, return the original code.
    *   If the code is too malformed or the request is unclear for a specific correction, you can return the original code and explain in the 'explanation' field.
2.  **explanation**: Explain the changes made (if any) or why the code is correct/uncorrectable. If no specific correction is made, you can provide general feedback or confirm correctness.
3.  **hasCorrection**: Set to true if you made a meaningful change or improvement to the code that is different from the original. Set to false if the original code was returned in 'suggestedCode' or if no actionable correction was provided.

Focus on providing functional and clear corrections/suggestions. Be direct and avoid conversational fluff.
If the code is fundamentally correct and requires no changes, 'suggestedCode' should be the original code, 'explanation' should state this, and 'hasCorrection' should be false.
If the request is for a review and the code is good, confirm its correctness.
If the code is empty or trivial (e.g. just comments), indicate that in the explanation and set hasCorrection to false.
`,
});

const suggestCodeCorrectionFlow = ai.defineFlow(
  {
    name: 'suggestCodeCorrectionFlow',
    inputSchema: SuggestCodeCorrectionInputSchema,
    outputSchema: SuggestCodeCorrectionOutputSchema,
  },
  async (input) => {
    if (!input.code.trim()) {
        return {
            suggestedCode: input.code,
            explanation: "The provided code is empty. Nothing to correct or suggest.",
            hasCorrection: false,
        };
    }

    // Normalize grade level instruction for the AI, if needed.
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
    
    const { output } = await correctionPrompt({ ...input, gradeLevel: gradeInstruction });

    if (!output) {
      throw new Error("AI failed to generate code correction suggestions.");
    }
    
    // Ensure hasCorrection reflects if suggestedCode is different from original, unless original was empty
    const hasMeaningfulChange = input.code.trim() !== '' && output.suggestedCode.trim() !== input.code.trim() && output.suggestedCode.trim() !== '';

    return {
        suggestedCode: output.suggestedCode,
        explanation: output.explanation || "AI analysis complete.",
        hasCorrection: output.hasCorrection && hasMeaningfulChange,
    };
  }
);
