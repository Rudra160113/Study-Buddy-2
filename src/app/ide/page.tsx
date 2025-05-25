
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Save, Settings2, TerminalSquare, Trash2 } from 'lucide-react';

export default function IdePage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8 flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust height for viewport filling */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Practice IDE
          </h1>
          <p className="text-xl text-muted-foreground">
            A space to experiment with code. (UI Preview - Not Functional)
          </p>
        </header>

        <Card className="shadow-xl flex-grow flex flex-col overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TerminalSquare className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Code Editor</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Select disabled>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue placeholder="JavaScript" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                </Button>
                <Button variant="default" size="sm" disabled className="h-8 text-xs bg-green-600 hover:bg-green-700">
                  <Play className="mr-1.5 h-3.5 w-3.5" /> Run
                </Button>
                 <Button variant="ghost" size="icon" disabled className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <div className="flex-grow flex flex-col md:flex-row h-full">
              {/* Editor Area */}
              <div className="w-full md:w-2/3 h-1/2 md:h-full flex flex-col border-r-0 md:border-r">
                <Textarea
                  placeholder="// Your code goes here..."
                  className="flex-grow w-full h-full rounded-none border-0 resize-none p-4 text-sm font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                  readOnly // For UI preview
                />
              </div>

              {/* Console/Output Area */}
              <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-secondary/20">
                <div className="p-2 border-b flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">Console Output</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled title="Clear console">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <Textarea
                  placeholder="Output will appear here..."
                  className="flex-grow w-full h-full rounded-none border-0 resize-none p-4 text-xs font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  readOnly // For UI preview
                />
              </div>
            </div>
          </CardContent>
           <CardFooter className="p-3 border-t">
            <p className="text-xs text-muted-foreground text-center w-full">
              Note: This is a visual representation of an IDE. Code editing and execution are not functional in this preview.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
