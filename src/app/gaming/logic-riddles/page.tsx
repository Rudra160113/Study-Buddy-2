
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Lightbulb, RefreshCw, Trophy, TrendingUp, Loader2, BrainCircuit, Send } from 'lucide-react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateLogicRiddle, type GenerateLogicRiddleInput, type GenerateLogicRiddleOutput } from '@/ai/flows/generate-logic-riddle-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CurrentRiddleState extends GenerateLogicRiddleOutput {}

const MAX_LEVELS = 50;

export default function LogicRiddlesPage() {
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
      const riddleData = await generateLogicRiddle({ level: currentLevel });
      setCurrentRiddle(riddleData);
      setGameState('PLAYING');
    } catch (error) {
      console.error("Failed to generate logic riddle:", error);
      toast({
        title: "Error!",
        description: "Could not load riddle. Please try again.",
        variant: "destructive",
      });
      setCurrentRiddle({
        riddle: "What has to be broken before you can use it?",
        options: ["An egg", "A promise", "A window", "A record"],
        correctAnswer: "An egg"
      });
      setGameState('PLAYING'); 
    }
  }, [toast]);
  
  const handleStartGame = () => {
    setLevel(1);
    setScore(0);
    fetchNewRiddle(1);
    toast({ title: "Game Started!", description: "Solve the riddle and earn points!" });
  };

  const handleSubmitAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (gameState !== 'PLAYING' || !currentRiddle || selectedAnswer === undefined) {
        if(selectedAnswer === undefined) {
            toast({ title: "No Answer Selected", description: "Please choose an option.", variant: "destructive" });
        }
        return;
    }

    setGameState('ANSWERED');
    const correct = selectedAnswer === currentRiddle.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const pointsEarned = 10 * level;
      setScore(prevScore => prevScore + pointsEarned);
      toast({ title: "Excellent!", description: `Correct answer! +${pointsEarned} points.`, className: "bg-green-500 text-white" });
    } else {
      toast({ title: "Incorrect", description: `The correct answer was: ${currentRiddle.correctAnswer}`, variant: "destructive" });
    }
  };

  const handleNextRiddle = () => {
    if (level < MAX_LEVELS) {
      const newLevel = level + 1;
      setLevel(newLevel);
      fetchNewRiddle(newLevel);
    } else {
      setGameState('GAME_OVER');
      toast({ title: "Game Over!", description: `Congratulations! You've completed all ${MAX_LEVELS} levels. Your total score: ${score}` });
    }
  };
  
  if (!isClient) {
    return (
        <AppShell>
            <div className="container mx-auto py-8 text-center">
                <p>Loading Logic Riddles...</p>
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
            Logic Riddles Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your wits with these AI-generated brain teasers!
          </p>
        </header>

        {gameState === 'IDLE' || gameState === 'GAME_OVER' ? (
          <Card className="shadow-xl max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <BrainCircuit className="h-10 w-10 text-accent" />
                {gameState === 'GAME_OVER' ? "Game Over!" : "Ready for a Challenge?"}
              </CardTitle>
              {score > 0 && (
                 <CardDescription className="text-lg font-semibold">
                    Final Score: {score}
                 </CardDescription>
              )}
               {level > 1 && gameState === 'GAME_OVER' && (
                 <CardDescription className="text-md text-muted-foreground">
                    Reached Level: {level}
                 </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                {gameState === 'GAME_OVER' ? "You played well!" : "Solve AI-generated logic riddles. Earn points for each correct answer."}
              </p>
              <Button onClick={handleStartGame} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                {gameState === 'GAME_OVER' ? "Play Again" : "Start Game"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center text-lg">
                <div className="font-semibold text-primary flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" /> Level: {level}
                </div>
                <div className="font-semibold text-accent flex items-center gap-1">
                  <Trophy className="h-5 w-5" /> Score: {score}
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
                    <p className="text-sm text-muted-foreground">AI is brewing a new brain teaser...</p>
                </div>
              )}
              {gameState === 'PLAYING' && currentRiddle && (
                <form onSubmit={handleSubmitAnswer} className="space-y-6 w-full">
                  <div className="my-4 p-4 bg-secondary/30 rounded-md shadow w-full">
                    <Label htmlFor="riddle-statement" className="text-xl md:text-2xl font-medium text-card-foreground text-center block whitespace-pre-line leading-relaxed">
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
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} className="sr-only" />
                        <span>{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={selectedAnswer === undefined}>
                    <Send className="mr-2 h-5 w-5" /> Submit Answer
                  </Button>
                </form>
              )}
              {gameState === 'ANSWERED' && currentRiddle && (
                <div className="space-y-6 w-full flex flex-col items-center">
                     <div className="my-4 p-4 bg-secondary/30 rounded-md shadow w-full">
                        <p className="text-xl md:text-2xl font-medium text-card-foreground text-center block whitespace-pre-line leading-relaxed">
                            {currentRiddle.riddle}
                        </p>
                    </div>
                    <p className={cn("text-2xl font-semibold", isCorrect ? "text-green-500" : "text-destructive")}>
                        {isCorrect ? "Correct!" : "Incorrect!"}
                    </p>
                    {!isCorrect && <p className="text-lg text-muted-foreground">The correct answer was: <span className="font-semibold">{currentRiddle.correctAnswer}</span></p>}
                    <Button onClick={handleNextRiddle} className="w-1/2">
                        {level < MAX_LEVELS ? "Next Riddle" : "Finish Game"}
                    </Button>
                </div>
              )}

            </CardContent>
            <CardFooter className="pt-4 flex-col items-center gap-2">
               <p className="text-xs text-muted-foreground pt-2 text-center">
                Logic riddles generated by AI. Think carefully!
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

