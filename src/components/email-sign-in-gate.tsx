
"use client";

import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const USER_EMAIL_KEY = 'currentUserEmail';

interface EmailSignInGateProps {
  children: ReactNode;
}

export function EmailSignInGate({ children }: EmailSignInGateProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }
    setIsLoading(false);
  }, []);

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      const processedEmail = inputValue.trim().toLowerCase(); // Normalize email
      localStorage.setItem(USER_EMAIL_KEY, processedEmail);
      setEmail(processedEmail);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <svg 
          width="200" 
          height="140" 
          viewBox="0 0 200 140" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Study Buddy Loading Animation"
          className="animated-study-buddy-loader"
        >
          {/* Book */}
          <rect x="30" y="30" width="140" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="4"/>
          {/* Book spine */}
          <line x1="100" y1="30" x2="100" y2="130" stroke="hsl(var(--primary))" strokeWidth="4"/>
          {/* Page lines (Left) - static */}
          <line x1="45" y1="50" x2="85" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          <line x1="45" y1="65" x2="85" y2="65" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          <line x1="45" y1="80" x2="85" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          <line x1="45" y1="95" x2="75" y2="95" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          {/* Page lines (Right) - static */}
          <line x1="115" y1="50" x2="155" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          <line x1="115" y1="65" x2="155" y2="65" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          <line x1="115" y1="80" x2="145" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"/>
          {/* Buddy - graduation cap - static */}
          <path d="M20 55 L100 20 L180 55 L100 90 L20 55 Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2" transform="translate(0 -25) scale(0.8)" />
          <line x1="100" y1="12" x2="100" y2="0" stroke="hsl(var(--primary-foreground))" strokeWidth="2" transform="translate(0 -5) scale(0.8)" />
          <rect x="95" y="-10" width="10" height="10" fill="hsl(var(--primary-foreground))" transform="translate(0 -5) scale(0.8)" />
          
          {/* Animated Eyes */}
          <circle id="eyeLeftLoader" cx="65" cy="60" r="5" fill="hsl(var(--foreground))" />
          <circle id="eyeRightLoader" cx="135" cy="60" r="5" fill="hsl(var(--foreground))" />
          
          {/* Animated Mouth - Sad paths */}
          <path id="sadMouthLeftLoader" d="M60 80 Q65 75 70 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
          <path id="sadMouthRightLoader" d="M130 80 Q135 75 140 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
          
          {/* Animated Mouth - Happy paths (initially hidden) */}
          <path id="happyMouthLeftLoader" d="M60 75 Q65 80 70 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
          <path id="happyMouthRightLoader" d="M130 75 Q135 80 140 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
        </svg>
        <style jsx>{`
          .animated-study-buddy-loader #eyeLeftLoader,
          .animated-study-buddy-loader #eyeRightLoader {
            animation: blinkAnimation 3s infinite ease-in-out;
            transform-origin: 50% 50%;
          }

          .animated-study-buddy-loader #sadMouthLeftLoader,
          .animated-study-buddy-loader #sadMouthRightLoader {
            opacity: 1;
            animation: mouthTransitionSad 4s ease-in-out forwards;
          }

          .animated-study-buddy-loader #happyMouthLeftLoader,
          .animated-study-buddy-loader #happyMouthRightLoader {
            opacity: 0;
            animation: mouthTransitionHappy 4s ease-in-out forwards;
          }

          @keyframes blinkAnimation {
            0%, 100% { transform: scaleY(1); }
            2.5%, 7.5% { transform: scaleY(0.1); } /* Faster blink */
            5%, 10% { transform: scaleY(1); }
            /* Long pause */
          }

          @keyframes mouthTransitionSad {
            0% { opacity: 1; }      /* Sad visible */
            40% { opacity: 1; }     /* Sad stays visible */
            50% { opacity: 0; }     /* Sad fades out */
            100% { opacity: 0; }    /* Sad stays hidden */
          }

          @keyframes mouthTransitionHappy {
            0% { opacity: 0; }      /* Happy hidden */
            49.9% { opacity: 0; }   /* Happy stays hidden */
            50% { opacity: 1; }     /* Happy fades in */
            100% { opacity: 1; }    /* Happy stays visible */
          }
        `}</style>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">Welcome to Study Buddy!</CardTitle>
            <CardDescription className="text-center">
              Please enter your email to personalize your experience and save your progress.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignIn}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email-signin" className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                </Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="you@example.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  required
                  className="bg-card focus:ring-primary/50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Sign In / Continue
              </Button>
            </CardFooter>
          </form>
          <p className="text-xs text-muted-foreground text-center p-4 pt-0">
            Note: This is for local data separation. If multiple users use the same email on this browser, they will share the same data.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
