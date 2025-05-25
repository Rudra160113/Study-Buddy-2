
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CodeXml, Lightbulb, Zap, BookOpen, Brain } from 'lucide-react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateCodingLesson, type GenerateCodingLessonInput, type GenerateCodingLessonOutput } from '@/ai/flows/generate-coding-lesson-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const lessonRequestSchema = z.object({
  language: z.string().min(1, 'Programming language is required.'),
  topic: z.string().min(1, 'Topic is required.'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], { required_error: "Difficulty level is required." }),
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
  const { toast } = useToast();

  const form = useForm<LessonRequestFormValues>({
    resolver: zodResolver(lessonRequestSchema),
    defaultValues: {
      language: '',
      topic: '',
      difficulty: 'beginner',
    },
  });

  const onSubmit: SubmitHandler<LessonRequestFormValues> = async (data) => {
    setIsLoading(true);
    setLesson(null);
    try {
      const result = await generateCodingLesson(data as GenerateCodingLessonInput);
      // Ensure a default empty array if any of these are undefined from the AI
      setLesson({
        ...result,
        concepts: result.concepts || [],
        codeExamples: result.codeExamples || [],
        exercises: result.exercises || [],
        suggestedNextTopics: result.suggestedNextTopics || [],
      });
      toast({ title: "Lesson Generated!", description: `Your lesson on ${data.topic} in ${data.language} is ready.` });
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
            Learn to code with AI assistance. Start your journey from novice to pro!
          </p>
        </header>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-10 w-10 text-accent" />
              <CardTitle className="text-3xl">AI Coding Tutor</CardTitle>
            </div>
            <CardDescription className="text-md">
              Tell us what you want to learn, and our AI tutor will generate a personalized lesson for you.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Input id="language" placeholder="e.g., Python, JavaScript" {...form.register('language')} />
                  {form.formState.errors.language && <p className="text-sm text-destructive mt-1">{form.formState.errors.language.message}</p>}
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" placeholder="e.g., Variables, Loops, Functions" {...form.register('topic')} />
                  {form.formState.errors.topic && <p className="text-sm text-destructive mt-1">{form.formState.errors.topic.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Controller
                  name="difficulty"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.difficulty && <p className="text-sm text-destructive mt-1">{form.formState.errors.difficulty.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                {isLoading ? 'Generating Lesson...' : 'Generate Lesson'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && (
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

        {lesson && !isLoading && (
          <Card className="shadow-xl w-full max-w-4xl mx-auto mt-8 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{lesson.lessonTitle}</CardTitle>
              {lesson.introduction && <CardDescription className="text-md pt-2">{lesson.introduction}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.concepts && lesson.concepts.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent" />Key Concepts</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {lesson.concepts.map((concept, index) => (
                      <AccordionItem value={`concept-${index}`} key={`concept-${index}`}>
                        <AccordionTrigger className="text-lg hover:no-underline">{concept.name}</AccordionTrigger>
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
                        <CardDescription>{example.description}</CardDescription>
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
                         <AccordionTrigger className="text-lg hover:no-underline">Exercise {index + 1}: {exercise.statement.substring(0,50)}...</AccordionTrigger>
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
                <p className="text-sm text-muted-foreground">End of lesson. Ready to learn more?</p>
            </CardFooter>
          </Card>
        )}

        <div className="flex justify-center mt-12">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CodeXml className="h-10 w-10 text-primary" />
                <CardTitle className="text-3xl">Practice IDE</CardTitle>
              </div>
              <CardDescription className="text-md">
                Test your knowledge and experiment with code in our integrated development environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button disabled className="w-full bg-primary hover:bg-primary/90">
                Launch Coding Environment
              </Button>
              <p className="text-sm text-center text-muted-foreground pt-4">
                The interactive IDE is currently under construction. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}

// Loader icon for button, if not already globally available
const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

    