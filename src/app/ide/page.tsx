
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Save, Settings2, TerminalSquare, Trash2, Bot, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { interpretCode, type InterpretCodeInput, type InterpretCodeOutput } from '@/ai/flows/interpret-code-flow';
import { suggestCodeCorrection, type SuggestCodeCorrectionInput, type SuggestCodeCorrectionOutput } from '@/ai/flows/suggest-code-correction-flow';

const programmingLanguages = [
  { value: "javascript", label: "JavaScript (Executable)" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "php", label: "PHP" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL (Generic)"},
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "text", label: "Plain Text" },
];

const gradeLevels = [
  { value: "Grade 2", label: "Grade 2" },
  { value: "Grade 3", label: "Grade 3" },
  { value: "Grade 4", label: "Grade 4" },
  { value: "Grade 5", label: "Grade 5" },
  { value: "Grade 6", label: "Grade 6" },
  { value: "Grade 7", label: "Grade 7" },
  { value: "Grade 8", label: "Grade 8" },
  { value: "Grade 9", label: "Grade 9" },
  { value: "Grade 10", label: "Grade 10" },
  { value: "Grade 11", label: "Grade 11" },
  { value: "Grade 12", label: "Grade 12" },
  { value: "College/Adult", label: "College/Adult" },
];

