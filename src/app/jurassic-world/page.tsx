
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

  const fetchAndCacheCreatureImage = useCallback(async (creatureName: string, index: number) => {
    setCreatures(prev => prev.map((c, i) => i === index ? { ...c, isLoading: true, error: false } : c));
    try {
      const result: GenerateCreatureImageOutput = await generateCreatureImage({ creatureName });
      setCreatures(prev => {
        const updated = prev.map((c, i) => i === index ? { ...c, imageUrl: result.imageUrl, isLoading: false } : c);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.map(cr => ({ name: cr.name, imageUrl: cr.imageUrl })))); // Only store name and imageUrl
        return updated;
      });
      return result.imageUrl;
    } catch (error) {
      console.error(`Failed to generate image for ${creatureName}:`, error);
      toast({ title: "Image Generation Error", description: `Could not load image for: ${creatureName}`, variant: "destructive" });
      setCreatures(prev => {
         const updated = prev.map((c, i) => i === index ? { ...c, imageUrl: null, isLoading: false, error: true } : c);
         localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.map(cr => ({ name: cr.name, imageUrl: cr.imageUrl }))));
         return updated;
      });
      return null;
    }
  }, [toast]);

  useEffect(() => {
    const loadCreatures = async () => {
      setIsInitialLoading(true);
      const cachedDataRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let needsSave = false;

      if (cachedDataRaw) {
        try {
          const cachedCreatures: Array<{ name: string, imageUrl: string | null }> = JSON.parse(cachedDataRaw);
          // Create a map for quick lookup
          const cachedMap = new Map(cachedCreatures.map(c => [c.name, c.imageUrl]));
          
          let currentCreatures = PREDEFINED_CREATURES.map(name => ({
            name,
            imageUrl: cachedMap.get(name) || null,
            isLoading: false,
            error: false
          }));

          setCreatures(currentCreatures);

          // Check for any creatures in predefined list that are not in cache or have no image
          // and fetch them one by one
          for (let i = 0; i < currentCreatures.length; i++) {
            if (!currentCreatures[i].imageUrl) {
                await fetchAndCacheCreatureImage(currentCreatures[i].name, i);
                needsSave = true; // Mark that we fetched something and need to re-save
            }
          }
        } catch (e) {
          console.error("Failed to parse cached creature data, clearing cache.", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          // Fall through to generate all
           for (let i = 0; i < PREDEFINED_CREATURES.length; i++) {
            await fetchAndCacheCreatureImage(PREDEFINED_CREATURES[i], i);
          }
          needsSave = true;
        }
      } else {
        // No cache, generate all images one by one
        for (let i = 0; i < PREDEFINED_CREATURES.length; i++) {
          await fetchAndCacheCreatureImage(PREDEFINED_CREATURES[i], i);
        }
        needsSave = true;
      }
      
      // Final save if any new images were fetched or cache was initialized
      if (needsSave) {
        // The fetchAndCacheCreatureImage already saves, but an explicit save here
        // based on the final state might be good if logic changes.
        // For now, it's somewhat redundant if fetchAndCache... always saves the whole list.
      }
      setIsInitialLoading(false);
    };

    loadCreatures();
  }, [fetchAndCacheCreatureImage]); // fetchAndCacheCreatureImage is stable due to useCallback

  const handleRefreshAllImages = () => {
    const confirmRefresh = window.confirm("Are you sure you want to refresh all images? This will clear existing images and regenerate them, which may take some time.");
    if (confirmRefresh) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      // Re-trigger the loadCreatures effect by changing a dependency or calling it directly
      // For simplicity, we can just reload the state, which will trigger the useEffect
      setCreatures(PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: false, error: false })));
      setIsInitialLoading(true); // This will make useEffect run again
      // The useEffect will then handle fetching.
    }
  };

  if (isInitialLoading && creatures.every(c => !c.imageUrl && !c.error)) {
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
            Images generated by AI. Refreshing all images will clear the local cache and re-fetch from the AI.
        </p>
      </div>
    </AppShell>
  );
}
