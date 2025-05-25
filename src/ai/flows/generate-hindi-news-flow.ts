
'use server';
/**
 * @fileOverview A Genkit flow to generate Hindi news headlines and answer related queries.
 *
 * - generateHindiNews - Fetches Hindi news headlines or answers news-related queries.
 * - GenerateHindiNewsInput - The input type for the generateHindiNews function.
 * - GenerateHindiNewsOutput - The return type for the generateHindiNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHindiNewsInputSchema = z.object({
  userQuery: z.string().describe('The user\'s query for news, headlines, or details about a specific news item. Should be in Hindi if possible for best results.'),
});
export type GenerateHindiNewsInput = z.infer<typeof GenerateHindiNewsInputSchema>;

const HeadlineSchema = z.object({
  headline: z.string().describe('The news headline in Hindi (Devanagari script).'),
  summary: z.string().describe('A brief 1-2 sentence summary of the news headline in Hindi (Devanagari script).'),
});

const GenerateHindiNewsOutputSchema = z.object({
  responseType: z.enum(['headlines', 'answer']).describe("Indicates if the response contains a list of headlines or a direct answer to a query."),
  headlines: z.array(HeadlineSchema).optional().describe("An array of news headlines, provided if responseType is 'headlines'."),
  answer: z.string().optional().describe("A detailed answer to the user's query, provided if responseType is 'answer'. In Hindi (Devanagari script)."),
  error: z.string().optional().describe("An error message if news generation failed."),
});
export type GenerateHindiNewsOutput = z.infer<typeof GenerateHindiNewsOutputSchema>;

export async function generateHindiNews(input: GenerateHindiNewsInput): Promise<GenerateHindiNewsOutput> {
  return generateHindiNewsFlow(input);
}

const hindiNewsGenerationPrompt = ai.definePrompt({
  name: 'generateHindiNewsPrompt',
  input: { schema: GenerateHindiNewsInputSchema },
  output: { schema: GenerateHindiNewsOutputSchema },
  prompt: `तुम एक सहायक हिन्दी समाचार प्रदाता हो। तुम्हारा काम भारत से संबंधित हाल की महत्वपूर्ण खबरें और सुर्खियाँ हिन्दी (देवनागरी लिपि) में देना है।

ব্যবহারকারীর প্রশ্ন: "{{userQuery}}"

निर्देश:
1.  यदि ব্যবহারকারী सामान्य समाचार या मुख्य सुर्खियों के लिए पूछता है (उदाहरण के लिए, "आज की मुख्य खबरें", "ताज़ा समाचार", "सुर्खियाँ"), तो 3-4 महत्वपूर्ण समाचार सुर्खियाँ और प्रत्येक का 1-2 वाक्यों में संक्षिप्त सारांश प्रदान करो। responseType को 'headlines' सेट करो।
2.  यदि ব্যবহারকারী किसी विशिष्ट समाचार आइटम या सुर्खी के बारे में अधिक जानकारी पूछता है, तो उस समाचार के बारे में विस्तृत, तथ्यात्मक और निष्पक्ष उत्तर प्रदान करो। responseType को 'answer' सेट करो।
3.  सभी प्रतिक्रियाएँ केवल हिन्दी (देवनागरी लिपि) में होनी चाहिए।
4.  अपनी नवीनतम जानकारी के आधार पर प्रतिक्रिया दो, यह स्वीकार करते हुए कि तुम एक भाषा मॉडल हो और तुम्हारी जानकारी वास्तविक समय की नहीं हो सकती, बल्कि हाल की घटनाओं पर आधारित है। अत्यधिक संवेदनशील या विवादास्पद विषयों पर टिप्पणी करने से बचो।
5.  यदि तुम ব্যবহারকারীর प्रश्न को समझ नहीं पा रहे हो या अनुरोधित समाचार उत्पन्न नहीं कर सकते हो, तो error फ़ील्ड में एक विनम्र संदेश प्रदान करो।

उदाहरण 'headlines' आउटपुट:
{
  "responseType": "headlines",
  "headlines": [
    { "headline": "सरकार ने नई शिक्षा नीति की घोषणा की।", "summary": "इस नीति का उद्देश्य शिक्षा प्रणाली में सुधार करना और इसे और अधिक समग्र बनाना है।" },
    { "headline": "चंद्रयान-3 सफलतापूर्वक प्रक्षेपित हुआ।", "summary": "भारत का महत्वाकांक्षी चंद्र मिशन इसरो द्वारा सफलतापूर्वक लॉन्च किया गया।" }
  ]
}

उदाहरण 'answer' आउटपुट:
{
  "responseType": "answer",
  "answer": "नई शिक्षा नीति के तहत, पाठ्यक्रम में व्यावसायिक शिक्षा और कौशल विकास पर अधिक ध्यान दिया जाएगा। इसका उद्देश्य छात्रों को भविष्य की नौकरियों के लिए बेहतर तरीके से तैयार करना है।"
}

अब, ব্যবহারকারীর प्रश्न के आधार पर समाचार प्रदान करो।`,
});

const generateHindiNewsFlow = ai.defineFlow(
  {
    name: 'generateHindiNewsFlow',
    inputSchema: GenerateHindiNewsInputSchema,
    outputSchema: GenerateHindiNewsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await hindiNewsGenerationPrompt(input);
      if (!output) {
        console.error("AI failed to generate Hindi news, output is null/undefined.");
        return { responseType: 'answer', answer: "माफ़ कीजिए, मैं अभी समाचार उत्पन्न नहीं कर सका। कृपया बाद में प्रयास करें।", error: "AI output was null." };
      }
       // Ensure either headlines or answer is present based on responseType
      if (output.responseType === 'headlines' && (!output.headlines || output.headlines.length === 0)) {
        return { responseType: 'answer', answer: "मुझे अभी कोई मुख्य सुर्खियाँ नहीं मिल पा रही हैं।", error: "Headlines requested but not provided or empty." };
      }
      if (output.responseType === 'answer' && !output.answer) {
         return { responseType: 'answer', answer: "मैं आपके प्रश्न का उत्तर अभी नहीं दे पा रहा हूँ।", error: "Answer requested but not provided." };
      }
      return output;
    } catch (e) {
      console.error("Error in generateHindiNewsFlow:", e);
      return { responseType: 'answer', answer: "समाचार उत्पन्न करने में एक त्रुटि हुई।", error: e instanceof Error ? e.message : "Unknown error" };
    }
  }
);
