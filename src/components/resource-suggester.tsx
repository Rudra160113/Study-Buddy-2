
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Cpu, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestResources, type SuggestResourcesInput, type SuggestResourcesOutput } from '@/ai/flows/suggest-resources';
import { Skeleton } from '@/components/ui/skeleton';

const resourceSchema = z.object({
  notes: z.string().min(10, 'Please provide some notes (min 10 characters).'),
  topics: z.string().min(3, 'Please specify topics (min 3 characters).'),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

export function ResourceSuggester() {
  const [suggestedResourcesText, setSuggestedResourcesText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      notes: '',
      topics: '',
    },
  });

  const onSubmit: SubmitHandler<ResourceFormValues> = async (data) => {
    setIsLoading(true);
    setSuggestedResourcesText(null);
    try {
      const result: SuggestResourcesOutput = await suggestResources(data as SuggestResourcesInput);
      setSuggestedResourcesText(result.suggestedResources);
      toast({ title: "Resources Suggested!", description: "AI has provided some resource suggestions." });
    } catch (error) {
      console.error("Error suggesting resources:", error);
      toast({
        title: "Error",
        description: "Could not fetch resource suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><Cpu className="h-7 w-7 text-primary" /> AI Resource Suggester</CardTitle>
          <CardDescription>Enter your notes and topics, and let AI suggest relevant study resources for you.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste or type your study notes here..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topics</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quantum Physics, 18th Century Literature" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the main topics covered in your notes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                <Zap className="mr-2 h-4 w-4" />
                {isLoading ? 'Suggesting...' : 'Suggest Resources'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Suggested Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {suggestedResourcesText && !isLoading && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Suggested Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{suggestedResourcesText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
