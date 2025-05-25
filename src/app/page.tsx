"use client";

import { AppShell } from '@/components/app-shell';
import { DeadlineCountdown } from '@/components/deadline-countdown';
import { ProgressTracker } from '@/components/progress-tracker';
import type { ScheduleItem } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

// Mock data, replace with actual data fetching or state management
const initialScheduleItems: ScheduleItem[] = [
  { id: '1', title: 'Math Assignment 1', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: false, description: 'Complete chapter 1 exercises.' },
  { id: '2', title: 'History Presentation Prep', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false, description: 'Research and outline presentation.' },
  { id: '3', title: 'Physics Lab Report', deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), completed: true, description: 'Write up experiment results.' },
  { id: '4', title: 'Literature Essay', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), completed: false, description: 'Draft first version of essay.' },
];


export default function DashboardPage() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    // In a real app, fetch this from a DB or global state
    // For now, using localStorage to persist mock data across refreshes for demo purposes
    const storedItems = localStorage.getItem('scheduleItems');
    if (storedItems) {
      setScheduleItems(JSON.parse(storedItems).map((item: ScheduleItem) => ({...item, deadline: new Date(item.deadline)})));
    } else {
      setScheduleItems(initialScheduleItems);
      localStorage.setItem('scheduleItems', JSON.stringify(initialScheduleItems));
    }
  }, []);


  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome to Study Buddy!</CardTitle>
            <CardDescription className="text-lg">Your personal AI-powered study assistant. Let's get productive!</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-muted-foreground">
                Stay organized, manage your tasks, and get smart suggestions to boost your learning.
                Navigate using the sidebar to access all tools.
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

        <div className="grid gap-6 md:grid-cols-2">
          <DeadlineCountdown items={scheduleItems} />
          <ProgressTracker items={scheduleItems} />
        </div>
      </div>
    </AppShell>
  );
}
