
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check, Clock, RefreshCw, Trophy, TrendingUp } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

// Simple problem generation for now
const generateProblem = (level: number) => {
  // Difficulty will increase with level. For now, very basic.
  // After every 5 levels, difficulty might increase (e.g. larger numbers, different ops)
  // This is a placeholder for more complex logic.
  const maxNumber = 10 + Math.floor(level / 5) * 5;
  const num1 = Math.floor(Math.random() * maxNumber) + 1;
  const num2 = Math.floor(Math.random() * maxNumber) + 1;
  // For now, only addition. More ops (subtraction, multiplication) can be added based on level.
  const operator = '+';
  let answer;
  switch (operator) {
    case '+':
      answer = num1 + num2;
      break;
    default:
      answer = 0;
  }
  return { num1, num2, operator, answer };
};

export default function SuperSumsPage() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [currentProblem, setCurrentProblem] = useState(generateProblem(level));
  const [userAnswer, setUserAnswer] = useState('');
  const [isGameActive, setIsGameActive] = useState(false); // To control timer and game flow
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Timer logic (Placeholder - full timer logic will be more complex)
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
        description: `Your final score is ${score}. Great effort!`,
        variant: "default",
        duration: 5000,
      });
      // Placeholder: Here you would potentially show a game over screen or submit score to leaderboard
    }
  }, [timeLeft, isGameActive, score, toast]);


  const handleStartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(10 * 60);
    setCurrentProblem(generateProblem(1));
    setUserAnswer('');
    setIsGameActive(true);
    toast({ title: "Game Started!", description: "Solve the problems as quickly as you can." });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isGameActive) return;

    const answerNum = parseInt(userAnswer, 10);
    if (isNaN(answerNum)) {
      toast({ title: "Invalid Input", description: "Please enter a number.", variant: "destructive" });
      return;
    }

    if (answerNum === currentProblem.answer) {
      setScore(prevScore => prevScore + 10); // Add 10 points for correct answer
      toast({ title: "Correct!", description: "+10 points!", className: "bg-green-500 text-white" });
      // Level progression (placeholder)
      if ((score + 10) % 50 === 0 && score > 0) { // Example: level up every 5 correct answers (50 points)
        setLevel(prevLevel => prevLevel + 1);
        toast({ title: "Level Up!", description: `You've reached level ${level + 1}!` });
      }
      setCurrentProblem(generateProblem(level)); // Generate new problem for current/new level
    } else {
      toast({ title: "Incorrect", description: "Try again or get a new problem.", variant: "destructive" });
      // Optionally, deduct points or generate new problem immediately
      setCurrentProblem(generateProblem(level));
    }
    setUserAnswer('');
  };

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
            Super Sums Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your mental math skills! (10 Minute Timer)
          </p>
        </header>

        {!isGameActive ? (
          <Card className="shadow-xl max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Calculator className="h-10 w-10 text-accent" />
                Ready to Play?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                You'll have 10 minutes to solve as many math problems as you can.
                Difficulty increases as you progress through levels.
              </p>
              <Button onClick={handleStartGame} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                Start Game
              </Button>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground mx-auto">Full game with 100 levels and progressive difficulty under development.</p>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-xl max-w-md mx-auto">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center text-lg">
                <div className="font-semibold text-primary flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" /> Level: {level}
                </div>
                <div className="font-semibold text-accent flex items-center gap-1">
                  <Trophy className="h-5 w-5" /> Score: {score}
                </div>
                <div className="font-semibold text-destructive flex items-center gap-1">
                  <Clock className="h-5 w-5" /> Time: {formatTime(timeLeft)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="my-8">
                <p className="text-5xl font-bold tracking-tight text-card-foreground">
                  {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="answer" className="sr-only">Your Answer</Label>
                  <Input
                    id="answer"
                    type="number" // Use number type for easier input on mobile
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Your Answer"
                    className="text-xl text-center h-12 shadow-inner"
                    required
                    disabled={timeLeft <=0}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={timeLeft <=0}>
                  <Check className="mr-2 h-5 w-5" /> Submit Answer
                </Button>
              </form>
            </CardContent>
            <CardFooter className="pt-4 flex-col items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentProblem(generateProblem(level))} disabled={timeLeft <=0}>
                <RefreshCw className="mr-2 h-4 w-4" /> Skip Problem (New)
              </Button>
               <p className="text-xs text-muted-foreground pt-2">
                Game logic for 100 levels and advanced difficulty progression is under development.
              </p>
            </CardFooter>
          </Card>
        )}
         {/* Placeholder for Leaderboard - to be developed */}
        <Card className="shadow-lg max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-xl">Leaderboard (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center">Top scores will be displayed here!</p>
                {/* Example static entries */}
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
