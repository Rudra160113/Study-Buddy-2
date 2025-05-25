
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Laugh, RefreshCw } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { useToast } from '@/hooks/use-toast';
import { generateHindiJoke, type GenerateHindiJokeOutput } from '@/ai/flows/generate-hindi-joke-flow';
import { Skeleton } from '@/components/ui/skeleton';

export default function JokesPage() {
  const [currentJoke, setCurrentJoke] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchNewJoke = useCallback(async () => {
    setIsLoading(true);
    setCurrentJoke(null);
    try {
      const jokeData: GenerateHindiJokeOutput = await generateHindiJoke();
      setCurrentJoke(jokeData.joke);
    } catch (error) {
      console.error("Failed to generate Hindi joke:", error);
      toast({
        title: "चुटकुला लाने में समस्या!", // Error fetching joke!
        description: "AI अभी कोई नया चुटकुला नहीं सोच पा रहा है। कृपया पुनः प्रयास करें।", // AI can't think of a new joke right now. Please try again.
        variant: "destructive",
      });
      setCurrentJoke("माफ़ कीजिए, AI अभी थोड़ा आराम कर रहा है। बाद में हंसाएगा!"); // Fallback joke
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch a joke on initial load using useEffect
  useEffect(() => {
    fetchNewJoke();
  }, [fetchNewJoke]); // fetchNewJoke is memoized by useCallback

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-md">
            <Laugh className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            मनोरंजन पिटारा: AI चुटकुले
          </h1>
          <p className="text-xl text-muted-foreground">
            AI द्वारा उत्पन्न मज़ेदार हिंदी चुटकुलों का आनंद लें!
          </p>
        </header>

        <Card className="shadow-xl max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">आज का चुटकुला</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[150px] flex items-center justify-center p-6 bg-secondary/30 rounded-md shadow-inner">
            {isLoading && (
              <div className="w-full space-y-2">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-full mx-auto" />
                <Skeleton className="h-5 w-5/6 mx-auto" />
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-4" />
              </div>
            )}
            {!isLoading && currentJoke && (
              <p 
                className="text-lg md:text-xl text-card-foreground text-center whitespace-pre-line leading-relaxed"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                {currentJoke}
              </p>
            )}
            {!isLoading && !currentJoke && (
                 <p className="text-muted-foreground text-center">AI नया चुटकुला सोच रहा है...</p>
            )}
          </CardContent>
          <CardFooter className="pt-6 flex justify-center">
            <Button onClick={fetchNewJoke} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5" />}
              {isLoading ? "ला रहा है..." : "नया चुटकुला"}
            </Button>
          </CardFooter>
        </Card>
         <p className="text-center text-xs text-muted-foreground mt-4">
            सभी चुटकुले AI द्वारा उत्पन्न किए गए हैं। कृपया विवेक से काम लें।
        </p>
      </div>
    </AppShell>
  );
}
