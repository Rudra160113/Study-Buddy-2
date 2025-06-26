
"use client";

import { AppShell } from '@/components/app-shell';
import { DeadlineCountdown } from '@/components/deadline-countdown';
import { ProgressTracker } from '@/components/progress-tracker';
import type { ScheduleItem } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { SearchBar } from '@/components/search-bar';
import { studyBuddySearch, type StudyBuddySearchInput, type StudyBuddySearchOutput } from '@/ai/flows/study-buddy-search-flow';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownCircle, RefreshCw } from 'lucide-react';
import { useCurrentUserEmail } from '@/hooks/use-current-user-email';
import { Button } from '@/components/ui/button';

interface SearchResult {
  query: string;
  answer: string;
  imageUrl?: string;
}

const StudyBuddyLogo = () => (
  <svg 
    width="250" 
    height="180" 
    viewBox="0 0 200 140" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="rounded-lg"
    aria-label="Study Buddy Logo"
  >
    {/* Book */}
    <rect x="30" y="30" width="140" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="4"/>
    {/* Book spine */}
    <line x1="100" y1="30" x2="100" y2="130" stroke="hsl(var(--primary))" strokeWidth="4"/>
    {/* Page lines (Left) */}
    <line x1="45" y1="50" x2="85" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    <line x1="45" y1="65" x2="85" y2="65" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    <line x1="45" y1="80" x2="85" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    <line x1="45" y1="95" x2="75" y2="95" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    {/* Page lines (Right) */}
    <line x1="115" y1="50" x2="155" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    <line x1="115" y1="65" x2="155" y2="65" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    <line x1="115" y1="80" x2="145" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
    {/* Buddy - graduation cap */}
    <path d="M20 55 L100 20 L180 55 L100 90 L20 55 Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2" transform="translate(0 -25) scale(0.8)" />
    <line x1="100" y1="12" x2="100" y2="0" stroke="hsl(var(--primary-foreground))" strokeWidth="2" transform="translate(0 -5) scale(0.8)" />
    <rect x="95" y="-10" width="10" height="10" fill="hsl(var(--primary-foreground))" transform="translate(0 -5) scale(0.8)" />
    {/* Friendly eyes on the book (optional, makes it more 'buddy'-like) */}
    <circle cx="65" cy="60" r="5" fill="hsl(var(--foreground))" />
    <circle cx="135" cy="60" r="5" fill="hsl(var(--foreground))" />
    <path d="M60 75 Q65 80 70 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
    <path d="M130 75 Q135 80 140 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
  </svg>
);


export default function DashboardPage() {
  const currentUserEmail = useCurrentUserEmail();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [searchBarPosition, setSearchBarPosition] = useState<'top' | 'bottom'>('top');
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState(""); 

  const { toast } = useToast();
  const searchResultsRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    if (currentUserEmail === undefined) return; // Wait for email

    const storageKey = currentUserEmail ? `${currentUserEmail}_scheduleItems` : 'scheduleItems_guest';
    const storedItems = localStorage.getItem(storageKey);
    if (storedItems) {
      try {
        setScheduleItems(JSON.parse(storedItems).map((item: ScheduleItem) => ({...item, deadline: new Date(item.deadline)})));
      } catch (error) {
        console.error("Failed to parse schedule items for dashboard from localStorage", error);
        setScheduleItems([]); // Fallback
      }
    } else {
      setScheduleItems([]); // No items if nothing in storage for this user
    }
  }, [currentUserEmail]);

  const handleSearch = async (query: string) => {
    setIsLoadingSearch(true);
    setSearchResult(null); 
    setCurrentQuery(query); 

    try {
      const input: StudyBuddySearchInput = { query };
      const result: StudyBuddySearchOutput = await studyBuddySearch(input);
      setSearchResult({ query, ...result });
      if (searchBarPosition === 'top') {
        setSearchBarPosition('bottom');
      }
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Error",
        description: "Sorry, I couldn't fetch an answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleStartNewSearch = () => {
    setSearchResult(null);
    setSearchBarPosition('top');
    setCurrentQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SearchSection = ({isBottom = false}: {isBottom?: boolean}) => (
    <div className={`w-full flex flex-col items-center ${isBottom ? '' : 'mb-8'}`}>
      <SearchBar 
        onSearch={handleSearch} 
        isLoading={isLoadingSearch} 
        placeholder={searchBarPosition === 'bottom' ? "Ask a follow-up or new question..." : "Ask Study Buddy anything..."} 
      />
    </div>
  );

  if (currentUserEmail === undefined) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-full">
          <p>Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center space-y-6 min-h-full pb-24"> 
        {searchBarPosition === 'top' && <SearchSection />}

        <div className="text-center my-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary">
            Study Buddy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            The buddy for your study
          </p>
        </div>
        
        {isLoadingSearch && !searchResult && (
          <Card className="w-full max-w-3xl shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-40 w-full aspect-video" />
              <Skeleton className="h-6 w-full mt-4" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-3/4" />
            </CardContent>
          </Card>
        )}

        {searchResult && (
          <div ref={searchResultsRef} className="w-full max-w-3xl space-y-6">
            <Card className="shadow-xl animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
              <CardContent className="space-y-4 pt-6">
                {searchResult.imageUrl && (
                  <div className="flex justify-center my-4 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={searchResult.imageUrl}
                      alt={`Generated image for "${searchResult.query}"`}
                      width={500}
                      height={300}
                      className="object-contain" 
                      data-ai-hint="study concept"
                      unoptimized={searchResult.imageUrl.startsWith('data:')} 
                    />
                  </div>
                )}
                <p className="text-md whitespace-pre-line leading-relaxed">{searchResult.answer}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoadingSearch && !searchResult && searchBarPosition === 'top' && (
          <>
            <Card className="w-full max-w-4xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Welcome, {currentUserEmail || 'Guest'}!</CardTitle>
                <CardDescription className="text-lg">Your personal AI-powered study assistant. Let's get productive!</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    Stay organized, manage your tasks, and get smart suggestions to boost your learning.
                    Ask me anything using the search bar above, or navigate using the sidebar to access other tools.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StudyBuddyLogo />
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl">
              <DeadlineCountdown items={scheduleItems} />
              <ProgressTracker items={scheduleItems} />
            </div>
          </>
        )}

        {searchBarPosition === 'bottom' && (
          <div className="fixed bottom-0 left-0 right-0 w-full p-4 bg-background/90 backdrop-blur-sm border-t border-border shadow-lg z-20">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2 text-sm text-muted-foreground">
                <ArrowDownCircle className="h-4 w-4 mr-1" />
                <span>Ask a follow-up or start a new search</span>
              </div>
              <div className="flex items-center gap-2">
                <SearchSection isBottom={true}/>
                 <Button variant="outline" onClick={handleStartNewSearch} title="Start New Search">
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Start New Search</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
