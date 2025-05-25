
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { HelpCircle, ListPlus, Loader2, Wand2, ThumbsUp, BookOpen } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateCustomQuestions,
} from '@/ai/flows/generate-custom-questions-flow';
import { 
  GenerateCustomQuestionsInputSchema,
  type GenerateCustomQuestionsInput, 
  type GenerateCustomQuestionsOutput,
  type QuestionAnswerPair,
  classLevels,
  questionStyles
} from '@/lib/schemas/custom-questions-schemas';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


export default function CustomQuizGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPairs, setGeneratedPairs] = useState<QuestionAnswerPair[]>([]);
  const { toast } = useToast();

  const form = useForm<GenerateCustomQuestionsInput>({
    resolver: zodResolver(GenerateCustomQuestionsInputSchema),
    defaultValues: {
      classLevel: "Grade 10",
      subject: '',
      topicDetails: '',
      questionStyle: "Short Answer (1-2 sentences)",
      numberOfQuestions: 3,
    },
  });

  const onSubmit: SubmitHandler<GenerateCustomQuestionsInput> = async (data) => {
    setIsLoading(true);
    setGeneratedPairs([]);
    try {
      const result: GenerateCustomQuestionsOutput = await generateCustomQuestions(data);
      if (result.questionAnswerPairs && result.questionAnswerPairs.length > 0) {
        setGeneratedPairs(result.questionAnswerPairs);
        toast({ title: "Questions & Answers Generated!", description: "Your custom Q&A pairs are ready." });
      } else {
        setGeneratedPairs([{
          question: "The AI couldn't generate questions and answers for this specific request. Please try adjusting your input.",
          answer: "N/A"
        }]);
        toast({ title: "No Q&A Generated", description: "Please refine your topic or style and try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error generating custom questions and answers:", error);
      toast({
        title: "Error",
        description: "Could not generate questions and answers. Please try again later.",
        variant: "destructive",
      });
       setGeneratedPairs([{
         question: "An error occurred while generating questions and answers. Please try again.",
         answer: "N/A"
        }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center mb-10">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-md">
            <Wand2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Custom Q&A Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI-generated open-ended questions with answers, tailored to your study needs.
          </p>
        </header>

        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><HelpCircle className="text-accent" />Describe Your Needs</CardTitle>
            <CardDescription>Fill in the details below to generate your custom questions and answers.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="classLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Biology, Algebra II" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="topicDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Details / Chapter Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a summary of the chapter, key concepts, or specific areas you want questions about..." 
                          {...field} 
                          rows={5} 
                        />
                      </FormControl>
                      <FormDescription>The more detail you provide, the better the questions and answers will be.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Style</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select question style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {questionStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="numberOfQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Q&A (1-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" max="10" 
                            placeholder="e.g., 3" 
                            {...field}
                            onChange={event => field.onChange(+event.target.value)} // Ensure value is number
                           />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListPlus className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Generating...' : 'Generate Q&A'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {(isLoading || generatedPairs.length > 0) && (
          <Card className="shadow-lg max-w-2xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><ThumbsUp className="text-accent"/>Generated Q&A Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-3">
                  {[...Array(form.getValues("numberOfQuestions") || 3)].map((_, i) => (
                    <div key={i} className="space-y-2 p-3 border rounded-md">
                        <Skeleton className="h-5 w-1/4 mb-1" /> {/* For "Question X:" */}
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-5 w-1/6 mt-2 mb-1" /> {/* For "Answer:" */}
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && generatedPairs.length > 0 && (
                <Accordion type="single" collapsible className="w-full" defaultValue={generatedPairs.length > 0 ? "item-0" : undefined}>
                  {generatedPairs.map((pair, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-md hover:no-underline text-left">
                        <strong className="text-primary mr-2">Q{index + 1}:</strong> {pair.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pl-6 pr-2">
                        <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-accent mt-1 shrink-0" />
                            <p className="whitespace-pre-line">{pair.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
