
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Newspaper, Loader2, Send, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateHindiNews, type GenerateHindiNewsInput, type GenerateHindiNewsOutput, type HeadlineSchema as Headline } from '@/ai/flows/generate-hindi-news-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const newsQuerySchema = z.object({
  userQuery: z.string().min(3, 'कृपया अपना प्रश्न लिखें (कम से कम 3 अक्षर)।'), // Please type your question (min 3 characters)
});
type NewsQueryFormValues = z.infer<typeof newsQuerySchema>;

export default function HindiNewsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [newsResponse, setNewsResponse] = useState<GenerateHindiNewsOutput | null>(null);
  const [currentQueryText, setCurrentQueryText] = useState("आज की मुख्य खबरें बताएं"); // Default query

  const { toast } = useToast();

  const form = useForm<NewsQueryFormValues>({
    resolver: zodResolver(newsQuerySchema),
    defaultValues: {
      userQuery: currentQueryText,
    },
  });
  
  // Sync react-hook-form with currentQueryText state
  useEffect(() => {
    form.setValue('userQuery', currentQueryText);
  }, [currentQueryText, form]);


  const fetchNews = useCallback(async (query: string) => {
    setIsLoading(true);
    setNewsResponse(null);
    try {
      const result = await generateHindiNews({ userQuery: query });
      setNewsResponse(result);
      if (result.error) {
        toast({ title: "त्रुटि!", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching Hindi news:", error);
      toast({
        title: "त्रुटि!",
        description: "समाचार प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
      setNewsResponse({ responseType: 'answer', answer: "समाचार लोड करने में एक तकनीकी समस्या हुई।", error: "Network or flow error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch initial headlines on load
  useEffect(() => {
    fetchNews("आज की मुख्य खबरें बताएं");
  }, [fetchNews]);

  const onSubmit: SubmitHandler<NewsQueryFormValues> = (data) => {
    fetchNews(data.userQuery);
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center mb-10">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-md">
            <Newspaper className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            हिन्दी समाचार
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            AI द्वारा संचालित भारत की नवीनतम समाचार सुर्खियाँ और जानकारी प्राप्त करें।
          </p>
        </header>

        <Card className="shadow-xl max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              <Sparkles className="text-accent h-6 w-6" />
              AI से पूछें
            </CardTitle>
            <CardDescription style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              नवीनतम समाचारों के लिए पूछें, या किसी विशिष्ट खबर के बारे में अधिक जानकारी प्राप्त करें।
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userQuery" className="sr-only">आपका प्रश्न</Label>
                <Textarea
                  id="userQuery"
                  placeholder="जैसे: आज की मुख्य खबरें बताएं, या किसी खबर के बारे में पूछें..."
                  {...form.register('userQuery')}
                  value={currentQueryText}
                  onChange={(e) => setCurrentQueryText(e.target.value)}
                  rows={3}
                  className="shadow-inner focus:ring-primary/50"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                />
                {form.formState.errors.userQuery && <p className="text-sm text-destructive mt-1">{form.formState.errors.userQuery.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                <span style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  {isLoading ? 'खोज रहा है...' : 'पूछें'}
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>

        {(isLoading || newsResponse) && (
          <Card className="shadow-lg max-w-3xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                <Newspaper className="h-6 w-6 text-primary" /> AI समाचार प्रतिक्रिया
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px]">
              {isLoading && (
                <div className="space-y-4 p-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-6 w-1/2 mt-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              )}
              {!isLoading && newsResponse && (
                <div className="space-y-4">
                  {newsResponse.responseType === 'headlines' && newsResponse.headlines && newsResponse.headlines.length > 0 && (
                    <div className="space-y-3">
                      {newsResponse.headlines.map((item, index) => (
                        <Card key={index} className="bg-secondary/30 p-4 shadow-sm">
                          <h3 className="text-lg font-semibold text-primary mb-1" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{item.headline}</h3>
                          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{item.summary}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                  {newsResponse.responseType === 'answer' && newsResponse.answer && (
                    <p className="whitespace-pre-line text-md leading-relaxed text-card-foreground" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                      {newsResponse.answer}
                    </p>
                  )}
                  {newsResponse.error && newsResponse.responseType === 'answer' && !newsResponse.answer && (
                     <p className="whitespace-pre-line text-md leading-relaxed text-destructive" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                      {newsResponse.error}
                    </p>
                  )}
                   {!newsResponse.headlines && !newsResponse.answer && !newsResponse.error && (
                     <p className="text-muted-foreground text-center py-4" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>AI से प्रतिक्रिया की प्रतीक्षा है...</p>
                   )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
         <p className="text-center text-xs text-muted-foreground mt-4" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            सभी समाचार AI द्वारा उत्पन्न किए गए हैं और केवल सूचनात्मक उद्देश्यों के लिए हैं। नवीनतम और सटीक जानकारी के लिए विश्वसनीय समाचार स्रोतों से पुष्टि करें।
          </p>
      </div>
    </AppShell>
  );
}
