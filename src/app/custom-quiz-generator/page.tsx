
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { HelpCircle, ListPlus, Loader2, Wand2, ThumbsUp } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateCustomQuestions, 
  type GenerateCustomQuestionsInput, 
  type GenerateCustomQuestionsOutput,
  GenerateCustomQuestionsInputSchema // Import the schema for direct use
} from '@/ai/flows/generate-custom-questions-flow';
import { Skeleton } from '@/components/ui/skeleton';

// Directly use the enums from the schema for consistency
const classLevels = GenerateCustomQuestionsInputSchema.shape.classLevel._def.values;
const questionStyles = GenerateCustomQuestionsInputSchema.shape.questionStyle._def.values;


export default function CustomQuizGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
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
    setGeneratedQuestions([]);
    try {
      const result: GenerateCustomQuestionsOutput = await generateCustomQuestions(data);
      if (result.questions && result.questions.length > 0) {
        setGeneratedQuestions(result.questions);
        toast({ title: "Questions Generated!", description: "Your custom questions are ready." });
      } else {
        setGeneratedQuestions(["The AI couldn't generate questions for this specific request. Please try adjusting your input."]);
        toast({ title: "No Questions Generated", description: "Please refine your topic or style and try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error generating custom questions:", error);
      toast({
        title: "Error",
        description: "Could not generate questions. Please try again later.",
        variant: "destructive",
      });
       setGeneratedQuestions(["An error occurred while generating questions. Please try again."]);
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
            Custom Question Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI-generated open-ended questions tailored to your study needs.
          </p>
        </header>

        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><HelpCircle className="text-accent" />Describe Your Needs</CardTitle>
            <CardDescription>Fill in the details below to generate your custom questions.</CardDescription>
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
                      <FormDescription>The more detail you provide, the better the questions will be.</FormDescription>
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
                        <FormLabel>Number of Questions (1-10)</FormLabel>
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
                  {isLoading ? 'Generating...' : 'Generate Questions'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {(isLoading || generatedQuestions.length > 0) && (
          <Card className="shadow-lg max-w-2xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><ThumbsUp className="text-accent"/>Generated Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-3">
                  {[...Array(form.getValues("numberOfQuestions") || 3)].map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && generatedQuestions.length > 0 && (
                <ul className="space-y-4">
                  {generatedQuestions.map((q, index) => (
                    <li key={index} className="p-4 bg-secondary/30 rounded-md shadow-sm">
                      <p className="text-md text-card-foreground whitespace-pre-line">
                        <strong className="text-primary">Q{index + 1}:</strong> {q}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
