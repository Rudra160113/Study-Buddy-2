
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeXml } from 'lucide-react'; // Changed icon to CodeXml for coding section

export default function CodingPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Coding Zone
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn to code with AI assistance and practice in our IDE.
          </p>
        </header>

        <div className="flex justify-center">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CodeXml className="h-10 w-10 text-accent" /> {/* Changed icon */}
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
