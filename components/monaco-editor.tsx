"use client";

import { Editor } from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CodeDisplay } from "./code-display";
import { useTheme } from "next-themes";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  height?: string;
}

export function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  className,
  height = "400px",
}: MonacoEditorProps) {
  const { theme } = useTheme();

  // Map language names to Monaco language IDs
  const getMonacoLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      rb: "ruby",
      go: "go",
      rs: "rust",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      php: "php",
      swift: "swift",
      kt: "kotlin",
      scala: "scala",
      sql: "sql",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      yaml: "yaml",
      markdown: "markdown",
      md: "markdown",
      xml: "xml",
      bash: "shell",
      sh: "shell",
    };

    return languageMap[lang.toLowerCase()] || lang;
  };

  if (readOnly) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-0">
          <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {language}
            </span>
          </div>
          <div className="min-h-[400px] overflow-auto">
            <CodeDisplay code={value} language={language} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground uppercase">
            {language}
          </span>
          <span className="text-xs text-muted-foreground">
            Monaco Editor
          </span>
        </div>
        
        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={value}
          onChange={(value) => onChange(value || "")}
          theme={theme === "light" ? "vs-light" : "vs-dark"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            cursorStyle: "line",
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
              <div className="text-muted-foreground">Loading editor...</div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
