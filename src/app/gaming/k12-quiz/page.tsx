
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Loader2, BookOpen, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateK12QuizQuestion, type GenerateK12QuizQuestionInput, type GenerateK12QuizQuestionOutput } from '@/ai/flows/generate-k12-quiz-question-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CurrentQuestionState extends GenerateK12QuizQuestionOutput {}

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
] as const;

const subjects = ["Mathematics", "Science", "History", "English Language Arts", "Geography"] as const;

const QUESTIONS_PER_QUIZ = 10;

type GameState = "CONFIG" | "LOADING" | "PLAYING" | "ANSWERED" | "QUIZ_OVER";

export default function K12QuizPage() {
  const [selectedGrade, setSelectedGrade] = useState<typeof gradeLevels[number] | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<typeof subjects[number] | undefined>(undefined);
  
  const [currentQuestionData, setCurrentQuestionData] = useState<CurrentQuestionState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [gameState, setGameState] = useState<GameState>("CONFIG");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNewQuestion = useCallback(async () => {
    if (!selectedGrade || !selectedSubject) {
        toast({ title: "Configuration Error", description: "Please select grade and subject.", variant: "destructive"});
        setGameState("CONFIG");
        return;
    }
    setGameState("LOADING");
    setCurrentQuestionData(null);
    setSelectedAnswer(undefined);
    setIsCorrect(null);
    try {
      const questionData = await generateK12QuizQuestion({ gradeLevel: selectedGrade, subject: selectedSubject });
      setCurrentQuestionData(questionData);
      setGameState("PLAYING");
    } catch (error) {
      console.error("Failed to generate K-12 quiz question:", error);
      toast({
        title: "Error!",
        description: "Could not load question. Please try again.",
        variant: "destructive",
      });
      setGameState("CONFIG"); // Revert to config if question fails
    }
  }, [selectedGrade, selectedSubject, toast]);

  const handleStartQuiz = () => {
    if (!selectedGrade || !selectedSubject) {
      toast({ title: "Missing Selection", description: "Please select both grade level and subject.", variant: "destructive"});
      return;
    }
    setScore(0);
    setQuestionNumber(1);
    fetchNewQuestion();
    toast({ title: "Quiz Started!", description: `Grade ${selectedGrade}, Subject: ${selectedSubject}. Good luck!` });
  };

  const handleSubmitAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (gameState !== 'PLAYING' || !currentQuestionData || selectedAnswer === undefined) {
        if(selectedAnswer === undefined) {
            toast({ title: "No Answer Selected", description: "Please choose an option.", variant: "destructive" });
        }
        return;
    }

    setGameState('ANSWERED');
    const correct = selectedAnswer === currentQuestionData.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prevScore => prevScore + 10);
      toast({ title: "Correct!", description: "+10 points!", className: "bg-green-500 text-white" });
    } else {
      toast({ title: "Incorrect", description: `The correct answer was: ${currentQuestionData.correctAnswer}`, variant: "destructive" });
    }
  };

  const handleNext = () => {
    if (questionNumber < QUESTIONS_PER_QUIZ) {
      setQuestionNumber(prev => prev + 1);
      fetchNewQuestion();
    } else {
      setGameState('QUIZ_OVER');
      toast({ title: "Quiz Over!", description: `You completed ${QUESTIONS_PER_QUIZ} questions. Your final score: ${score}` });
    }
  };

  const handleRestartQuiz = () => {
    setGameState("CONFIG");
    setSelectedGrade(undefined);
    setSelectedSubject(undefined);
    setCurrentQuestionData(null);
    setSelectedAnswer(undefined);
    setScore(0);
    setQuestionNumber(0);
    setIsCorrect(null);
  }
  
  if (!isClient) {
    return (
        <AppShell>
            <div className="container mx-auto py-8 text-center">
                <p>Loading K-12 Quiz...</p>
                <Skeleton className="h-96 w-full max-w-lg mx-auto mt-4" />
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            K-12 Subject Quiz
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your knowledge across various subjects and grade levels!
          </p>
        </header>

        {gameState === 'CONFIG' && (
          <Card className="shadow-xl max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><BookOpen className="h-7 w-7 text-accent"/>Configure Your Quiz</CardTitle>
              <CardDescription>Select a grade level and subject to begin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value as typeof gradeLevels[number])}>
                  <SelectTrigger id="gradeLevel">
                    <SelectValue placeholder="Select Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={(value) => setSelectedSubject(value as typeof subjects[number])}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartQuiz} disabled={!selectedGrade || !selectedSubject} className="w-full bg-primary hover:bg-primary/90">
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        )}

        {(gameState === 'LOADING' || gameState === 'PLAYING' || gameState === 'ANSWERED') && (
          <Card className="shadow-xl max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center text-lg">
                <div className="font-semibold text-primary">Question: {questionNumber}/{QUESTIONS_PER_QUIZ}</div>
                <div className="font-semibold text-accent">Score: {score}</div>
              </div>
              {selectedGrade && selectedSubject && (
                <CardDescription>Grade: {selectedGrade} | Subject: {selectedSubject}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6 text-center min-h-[300px] flex flex-col justify-center items-center">
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
                    <p className="text-sm text-muted-foreground">AI is crafting a question for you...</p>
                </div>
              )}
              {currentQuestionData && (gameState === 'PLAYING' || gameState === 'ANSWERED') && (
                <form onSubmit={handleSubmitAnswer} className="space-y-6 w-full">
                  <div className="my-4 p-4 bg-secondary/30 rounded-md shadow w-full">
                    <Label htmlFor="question-statement" className="text-lg md:text-xl font-medium text-card-foreground text-left block whitespace-pre-line">
                        {currentQuestionData.question}
                    </Label>
                  </div>
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    aria-labelledby="question-statement"
                    disabled={gameState === 'ANSWERED'}
                  >
                    {currentQuestionData.options.map((option, index) => (
                      <Label
                        key={index}
                        htmlFor={`option-${index}`}
                        className={cn(
                            "flex items-center justify-start text-left space-x-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/20 text-md min-h-[60px]",
                            gameState === 'ANSWERED' && option === currentQuestionData.correctAnswer && "bg-green-100 border-green-500 ring-2 ring-green-500",
                            gameState === 'ANSWERED' && selectedAnswer === option && option !== currentQuestionData.correctAnswer && "bg-red-100 border-red-500 ring-2 ring-red-500",
                            selectedAnswer === option && gameState !== 'ANSWERED' ? 'bg-primary text-primary-foreground ring-2 ring-primary-foreground' : 'bg-card hover:border-primary',
                             gameState === 'ANSWERED' ? "cursor-default opacity-70" : ""
                        )}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} className="shrink-0" disabled={gameState === 'ANSWERED'} />
                        <span className="flex-1">{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  {gameState === 'PLAYING' && (
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={selectedAnswer === undefined}>
                      Submit Answer
                    </Button>
                  )}
                </form>
              )}
               {gameState === 'ANSWERED' && currentQuestionData && (
                <div className="mt-6 w-full space-y-4 text-left p-4 rounded-md bg-muted/50 border">
                    <h3 className={cn("text-xl font-semibold", isCorrect ? "text-green-600" : "text-red-600")}>
                        {isCorrect ? "Correct!" : "Incorrect!"}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{currentQuestionData.explanation}</p>
                    <Button onClick={handleNext} className="w-full">
                        {questionNumber < QUESTIONS_PER_QUIZ ? "Next Question" : "Finish Quiz"} <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {gameState === 'QUIZ_OVER' && (
            <Card className="shadow-xl max-w-md mx-auto text-center">
                <CardHeader>
                    <CardTitle className="text-3xl text-primary flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-10 w-10"/> Quiz Complete!
                    </CardTitle>
                    <CardDescription className="text-xl font-semibold">Your Final Score: {score} / {QUESTIONS_PER_QUIZ * 10}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground mb-6">
                        You've completed the quiz for {selectedGrade}, {selectedSubject}.
                    </p>
                    <Button onClick={handleRestartQuiz} size="lg" className="w-full bg-primary hover:bg-primary/90">
                       <RefreshCw className="mr-2 h-5 w-5"/> Start New Quiz
                    </Button>
                </CardContent>
            </Card>
        )}

      </div>
    </AppShell>
  );
}
