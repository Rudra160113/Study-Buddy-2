
'use server';
/**
 * @fileOverview A Genkit flow to generate Hindi riddles (Paheliyan) with multiple-choice answers.
 *
 * - generateHindiRiddle - A function that takes a level and returns a Hindi riddle, options, and the correct answer.
 * - GenerateHindiRiddleInput - The input type for the generateHindiRiddle function.
 * - GenerateHindiRiddleOutput - The return type for the generateHindiRiddle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHindiRiddleInputSchema = z.object({
  level: z.number().min(1).max(50).describe('The current game level, used to potentially vary riddle type or difficulty (1-50).'),
});
export type GenerateHindiRiddleInput = z.infer<typeof GenerateHindiRiddleInputSchema>;

const GenerateHindiRiddleOutputSchema = z.object({
  riddle: z.string().describe('The Hindi riddle (Paheli) in Devanagari script. Example: "हरी थी मन भरी थी, लाख मोती जड़ी थी, राजाजी के बाग़ में, दुशाला ओढ़े खड़ी थी?"'),
  options: z.array(z.string()).length(4).describe('An array of 4 string options (potential answers) in Devanagari script. Example: ["भुट्टा", "अनार", "मिर्च", "केला"]'),
  correctAnswer: z.string().describe('The correct answer string, which must be one of the provided options. Example: "भुट्टा"'),
});
export type GenerateHindiRiddleOutput = z.infer<typeof GenerateHindiRiddleOutputSchema>;

export async function generateHindiRiddle(input: GenerateHindiRiddleInput): Promise<GenerateHindiRiddleOutput> {
  return generateHindiRiddleFlow(input);
}

const hindiRiddleGenerationPrompt = ai.definePrompt({
  name: 'generateHindiRiddlePrompt',
  input: { schema: GenerateHindiRiddleInputSchema },
  output: { schema: GenerateHindiRiddleOutputSchema },
  prompt: `You are an expert creator of Hindi riddles (पहेलियाँ - Paheliyan).
Your task is to generate a Hindi riddle, along with 4 multiple-choice options and the correct answer.
All text (riddle, options, answer) MUST be in Devanagari script.

Current Level: {{level}} (Use this to slightly vary the type or perceived difficulty, but keep riddles generally solvable and engaging for a wide audience).

Instructions:
1.  **Riddle (riddle):** Create a clear, fun, and engaging Hindi riddle.
    Example Riddle: "ऐसी कौन सी चीज़ है जो सुबह हरी, दोपहर को काली, शाम को नीली, और रात को सफेद दिखाई देती है?"
2.  **Options (options):** Provide an array of exactly 4 string options in Devanagari.
    *   One option must be the correct answer.
    *   The other three options should be plausible but incorrect distractors.
    Example Options for above riddle: ["बिल्ली की आँखें", "इंद्रधनुष", "बादल", "इंसान की परछाई"]
3.  **Correct Answer (correctAnswer):** Specify the correct answer string, ensuring it exactly matches one of the items in the 'options' array.
    Example Correct Answer: "बिल्ली की आँखें"

Output Format:
Ensure your output is a JSON object matching the defined schema, with fields "riddle", "options", and "correctAnswer".

Example of a complete desired output structure for a different riddle:
{
  "riddle": "हरी थी मन भरी थी, लाख मोती जड़ी थी, राजाजी के बाग़ में, दुशाला ओढ़े खड़ी थी?",
  "options": ["भुट्टा", "अनार", "मिर्च", "केला"],
  "correctAnswer": "भुट्टा"
}

Ensure the generated riddle is thoughtful and the distractors are reasonable.
Do not include any extra text, explanations, or labels like "Paheli:", "Options:", "Answer:" in the output fields themselves. Just the direct values.
The `correctAnswer` must be one of the strings present in the `options` array.
`,
});

const generateHindiRiddleFlow = ai.defineFlow(
  {
    name: 'generateHindiRiddleFlow',
    inputSchema: GenerateHindiRiddleInputSchema,
    outputSchema: GenerateHindiRiddleOutputSchema,
  },
  async (input) => {
    const saneLevel = Math.max(1, Math.min(input.level, 50)); // Ensure level is within a defined range
    const { output } = await hindiRiddleGenerationPrompt({ level: saneLevel });

    if (!output || !output.riddle || !output.options || output.options.length !== 4 || !output.correctAnswer || !output.options.includes(output.correctAnswer)) {
      console.error("AI failed to generate a valid Hindi riddle or options:", output);
      // Provide a fallback riddle
      return {
        riddle: "एक छोटा सा फकीर, जिसके पेट में लकीर। बताओ क्या?", // A simple fallback riddle
        options: ["नारियल", "केला", "सेब", "आम"],
        correctAnswer: "नारियल",
      };
    }
    return output;
  }
);
