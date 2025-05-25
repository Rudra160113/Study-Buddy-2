
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CodeXml, Lightbulb, Zap, BookOpen, Brain, TerminalSquare, Send, Loader2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateCodingLesson, type GenerateCodingLessonInput, type GenerateCodingLessonOutput } from '@/ai/flows/generate-coding-lesson-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const lessonRequestSchema = z.object({
  userPrompt: z.string().min(10, 'Please describe what you want to learn (min 10 characters).'),
});

type LessonRequestFormValues = z.infer<typeof lessonRequestSchema>;

interface CodeExample {
  code: string;
  language: string;
  description: string;
}

interface Concept {
  name: string;
  explanation: string;
}

interface Exercise {
  statement: string;
  hints?: string[];
}

interface DisplayLesson extends Omit<GenerateCodingLessonOutput, 'codeExamples' | 'concepts' | 'exercises'> {
  codeExamples: CodeExample[];
  concepts: Concept[];
  exercises: Exercise[];
}


export default function CodingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<DisplayLesson | null>(null);
  const [currentPromptText, setCurrentPromptText] = useState("Tell me about Python functions, explain like I'm a beginner.");
  const { toast } = useToast();

  const form = useForm<LessonRequestFormValues>({
    resolver: zodResolver(lessonRequestSchema),
    defaultValues: {
      userPrompt: currentPromptText,
    },
  });
  
  // Sync react-hook-form with currentPromptText state
  useEffect(() => {
    form.setValue('userPrompt', currentPromptText);
  }, [currentPromptText, form]);


  const onSubmit: SubmitHandler<LessonRequestFormValues> = async (data) => {
    setIsLoading(true);
    // Do not set lesson to null immediately, allow current lesson to be visible while new one loads
    // setLesson(null); 
    try {
      const result = await generateCodingLesson(data as GenerateCodingLessonInput);
      setLesson({
        ...result,
        concepts: result.concepts || [],
        codeExamples: result.codeExamples || [],
        exercises: result.exercises || [],
        suggestedNextTopics: result.suggestedNextTopics || [],
      });
      toast({ title: "Lesson Generated!", description: `Your new lesson is ready.` });
      // Clear the prompt for the next question, or set a follow-up placeholder
      setCurrentPromptText(""); 
      form.reset({ userPrompt: "" });

    } catch (error) {
      console.error("Error generating lesson:", error);
      toast({
        title: "Error",
        description: "Could not generate coding lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Coding Zone
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn to code with AI assistance. Ask anything, from basic concepts to advanced topics!
          </p>
        </header>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-10 w-10 text-accent" />
              <CardTitle className="text-3xl">AI Coding Tutor</CardTitle>
            </div>
            <CardDescription className="text-md">
              Describe what you want to learn, or ask a follow-up question about the current lesson.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="userPrompt">Your Learning Request or Question</Label>
                <Textarea 
                  id="userPrompt" 
                  placeholder={lesson ? "Ask a follow-up or a new coding question..." : "e.g., Explain Python lists for beginners, What are async functions in JavaScript?, How do I use the Rust borrow checker?"}
                  {...form.register('userPrompt')} 
                  rows={4}
                  value={currentPromptText}
                  onChange={(e) => setCurrentPromptText(e.target.value)}
                />
                {form.formState.errors.userPrompt && <p className="text-sm text-destructive mt-1">{form.formState.errors.userPrompt.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isLoading ? 'Generating...' : (lesson ? 'Ask Follow-up / New Question' : 'Generate Lesson')}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && !lesson && ( // Show this skeleton only if it's the initial loading state
          <Card className="shadow-lg w-full max-w-3xl mx-auto mt-8">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-3/4 mt-4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-full mt-4" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        )}
        
        {isLoading && lesson && ( // Show a more subtle loading indicator when a lesson is already displayed
             <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Generating new content...</p>
            </div>
        )}


        {lesson && ! (isLoading && !lesson) && ( // Render lesson if available and not in initial loading state
          <Card className="shadow-xl w-full max-w-4xl mx-auto mt-8 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{lesson.lessonTitle}</CardTitle>
              {lesson.introduction && <CardDescription className="text-md pt-2 whitespace-pre-line">{lesson.introduction}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.concepts && lesson.concepts.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent" />Key Concepts</h3>
                  <Accordion type="single" collapsible className="w-full" defaultValue="concept-0">
                    {lesson.concepts.map((concept, index) => (
                      <AccordionItem value={`concept-${index}`} key={`concept-${index}`}>
                        <AccordionTrigger className="text-lg hover:no-underline text-left">{concept.name}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {concept.explanation}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {lesson.codeExamples && lesson.codeExamples.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center"><CodeXml className="mr-2 h-5 w-5 text-accent" />Code Examples</h3>
                  {lesson.codeExamples.map((example, index) => (
                    <Card key={`code-${index}`} className="mb-4 bg-secondary/30">
                      <CardHeader className="pb-2">
                         <p className="text-sm font-medium text-muted-foreground">Language: {example.language || "not specified"}</p>
                        <CardDescription className="whitespace-pre-line">{example.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-background p-4 rounded-md shadow overflow-x-auto">
                          <code className={`language-${example.language} text-sm`}>{example.code}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {lesson.exercises && lesson.exercises.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center"><Zap className="mr-2 h-5 w-5 text-accent" />Exercises</h3>
                   <Accordion type="single" collapsible className="w-full">
                    {lesson.exercises.map((exercise, index) => (
                       <AccordionItem value={`exercise-${index}`} key={`exercise-${index}`}>
                         <AccordionTrigger className="text-lg hover:no-underline text-left">Exercise {index + 1}: {exercise.statement.substring(0,70)}{exercise.statement.length > 70 ? "..." : ""}</AccordionTrigger>
                         <AccordionContent>
                           <p className="text-muted-foreground mb-2 whitespace-pre-line">{exercise.statement}</p>
                           {exercise.hints && exercise.hints.length > 0 && (
                             <div>
                               <h4 className="font-semibold text-sm">Hints:</h4>
                               <ul className="list-disc list-inside text-xs text-muted-foreground/80">
                                 {exercise.hints.map((hint, hIndex) => <li key={hIndex}>{hint}</li>)}
                               </ul>
                             </div>
                           )}
                         </AccordionContent>
                       </AccordionItem>
                    ))}
                   </Accordion>
                </div>
              )}
              
              {lesson.summary && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center"><BookOpen className="mr-2 h-5 w-5 text-accent" />Summary</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{lesson.summary}</p>
                </div>
              )}

              {lesson.suggestedNextTopics && lesson.suggestedNextTopics.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">Suggested Next Topics (Your Coding Planner):</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {lesson.suggestedNextTopics.map((topic, index) => (
                      <li key={`next-${index}`}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">End of lesson. Ask a follow-up question above or request a new topic!</p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
