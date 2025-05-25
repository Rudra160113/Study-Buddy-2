
'use server';
/**
 * @fileOverview A Genkit flow to generate funny Hindi jokes.
 *
 * - generateHindiJoke - A function that returns a Hindi joke.
 * - GenerateHindiJokeOutput - The return type for the generateHindiJoke function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// No input schema needed for a simple joke request
const GenerateHindiJokeOutputSchema = z.object({
  joke: z.string().describe('A short, funny Hindi joke (chutkula) in Devanagari script.'),
});
export type GenerateHindiJokeOutput = z.infer<typeof GenerateHindiJokeOutputSchema>;

export async function generateHindiJoke(): Promise<GenerateHindiJokeOutput> {
  return generateHindiJokeFlow();
}

const hindiJokeGenerationPrompt = ai.definePrompt({
  name: 'generateHindiJokePrompt',
  output: { schema: GenerateHindiJokeOutputSchema },
  prompt: `You are an expert comedian specializing in short and funny Hindi jokes (चुटकुले).
Your task is to generate one such joke.
The joke MUST be in Devanagari script.
It should be suitable for a general audience and aim for a light-hearted chuckle.
Avoid controversial or offensive topics. Keep it clean and fun.

Example output format:
{
  "joke": "टीचर: बच्चो, वादा करो कि कभी शराब नहीं पियोगे। बच्चे: जी सर, नहीं पिएंगे। टीचर: कभी जुआ नहीं खेलोगे। बच्चे: जी सर, नहीं खेलेंगे। टीचर: लड़कियों से दूर रहोगे। बच्चे: जी सर रहेंगे। टीचर: और देश के लिए जान दे दोगे। बच्चे: जी सर, दे देंगे... ऐसी जिंदगी का करेंगे भी क्या!"
}

Generate a new, original Hindi joke.
`,
});

const generateHindiJokeFlow = ai.defineFlow(
  {
    name: 'generateHindiJokeFlow',
    outputSchema: GenerateHindiJokeOutputSchema,
  },
  async () => {
    const { output } = await hindiJokeGenerationPrompt({}); // No input needed for the prompt

    if (!output || !output.joke) {
      console.error("AI failed to generate a valid Hindi joke:", output);
      // Provide a fallback joke
      return {
        joke: "माफ़ कीजिए, अभी कोई चुटकुला याद नहीं आ रहा। बाद में प्रयास करें।", // Sorry, can't recall a joke right now. Try later.
      };
    }
    return output;
  }
);
