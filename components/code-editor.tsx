"use client";

import { MonacoEditor } from "./monaco-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  className,
}: CodeEditorProps) {
  // Use Monaco Editor for better syntax highlighting
  return (
    <MonacoEditor
      value={value}
      onChange={onChange}
      language={language}
      readOnly={readOnly}
      className={className}
      height="500px"
    />
  );
}
