
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Lightbulb, RefreshCw, Trophy, TrendingUp, Loader2, Brain, Send } from 'lucide-react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateHindiRiddle, type GenerateHindiRiddleInput, type GenerateHindiRiddleOutput } from '@/ai/flows/generate-hindi-riddle-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CurrentRiddleState extends GenerateHindiRiddleOutput {}

const MAX_LEVELS = 50;

export default function HindiRiddlesPage() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentRiddle, setCurrentRiddle] = useState<CurrentRiddleState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [gameState, setGameState] = useState<'IDLE' | 'LOADING' | 'PLAYING' | 'ANSWERED' | 'GAME_OVER'>('IDLE');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNewRiddle = useCallback(async (currentLevel: number) => {
    setGameState('LOADING');
    setCurrentRiddle(null);
    setSelectedAnswer(undefined);
    setIsCorrect(null);
    try {
      const riddleData = await generateHindiRiddle({ level: currentLevel });
      setCurrentRiddle(riddleData);
      setGameState('PLAYING');
    } catch (error) {
      console.error("Failed to generate Hindi riddle:", error);
      toast({
        title: "समस्या!",
        description: "पहेली लोड करने में असमर्थ। कृपया पुनः प्रयास करें।", // Error! Could not load riddle. Please try again.
        variant: "destructive",
      });
      // Fallback riddle
      setCurrentRiddle({
        riddle: "एक छोटा सा फकीर, जिसके पेट में लकीर। बताओ क्या?",
        options: ["नारियल", "केला", "सेब", "आम"],
        correctAnswer: "नारियल"
      });
      setGameState('PLAYING'); // Allow playing with fallback
    }
  }, [toast]);
  
  const handleStartGame = () => {
    setLevel(1);
    setScore(0);
    fetchNewRiddle(1);
    toast({ title: "खेल शुरू!", description: "सही उत्तर चुनें और अंक अर्जित करें!" }); // Game started! Choose the correct answer and earn points!
  };

  const handleSubmitAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (gameState !== 'PLAYING' || !currentRiddle || selectedAnswer === undefined) {
        if(selectedAnswer === undefined) {
            toast({ title: "कोई उत्तर नहीं", description: "कृपया एक विकल्प चुनें।", variant: "destructive" }); // No answer. Please choose an option.
        }
        return;
    }

    setGameState('ANSWERED');
    const correct = selectedAnswer === currentRiddle.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const pointsEarned = 10 * level;
      setScore(prevScore => prevScore + pointsEarned);
      toast({ title: "बहुत बढ़िया!", description: `सही उत्तर! +${pointsEarned} अंक।`, className: "bg-green-500 text-white" }); // Excellent! Correct answer! +X points.
    } else {
      toast({ title: "गलत जवाब", description: `सही उत्तर था: ${currentRiddle.correctAnswer}`, variant: "destructive" }); // Wrong answer. The correct answer was: X
    }
  };

  const handleNextRiddle = () => {
    if (level < MAX_LEVELS) {
      const newLevel = level + 1;
      setLevel(newLevel);
      fetchNewRiddle(newLevel);
    } else {
      setGameState('GAME_OVER');
      toast({ title: "खेल समाप्त!", description: `बधाई हो! आपने सभी ${MAX_LEVELS} स्तर पूरे कर लिए हैं। आपका कुल स्कोर: ${score}` }); // Game Over! Congratulations! You've completed all X levels. Your total score: Y
    }
  };
  
  if (!isClient) {
    return (
        <AppShell>
            <div className="container mx-auto py-8 text-center">
                <p>हिंदी पहेलियाँ लोड हो रही हैं...</p> {/* Loading Hindi Riddles... */}
                <Skeleton className="h-64 w-full max-w-md mx-auto mt-4" />
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            हिंदी पहेलियाँ Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            इन मज़ेदार हिंदी पहेलियों को बूझें और अपने ज्ञान का परीक्षण करें!
          </p> {/* Solve these fun Hindi riddles and test your knowledge! */}
        </header>

        {gameState === 'IDLE' || gameState === 'GAME_OVER' ? (
          <Card className="shadow-xl max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Brain className="h-10 w-10 text-accent" />
                {gameState === 'GAME_OVER' ? "खेल समाप्त!" : "चुनौती के लिए तैयार हैं?"} {/* Ready for the challenge? */}
              </CardTitle>
              {score > 0 && (
                 <CardDescription className="text-lg font-semibold">
                    अंतिम स्कोर: {score} {/* Last Score: X */}
                 </CardDescription>
              )}
               {level > 1 && gameState === 'GAME_OVER' && (
                 <CardDescription className="text-md text-muted-foreground">
                    स्तर तक पहुँचे: {level} {/* Reached Level: X */}
                 </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                {gameState === 'GAME_OVER' ? "आपने बहुत अच्छा खेला!" : "AI द्वारा उत्पन्न हिंदी पहेलियों को हल करें। प्रत्येक सही उत्तर के लिए अंक अर्जित करें।"}
              </p> {/* Solve AI-generated Hindi riddles. Earn points for each correct answer. */}
              <Button onClick={handleStartGame} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                {gameState === 'GAME_OVER' ? "पुनः खेलें" : "खेल शुरू करें"} {/* Play Again / Start Game */}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center text-lg">
                <div className="font-semibold text-primary flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" /> स्तर: {level} {/* Level: X */}
                </div>
                <div className="font-semibold text-accent flex items-center gap-1">
                  <Trophy className="h-5 w-5" /> स्कोर: {score} {/* Score: X */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-center min-h-[250px] flex flex-col justify-center items-center">
              {gameState === 'LOADING' && (
                <div className="space-y-3 py-4 w-full">
                    <Skeleton className="h-8 w-full mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mt-3" />
                    <p className="text-sm text-muted-foreground">AI आपके लिए एक नई पहेली तैयार कर रहा है...</p> {/* AI is preparing a new riddle for you... */}
                </div>
              )}
              {gameState === 'PLAYING' && currentRiddle && (
                <form onSubmit={handleSubmitAnswer} className="space-y-6 w-full">
                  <div className="my-4 p-4 bg-secondary/30 rounded-md shadow w-full">
                    <Label htmlFor="riddle-statement" className="text-xl md:text-2xl font-medium text-card-foreground text-center block whitespace-pre-line leading-relaxed" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                        {currentRiddle.riddle}
                    </Label>
                  </div>
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    aria-labelledby="riddle-statement"
                  >
                    {currentRiddle.options.map((option, index) => (
                      <Label
                        key={index}
                        htmlFor={`option-${index}`}
                        className={cn(
                            "flex items-center justify-center text-center space-x-2 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/20 text-md",
                            selectedAnswer === option ? 'bg-primary text-primary-foreground ring-2 ring-primary-foreground' : 'bg-card hover:border-primary',
                            "min-h-[60px]"
                        )}
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} className="sr-only" />
                        <span>{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={selectedAnswer === undefined}>
                    <Send className="mr-2 h-5 w-5" /> उत्तर जमा करें {/* Submit Answer */}
                  </Button>
                </form>
              )}
              {gameState === 'ANSWERED' && currentRiddle && (
                <div className="space-y-6 w-full flex flex-col items-center">
                     <div className="my-4 p-4 bg-secondary/30 rounded-md shadow w-full">
                        <p className="text-xl md:text-2xl font-medium text-card-foreground text-center block whitespace-pre-line leading-relaxed" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                            {currentRiddle.riddle}
                        </p>
                    </div>
                    <p className={cn("text-2xl font-semibold", isCorrect ? "text-green-500" : "text-destructive")}>
                        {isCorrect ? "सही जवाब!" : "गलत जवाब!"}
                    </p>
                    {!isCorrect && <p className="text-lg text-muted-foreground">सही उत्तर था: <span className="font-semibold" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{currentRiddle.correctAnswer}</span></p>}
                    <Button onClick={handleNextRiddle} className="w-1/2">
                        {level < MAX_LEVELS ? "अगली पहेली" : "खेल समाप्त करें"} {/* Next Riddle / Finish Game */}
                    </Button>
                </div>
              )}

            </CardContent>
            <CardFooter className="pt-4 flex-col items-center gap-2">
               <p className="text-xs text-muted-foreground pt-2 text-center">
                AI द्वारा उत्पन्न हिंदी पहेलियाँ। ध्यान से चुनें!
              </p> {/* Hindi riddles generated by AI. Choose wisely! */}
            </CardFooter>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

