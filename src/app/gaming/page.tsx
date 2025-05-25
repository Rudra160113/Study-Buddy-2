
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Puzzle, Brain, Calculator, BookOpen, Code, DivideSquare, Dices, Eye } from 'lucide-react'; // Added Eye for Pattern Recall
import Link from 'next/link';

export default function GamingPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Gaming Zone
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn through play! Sharpen your knowledge with interactive study games.
          </p>
        </header>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 w-full max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Gamepad2 className="h-10 w-10 text-accent" />
              <CardTitle className="text-3xl">Study Games Arcade</CardTitle>
            </div>
            <CardDescription className="text-md">
              Select a game category below to start playing and learning.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-semibold text-center text-muted-foreground">
              Choose a Category:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Link href="/gaming/sudoku">
                  <Puzzle className="mr-3 h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">Logic Puzzles</p>
                    <p className="text-sm text-muted-foreground">e.g., Sudoku</p>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Link href="/gaming/super-sums">
                  <Calculator className="mr-3 h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">Math Word Problems</p>
                    <p className="text-sm text-muted-foreground">Super Sums</p>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Link href="/gaming/bodmas-masters">
                  <DivideSquare className="mr-3 h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">Order of Operations</p>
                    <p className="text-sm text-muted-foreground">BODMAS Masters</p>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Link href="/gaming/dice-probability">
                  <Dices className="mr-3 h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">Dice Probability</p>
                    <p className="text-sm text-muted-foreground">Probability Challenge</p>
                  </div>
                </Link>
              </Button>
               <Button asChild variant="outline" className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Link href="/gaming/pattern-recall">
                  <Eye className="mr-3 h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">Pattern Recall</p>
                    <p className="text-sm text-muted-foreground">AI Image Memory</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" disabled className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <BookOpen className="mr-3 h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-lg">Subject Quizzes</p>
                  <p className="text-sm text-muted-foreground">K-12 Topics, General Knowledge</p>
                </div>
              </Button>
              {/* 
              <Button variant="outline" disabled className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Brain className="mr-3 h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-lg">Memory Games</p>
                  <p className="text-sm text-muted-foreground">Pattern recall, Flashcards</p>
                </div>
              </Button>
               <Button variant="outline" disabled className="w-full justify-start p-6 h-auto text-left shadow-sm hover:shadow-md transition-shadow">
                <Code className="mr-3 h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-lg">Coding Challenges (Basic)</p>
                  <p className="text-sm text-muted-foreground">Introductory logic & syntax</p>
                </div>
              </Button>
              */}
            </div>
            <p className="text-sm text-center text-muted-foreground pt-4">
              Each game features multiple levels and timers. Some games include leaderboards. (More games coming soon!)
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
