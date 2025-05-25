
"use client"; // Ensure this page is a client component to use the hook

import { AppShell } from '@/components/app-shell';
import { NoteRepository } from '@/components/note-repository';
import { useCurrentUserEmail } from '@/hooks/use-current-user-email';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotesPage() {
  const currentUserEmail = useCurrentUserEmail();

  // Optional: Show a loading state while email is being determined
  if (currentUserEmail === undefined) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <NoteRepository />
    </AppShell>
  );
}
