
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2, Sparkles, Send } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleFriendlyQuery, type FriendlyQueryInput, type FriendlyQueryOutput } from '@/ai/flows/friendly-query-handler-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const querySchema = z.object({
  userQuery: z.string().min(5, 'Please ask a question (min 5 characters).'),
});
type QueryFormValues = z.infer<typeof querySchema>;

export default function QueryHandlerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      userQuery: '',
    },
  });

  const onSubmit: SubmitHandler<QueryFormValues> = async (data) => {
    setIsLoading(true);
    setAiAnswer(null);
    try {
      const result: FriendlyQueryOutput = await handleFriendlyQuery(data as FriendlyQueryInput);
      setAiAnswer(result.answer);
      toast({ title: "Answer Received!", description: "Your friendly AI Study Buddy has responded." });
    } catch (error) {
      console.error("Error handling query:", error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't get an answer right now. Please try again.",
        variant: "destructive",
      });
      setAiAnswer("I encountered an issue trying to get an answer for you. Please try asking again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center mb-10">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-md">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Ask Your Doubts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question? No matter how big or small, your friendly AI Study Buddy is here to help!
          </p>
        </header>

        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="text-accent h-6 w-6" />
              What's on your mind?
            </CardTitle>
            <CardDescription>
              Type your question or doubt below, and I'll do my best to explain it in a friendly way.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userQuery" className="sr-only">Your Question</Label>
                <Textarea
                  id="userQuery"
                  placeholder="e.g., Can you explain photosynthesis in simple terms? or What's the difference between an adjective and an adverb?"
                  {...form.register('userQuery')}
                  rows={5}
                  className="shadow-inner focus:ring-primary/50"
                />
                {form.formState.errors.userQuery && <p className="text-sm text-destructive mt-1">{form.formState.errors.userQuery.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isLoading ? 'Getting Answer...' : 'Ask AI Buddy'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && !aiAnswer && (
          <Card className="shadow-lg max-w-2xl mx-auto mt-8">
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        )}

        {aiAnswer && !isLoading && (
          <Card className="shadow-xl max-w-2xl mx-auto mt-8 animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" /> AI Study Buddy's Answer:
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-secondary/30 p-6 rounded-md shadow-inner">
              <p className="whitespace-pre-line text-md leading-relaxed text-card-foreground">
                {aiAnswer}
              </p>
            </CardContent>
             <CardFooter className="pt-4">
                <p className="text-xs text-muted-foreground">Remember, I'm an AI and can make mistakes. Always cross-check important information!</p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
