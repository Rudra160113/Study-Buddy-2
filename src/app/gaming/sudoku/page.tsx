
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Puzzle, RotateCcw, Timer, CheckCircle, Lightbulb, RefreshCw } from 'lucide-react'; // Added RefreshCw for New Game
import { useState, useEffect, useCallback } from 'react';

// Sample Sudoku puzzle (0 or '' for empty cells)
const samplePuzzleInitial: (number | string)[][] = [
  [5, 3, '', '', 7, '', '', '', ''],
  [6, '', '', 1, 9, 5, '', '', ''],
  ['', 9, 8, '', '', '', '', 6, ''],
  [8, '', '', '', 6, '', '', '', 3],
  [4, '', '', 8, '', 3, '', '', 1],
  [7, '', '', '', 2, '', '', '', 6],
  ['', 6, '', '', '', '', 2, 8, ''],
  ['', '', '', 4, 1, 9, '', '', 5],
  ['', '', '', '', 8, '', '', 7, 9]
];

const convertPuzzleToStringGrid = (puzzle: (number | string)[][]): string[][] => {
  return puzzle.map(row => row.map(cell => (cell === 0 ? '' : String(cell))));
};

export default function SudokuPage() {
  const [currentPuzzle, setCurrentPuzzle] = useState<(number | string)[][]>(samplePuzzleInitial);
  const [grid, setGrid] = useState<string[][]>(() => convertPuzzleToStringGrid(currentPuzzle));
  const [timer, setTimer] = useState(0); // Placeholder for timer in seconds
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Placeholder: Start timer logic here
    // const interval = setInterval(() => {
    //   setTimer(prev => prev + 1);
    // }, 1000);
    // return () => clearInterval(interval);
  }, []);

  const isInitialCell = useCallback((row: number, col: number) => {
    return currentPuzzle[row][col] !== '' && currentPuzzle[row][col] !== 0;
  }, [currentPuzzle]);

  const handleInputChange = (row: number, col: number, value: string) => {
    if (isInitialCell(row, col)) {
      return; // Don't allow changes to initial cells
    }
    if (/^[1-9]?$/.test(value)) { // Allow only single digits 1-9 or empty string
      const newGrid = grid.map((r, rowIndex) =>
        r.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return value;
          }
          return cell;
        })
      );
      setGrid(newGrid);
    }
  };

  const resetGrid = () => {
    setGrid(convertPuzzleToStringGrid(currentPuzzle));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isClient) {
    return (
        <AppShell>
            <div className="container mx-auto py-8 text-center">
                <p>Loading Sudoku...</p>
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Sudoku Challenge
          </h1>
          <p className="text-xl text-muted-foreground">
            Fill the grid, test your logic!
          </p>
        </header>

        <Card className="shadow-xl max-w-lg mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Puzzle className="h-7 w-7 text-accent" />
                    Solve the Puzzle
                </CardTitle>
                <div className="text-lg font-semibold text-primary">
                    <Timer className="inline h-5 w-5 mr-1" /> {formatTime(timer)}
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-9 gap-0.5 bg-muted-foreground rounded overflow-hidden shadow-md aspect-square">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const initial = isInitialCell(rowIndex, colIndex);
                  return (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="text"
                      maxLength={1}
                      value={cell}
                      readOnly={initial}
                      onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                      className={
                        `aspect-square text-2xl text-center font-semibold rounded-none border-muted-foreground focus:z-10
                        ${initial 
                          ? 'bg-secondary/30 text-card-foreground pointer-events-none' 
                          : 'bg-card hover:bg-secondary/50 text-primary focus:bg-secondary/60 focus:ring-2 focus:ring-primary/50'}
                        ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-r-muted-foreground' : ''}
                        ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-b-muted-foreground' : ''}
                        ${colIndex % 3 !== 0 ? 'border-l' : ''}
                        ${rowIndex % 3 !== 0 ? 'border-t' : ''}
                        `
                      }
                    />
                  );
                })
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" disabled className="w-full sm:col-span-1">
                    <RefreshCw className="mr-2 h-4 w-4" /> New Game
                </Button>
                <Button variant="outline" onClick={resetGrid} className="w-full sm:col-span-1">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Select disabled>
                  <SelectTrigger className="w-full sm:col-span-2">
                    <SelectValue placeholder="Difficulty: Easy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                 <Button variant="outline" disabled className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" /> Check
                </Button>
                <Button variant="outline" disabled className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4" /> Hint
                </Button>
            </div>
          </CardContent>
        </Card>
         <CardDescription className="text-center text-sm text-muted-foreground">
            Sudoku game logic, multiple levels, and difficulty settings are under development. This is a UI preview with a sample puzzle.
        </CardDescription>
      </div>
    </AppShell>
  );
}
