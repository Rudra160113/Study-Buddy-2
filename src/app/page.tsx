
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
import { ArrowDownCircle } from 'lucide-react';

// Mock data, replace with actual data fetching or state management
const initialScheduleItems: ScheduleItem[] = [
  { id: '1', title: 'Math Assignment 1', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: false, description: 'Complete chapter 1 exercises.' },
  { id: '2', title: 'History Presentation Prep', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false, description: 'Research and outline presentation.' },
  { id: '3', title: 'Physics Lab Report', deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), completed: true, description: 'Write up experiment results.' },
  { id: '4', title: 'Literature Essay', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), completed: false, description: 'Draft first version of essay.' },
];

interface SearchResult {
  query: string;
  answer: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [searchBarPosition, setSearchBarPosition] = useState<'top' | 'bottom'>('top');
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState(""); 

  const { toast } = useToast();
  const searchResultsRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const storedItems = localStorage.getItem('scheduleItems');
    if (storedItems) {
      setScheduleItems(JSON.parse(storedItems).map((item: ScheduleItem) => ({...item, deadline: new Date(item.deadline)})));
    } else {
      setScheduleItems(initialScheduleItems);
      localStorage.setItem('scheduleItems', JSON.stringify(initialScheduleItems));
    }
  }, []);

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

  const SearchSection = ({isBottom = false}: {isBottom?: boolean}) => (
    <div className={`w-full flex flex-col items-center ${isBottom ? 'py-2' : 'mb-8'}`}>
      <SearchBar 
        onSearch={handleSearch} 
        isLoading={isLoadingSearch} 
        placeholder={searchBarPosition === 'bottom' ? "Ask a follow-up or new question..." : "Ask Study Buddy anything..."} 
      />
    </div>
  );

  return (
    <AppShell>
      <div className="flex flex-col items-center space-y-6 min-h-full pb-24"> {/* Added pb-24 for bottom search bar space */}
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
              <CardHeader>
                <CardTitle className="text-2xl">Response to: "{searchResult.query}"</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <CardTitle className="text-3xl font-bold">Welcome!</CardTitle>
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
                  <Image 
                    src="https://placehold.co/300x200.png" 
                    alt="Study illustration" 
                    width={300} 
                    height={200} 
                    className="rounded-lg"
                    data-ai-hint="study desk"
                  />
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
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-center mb-2 text-sm text-muted-foreground">
                <ArrowDownCircle className="h-4 w-4 mr-1" />
                <span>Ask a follow-up or new question</span>
              </div>
              <SearchSection isBottom={true}/>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
