
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
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    // Attempt to load from localStorage to persist across refreshes for demo.
    const storedItems = localStorage.getItem('scheduleItems');
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems).map((item: ScheduleItem) => ({
            ...item, 
            deadline: new Date(item.deadline)
        }));
        setItems(parsedItems);
      } catch (error) {
        console.error("Failed to parse schedule items from localStorage", error);
        // If parsing fails, fall back to mock or empty, and clear potentially corrupted storage
        localStorage.removeItem('scheduleItems'); 
        setItems(mockScheduleItems); 
        if (mockScheduleItems.length > 0) { // Only save if mock items exist
            localStorage.setItem('scheduleItems', JSON.stringify(mockScheduleItems));
        }
      }
    } else {
      setItems(mockScheduleItems); // Set to mock if nothing in localStorage
      if (mockScheduleItems.length > 0) { // Only save if mock items exist
        localStorage.setItem('scheduleItems', JSON.stringify(mockScheduleItems));
      }
    }
    setIsLoading(false); // Set loading to false after attempting to load
  }, []);
  
  if (isLoading) {
      // Optional: render a loading spinner or placeholder
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
      <SchedulePlanner initialItems={items} />
    </AppShell>
  );
}

    