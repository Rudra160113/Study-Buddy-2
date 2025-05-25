
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check, Clock, RefreshCw, Trophy, TrendingUp, Loader2, Brain, ListOrdered } from 'lucide-react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateMathWordProblem, type GenerateMathWordProblemInput, type GenerateMathWordProblemOutput } from '@/ai/flows/generate-math-word-problem-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUserEmail } from '@/hooks/use-current-user-email'; // Added

interface CurrentProblemState {
  problemStatement: string;
  answer: number;
}

interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string; // ISO string
}

const MAX_LEADERBOARD_ENTRIES = 5;

export default function SuperSumsPage() {
  const currentUserEmail = useCurrentUserEmail();
  const getLeaderboardKey = useCallback(() => {
    return currentUserEmail ? `${currentUserEmail}_superSumsLeaderboard` : 'superSumsLeaderboard_guest';
  }, [currentUserEmail]);

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); 
  const [currentProblem, setCurrentProblem] = useState<CurrentProblemState | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Indicates component has mounted on client
  }, []);

  useEffect(() => {
    if (!isClient || currentUserEmail === undefined) return; // Wait for client and email
    
    const LEADERBOARD_KEY = getLeaderboardKey();
    try {
      const storedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
      if (storedLeaderboard) {
        setLeaderboard(JSON.parse(storedLeaderboard));
      } else {
        setLeaderboard([]); // Initialize if no data
      }
    } catch (error) {
      console.error("Failed to load leaderboard from localStorage", error);
      setLeaderboard([]); 
    }
  }, [isClient, currentUserEmail, getLeaderboardKey]);

  const saveScoreToLeaderboard = useCallback((finalScore: number) => {
    if (!isClient || currentUserEmail === undefined) return;
    
    if (finalScore === 0 && level === 1 && !currentProblem) {
        return;
    }
    const LEADERBOARD_KEY = getLeaderboardKey();
    const newEntry: LeaderboardEntry = {
      playerName: `Player ${Math.floor(100 + Math.random() * 900)}`, 
      score: finalScore,
      date: new Date().toISOString(),
    };

    try {
      setLeaderboard(prevLeaderboard => {
        const currentLeaderboard = [...prevLeaderboard, newEntry];
        currentLeaderboard.sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime()); 
        const updatedLeaderboard = currentLeaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
        return updatedLeaderboard;
      });
    } catch (error) {
      console.error("Failed to save leaderboard to localStorage", error);
      toast({
          title: "Leaderboard Error",
          description: "Could not save your score to the local leaderboard.",
          variant: "destructive"
      })
    }
  }, [isClient, currentUserEmail, getLeaderboardKey, currentProblem, level, toast]);


  const fetchNewProblem = useCallback(async (currentLevel: number) => {
    setIsLoadingProblem(true);
    setCurrentProblem(null); 
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
      setCurrentProblem({ problemStatement: "Error: Could not load problem. Click 'Skip' or restart.", answer: 0 });
    } finally {
      setIsLoadingProblem(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isGameActive && level > 0 && !currentProblem && !isLoadingProblem) { // Ensure problem isn't already loading
      fetchNewProblem(level);
    }
  // Omitting currentProblem from deps to avoid re-fetching if it's just set
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [isGameActive, level, fetchNewProblem, isLoadingProblem]); 

  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isGameActive, timeLeft]);

  const handleGameOver = useCallback((finalScore: number, message: string, variant: "default" | "destructive" = "default") => {
    setIsGameActive(false);
    saveScoreToLeaderboard(finalScore);
    toast({
      title: "Game Over!",
      description: `${message} Your final score is ${finalScore}. Click 'Start Game' to play again.`,
      variant: variant,
      duration: 7000,
    });
  }, [saveScoreToLeaderboard, toast]);

  useEffect(() => {
    if (timeLeft === 0 && isGameActive) {
      handleGameOver(score, "Time's Up!");
    }
  }, [timeLeft, isGameActive, score, handleGameOver]);


  const handleStartGame = () => {
    if (currentUserEmail === undefined) {
        toast({title: "Loading user data...", description: "Please wait a moment."});
        return;
    }
    setLevel(1);
    setScore(0);
    setTimeLeft(10 * 60);
    setUserAnswer('');
    setCurrentProblem(null); 
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
      const newScore = score + (10 * level); 
      setScore(newScore);
      setTimeLeft(10 * 60); 
      toast({ title: "Correct!", description: `+${10 * level} points! Timer reset.`, className: "bg-green-500 text-white" });
      
      const newLevel = level + 1;
      if (newLevel <= 100) { // Assuming max 100 levels
          setLevel(newLevel);
          // Fetch problem for new level directly
          fetchNewProblem(newLevel);
      } else {
          handleGameOver(newScore, "Congratulations! You've mastered all levels!");
      }

    } else {
      handleGameOver(score, `Incorrect. The correct answer was ${currentProblem.answer}.`, "destructive");
    }
    setUserAnswer('');
  };

  const handleSkipProblem = () => {
    if (!isGameActive || isLoadingProblem) return;
    toast({ title: "Problem Skipped", description: "Here's a new one!"});
    fetchNewProblem(level);
    setUserAnswer('');
    setScore(prevScore => Math.max(0, prevScore - (5 * level))); 
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  if (!isClient || currentUserEmail === undefined) { // Show loading if not client or email not yet resolved
    return (
        <AppShell>
            <div className="container mx-auto py-8 text-center">
                <p>Loading Super Sums...</p>
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
            Super Sums: Word Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            Solve AI-generated word problems. Timer resets on correct answers! Difficulty scales with level.
          </p>
        </header>

        {!isGameActive ? (
          <Card className="shadow-xl max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Brain className="h-10 w-10 text-accent" />
                Ready to Play?
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
                You get 10 minutes per question. Timer resets if you're correct!
                Answer incorrectly, and the game ends. Difficulty increases as you level up.
              </p>
              <Button onClick={handleStartGame} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                Start Game
              </Button>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground mx-auto">Max 100 levels. Score increases with level difficulty.</p>
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
            <CardContent className="space-y-6 text-center min-h-[200px]">
              {isLoadingProblem && (
                <div className="space-y-3 py-4">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-5 w-full mx-auto" />
                    <Skeleton className="h-5 w-5/6 mx-auto mb-3" />
                    <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">AI is crafting a new problem for Level {level}...</p>
                </div>
              )}
              {!isLoadingProblem && currentProblem && (
                <div className="my-6 p-4 bg-secondary/30 rounded-md shadow">
                  <p className="text-lg md:text-xl font-medium text-card-foreground text-left whitespace-pre-line">
                    {currentProblem.problemStatement}
                  </p>
                </div>
              )}
              {!isLoadingProblem && !currentProblem && isGameActive && (
                 <p className="text-muted-foreground py-4">Preparing your first problem...</p>
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
                <RefreshCw className="mr-2 h-4 w-4" /> Skip Problem (-{5 * level} pts)
              </Button>
               <p className="text-xs text-muted-foreground pt-2 text-center">
                Math word problems generated by AI.
              </p>
            </CardFooter>
          </Card>
        )}
        
        <Card className="shadow-lg max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><ListOrdered className="h-6 w-6 text-accent"/>Leaderboard (Top {MAX_LEADERBOARD_ENTRIES})</CardTitle>
                {leaderboard.length === 0 && isClient && <CardDescription>No scores yet. Be the first!</CardDescription>}
                 {!isClient && <CardDescription>Loading leaderboard...</CardDescription>}
            </CardHeader>
            <CardContent>
                {isClient && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg w-6 text-center rounded-full ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-500' : index === 2 ? 'text-orange-700' : 'text-primary'}`}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-card-foreground">{entry.playerName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-accent text-lg">{entry.score} pts</span>
                          <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isClient ? (
                  <p className="text-muted-foreground text-center py-4">Play a game to see your score here!</p>
                ) : (
                  <div className="space-y-2 py-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
