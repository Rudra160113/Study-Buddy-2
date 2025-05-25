"use client";

import type { ScheduleItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProgressTrackerProps {
  items: ScheduleItem[];
}

export function ProgressTracker({ items }: ProgressTrackerProps) {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completed = items.filter(item => item.completed).length;
    const total = items.length;
    setCompletedTasks(completed);
    setTotalTasks(total);
    setProgress(total > 0 ? (completed / total) * 100 : 0);
  }, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Study Progress
        </CardTitle>
        <CardDescription>
          {totalTasks > 0 
            ? `You've completed ${completedTasks} out of ${totalTasks} tasks.`
            : "No tasks scheduled yet. Add some to track your progress!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalTasks > 0 ? (
          <>
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground mt-2 text-right">{Math.round(progress)}% complete</p>
          </>
        ) : (
          <p className="text-muted-foreground">Add tasks to your schedule to see your progress here.</p>
        )}
      </CardContent>
    </Card>
  );
}
