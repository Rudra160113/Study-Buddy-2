
'use server';
/**
 * @fileOverview A Genkit flow to generate coding lessons.
 *
 * - generateCodingLesson - A function that takes language, topic, and difficulty to generate a coding lesson.
 * - GenerateCodingLessonInput - The input type for the generateCodingLesson function.
 * - GenerateCodingLessonOutput - The return type for the generateCodingLesson function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCodingLessonInputSchema = z.object({
  language: z.string().describe('The programming language for the lesson (e.g., Python, JavaScript).'),
  topic: z.string().describe('The specific coding topic to learn (e.g., variables, loops, functions, specific library).'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('The difficulty level of the lesson.'),
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
The user wants to learn about "{{topic}}" in the programming language "{{language}}" at a "{{difficulty}}" level.

Please structure the lesson as follows and provide detailed information for each section. Ensure code examples are in the specified language: "{{language}}".

1.  **Lesson Title**: Create a concise and engaging title for this lesson.
2.  **Introduction**: Briefly introduce the topic and what the user will learn.
3.  **Key Concepts**: Identify and explain the core concepts related to "{{topic}}". For each concept, provide its name and a clear explanation. Aim for 2-4 key concepts.
4.  **Code Examples**: Provide 2-3 relevant code examples. For each example:
    *   Include the code block itself.
    *   Specify the language (it should be "{{language}}").
    *   Describe what the code does, explaining important lines or blocks.
5.  **Exercises**: Create 1-2 simple exercises or challenges to help the user practice. For each exercise:
    *   Provide a clear problem statement.
    *   Optionally, include 1-2 hints.
6.  **Summary**: Briefly summarize the key takeaways from the lesson.
7.  **Suggested Next Topics**: Based on the current topic "{{topic}}" and difficulty "{{difficulty}}", suggest 2-3 topics the user could learn next to build upon this knowledge. This will form their learning path.

Adhere to the requested output format (JSON object matching the provided schema).
Make the explanations clear, concise, and appropriate for the specified "{{difficulty}}" level.
If the topic is broad for the difficulty level, focus on the most fundamental aspects.
If the topic is too advanced and the difficulty is 'beginner', try to simplify it or suggest foundational prerequisite topics first as part of the introduction or suggested next topics.
`,
});

const generateCodingLessonFlow = ai.defineFlow(
  {
    name: 'generateCodingLessonFlow',
    inputSchema: GenerateCodingLessonInputSchema,
    outputSchema: GenerateCodingLessonOutputSchema,
  },
  async (input) => {
    // You could add logic here to fetch prerequisite topics if needed, or pre-process input.
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

    