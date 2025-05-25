
import { z } from 'zod';

export const classLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "College Freshman", "College Sophomore", "College Junior", "College Senior",
  "Postgraduate", "Professional Development"
] as const;

export const questionStyles = [
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

export const QuestionAnswerPairSchema = z.object({
  question: z.string().describe('The generated open-ended question.'),
  answer: z.string().describe('The corresponding answer to the question.'),
});
export type QuestionAnswerPair = z.infer<typeof QuestionAnswerPairSchema>;

export const GenerateCustomQuestionsOutputSchema = z.object({
  questionAnswerPairs: z.array(QuestionAnswerPairSchema).describe('An array of generated question-answer pairs.'),
});
export type GenerateCustomQuestionsOutput = z.infer<typeof GenerateCustomQuestionsOutputSchema>;
