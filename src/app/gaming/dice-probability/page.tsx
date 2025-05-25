
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Clock, RefreshCw, Trophy, TrendingUp, Loader2, Brain, HelpCircle, Dices } from 'lucide-react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateDiceProbabilityProblem, type GenerateDiceProbabilityProblemInput, type GenerateDiceProbabilityProblemOutput } from '@/ai/flows/generate-dice-probability-problem-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface CurrentProblemState extends GenerateDiceProbabilityProblemOutput {}

const GAME_DURATION_SECONDS = 10 * 60; // 10 minutes

export default function DiceProbabilityPage() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [currentProblem, setCurrentProblem] = useState<CurrentProblemState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNewProblem = useCallback(async (currentLevel: number) => {
    setIsLoadingProblem(true);
    setCurrentProblem(null);
    setSelectedAnswer(undefined);
    try {
      const problemData = await generateDiceProbabilityProblem({ level: currentLevel });
      setCurrentProblem(problemData);
    } catch (error) {
      console.error("Failed to generate dice probability problem:", error);
      toast({
        title: "Error Generating Problem",
        description: "Could not fetch a new problem. Please try again or restart the game.",
        variant: "destructive",
      });
      // Fallback problem
      setCurrentProblem({
        problemStatement: "What is the probability of rolling an even number on a standard six-sided die?",
        options: ["1/6", "1/3", "1/2", "2/3"],
        correctAnswer: "1/2"
      });
    } finally {
      setIsLoadingProblem(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (isGameActive && level > 0 && !currentProblem && !isLoadingProblem) {
      fetchNewProblem(level);
    }
  }, [isGameActive, level, fetchNewProblem, currentProblem, isLoadingProblem]);

  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isGameActive, timeLeft]);
  
  const handleGameOver = useCallback((finalScore: number, message: string, variant: "default" | "destructive" = "default") => {
    setIsGameActive(false);
    toast({
      title: "Game Over!",
      description: `${message} Your final score is ${finalScore}. Click 'Start Game' to play again.`,
      variant: variant,
      duration: 7000,
    });
  }, [toast]);

  useEffect(() => {
    if (timeLeft === 0 && isGameActive) {
       handleGameOver(score, "Time's Up!");
    }
  }, [timeLeft, isGameActive, score, handleGameOver]);

  const handleStartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setSelectedAnswer(undefined);
    setCurrentProblem(null); 
    setIsGameActive(true);
    toast({ title: "Dice Probability Challenge Started!", description: "Answer the probability questions. Timer resets on correct answers!" });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isGameActive || isLoadingProblem || !currentProblem || selectedAnswer === undefined) {
        if(selectedAnswer === undefined) {
            toast({ title: "No Answer Selected", description: "Please select an option.", variant: "destructive" });
        }
        return;
    }

    const isCorrect = selectedAnswer === currentProblem.correctAnswer;

    if (isCorrect) {
      const pointsEarned = 10 * level;
      const newScore = score + pointsEarned;
      setScore(newScore);
      setTimeLeft(GAME_DURATION_SECONDS); 
      toast({ title: "Correct!", description: `+${pointsEarned} points! Timer reset.`, className: "bg-green-500 text-white" });
      
      const newLevel = level + 1;
      if (newLevel <= 100) {
        setLevel(newLevel);
        fetchNewProblem(newLevel);
      } else {
         handleGameOver(newScore, "Congratulations! You've mastered all 100 levels!");
      }
    } else {
       handleGameOver(score, `Incorrect. The correct answer was ${currentProblem.correctAnswer}.`, "destructive");
    }
    setSelectedAnswer(undefined); 
  };

  const handleSkipProblem = () => {
    if (!isGameActive || isLoadingProblem) return;
    toast({ title: "Problem Skipped", description: "Here's a new one!"});
    fetchNewProblem(level);
    setSelectedAnswer(undefined);
    setScore(prevScore => Math.max(0, prevScore - Math.floor(5 * level * 0.5))); // Smaller penalty
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  if (!isClient) {
    return (
        <AppShell>
            <div className="container mx-auto py-8 text-center">
                <p>Loading Dice Probability Challenge...</p>
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
            Dice Probability Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your probability skills with AI-generated dice questions!
          </p>
        </header>

        {!isGameActive ? (
          <Card className="shadow-xl max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Dices className="h-10 w-10 text-accent" />
                Ready for a Dicey Challenge?
              </CardTitle>
              {score > 0 && (
                 <CardDescription className="text-lg font-semibold">
                    Last Score: {score}
                 </CardDescription>
              )}
               {level > 1 && (
                 <CardDescription className="text-md text-muted-foreground">
                    Reached Level: {level}
                 </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                You have 10 minutes per question. Answer incorrectly, and the game ends. Difficulty increases each level.
              </p>
              <Button onClick={handleStartGame} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                Start Game
              </Button>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground mx-auto">Max 100 levels. Score increases with level difficulty. No leaderboard.</p>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-xl max-w-lg mx-auto">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center text-lg">
                <div className="font-semibold text-primary flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" /> Level: {level}
                </div>
                <div className="font-semibold text-accent flex items-center gap-1">
                  <Trophy className="h-5 w-5" /> Score: {score}
                </div>
                <div className={`font-semibold flex items-center gap-1 ${timeLeft < 60 ? 'text-destructive animate-pulse' : 'text-destructive/80'}`}>
                  <Clock className="h-5 w-5" /> Time: {formatTime(timeLeft)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-center min-h-[250px] flex flex-col justify-center items-center">
              {isLoadingProblem && (
                <div className="space-y-3 py-4">
                    <Skeleton className="h-8 w-full mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mt-3" />
                    <p className="text-sm text-muted-foreground">AI is rolling the dice for a new question...</p>
                </div>
              )}
              {!isLoadingProblem && currentProblem && (
                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                  <div className="my-4 p-4 bg-secondary/30 rounded-md shadow w-full">
                    <Label htmlFor="problem-statement" className="text-lg md:text-xl font-medium text-card-foreground text-left block whitespace-pre-line">
                        {currentProblem.problemStatement}
                    </Label>
                  </div>
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    aria-labelledby="problem-statement"
                  >
                    {currentProblem.options.map((option, index) => (
                      <Label
                        key={index}
                        htmlFor={`option-${index}`}
                        className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors hover:bg-accent/20 ${selectedAnswer === option ? 'bg-accent text-accent-foreground ring-2 ring-accent' : 'bg-card'}`}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <span>{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={timeLeft <=0 || isLoadingProblem || !currentProblem || selectedAnswer === undefined}>
                    <Check className="mr-2 h-5 w-5" /> Submit Answer
                  </Button>
                </form>
              )}
               {!isLoadingProblem && !currentProblem && isGameActive && (
                 <p className="text-muted-foreground py-4">Preparing your first dice question...</p>
              )}
            </CardContent>
            <CardFooter className="pt-4 flex-col items-center gap-2">
              <Button variant="outline" onClick={handleSkipProblem} disabled={timeLeft <=0 || isLoadingProblem || !currentProblem}>
                <RefreshCw className="mr-2 h-4 w-4" /> Skip Problem (-{Math.floor(5 * level * 0.5)} pts)
              </Button>
               <p className="text-xs text-muted-foreground pt-2 text-center">
                Dice probability questions generated by AI. Choose wisely!
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
