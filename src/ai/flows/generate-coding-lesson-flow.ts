
'use server';
/**
 * @fileOverview A Genkit flow to generate coding lessons based on a user's freeform prompt.
 *
 * - generateCodingLesson - A function that takes a user prompt to generate a coding lesson.
 * - GenerateCodingLessonInput - The input type for the generateCodingLesson function.
 * - GenerateCodingLessonOutput - The return type for the generateCodingLesson function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCodingLessonInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s freeform request for a coding lesson (e.g., "explain python loops for beginners", "how to make an API call in JavaScript", "advanced concepts in Rust ownership").'),
});
export type GenerateCodingLessonInput = z.infer<typeof GenerateCodingLessonInputSchema>;

const ConceptSchema = z.object({
  name: z.string().describe('The name of the concept.'),
  explanation: z.string().describe('A clear and concise explanation of the concept.'),
});

const CodeExampleSchema = z.object({
  code: z.string().describe('A block of example code relevant to the lesson topic and language.'),
  language: z.string().describe('The programming language of the code block (e.g., python, javascript). This should match the input language.'),
  description: z.string().describe('An explanation of what the code does, line by line or block by block.'),
});

const ExerciseSchema = z.object({
  statement: z.string().describe('A problem statement or task for the user to solve.'),
  hints: z.array(z.string()).optional().describe('Optional hints to help the user solve the exercise.'),
});

const GenerateCodingLessonOutputSchema = z.object({
  lessonTitle: z.string().describe('A concise and engaging title for the generated lesson.'),
  introduction: z.string().describe('A brief introduction to the topic and what the lesson will cover.'),
  concepts: z.array(ConceptSchema).describe('An array of key concepts related to the topic, each with a name and explanation.'),
  codeExamples: z.array(CodeExampleSchema).describe('An array of code examples, each with the code, language, and description.'),
  exercises: z.array(ExerciseSchema).describe('An array of exercises for the user to practice the concepts learned.'),
  summary: z.string().describe('A brief summary of what was covered in the lesson.'),
  suggestedNextTopics: z.array(z.string()).describe('A list of suggested topics the user could learn next to continue their learning path.'),
});
export type GenerateCodingLessonOutput = z.infer<typeof GenerateCodingLessonOutputSchema>;


export async function generateCodingLesson(input: GenerateCodingLessonInput): Promise<GenerateCodingLessonOutput> {
  return generateCodingLessonFlow(input);
}

const lessonPrompt = ai.definePrompt({
  name: 'codingLessonPrompt',
  input: { schema: GenerateCodingLessonInputSchema },
  output: { schema: GenerateCodingLessonOutputSchema },
  prompt: `You are an expert Coding Tutor AI. Your goal is to generate a comprehensive and easy-to-understand coding lesson based on the user's request.
The user's request is: "{{userPrompt}}"

From this request, you must infer:
- The programming language (e.g., Python, JavaScript). If not clearly specified or ambiguous, pick a common language relevant to the topic or ask for clarification in your introduction.
- The specific coding topic (e.g., variables, loops, API integration, a specific library, a concept).
- The desired depth or difficulty level (e.g., beginner, intermediate, advanced, or a general explanation). Adapt your explanation complexity accordingly.

Please structure the lesson as follows and provide detailed information for each section. Ensure code examples are in the inferred/specified language.

1.  **Lesson Title**: Create a concise and engaging title for this lesson based on the user's prompt.
2.  **Introduction**: Briefly introduce the topic and what the user will learn. If the language or topic was ambiguous, state your interpretation here.
3.  **Key Concepts**: Identify and explain 2-4 core concepts related to the inferred topic. For each concept, provide its name and a clear explanation.
4.  **Code Examples**: Provide 2-3 relevant code examples. For each example:
    *   Include the code block itself.
    *   Specify the language (e.g., python, javascript).
    *   Describe what the code does, explaining important lines or blocks. Explain any commands used if they are crucial to understanding.
5.  **Exercises**: Create 1-2 simple exercises or challenges to help the user practice. For each exercise:
    *   Provide a clear problem statement.
    *   Optionally, include 1-2 hints.
6.  **Summary**: Briefly summarize the key takeaways from the lesson.
7.  **Suggested Next Topics**: Based on the current topic and inferred difficulty, suggest 2-3 topics the user could learn next to build upon this knowledge. This will form their learning path.

Adhere to the requested output format (JSON object matching the provided schema).
Make the explanations clear, concise, and appropriate for the inferred difficulty level.
If the user's prompt is very broad, try to focus on the most fundamental aspects.
If the prompt seems like a follow-up question or asks for clarification on a previous topic, try to address that specifically within the lesson structure, perhaps by focusing the "Key Concepts" or "Code Examples" on the specific point of confusion or interest.
If the prompt asks for the reasoning behind something, incorporate that into the "Key Concepts" or "Code Example" explanations.
`,
});

const generateCodingLessonFlow = ai.defineFlow(
  {
    name: 'generateCodingLessonFlow',
    inputSchema: GenerateCodingLessonInputSchema,
    outputSchema: GenerateCodingLessonOutputSchema,
  },
  async (input) => {
    const { output } = await lessonPrompt(input);

    if (!output) {
        throw new Error("AI failed to generate lesson content.");
    }
    
    // Ensure arrays are not undefined, default to empty arrays
    return {
        ...output,
        concepts: output.concepts || [],
        codeExamples: output.codeExamples || [],
        exercises: output.exercises || [],
        suggestedNextTopics: output.suggestedNextTopics || [],
    };
  }
);
