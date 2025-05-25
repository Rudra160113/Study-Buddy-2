
"use client";

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generatePatternImage, type GeneratePatternImageOutput } from '@/ai/flows/generate-pattern-image-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw, Lightbulb, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type GameState = 
  | "IDLE" 
  | "GENERATING_PATTERN" 
  | "SHOWING_PATTERN" 
  | "AWAITING_USER_INPUT" 
  | "CHECKING_ANSWER" 
  | "LEVEL_COMPLETE" 
  | "GAME_OVER";

interface ImageChoice {
  prompt: string;
  imageUrl: string;
  id: string; // Unique ID for key prop
}

const PREDEFINED_PROMPTS = [
  "a red apple", "a blue bird", "a yellow sun", "a green leaf", 
  "a purple flower", "an orange square", "a black cat", "a white cloud",
  "a brown dog", "a pink heart", "a gray rock", "a golden star"
];

const IMAGES_PER_LEVEL_INCREASE = 1;
const INITIAL_PATTERN_LENGTH = 2; // Start with 2 images
const DISTRACTOR_COUNT = 2; // Number of distractor images

export default function PatternRecallPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("IDLE");
  
  const [targetPatternPrompts, setTargetPatternPrompts] = useState<string[]>([]);
  const [targetPatternImages, setTargetPatternImages] = useState<ImageChoice[]>([]);
  
  const [displayChoices, setDisplayChoices] = useState<ImageChoice[]>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]); // Store selected prompts
  
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [currentImageBeingShown, setCurrentImageBeingShown] = useState<ImageChoice | null>(null);
  const [showPatternIndex, setShowPatternIndex] = useState(0);

  const { toast } = useToast();

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const generateNewLevel = useCallback(async () => {
    setGameState("GENERATING_PATTERN");
    setIsLoadingImages(true);
    setUserSelection([]);
    setTargetPatternImages([]);
    setDisplayChoices([]);
    setShowPatternIndex(0);
    setCurrentImageBeingShown(null);

    const patternLength = INITIAL_PATTERN_LENGTH + (currentLevel - 1) * IMAGES_PER_LEVEL_INCREASE;
    const availablePrompts = shuffleArray([...PREDEFINED_PROMPTS]);
    
    const newTargetPrompts = availablePrompts.slice(0, patternLength);
    setTargetPatternPrompts(newTargetPrompts);

    const generatedTargetImages: ImageChoice[] = [];
    for (let i = 0; i < newTargetPrompts.length; i++) {
      const prompt = newTargetPrompts[i];
      try {
        const result: GeneratePatternImageOutput = await generatePatternImage({ prompt });
        generatedTargetImages.push({ prompt, imageUrl: result.imageUrl, id: `${prompt}-${i}-target` });
      } catch (error) {
        console.error(`Failed to generate image for target prompt: ${prompt}`, error);
        toast({ title: "Image Generation Error", description: `Could not load image for: ${prompt}`, variant: "destructive" });
        generatedTargetImages.push({ prompt, imageUrl: `https://placehold.co/128x128.png?text=${prompt.substring(0,10)}`, id: `${prompt}-${i}-target-fallback` });
      }
    }
    setTargetPatternImages(generatedTargetImages);

    // Generate distractors
    const distractorPrompts = availablePrompts.slice(patternLength, patternLength + DISTRACTOR_COUNT);
    const generatedDistractorImages: ImageChoice[] = [];
    for (let i = 0; i < distractorPrompts.length; i++) {
      const prompt = distractorPrompts[i];
       try {
        const result: GeneratePatternImageOutput = await generatePatternImage({ prompt });
        generatedDistractorImages.push({ prompt, imageUrl: result.imageUrl, id: `${prompt}-${i}-distractor` });
      } catch (error) {
        console.error(`Failed to generate image for distractor prompt: ${prompt}`, error);
        generatedDistractorImages.push({ prompt, imageUrl: `https://placehold.co/128x128.png?text=X`, id: `${prompt}-${i}-distractor-fallback` });
      }
    }
    
    setDisplayChoices(shuffleArray([...generatedTargetImages, ...generatedDistractorImages]));
    setIsLoadingImages(false);
    setGameState("SHOWING_PATTERN");

  }, [currentLevel, toast]);


  useEffect(() => {
    if (gameState === "SHOWING_PATTERN" && targetPatternImages.length > 0) {
      if (showPatternIndex < targetPatternImages.length) {
        setCurrentImageBeingShown(targetPatternImages[showPatternIndex]);
        const timer = setTimeout(() => {
          setCurrentImageBeingShown(null); // Briefly hide before next or finishing
          const nextTimer = setTimeout(() => {
             setShowPatternIndex(prev => prev + 1);
          }, 300); // Short pause between images
          return () => clearTimeout(nextTimer);
        }, 1500); // Show each image for 1.5 seconds
        return () => clearTimeout(timer);
      } else {
        // Finished showing pattern
        setGameState("AWAITING_USER_INPUT");
        setCurrentImageBeingShown(null);
      }
    }
  }, [gameState, targetPatternImages, showPatternIndex]);


  const handleImageSelect = (selectedPrompt: string) => {
    if (gameState !== "AWAITING_USER_INPUT") return;
    const newSelection = [...userSelection, selectedPrompt];
    setUserSelection(newSelection);

    if (newSelection.length === targetPatternPrompts.length) {
      checkAnswer(newSelection);
    }
  };

  const checkAnswer = (currentSelection: string[]) => {
    setGameState("CHECKING_ANSWER");
    const isCorrect = currentSelection.every((prompt, index) => prompt === targetPatternPrompts[index]);

    if (isCorrect) {
      setScore(prev => prev + currentLevel * 10);
      toast({ title: "Correct!", description: "Great job! Next level.", className: "bg-green-500 text-white" });
      setGameState("LEVEL_COMPLETE");
    } else {
      toast({ title: "Incorrect Pattern", description: `Game Over. Your score: ${score}`, variant: "destructive" });
      setGameState("GAME_OVER");
    }
  };

  const handleStartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    generateNewLevel();
  };
  
  const handleNextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    generateNewLevel();
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Pattern Recall Challenge</h1>
          <p className="text-xl text-muted-foreground">Memorize the sequence of AI-generated images!</p>
        </header>

        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Level: {currentLevel}</CardTitle>
              <CardDescription className="text-xl font-semibold text-accent">Score: {score}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="min-h-[350px] flex flex-col items-center justify-center">
            {gameState === "IDLE" && (
              <Button onClick={handleStartGame} size="lg">Start Game</Button>
            )}

            {(gameState === "GENERATING_PATTERN" || isLoadingImages) && (
              <div className="text-center space-y-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">AI is generating images for Level {currentLevel}...</p>
                <p className="text-xs text-muted-foreground">(This may take a moment)</p>
                 <div className="flex gap-2 justify-center mt-4">
                    <Skeleton className="h-24 w-24 rounded-md" />
                    <Skeleton className="h-24 w-24 rounded-md" />
                    <Skeleton className="h-24 w-24 rounded-md" />
                 </div>
              </div>
            )}

            {gameState === "SHOWING_PATTERN" && currentImageBeingShown && !isLoadingImages && (
              <div className="text-center animate-in fade-in duration-300 space-y-2">
                <p className="text-lg font-medium text-muted-foreground">Memorize this image ({showPatternIndex + 1} of {targetPatternImages.length}):</p>
                <Image 
                    src={currentImageBeingShown.imageUrl} 
                    alt={currentImageBeingShown.prompt}
                    data-ai-hint={currentImageBeingShown.prompt.split(" ").slice(1).join(" ")} // e.g. "red apple" -> "apple"
                    width={200} height={200} 
                    className="rounded-lg shadow-lg border mx-auto"
                    unoptimized={currentImageBeingShown.imageUrl.startsWith('data:')}
                />
              </div>
            )}
             {gameState === "SHOWING_PATTERN" && !currentImageBeingShown && !isLoadingImages && showPatternIndex < targetPatternImages.length && (
                 <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground mt-2">Getting next image...</p>
                 </div>
             )}


            {gameState === "AWAITING_USER_INPUT" && !isLoadingImages && (
              <div className="w-full text-center">
                <p className="text-lg font-medium mb-4">Select the images in the order they appeared:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {displayChoices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleImageSelect(choice.prompt)}
                      className={cn(
                        "p-2 border-2 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary transition-all aspect-square flex items-center justify-center",
                        userSelection.includes(choice.prompt) ? "border-accent ring-2 ring-accent opacity-50 cursor-not-allowed" : "border-muted",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      disabled={userSelection.includes(choice.prompt) || userSelection.length >= targetPatternPrompts.length}
                      aria-label={`Select ${choice.prompt}`}
                    >
                      <Image 
                        src={choice.imageUrl} 
                        alt={choice.prompt}
                        data-ai-hint={choice.prompt.split(" ").slice(1).join(" ")}
                        width={128} height={128} 
                        className="rounded-md object-contain"
                        unoptimized={choice.imageUrl.startsWith('data:')}
                      />
                    </button>
                  ))}
                </div>
                {userSelection.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-3">Selected: {userSelection.length} of {targetPatternPrompts.length}</p>
                )}
              </div>
            )}
            
            {gameState === "LEVEL_COMPLETE" && (
                <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto"/>
                    <h2 className="text-2xl font-semibold">Level {currentLevel -1} Complete!</h2>
                    <p className="text-muted-foreground">Your score: {score}</p>
                    <Button onClick={handleNextLevel} size="lg">
                        Next Level <ChevronRight className="ml-2 h-5 w-5"/>
                    </Button>
                </div>
            )}

            {gameState === "GAME_OVER" && (
              <div className="text-center space-y-4">
                <XCircle className="h-16 w-16 text-destructive mx-auto"/>
                <h2 className="text-2xl font-semibold">Game Over!</h2>
                <p className="text-muted-foreground">You remembered {userSelection.length > 0 && userSelection.every((p,i) => p === targetPatternPrompts[i]) ? targetPatternPrompts.length : userSelection.filter((p,i) => p === targetPatternPrompts[i]).length} correctly out of {targetPatternPrompts.length}.</p>
                <p className="text-xl font-bold">Final Score: {score}</p>
                <Button onClick={handleStartGame} size="lg">
                  <RotateCcw className="mr-2 h-5 w-5" /> Play Again
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-xs text-muted-foreground mx-auto">Images generated by AI. Click images in the order shown.</p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
