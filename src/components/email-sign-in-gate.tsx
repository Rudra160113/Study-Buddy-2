
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
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <p>Loading Study Buddy...</p>
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
