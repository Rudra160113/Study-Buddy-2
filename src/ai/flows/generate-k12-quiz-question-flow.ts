
'use server';
/**
 * @fileOverview A Genkit flow to generate K-12 subject-based quiz questions.
 *
 * - generateK12QuizQuestion - A function that takes a grade level and subject, and returns a quiz question.
 * - GenerateK12QuizQuestionInput - The input type for the generateK12QuizQuestion function.
 * - GenerateK12QuizQuestionOutput - The return type for the generateK12QuizQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
] as const;

const subjects = ["Mathematics", "Science", "History", "English Language Arts", "Geography"] as const;


const GenerateK12QuizQuestionInputSchema = z.object({
  gradeLevel: z.enum(gradeLevels).describe('The grade level for the quiz question (e.g., "Grade 5").'),
  subject: z.enum(subjects).describe('The subject for the quiz question (e.g., "Science").'),
});
export type GenerateK12QuizQuestionInput = z.infer<typeof GenerateK12QuizQuestionInputSchema>;

const GenerateK12QuizQuestionOutputSchema = z.object({
  question: z.string().describe('The quiz question text.'),
  options: z.array(z.string()).length(4).describe('An array of 4 string options for the multiple-choice answer.'),
  correctAnswer: z.string().describe('The correct answer string, which must be one of the provided options.'),
  explanation: z.string().describe('A brief explanation of why the correct answer is right, suitable for the grade level.'),
});
export type GenerateK12QuizQuestionOutput = z.infer<typeof GenerateK12QuizQuestionOutputSchema>;

export async function generateK12QuizQuestion(input: GenerateK12QuizQuestionInput): Promise<GenerateK12QuizQuestionOutput> {
  return generateK12QuizQuestionFlow(input);
}

const quizQuestionGenerationPrompt = ai.definePrompt({
  name: 'generateK12QuizQuestionPrompt',
  input: { schema: GenerateK12QuizQuestionInputSchema },
  output: { schema: GenerateK12QuizQuestionOutputSchema },
  prompt: `You are an expert K-12 curriculum content creator. Your task is to generate a multiple-choice quiz question for a student in {{gradeLevel}} studying {{subject}}.

The question must be:
- Appropriate for the specified {{gradeLevel}}.
- Directly related to the {{subject}}.
- Clear and unambiguous.

You must provide:
1.  **question**: The text of the quiz question.
2.  **options**: An array of exactly 4 string options. One option must be the correct answer. The other three options should be plausible distractors suitable for the {{gradeLevel}}.
3.  **correctAnswer**: The string representing the correct answer, which MUST exactly match one of the strings in the 'options' array.
4.  **explanation**: A brief (1-2 sentences) explanation of why the correct answer is correct, tailored to the {{gradeLevel}}'s understanding.

Example for {{gradeLevel}}: Grade 4, {{subject}}: Science
{
  "question": "Which of these is a primary source of energy for plants to make their own food?",
  "options": ["Moonlight", "Sunlight", "Water", "Soil"],
  "correctAnswer": "Sunlight",
  "explanation": "Plants use sunlight, water, and carbon dioxide to make their food through a process called photosynthesis. Sunlight is the main energy source for this process."
}

Ensure the output is a valid JSON object adhering to the schema. The correctAnswer must be one of the options.
`,
});

const generateK12QuizQuestionFlow = ai.defineFlow(
  {
    name: 'generateK12QuizQuestionFlow',
    inputSchema: GenerateK12QuizQuestionInputSchema,
    outputSchema: GenerateK12QuizQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await quizQuestionGenerationPrompt(input);

    if (!output || !output.question || !output.options || output.options.length !== 4 || !output.correctAnswer || !output.options.includes(output.correctAnswer) || !output.explanation) {
      console.error("AI failed to generate a valid K-12 quiz question or options:", output);
      // Provide a fallback question
      return {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        explanation: "Adding 2 and 2 together results in 4.",
      };
    }
    return output;
  }
);
