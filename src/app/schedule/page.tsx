
"use client";

import { AppShell } from '@/components/app-shell';
import { SchedulePlanner } from '@/components/schedule-planner';
import type { ScheduleItem } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useCurrentUserEmail } from '@/hooks/use-current-user-email'; // Added import

const mockScheduleItems: ScheduleItem[] = []; // Start with no mock items by default

export default function SchedulePage() {
  const currentUserEmail = useCurrentUserEmail();
  const [items, setItems] = useState<ScheduleItem[]>(mockScheduleItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUserEmail === undefined) { // Still determining email
        setIsLoading(true);
        return;
    }

    setIsLoading(true);
    const storageKey = currentUserEmail ? `${currentUserEmail}_scheduleItems` : 'scheduleItems_guest';
    const storedItems = localStorage.getItem(storageKey);

    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems).map((item: ScheduleItem) => ({
            ...item, 
            deadline: new Date(item.deadline)
        }));
        setItems(parsedItems);
      } catch (error) {
        console.error(`Failed to parse schedule items from localStorage for key ${storageKey}:`, error);
        localStorage.removeItem(storageKey); 
        setItems(mockScheduleItems); 
      }
    } else {
      setItems(mockScheduleItems); 
    }
    setIsLoading(false);
  }, [currentUserEmail]);
  
  if (isLoading) {
      return (
        <AppShell>
          <div className="flex justify-center items-center h-full">
            <p>Loading schedule...</p>
          </div>
        </AppShell>
      );
  }

  return (
    <AppShell>
      {/* Pass items to SchedulePlanner, it will handle its own localStorage interactions */}
      <SchedulePlanner initialItems={items} />
    </AppShell>
  );
}
