
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
import { useCurrentUserEmail } from '@/hooks/use-current-user-email'; // Added

interface JurassicCreature {
  name: string;
  imageUrl: string | null;
  isLoading: boolean;
  error: boolean;
}

const PREDEFINED_CREATURES: string[] = [
  "Tyrannosaurus Rex", "Triceratops", "Stegosaurus", "Velociraptor", 
  "Pterodactylus", "Brachiosaurus", "Ankylosaurus", "Allosaurus",
  "Dilophosaurus", "Mosasaurus", "Plesiosaurus", "Compsognathus",
  "Apatosaurus", "Diplodocus", "Ceratosaurus", "Kentrosaurus",
  "Ichthyosaurus", "Rhamphorhynchus", "Megalosaurus", "Archaeopteryx"
];


export default function JurassicWorldPage() {
  const currentUserEmail = useCurrentUserEmail();
  const getLocalStorageKey = useCallback(() => {
    return currentUserEmail ? `${currentUserEmail}_jurassicWorldCreaturesData` : 'jurassicWorldCreaturesData_guest';
  }, [currentUserEmail]);


  const [creatures, setCreatures] = useState<JurassicCreature[]>(
    PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: false, error: false }))
  );
  const [isPageLoading, setIsPageLoading] = useState(true); // Overall page loading state
  const { toast } = useToast();

  const fetchIndividualCreatureImage = useCallback(async (creatureName: string, index: number): Promise<string | null> => {
    setCreatures(prev => prev.map((c, i) => i === index ? { ...c, isLoading: true, error: false } : c));
    try {
      const result: GenerateCreatureImageOutput = await generateCreatureImage({ creatureName });
      setCreatures(prev => prev.map((c, i) => i === index ? { ...c, imageUrl: result.imageUrl, isLoading: false } : c));
      return result.imageUrl;
    } catch (error) {
      console.error(`Failed to generate image for ${creatureName}:`, error);
      // Toast is now handled by the caller if needed, to avoid duplicate toasts during bulk fetch.
      setCreatures(prev => prev.map((c, i) => i === index ? { ...c, imageUrl: null, isLoading: false, error: true } : c));
      return null;
    }
  }, []);

  useEffect(() => {
    if (currentUserEmail === undefined) { // Wait for email to be resolved
      setIsPageLoading(true);
      return;
    }

    const loadCreaturesAndPersist = async () => {
      setIsPageLoading(true);
      const LOCAL_STORAGE_KEY = getLocalStorageKey();
      let initialCreatureStates: JurassicCreature[] = PREDEFINED_CREATURES.map(name => ({
        name,
        imageUrl: null,
        isLoading: false,
        error: false
      }));
      let imagesToSaveToStorage: Array<{ name: string, imageUrl: string | null }> = [];
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
            error: false // Reset error state from cache if image exists
          }));
          imagesToSaveToStorage = [...cachedItems]; // Start with cached items
        } else {
          imagesToSaveToStorage = PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null }));
        }
      } catch (e) {
        console.error("Failed to parse cached creature data. Clearing cache.", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        imagesToSaveToStorage = PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null }));
      }

      setCreatures(initialCreatureStates); // Set initial state from cache first

      const imagesToFetchPromises: Promise<void>[] = [];

      for (let i = 0; i < initialCreatureStates.length; i++) {
        if (!initialCreatureStates[i].imageUrl) { 
          imagesToFetchPromises.push(
            (async () => {
              const fetchedUrl = await fetchIndividualCreatureImage(initialCreatureStates[i].name, i);
              const creatureInStorage = imagesToSaveToStorage.find(cfs => cfs.name === initialCreatureStates[i].name);
              if (creatureInStorage) {
                creatureInStorage.imageUrl = fetchedUrl;
              } else { // Should not happen if imagesToSaveToStorage is initialized correctly
                imagesToSaveToStorage.push({ name: initialCreatureStates[i].name, imageUrl: fetchedUrl });
              }
              if (fetchedUrl) {
                newImagesWereFetchedThisSession = true;
              }
            })()
          );
        }
      }
      
      await Promise.all(imagesToFetchPromises);
      
      if (newImagesWereFetchedThisSession || !localStorage.getItem(LOCAL_STORAGE_KEY)) {
        try {
          const currentPredefinedNames = new Set(PREDEFINED_CREATURES);
          const filteredForStorage = imagesToSaveToStorage.filter(c => currentPredefinedNames.has(c.name));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredForStorage));
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
             toast({ title: "Storage Error", description: "Could not save all image data.", variant: "destructive" });
          }
        }
      }
      setIsPageLoading(false);
    };

    loadCreaturesAndPersist();
  }, [currentUserEmail, fetchIndividualCreatureImage, getLocalStorageKey, toast]);

  const handleRefreshAllImages = () => {
    const confirmRefresh = window.confirm("Are you sure you want to refresh all images? This will clear existing images and regenerate them, which may take some time and browser resources.");
    if (confirmRefresh) {
      const LOCAL_STORAGE_KEY = getLocalStorageKey();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      // Trigger useEffect to reload by changing a dependency or explicitly calling the load function.
      // Forcing a re-render by setting creatures to an initial loading state.
      setCreatures(PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: true, error: false })));
      
      // Re-trigger the main effect. A more direct call to loadCreaturesAndPersist would be better
      // but involves careful state management of isPageLoading.
      // Forcing a key change on the component or a dummy state change is another way.
      // Here, we rely on a slight modification of state to re-trigger, then useEffect does its job.
      // Simulate a change to currentUserEmail to re-trigger if it was already set. This is a bit hacky.
      // A cleaner way would be to extract loadCreaturesAndPersist and call it.
      if (currentUserEmail !== undefined) { // Make sure it's not in its initial undefined state
        const currentEmail = currentUserEmail; // capture current value
        // Temporarily set to a value that will cause re-evaluation and then back
        // This approach is not ideal. Let's just re-initiate the states and let useEffect handle it.
        setIsPageLoading(true); // Reset page loading
         // The useEffect will re-run due to currentUserEmail potentially changing or if it was undefined.
         // More directly, we should ensure the loadCreaturesAndPersist can be called on demand.
         // For simplicity in this pass, we'll set creatures to a loading state
         // and let the existing useEffect logic handle the full fetch if needed (or the next mount)
         // A more robust solution would be to explicitly call the loading function.
        setCreatures(PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: false, error: false })));
         // The useEffect should handle this reset. If currentUserEmail is stable, it might not refetch
         // unless we set imageUrls to null explicitly.
         // Let's refine this to make the reload more explicit
        const reload = async () => {
          setIsPageLoading(true);
          const freshCreatures = PREDEFINED_CREATURES.map(name => ({ name, imageUrl: null, isLoading: false, error: false }));
          setCreatures(freshCreatures); // Set state to loading appearances
          
          const imagesToSaveToStorage = freshCreatures.map(c => ({ name: c.name, imageUrl: c.imageUrl }));
          let newImagesWereFetched = false;

          const fetchPromises = freshCreatures.map((creature, index) => 
            fetchIndividualCreatureImage(creature.name, index).then(url => {
              imagesToSaveToStorage[index].imageUrl = url;
              if (url) newImagesWereFetched = true;
            })
          );
          await Promise.all(fetchPromises);

          if (newImagesWereFetched) {
              try {
                  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(imagesToSaveToStorage));
              } catch (e: any) { /* ... quota error handling ... */ }
          }
          setIsPageLoading(false);
        };
        reload();
      }
    }
  };

  if (isPageLoading && creatures.every(c => !c.imageUrl && !c.error && !c.isLoading)) {
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
          <Button onClick={handleRefreshAllImages} variant="outline" disabled={isPageLoading || creatures.some(c => c.isLoading)}>
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
                    priority={PREDEFINED_CREATURES.indexOf(creature.name) < 4} 
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
