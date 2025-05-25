import { AppShell } from '@/components/app-shell';
import { ResourceSuggester } from '@/components/resource-suggester';

export default function ResourcesPage() {
  return (
    <AppShell>
      <ResourceSuggester />
    </AppShell>
  );
}
