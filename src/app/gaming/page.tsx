
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Gamepad2, School } from 'lucide-react';

export default function GamingPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Gaming Zone
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn through play and code!
          </p>
        </header>

        <div className="space-y-8"> {/* Changed from grid to space-y for vertical stacking */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="h-10 w-10 text-accent" />
                <CardTitle className="text-3xl">Study Games</CardTitle>
              </div>
              <CardDescription className="text-md">
                Sharpen your knowledge with our collection of interactive study games. Fun and learning, all in one place! (Leaderboard coming soon!)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Select a game category to get started:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Adjusted grid for better responsiveness */}
                <Button variant="outline" disabled className="w-full justify-start p-4 h-auto">
                  <School className="mr-2 h-5 w-5" />
                  <div>
                    <p className="font-semibold">K-12 Games</p>
                    <p className="text-xs text-muted-foreground">Math, Science, Vocab & more</p>
                  </div>
                </Button>
                <Button variant="outline" disabled className="w-full justify-start p-4 h-auto">
                  <Code className="mr-2 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Logic Puzzles</p>
                    <p className="text-xs text-muted-foreground">Boost critical thinking</p>
                  </div>
                </Button>
                 {/* Add more game category placeholders here */}
              </div>
               <p className="text-sm text-center text-muted-foreground pt-4">
                More games and features are under development!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Code className="h-10 w-10 text-accent" />
                <CardTitle className="text-3xl">Coding Learner</CardTitle>
              </div>
              <CardDescription className="text-md">
                Embark on your coding journey with our AI-powered tutor and built-in IDE. From novice to pro!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our comprehensive coding curriculum will guide you step-by-step.
                The AI tutor will provide explanations, exercises, and feedback.
              </p>
              <Button disabled className="w-full bg-primary hover:bg-primary/90">
                Launch Coding Environment & AI Tutor
              </Button>
              <p className="text-sm text-center text-muted-foreground pt-4">
                The coding learner module is currently under construction. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
