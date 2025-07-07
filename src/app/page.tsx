
"use client";

import { AppShell } from '@/components/app-shell';
import { DeadlineCountdown } from '@/components/deadline-countdown';
import { ProgressTracker } from '@/components/progress-tracker';
import type { ScheduleItem } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { SearchBar } from '@/components/search-bar';
import { studyBuddySearch, type StudyBuddySearchInput, type StudyBuddySearchOutput } from '@/ai/flows/study-buddy-search-flow';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, User, Sparkles } from 'lucide-react';
import { useCurrentUserEmail } from '@/hooks/use-current-user-email';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface ConversationTurn {
  role: 'user' | 'model';
  query?: string;
  answer?: string;
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
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

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
    setConversation(prev => [...prev, { role: 'user', query }]);
    
    // Prepare history for Genkit
    const genkitHistory = conversation.map(turn => {
        if (turn.role === 'user') {
            return { role: 'user' as const, content: turn.query! };
        } else {
            return { role: 'model' as const, content: turn.answer! };
        }
    });

    try {
      const input: StudyBuddySearchInput = { query, history: genkitHistory };
      const result: StudyBuddySearchOutput = await studyBuddySearch(input);
      setConversation(prev => [...prev, { role: 'model', ...result }]);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Error",
        description: "Sorry, I couldn't fetch an answer. Please try again.",
        variant: "destructive",
      });
      setConversation(prev => [...prev, { role: 'model', answer: "I'm sorry, I ran into an error. Please try again." }]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleStartNewSearch = () => {
    setConversation([]);
  };

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
      <div className="flex flex-col h-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* Initial View: Shown only when there is no conversation */}
            {conversation.length === 0 && !isLoadingSearch && (
              <>
                <div className="text-center my-6">
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary">
                    Study Buddy
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mt-2">
                    The buddy for your study
                  </p>
                </div>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold">Welcome, {currentUserEmail || 'Guest'}!</CardTitle>
                    <CardDescription className="text-lg">Your personal AI-powered study assistant. Let's get productive!</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <p className="text-muted-foreground">
                        Stay organized, manage your tasks, and get smart suggestions to boost your learning.
                        Ask me anything using the search bar below, or navigate using the sidebar to access other tools.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <StudyBuddyLogo />
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                  <DeadlineCountdown items={scheduleItems} />
                  <ProgressTracker items={scheduleItems} />
                </div>
              </>
            )}

            {/* Conversation View */}
            {conversation.length > 0 && (
              <div className="w-full max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader className="flex-row justify-between items-center">
                    <CardTitle>Conversation</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleStartNewSearch}>
                      <RefreshCw className="mr-2 h-4 w-4" /> New Search
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {conversation.map((turn, index) => (
                      <div key={index} className="flex gap-4 items-start animate-in fade-in-50 duration-500">
                        <Avatar>
                          <AvatarFallback className={turn.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}>
                            {turn.role === 'user' ? <User /> : <Sparkles />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold">{turn.role === 'user' ? 'You' : 'Study Buddy'}</p>
                          <div className="p-4 rounded-lg bg-secondary/50">
                            {turn.role === 'user' ? (
                              <p className="text-md">{turn.query}</p>
                            ) : (
                              <div className="space-y-4">
                                {turn.imageUrl && (
                                  <div className="flex justify-center rounded-lg overflow-hidden shadow-md border">
                                    <Image
                                      src={turn.imageUrl}
                                      alt={`Generated image for your query`}
                                      width={400}
                                      height={250}
                                      className="object-contain"
                                      data-ai-hint="study concept"
                                      unoptimized={turn.imageUrl.startsWith('data:')}
                                    />
                                  </div>
                                )}
                                <p className="text-md whitespace-pre-line leading-relaxed">{turn.answer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoadingSearch && (
                      <div className="flex gap-4 items-start">
                        <Avatar>
                          <AvatarFallback className='bg-primary text-primary-foreground'>
                            <Sparkles />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold">Study Buddy</p>
                          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div ref={resultsRef} />
          </div>
        </div>

        {/* Search Bar at the bottom */}
        <div className="border-t bg-background">
          <div className="max-w-3xl mx-auto p-4">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoadingSearch} 
              placeholder={conversation.length > 0 ? "Ask a follow-up question..." : "Ask Study Buddy anything..."} 
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
