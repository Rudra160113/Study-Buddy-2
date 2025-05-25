
"use client";

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generateCreatureImage, type GenerateCreatureImageOutput } from '@/ai/flows/generate-creature-image-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw, Leaf, ShieldAlert, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface JurassicCreature {
  name: string;
  imageUrl: string | null;
  isLoading: boolean;
  error: boolean;
}

const PREDEFINED_CREATURES: string[] = [
  "Tyrannosaurus Rex",
  "Triceratops",
  "Stegosaurus",
  "Velociraptor",
  "Pterodactyl",
  "Brachiosaurus",
  "Ankylosaurus",
  "Allosaurus",
  "Dilophosaurus",
  "Mosasaurus", // Marine reptile, often in Jurassic media
  "Plesiosaurus", // Another marine reptile
  "Compsognathus"
];

const LOCAL_STORAGE_KEY = 'jurassicWorldCreaturesData';

export default function JurassicWorldPage() {
  const [creatures, setCreatures] = useState<JurassicCreature[]>(
    PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: false, error: false }))
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  // This function now only fetches the image and updates the React state for that specific creature.
  // It no longer writes to localStorage directly.
  const fetchIndividualCreatureImage = useCallback(async (creatureName: string, index: number): Promise<string | null> => {
    setCreatures(prev => prev.map((c, i) => i === index ? { ...c, isLoading: true, error: false } : c));
    try {
      const result: GenerateCreatureImageOutput = await generateCreatureImage({ creatureName });
      setCreatures(prev => prev.map((c, i) => i === index ? { ...c, imageUrl: result.imageUrl, isLoading: false } : c));
      return result.imageUrl;
    } catch (error) {
      console.error(`Failed to generate image for ${creatureName}:`, error);
      toast({ title: "Image Generation Error", description: `Could not load image for: ${creatureName}`, variant: "destructive" });
      setCreatures(prev => prev.map((c, i) => i === index ? { ...c, imageUrl: null, isLoading: false, error: true } : c));
      return null;
    }
  }, [toast]);

  useEffect(() => {
    const loadCreaturesAndPersist = async () => {
      setIsInitialLoading(true);
      let initialCreatureStates: JurassicCreature[] = PREDEFINED_CREATURES.map(name => ({
        name,
        imageUrl: null,
        isLoading: false,
        error: false
      }));
      let newImagesWereFetchedThisSession = false;

      try {
        const cachedDataRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cachedDataRaw) {
          const cachedItems: Array<{ name: string, imageUrl: string | null }> = JSON.parse(cachedDataRaw);
          const cachedMap = new Map(cachedItems.map(item => [item.name, item.imageUrl]));
          initialCreatureStates = PREDEFINED_CREATURES.map(name => ({
            name,
            imageUrl: cachedMap.get(name) || null,
            isLoading: false,
            error: false
          }));
        }
      } catch (e) {
        console.error("Failed to parse cached creature data. Clearing cache.", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        // initialCreatureStates remains as default (all imageUrls null)
      }

      // Set creatures for initial display based on cache or defaults
      setCreatures(initialCreatureStates);

      // Create a mutable copy to track fetched URLs for saving
      const creaturesForStorage = initialCreatureStates.map(c => ({ name: c.name, imageUrl: c.imageUrl }));

      // Sequentially fetch images for creatures that don't have one
      for (let i = 0; i < initialCreatureStates.length; i++) {
        if (!initialCreatureStates[i].imageUrl) {
          const fetchedUrl = await fetchIndividualCreatureImage(initialCreatureStates[i].name, i);
          if (fetchedUrl) {
            creaturesForStorage[i].imageUrl = fetchedUrl;
            newImagesWereFetchedThisSession = true;
          } else {
            // Ensure error state from fetchIndividualCreatureImage is reflected if needed for storage
            creaturesForStorage[i].imageUrl = null; 
          }
        }
      }
      
      // Save to localStorage ONCE after all fetches are done for this load cycle,
      // but only if new images were fetched or cache was initially empty.
      if (newImagesWereFetchedThisSession || !localStorage.getItem(LOCAL_STORAGE_KEY)) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(creaturesForStorage));
        } catch (e: any) {
          if (e.name === 'QuotaExceededError') {
            toast({
              title: "Storage Full",
              description: "Browser storage is full. Cannot save all creature images. Some images may not persist.",
              variant: "destructive",
              duration: 7000,
            });
          } else {
            console.error("Failed to save to localStorage:", e);
          }
        }
      }
      setIsInitialLoading(false);
    };

    loadCreaturesAndPersist();
  }, [fetchIndividualCreatureImage, toast]); // fetchIndividualCreatureImage is stable due to useCallback

  const handleRefreshAllImages = () => {
    const confirmRefresh = window.confirm("Are you sure you want to refresh all images? This will clear existing images and regenerate them, which may take some time and browser resources.");
    if (confirmRefresh) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      // Re-trigger the loadCreaturesAndPersist effect by resetting state that leads to re-fetching
      setCreatures(PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: false, error: false })));
      // The useEffect will run again due to state change and internal logic.
    }
  };


  if (isInitialLoading && creatures.every(c => !c.imageUrl && !c.error && !c.isLoading)) {
    return (
      <AppShell>
        <div className="container mx-auto py-8 space-y-8">
          <header className="text-center">
            <Leaf className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Welcome to Jurassic World</h1>
            <p className="text-xl text-muted-foreground">Discover ancient creatures with AI-generated images.</p>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-6" />
            <p className="text-muted-foreground mt-2">Excavating creature data... this may take a moment.</p>
          </header>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {PREDEFINED_CREATURES.map((name) => (
              <Card key={name} className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg truncate">{name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 aspect-square flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <Leaf className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Welcome to Jurassic World</h1>
          <p className="text-xl text-muted-foreground">Discover ancient creatures with AI-generated images.</p>
        </header>

        <div className="flex justify-center">
          <Button onClick={handleRefreshAllImages} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Refresh All Images
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creatures.map((creature) => (
            <Card key={creature.name} className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate" title={creature.name}>{creature.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-square flex-grow flex items-center justify-center bg-secondary/30">
                {creature.isLoading ? (
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Generating...</p>
                  </div>
                ) : creature.error || !creature.imageUrl ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-destructive p-4 text-center">
                    <ImageOff className="h-12 w-12" />
                     <p className="text-sm mt-2">Image unavailable</p>
                  </div>
                ) : (
                  <Image
                    src={creature.imageUrl}
                    alt={`AI generated image of ${creature.name}`}
                    data-ai-hint={creature.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                    unoptimized={creature.imageUrl.startsWith('data:') || creature.imageUrl.startsWith('https://placehold.co')}
                    priority={PREDEFINED_CREATURES.indexOf(creature.name) < 4} // Prioritize loading first few images
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
         <p className="text-center text-xs text-muted-foreground mt-4">
            Images generated by AI. Refreshing all images will clear the local cache and re-fetch from the AI. Large images may exceed browser storage limits.
        </p>
      </div>
    </AppShell>
  );
}
