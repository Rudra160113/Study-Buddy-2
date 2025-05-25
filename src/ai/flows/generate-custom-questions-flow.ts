
'use server';
/**
 * @fileOverview A Genkit flow to generate custom open-ended (non-multiple-choice) questions with answers.
 *
 * - generateCustomQuestions - A function that takes class level, subject, topic details, question style, and number of questions.
 * - GenerateCustomQuestionsInput - The input type for the generateCustomQuestions function.
 * - GenerateCustomQuestionsOutput - The return type for the generateCustomQuestions function.
 */

import { ai } from '@/ai/genkit';
// Import the schemas and types from the new shared file
import {
  GenerateCustomQuestionsInputSchema,
  GenerateCustomQuestionsOutputSchema,
  type GenerateCustomQuestionsInput,
  type GenerateCustomQuestionsOutput,
} from '@/lib/schemas/custom-questions-schemas';

// Re-export the types for this flow's public interface
export type { GenerateCustomQuestionsInput, GenerateCustomQuestionsOutput };

export async function generateCustomQuestions(input: GenerateCustomQuestionsInput): Promise<GenerateCustomQuestionsOutput> {
  return generateCustomQuestionsFlow(input);
}

const customQuestionGenerationPrompt = ai.definePrompt({
  name: 'generateCustomQuestionsPrompt',
  input: { schema: GenerateCustomQuestionsInputSchema }, // Use imported schema
  output: { schema: GenerateCustomQuestionsOutputSchema }, // Use imported schema
  prompt: `You are an expert question writer and subject matter expert for educational content. Your task is to generate {{numberOfQuestions}} open-ended (non-multiple-choice) questions, each with a concise and accurate answer, based on the following criteria:

Academic Level: {{classLevel}}
Subject: {{subject}}
Topic Details/Chapter Summary:
{{{topicDetails}}}

Desired Question Style: {{questionStyle}}

Instructions:
- Generate exactly {{numberOfQuestions}} distinct question-answer pairs.
- For each pair, provide a 'question' and an 'answer'.
- The questions must be open-ended and cannot be answered with a simple 'yes' or 'no', or by selecting from a list.
- The questions and answers should directly relate to the provided 'Topic Details'.
- The complexity and phrasing of both questions and answers MUST be appropriate for the specified 'Academic Level'.
- The questions should align with the 'Desired Question Style'. For example:
    - If "Short Answer", expect a concise question and a concise answer.
    - If "Explanation Required", the question should prompt for a more detailed answer, and the answer should provide that detail.
    - If "Problem Solving", and the subject is appropriate (like Math or Physics), the question should present a problem to be solved, and the answer should provide the solution, including steps if requested by "show your work" or similar in the style.
    - If "Critical Thinking/Analysis", the question should require deeper thought, and the answer should reflect that level of analysis.
- Do NOT include any multiple-choice options. Only generate the question and its direct answer.
- Present the output as a JSON object with a 'questionAnswerPairs' array, where each element is an object containing 'question' and 'answer' strings.

Example for Input:
{
  classLevel: "Grade 10",
  subject: "Biology",
  topicDetails: "The Krebs cycle (citric acid cycle), its main stages, inputs, outputs, and importance in cellular respiration.",
  questionStyle: "Explanation Required (paragraph)",
  numberOfQuestions: 1
}

Example for Output (questionAnswerPairs array):
{
  "questionAnswerPairs": [
    {
      "question": "Explain the primary role of the Krebs cycle in cellular respiration and list its major products.",
      "answer": "The primary role of the Krebs cycle in cellular respiration is to complete the oxidation of glucose (derived from carbohydrates, fats, and proteins) by breaking down acetyl-CoA into carbon dioxide. This process harvests high-energy electrons carried by NADH and FADH2, which are then used in the electron transport chain to produce ATP. Its major products are ATP (or GTP), NADH, FADH2, and CO2."
    }
  ]
}

Generate the question-answer pairs now.
`,
});

const generateCustomQuestionsFlow = ai.defineFlow(
  {
    name: 'generateCustomQuestionsFlow',
    inputSchema: GenerateCustomQuestionsInputSchema, // Use imported schema
    outputSchema: GenerateCustomQuestionsOutputSchema, // Use imported schema
  },
  async (input) => {
    const { output } = await customQuestionGenerationPrompt(input);

    if (!output || !output.questionAnswerPairs || output.questionAnswerPairs.length === 0) {
      console.error("AI failed to generate custom questions with answers or returned an empty array:", output);
      return {
        questionAnswerPairs: [{
          question: "The AI was unable to generate questions and answers based on the provided input. Please try refining your topic details or question style.",
          answer: "No answer available."
        }],
      };
    }
    // Ensure the correct number of question-answer pairs is returned, or cap if AI over-generates
    const limitedPairs = output.questionAnswerPairs.slice(0, input.numberOfQuestions);
     if (limitedPairs.length < input.numberOfQuestions && output.questionAnswerPairs.length > 0) {
        console.warn(`AI generated ${limitedPairs.length} question-answer pairs, but ${input.numberOfQuestions} were requested.`);
    }

    return { questionAnswerPairs: limitedPairs };
  }
);
