
"use client";

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeImage, type AnalyzeImageInput, type AnalyzeImageOutput } from '@/ai/flows/analyze-image-flow';
import { ImageIcon, Upload, Trash2, Loader2, Send, Sparkles, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MAX_IMAGES = 15;

interface ImageFile {
  id: string;
  dataUrl: string;
  name: string;
}

export default function ImageAnalysisPage() {
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadedImages.length >= MAX_IMAGES) {
      toast({ title: "Limit Reached", description: `You can upload a maximum of ${MAX_IMAGES} images.`, variant: "destructive" });
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newImage: ImageFile = { id: Date.now().toString(), dataUrl, name: file.name };
        setUploadedImages(prev => [...prev, newImage]);
        if (!selectedImage) setSelectedImage(newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (image: ImageFile) => {
    setSelectedImage(image);
    setAiAnalysis(null); // Clear previous analysis when new image selected
    setUserQuery('');
  };

  const handleRemoveImage = (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selection if clicking remove icon on thumbnail
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
      setAiAnalysis(null);
      setUserQuery('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !userQuery.trim()) {
      toast({ title: "Missing Information", description: "Please select an image and type a query.", variant: "destructive" });
      return;
    }
    setIsLoadingAnalysis(true);
    setAiAnalysis(null);
    try {
      const input: AnalyzeImageInput = { imageDataUri: selectedImage.dataUrl, userQuery };
      const result: AnalyzeImageOutput = await analyzeImage(input);
      setAiAnalysis(result.analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({ title: "Analysis Error", description: "Could not analyze the image. Please try again.", variant: "destructive" });
      setAiAnalysis("An error occurred during analysis.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
            <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-md">
             <ImageIcon className="h-12 w-12 text-primary" />
            </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">AI Image Analysis</h1>
          <p className="text-xl text-muted-foreground">Upload an image and ask the AI about it!</p>
        </header>

        {/* Image Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add Images (Up to {MAX_IMAGES})</CardTitle>
            <CardDescription>You can upload images from your device.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadedImages.length >= MAX_IMAGES} className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </CardContent>
        </Card>

        {/* Image Gallery */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Images ({uploadedImages.length}/{MAX_IMAGES})</CardTitle>
              <CardDescription>Click an image to select it for analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex space-x-4 p-1">
                  {uploadedImages.map(img => (
                    <div
                      key={img.id}
                      className={`relative shrink-0 w-28 h-28 rounded-md cursor-pointer border-2 hover:border-primary transition-all
                                  ${selectedImage?.id === img.id ? 'border-primary ring-2 ring-primary' : 'border-muted'}`}
                      onClick={() => handleImageSelect(img)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleImageSelect(img)}
                    >
                      <Image src={img.dataUrl} alt={img.name} layout="fill" objectFit="cover" className="rounded-md" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-70 hover:opacity-100"
                        onClick={(e) => handleRemoveImage(img.id, e)}
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Analysis Section */}
        {selectedImage && (
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Sparkles className="text-accent h-6 w-6"/>AI Analysis for: <span className="truncate max-w-xs text-muted-foreground">{selectedImage.name}</span></CardTitle>
              <CardDescription>Ask the AI a question about the selected image.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center">
                <Image src={selectedImage.dataUrl} alt="Selected for analysis" width={400} height={300} className="rounded-lg shadow-md max-w-full h-auto object-contain border" />
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userQuery" className="text-md">Your Question/Prompt for AI:</Label>
                  <Textarea
                    id="userQuery"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="e.g., What is the main subject? Can you describe the colors?"
                    rows={3}
                    className="mt-1 shadow-inner"
                  />
                </div>
                <Button onClick={handleAnalyze} disabled={isLoadingAnalysis || !userQuery.trim()} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  {isLoadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isLoadingAnalysis ? 'Analyzing...' : 'Ask AI'}
                </Button>
                
                {isLoadingAnalysis && (
                  <div className="mt-4 space-y-2 p-4 border rounded-md bg-muted/50">
                     <Skeleton className="h-5 w-1/3" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-5/6" />
                  </div>
                )}

                {aiAnalysis && !isLoadingAnalysis && (
                  <div className="mt-4 p-4 border rounded-md bg-secondary/30 shadow-inner">
                    <h3 className="font-semibold text-lg mb-2 text-card-foreground">AI Response:</h3>
                    <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{aiAnalysis}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
         {!selectedImage && uploadedImages.length > 0 && (
            <p className="text-center text-muted-foreground py-4">Select an image from the gallery above to start analyzing.</p>
        )}
        {uploadedImages.length === 0 && (
             <p className="text-center text-muted-foreground py-4">Upload an image to begin analysis.</p>
        )}
      </div>
    </AppShell>
  );
}
