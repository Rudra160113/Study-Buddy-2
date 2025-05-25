"use client";

import type { ScheduleItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { differenceInSeconds, formatDistanceStrict } from 'date-fns';
import { TimerIcon } from 'lucide-react';

interface DeadlineCountdownProps {
  items: ScheduleItem[];
}

export function DeadlineCountdown({ items }: DeadlineCountdownProps) {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const now = new Date();
    const futureDeadlines = items
      .filter(item => !item.completed && new Date(item.deadline) > now)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    setUpcomingDeadlines(futureDeadlines.slice(0, 3)); // Show top 3 upcoming
  }, [items]);

  if (upcomingDeadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerIcon className="h-6 w-6 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming deadlines. Time to relax or plan new tasks!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TimerIcon className="h-6 w-6 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingDeadlines.map(item => (
          <DeadlineItem key={item.id} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}

function DeadlineItem({ item }: { item: ScheduleItem }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(item.deadline);
      if (deadlineDate <= now) {
        setTimeLeft('Deadline passed');
        return;
      }
      setTimeLeft(formatDistanceStrict(deadlineDate, now, { addSuffix: true }));
    };

    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute

    return () => clearInterval(intervalId);
  }, [item.deadline]);

  return (
    <div className="p-3 bg-secondary/50 rounded-md shadow-sm">
      <h3 className="font-semibold text-md">{item.title}</h3>
      <p className="text-sm text-primary">{timeLeft}</p>
      <p className="text-xs text-muted-foreground">
        Due: {new Date(item.deadline).toLocaleDateString()} {new Date(item.deadline).toLocaleTimeString()}
      </p>
    </div>
  );
}
