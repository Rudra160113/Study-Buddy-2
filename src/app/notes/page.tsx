import { AppShell } from '@/components/app-shell';
import { NoteRepository } from '@/components/note-repository';

export default function NotesPage() {
  return (
    <AppShell>
      <NoteRepository />
    </AppShell>
  );
}
