
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TerminalSquare } from 'lucide-react';

export default function IdePage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Practice IDE
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your knowledge and experiment with code.
          </p>
        </header>

        <div className="flex justify-center mt-12">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <TerminalSquare className="h-10 w-10 text-primary" />
                <CardTitle className="text-3xl">Integrated Development Environment</CardTitle>
              </div>
              <CardDescription className="text-md">
                Test your knowledge and experiment with code in our integrated development environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button disabled className="w-full bg-primary hover:bg-primary/90">
                Launch Coding Environment
              </Button>
              <p className="text-sm text-center text-muted-foreground pt-4">
                The interactive IDE is currently under construction. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
