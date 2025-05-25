
'use server';
/**
 * @fileOverview A Genkit flow to generate custom open-ended (non-multiple-choice) questions.
 *
 * - generateCustomQuestions - A function that takes class level, subject, topic details, question style, and number of questions.
 * - GenerateCustomQuestionsInput - The input type for the generateCustomQuestions function.
 * - GenerateCustomQuestionsOutput - The return type for the generateCustomQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const classLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "College Freshman", "College Sophomore", "College Junior", "College Senior",
  "Postgraduate", "Professional Development"
] as const;

const questionStyles = [
    "Short Answer (1-2 sentences)",
    "Explanation Required (paragraph)",
    "Problem Solving (show steps if applicable)",
    "Critical Thinking/Analysis",
    "Compare and Contrast",
    "Definition Request",
    "Scenario-based Question"
] as const;

export const GenerateCustomQuestionsInputSchema = z.object({
  classLevel: z.enum(classLevels).describe('The target academic level for the questions.'),
  subject: z.string().min(3).describe('The subject area (e.g., "Physics", "World History", "Algebra").'),
  topicDetails: z.string().min(10).describe('A detailed description of the chapter, topic, or specific concepts the questions should cover.'),
  questionStyle: z.enum(questionStyles).describe('The desired style or type of open-ended questions.'),
  numberOfQuestions: z.number().min(1).max(10).default(3).describe('The number of questions to generate.'),
});
export type GenerateCustomQuestionsInput = z.infer<typeof GenerateCustomQuestionsInputSchema>;

export const GenerateCustomQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated open-ended questions.'),
});
export type GenerateCustomQuestionsOutput = z.infer<typeof GenerateCustomQuestionsOutputSchema>;

export async function generateCustomQuestions(input: GenerateCustomQuestionsInput): Promise<GenerateCustomQuestionsOutput> {
  return generateCustomQuestionsFlow(input);
}

const customQuestionGenerationPrompt = ai.definePrompt({
  name: 'generateCustomQuestionsPrompt',
  input: { schema: GenerateCustomQuestionsInputSchema },
  output: { schema: GenerateCustomQuestionsOutputSchema },
  prompt: `You are an expert question writer for educational content. Your task is to generate {{numberOfQuestions}} open-ended (non-multiple-choice) questions based on the following criteria:

Academic Level: {{classLevel}}
Subject: {{subject}}
Topic Details/Chapter Summary:
{{{topicDetails}}}

Desired Question Style: {{questionStyle}}

Instructions:
- Generate exactly {{numberOfQuestions}} distinct questions.
- Ensure the questions are open-ended and cannot be answered with a simple 'yes' or 'no', or by selecting from a list.
- The questions should directly relate to the provided 'Topic Details'.
- The complexity and phrasing of the questions MUST be appropriate for the specified 'Academic Level'.
- The questions should align with the 'Desired Question Style'. For example:
    - If "Short Answer", expect a concise response.
    - If "Explanation Required", the question should prompt for a more detailed answer.
    - If "Problem Solving", and the subject is appropriate (like Math or Physics), the question should present a problem to be solved. If steps are expected, mention "show your work" or similar.
    - If "Critical Thinking/Analysis", the question should require deeper thought, interpretation, or evaluation.
- Do NOT include any answer keys, solutions, or multiple-choice options. Only generate the questions themselves.
- Present the questions as a list of strings.

Example for Input:
{
  classLevel: "Grade 10",
  subject: "Biology",
  topicDetails: "The Krebs cycle (citric acid cycle), its main stages, inputs, outputs, and importance in cellular respiration.",
  questionStyle: "Explanation Required (paragraph)",
  numberOfQuestions: 2
}

Example for Output (questions array):
{
  "questions": [
    "Explain the primary role of the Krebs cycle in cellular respiration and list its major products.",
    "Describe the key inputs that enter the Krebs cycle and how they are transformed through its main stages."
  ]
}

Generate the questions now.
`,
});

const generateCustomQuestionsFlow = ai.defineFlow(
  {
    name: 'generateCustomQuestionsFlow',
    inputSchema: GenerateCustomQuestionsInputSchema,
    outputSchema: GenerateCustomQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await customQuestionGenerationPrompt(input);

    if (!output || !output.questions || output.questions.length === 0) {
      console.error("AI failed to generate custom questions or returned an empty array:", output);
      return {
        questions: ["The AI was unable to generate questions based on the provided input. Please try refining your topic details or question style."],
      };
    }
    // Ensure the correct number of questions is returned, or cap if AI over-generates
    const limitedQuestions = output.questions.slice(0, input.numberOfQuestions);
     if (limitedQuestions.length < input.numberOfQuestions && output.questions.length > 0) {
        // If AI returned fewer than requested but some, use what it gave. 
        // If it returned none, the above fallback handles it.
        console.warn(`AI generated ${limitedQuestions.length} questions, but ${input.numberOfQuestions} were requested.`);
    }

    return { questions: limitedQuestions };
  }
);
