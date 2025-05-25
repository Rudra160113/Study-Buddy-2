
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Save, Settings2, TerminalSquare, Trash2, Bot, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function IdePage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState<string>("// Your JavaScript code goes here...\nconsole.log('Hello from the IDE!');\n// Try returning a value, e.g., Math.random();");
  const [consoleOutput, setConsoleOutput] = useState<string>("Output will appear here...");

  const handleRunCode = () => {
    if (selectedLanguage === "javascript") {
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function(code)();
        if (result !== undefined) {
          setConsoleOutput(String(result));
        } else {
          // If new Function doesn't return anything explicitly,
          // we might not get direct output here.
          // For a real console, we'd need to override console.log.
          // For now, we'll just indicate successful execution if no error.
          setConsoleOutput("JavaScript executed successfully.\n(Note: Direct console.log output is not captured in this preview. Return a value to see it here.)");
        }
      } catch (error) {
        if (error instanceof Error) {
          setConsoleOutput(`Error: ${error.message}`);
        } else {
          setConsoleOutput(`An unknown error occurred: ${String(error)}`);
        }
      }
    } else {
      setConsoleOutput(`Running ${selectedLanguage} code is not supported in this preview environment.`);
    }
  };

  const handleClearConsole = () => {
    setConsoleOutput("");
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust height for viewport filling */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Practice IDE
          </h1>
          <p className="text-xl text-muted-foreground">
            A space to experiment with code. (UI Preview with basic JS execution)
          </p>
        </header>

        <Card className="shadow-xl flex-grow flex flex-col overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <TerminalSquare className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Code Editor</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="swift">Swift</SelectItem>
                    <SelectItem value="kotlin">Kotlin</SelectItem>
                  </SelectContent>
                </Select>
                <Select disabled>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Select Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade1">Grade 1</SelectItem>
                    <SelectItem value="grade2">Grade 2</SelectItem>
                    <SelectItem value="grade3">Grade 3</SelectItem>
                    <SelectItem value="grade4">Grade 4</SelectItem>
                    <SelectItem value="grade5">Grade 5</SelectItem>
                    <SelectItem value="grade6">Grade 6</SelectItem>
                    <SelectItem value="grade7">Grade 7</SelectItem>
                    <SelectItem value="grade8">Grade 8</SelectItem>
                    <SelectItem value="grade9">Grade 9</SelectItem>
                    <SelectItem value="grade10">Grade 10</SelectItem>
                    <SelectItem value="grade11">Grade 11</SelectItem>
                    <SelectItem value="grade12">Grade 12</SelectItem>
                    <SelectItem value="college">College/Adult</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 text-xs bg-green-600 hover:bg-green-700"
                  onClick={handleRunCode}
                >
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
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              {/* Console/Output Area */}
              <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-secondary/20">
                <div className="p-2 border-b flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">Console Output</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearConsole} title="Clear console">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <Textarea
                  placeholder="Output will appear here..."
                  className="flex-grow w-full h-full rounded-none border-0 resize-none p-4 text-xs font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={consoleOutput}
                  readOnly 
                />
              </div>
            </div>
          </CardContent>
           <CardFooter className="p-3 border-t flex flex-col gap-2 items-start">
             <div className="w-full">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Advanced Tools (For Grade 9+ - Conceptual Preview)</h4>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" disabled className="text-xs">
                        <Bot className="mr-1.5 h-3.5 w-3.5" /> LLM Code Assistant
                    </Button>
                    <Button variant="outline" size="sm" disabled className="text-xs">
                        <Terminal className="mr-1.5 h-3.5 w-3.5" /> Bash Terminal
                    </Button>
                </div>
             </div>
            <p className="text-xs text-muted-foreground text-center w-full mt-2">
              Note: This is a visual representation. Basic JavaScript execution is enabled for preview. 
              Code execution for other languages, class verification, and advanced tools are not functional.
              Advanced tools would be available for Grade 9+ users after class confirmation.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
