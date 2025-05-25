"use client";

import { AppShell } from '@/components/app-shell';
import { SchedulePlanner } from '@/components/schedule-planner';
import type { ScheduleItem } from '@/lib/types';
import { useEffect, useState } from 'react';

// Mock data for initial load, this would typically come from a database or global state
const mockScheduleItems: ScheduleItem[] = [
  // Example: { id: '1', title: 'Math Homework', deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: false, description: 'Chapter 3 problems' },
];


export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>(mockScheduleItems);

  useEffect(() => {
    // Attempt to load from localStorage to persist across refreshes for demo.
    // This ensures SchedulePlanner can also access this shared state if needed,
    // though SchedulePlanner has its own localStorage logic.
    // Ideally, this would be a global state (Context/Zustand) or server state.
    const storedItems = localStorage.getItem('scheduleItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems).map((item: ScheduleItem) => ({...item, deadline: new Date(item.deadline)})));
    } else {
        localStorage.setItem('scheduleItems', JSON.stringify(mockScheduleItems));
    }
  }, []);
  
  return (
    <AppShell>
      <SchedulePlanner initialItems={items} />
    </AppShell>
  );
}
