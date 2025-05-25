
"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ChevronLeft } from 'lucide-react'; 
import Link from 'next/link'; 
// import { useTheme } from 'next-themes'; 
// import { useEffect, useState } from 'react';

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/': return 'Dashboard';
    case '/schedule': return 'Schedule Planner';
    case '/notes': return 'Note Repository';
    case '/resources': return 'Resource Suggester';
    case '/tips': return 'Time Management Tips';
    case '/gaming': return 'Gaming Zone';
    case '/gaming/sudoku': return 'Sudoku Challenge';
    case '/gaming/super-sums': return 'Super Sums Challenge';
    case '/gaming/bodmas-masters': return 'BODMAS Masters';
    case '/gaming/dice-probability': return 'Dice Probability Challenge';
    case '/gaming/pattern-recall': return 'Pattern Recall Challenge';
    case '/gaming/hindi-riddles': return 'Hindi Paheliyan Challenge';
    case '/gaming/logic-riddles': return 'Logic Riddles Challenge';
    case '/gaming/k12-quiz': return 'K-12 Subject Quiz';
    case '/coding': return 'Coding Zone';
    case '/ide': return 'IDE';
    case '/jokes': return 'Jokes Corner';
    case '/science-facts': return 'Science Facts'; // New mapping for Science Facts
    case '/contact': return 'Contact Us';
    default: 
      if (pathname.startsWith('/gaming/')) return 'Game Details'; // Generic for other games
      return 'Study Buddy';
  }
};

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  
  // const { theme, setTheme } = useTheme();
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        {pathname !== '/' && (
          <Button asChild variant="ghost" size="icon" className="h-7 w-7">
            <Link href="/" aria-label="Back to Dashboard">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
      {/* 
      // Theme toggle button - requires next-themes
      {mounted && (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      )}
      */}
    </header>
  );
}