export default function IdePage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("Grade 7");
  const [code, setCode] = useState<string>("// Your code goes here...\nconsole.log('Hello from the IDE!');\n// For JavaScript, try returning a value, e.g., Math.random(); \n// For other languages, AI will interpret the code.");
  const [consoleOutput, setConsoleOutput] = useState<string>("Output and AI analysis will appear here...");
  const [isProcessingRun, setIsProcessingRun] = useState(false);
  const [isProcessingAssistant, setIsProcessingAssistant] = useState(false);
  const { toast } = useToast();

  const handleRunOrAnalyzeCode = async () => {
    setIsProcessingRun(true);
    setConsoleOutput(""); 

    if (selectedLanguage === "javascript") {
      setConsoleOutput("Executing JavaScript...");
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function(code)();
        if (result !== undefined) {
          setConsoleOutput(`JavaScript Execution Result:\n${String(result)}`);
        } else {
          setConsoleOutput("JavaScript executed successfully.\n(Note: Direct console.log output is not captured here. Return a value to see it, or use AI analysis for other languages.)");
        }
      } catch (error) {
        if (error instanceof Error) {
          setConsoleOutput(`JavaScript Execution Error:\n${error.message}`);
        } else {
          setConsoleOutput(`An unknown JavaScript execution error occurred:\n${String(error)}`);
        }
      }
    } else {
      if (!code.trim()) {
        toast({ title: "Empty Code", description: "Please enter some code to analyze.", variant: "destructive" });
        setIsProcessingRun(false);
        return;
      }
      setConsoleOutput(`AI is analyzing your ${selectedLanguage} code for ${selectedGradeLevel}...`);
      try {
        const input: InterpretCodeInput = { code, language: selectedLanguage, gradeLevel: selectedGradeLevel };
        const result: InterpretCodeOutput = await interpretCode(input);
        
        let analysisText = `AI Code Analysis (${selectedLanguage} for ${selectedGradeLevel}):\n\nInterpretation:\n${result.interpretation}`;
        if (result.suggestions && result.suggestions.length > 0) {
          analysisText += `\n\nSuggestions:\n- ${result.suggestions.join('\n- ')}`;
        }
        if (result.warnings && result.warnings.length > 0) {
          analysisText += `\n\nWarnings:\n- ${result.warnings.join('\n- ')}`;
        }
        setConsoleOutput(analysisText);
        toast({ title: "AI Analysis Complete", description: `AI has provided feedback on your ${selectedLanguage} code.` });

      } catch (error) {
        console.error("Error interpreting code with AI:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
        setConsoleOutput(`AI Analysis Error (${selectedLanguage}):\n${errorMessage}`);
        toast({
          title: "AI Analysis Error",
          description: "Could not get AI interpretation. Please try again.",
          variant: "destructive",
        });
      }
    }
    setIsProcessingRun(false);
  };

  const handleCodeAssistant = async () => {
    if (!code.trim()) {
        toast({ title: "Empty Code", description: "Please enter some code for the assistant to analyze.", variant: "destructive"});
        return;
    }
    setIsProcessingAssistant(true);
    setConsoleOutput(`LLM Code Assistant is analyzing your ${selectedLanguage} code...`);

    let errorContextForAssistant = "User requests code review/correction.";
    if (consoleOutput.toLowerCase().includes("error:") || consoleOutput.toLowerCase().includes("failed:")) {
        errorContextForAssistant = `Previous console output indicated an issue: "${consoleOutput.substring(0, 200)}${consoleOutput.length > 200 ? "..." : ""}"`;
    }
    
    try {
        const input: SuggestCodeCorrectionInput = { 
            code, 
            language: selectedLanguage, 
            gradeLevel: selectedGradeLevel,
            errorContext: errorContextForAssistant
        };
        const result: SuggestCodeCorrectionOutput = await suggestCodeCorrection(input);

        let assistantResponse = `--- LLM Code Assistant (${selectedLanguage} for ${selectedGradeLevel}) ---\n\nExplanation:\n${result.explanation}\n`;
        if (result.hasCorrection && result.suggestedCode) {
            assistantResponse += `\nSuggested Code:\n\`\`\`${selectedLanguage}\n${result.suggestedCode}\n\`\`\`\n(To use this suggestion, copy and paste it into the editor above.)`;
        } else if (result.suggestedCode && !result.hasCorrection) {
             assistantResponse += `\nReviewed Code (no specific corrections needed):\n\`\`\`${selectedLanguage}\n${result.suggestedCode}\n\`\`\`\n`;
        }

        setConsoleOutput(assistantResponse);
        toast({ title: "LLM Assistant Responded", description: "The AI assistant has provided feedback."});

    } catch (error) {
        console.error("Error with LLM Code Assistant:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the AI assistant.";
        setConsoleOutput(`LLM Code Assistant Error:\n${errorMessage}`);
        toast({
          title: "LLM Assistant Error",
          description: "Could not get suggestions from the AI assistant. Please try again.",
          variant: "destructive",
        });
    }
    setIsProcessingAssistant(false);
  };


  const handleClearConsole = () => {
    setConsoleOutput("");
  };

  const runButtonText = isProcessingRun 
    ? (selectedLanguage === 'javascript' ? 'Running JS...' : 'AI Analyzing...') 
    : "Run";
  const runButtonIcon = isProcessingRun 
    ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
    : (selectedLanguage === 'javascript' ? <Play className="mr-1.5 h-3.5 w-3.5" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />);

  return (
    <AppShell>
      <div className="container mx-auto py-8 flex flex-col h-[calc(100vh-8rem)]">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            Practice IDE
          </h1>
          <p className="text-xl text-muted-foreground">
            Experiment with code. Run JavaScript or get AI explanations for other languages.
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
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isProcessingRun || isProcessingAssistant}>
                  <SelectTrigger className="w-auto min-w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {programmingLanguages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel} disabled={isProcessingRun || isProcessingAssistant}>
                  <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Select Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 text-xs bg-green-600 hover:bg-green-700 min-w-[100px]"
                  onClick={handleRunOrAnalyzeCode}
                  disabled={isProcessingRun || isProcessingAssistant || !code.trim()}
                >
                  {runButtonIcon}
                  {runButtonText}
                </Button>
                 <Button variant="ghost" size="icon" disabled className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <div className="flex-grow flex flex-col md:flex-row h-full">
              <div className="w-full md:w-2/3 h-1/2 md:h-full flex flex-col border-r-0 md:border-r">
                <Textarea
                  placeholder="// Your code goes here... Type or paste and click 'Run'."
                  className="flex-grow w-full h-full rounded-none border-0 resize-none p-4 text-sm font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isProcessingRun || isProcessingAssistant}
                />
              </div>
              <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-secondary/20">
                <div className="p-2 border-b flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">Console / AI Output</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearConsole} title="Clear console" disabled={isProcessingRun || isProcessingAssistant}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <Textarea
                  placeholder="Output from JavaScript execution or AI analysis will appear here..."
                  className="flex-grow w-full h-full rounded-none border-0 resize-none p-4 text-xs font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-pre-wrap"
                  value={consoleOutput}
                  readOnly 
                />
              </div>
            </div>
          </CardContent>
           <CardFooter className="p-3 border-t flex flex-col gap-2 items-start">
             <div className="w-full">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Advanced Tools</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Use the LLM Assistant to get suggestions or corrections for your code.
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={handleCodeAssistant}
                        disabled={isProcessingRun || isProcessingAssistant || !code.trim()}
                    >
                        {isProcessingAssistant ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Bot className="mr-1.5 h-3.5 w-3.5" />}
                        {isProcessingAssistant ? 'Assisting...' : 'LLM Code Assistant'}
                    </Button>
                </div>
             </div>
            <p className="text-xs text-muted-foreground text-center w-full mt-2">
              Note: Basic JavaScript execution is available. For other selected languages, the "Run" button triggers AI code analysis.
              The AI will attempt to tailor explanations based on the selected grade.
              True multi-language execution is conceptual. Use the LLM Code Assistant for feedback.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
