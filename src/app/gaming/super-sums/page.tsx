
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check, Clock, RefreshCw, Trophy, TrendingUp, Loader2, Brain } from 'lucide-react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateMathWordProblem, type GenerateMathWordProblemInput, type GenerateMathWordProblemOutput } from '@/ai/flows/generate-math-word-problem-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface CurrentProblemState {
  problemStatement: string;
  answer: number;
}

export default function SuperSumsPage() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [currentProblem, setCurrentProblem] = useState<CurrentProblemState | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNewProblem = useCallback(async (currentLevel: number) => {
    setIsLoadingProblem(true);
    setCurrentProblem(null); // Clear old problem
    try {
      const problemData = await generateMathWordProblem({ level: currentLevel });
      setCurrentProblem({
        problemStatement: problemData.problemStatement,
        answer: problemData.answer,
      });
    } catch (error) {
      console.error("Failed to generate word problem:", error);
      toast({
        title: "Error Generating Problem",
        description: "Could not fetch a new word problem. Please try again or restart the game.",
        variant: "destructive",
      });
      setCurrentProblem({ problemStatement: "Error: Could not load problem.", answer: 0 });
    } finally {
      setIsLoadingProblem(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isGameActive && level > 0) {
      fetchNewProblem(level);
    }
  }, [isGameActive, level, fetchNewProblem]);


  // Timer logic
  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isGameActive, timeLeft]);

  // Handle game over when time runs out
  useEffect(() => {
    if (timeLeft === 0 && isGameActive) {
      setIsGameActive(false);
      toast({
        title: "Time's Up!",
        description: `Your final score is ${score}. Great effort! Click 'Start Game' to play again.`,
        variant: "default",
        duration: 7000,
      });
    }
  }, [timeLeft, isGameActive, score, toast]);


  const handleStartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(10 * 60);
    setUserAnswer('');
    setIsGameActive(true);
    toast({ title: "Game Started!", description: "Solve the word problems. Timer resets on correct answers!" });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isGameActive || isLoadingProblem || !currentProblem) return;

    const answerNum = parseInt(userAnswer, 10);
    if (isNaN(answerNum)) {
      toast({ title: "Invalid Input", description: "Please enter a number.", variant: "destructive" });
      return;
    }

    if (answerNum === currentProblem.answer) {
      const newScore = score + 10;
      setScore(newScore);
      setTimeLeft(10 * 60); // Reset timer on correct answer
      toast({ title: "Correct!", description: "+10 points! Timer reset.", className: "bg-green-500 text-white" });
      
      if (newScore % 50 === 0 && newScore > 0) { 
        const newLevel = level + 1;
        setLevel(newLevel);
        toast({ title: "Level Up!", description: `You've reached level ${newLevel}!` });
      } else {
        fetchNewProblem(level); 
      }
    } else {
      setIsGameActive(false); // Game over on incorrect answer
      toast({ 
        title: "Incorrect. Game Over!", 
        description: `The correct answer was ${currentProblem.answer}. Your final score: ${score}. Click 'Start Game' to play again.`, 
        variant: "destructive",
        duration: 7000,
      });
    }
    setUserAnswer('');
  };

  const handleSkipProblem = () => {
    if (!isGameActive || isLoadingProblem) return;
    toast({ title: "Problem Skipped", description: "Here's a new one!"});
    fetchNewProblem(level);
    setUserAnswer('');
    // Optionally, you could penalize score or time for skipping.
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
                <p>Loading Super Sums...</p>
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Super Sums: Word Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            Solve AI-generated word problems. Timer resets on correct answers!
          </p>
        </header>

        {!isGameActive ? (
          <Card className="shadow-xl max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Brain className="h-10 w-10 text-accent" />
                Ready to Play?
              </CardTitle>
              {score > 0 && timeLeft > 0 && ( // Show final score if game ended prematurely by wrong answer but time wasn't up
                 <CardDescription className="text-lg font-semibold">
                    Last Score: {score}
                 </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                You'll get 10 minutes per question. Timer resets if you're correct!
                Answer incorrectly, and the game ends.
              </p>
              <Button onClick={handleStartGame} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                Start Game
              </Button>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground mx-auto">Difficulty increases as you level up.</p>
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
                <div className={`font-semibold flex items-center gap-1 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-destructive'}`}>
                  <Clock className="h-5 w-5" /> Time: {formatTime(timeLeft)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-center min-h-[150px]">
              {isLoadingProblem && (
                <div className="space-y-3 py-4">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-5 w-full mx-auto" />
                    <Skeleton className="h-5 w-5/6 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">AI is crafting a new problem...</p>
                </div>
              )}
              {!isLoadingProblem && currentProblem && (
                <div className="my-6 p-4 bg-secondary/30 rounded-md shadow">
                  <p className="text-lg md:text-xl font-medium text-card-foreground text-left whitespace-pre-line">
                    {currentProblem.problemStatement}
                  </p>
                </div>
              )}
              {!isLoadingProblem && !currentProblem && (
                 <p className="text-muted-foreground py-4">Waiting for problem...</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="answer" className="sr-only">Your Answer</Label>
                  <Input
                    id="answer"
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Your Numerical Answer"
                    className="text-xl text-center h-12 shadow-inner"
                    required
                    disabled={timeLeft <=0 || isLoadingProblem || !currentProblem}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={timeLeft <=0 || isLoadingProblem || !currentProblem}>
                  {isLoadingProblem ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                  {isLoadingProblem ? 'Loading...' : 'Submit Answer'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="pt-4 flex-col items-center gap-2">
              <Button variant="outline" onClick={handleSkipProblem} disabled={timeLeft <=0 || isLoadingProblem || !currentProblem}>
                <RefreshCw className="mr-2 h-4 w-4" /> Skip Problem
              </Button>
               <p className="text-xs text-muted-foreground pt-2 text-center">
                Math word problems generated by AI. Difficulty increases with level.
              </p>
            </CardFooter>
          </Card>
        )}
        <Card className="shadow-lg max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-xl">Leaderboard (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center">Top scores will be displayed here!</p>
                {/* Static Leaderboard Placeholder */}
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between p-2 bg-secondary/30 rounded"><span>Player1</span><span>1200 pts</span></div>
                    <div className="flex justify-between p-2 bg-secondary/30 rounded"><span>Player2</span><span>950 pts</span></div>
                    <div className="flex justify-between p-2 bg-secondary/30 rounded"><span>Player3</span><span>700 pts</span></div>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

    