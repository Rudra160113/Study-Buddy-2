"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes'; // Assuming next-themes is or will be installed for theme toggling
import { useEffect, useState } from 'react';

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/': return 'Dashboard';
    case '/schedule': return 'Schedule Planner';
    case '/notes': return 'Note Repository';
    case '/resources': return 'Resource Suggester';
    case '/tips': return 'Time Management Tips';
    default: return 'Study Buddy';
  }
};

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  
  // For theme toggling, next-themes is typical. If not available, this part can be removed.
  // const { theme, setTheme } = useTheme();
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
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
