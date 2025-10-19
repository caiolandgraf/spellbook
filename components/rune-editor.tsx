"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Eye, FileCode, Maximize2, Minimize2, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RuneEditorProps {
  html: string;
  css: string;
  javascript: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  onJavascriptChange: (value: string) => void;
  readOnly?: boolean;
  sideBySide?: boolean;
}

export function RuneEditor({
  html,
  css,
  javascript,
  onHtmlChange,
  onCssChange,
  onJavascriptChange,
  readOnly = false,
  sideBySide = false,
}: RuneEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState("html");
  const [fullscreenEditor, setFullscreenEditor] = useState<string | null>(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  // Update preview whenever code changes
  useEffect(() => {
    updatePreview();
  }, [html, css, javascript]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    const document = iframeRef.current.contentDocument;
    if (!document) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 1rem;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${javascript}
            } catch (error) {
              console.error('Runtime Error:', error);
              document.body.innerHTML += '<div style="color: red; padding: 1rem; margin-top: 1rem; background: #fee; border: 1px solid red; border-radius: 4px;"><strong>Error:</strong> ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    document.open();
    document.write(htmlContent);
    document.close();
  };

  const renderEditor = (language: string, value: string, onChange: (value: string) => void, height: string = "calc(100vh - 420px)") => {
    const isFullscreen = fullscreenEditor === language;
    const editorHeight = isFullscreen ? "calc(100vh - 180px)" : height;
    
    return (
      <Card className={isFullscreen ? "fixed inset-0 z-50 m-4 flex flex-col" : ""}>
        {isFullscreen && (
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2 text-sm font-medium">
              {language === "html" && <FileCode className="w-4 h-4" />}
              {language === "css" && <Palette className="w-4 h-4" />}
              {language === "javascript" && <Code2 className="w-4 h-4" />}
              {language.toUpperCase()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenEditor(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <CardContent className={`p-0 ${isFullscreen ? "flex-1" : ""}`}>
          <div className="relative group">
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setFullscreenEditor(language)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
            <Editor
              height={editorHeight}
              defaultLanguage={language}
              value={value}
              onChange={(value) => onChange(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: isFullscreen },
                fontSize: 15,
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (sideBySide) {
    return (
      <>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Editor Side */}
              <div className="space-y-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html" className="text-sm">
                      <FileCode className="w-4 h-4 mr-2" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="text-sm">
                      <Palette className="w-4 h-4 mr-2" />
                      CSS
                    </TabsTrigger>
                    <TabsTrigger value="javascript" className="text-sm">
                      <Code2 className="w-4 h-4 mr-2" />
                      JS
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="mt-3">
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setFullscreenEditor("html")}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <div className="rounded-lg overflow-hidden border">
                        <Editor
                          height="calc(100vh - 320px)"
                          defaultLanguage="html"
                          value={html}
                          onChange={(value) => onHtmlChange(value || "")}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 15,
                            lineNumbers: "on",
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            readOnly,
                            automaticLayout: true,
                            wordWrap: "on",
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="css" className="mt-3">
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setFullscreenEditor("css")}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <div className="rounded-lg overflow-hidden border">
                        <Editor
                          height="calc(100vh - 320px)"
                          defaultLanguage="css"
                          value={css}
                          onChange={(value) => onCssChange(value || "")}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 15,
                            lineNumbers: "on",
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            readOnly,
                            automaticLayout: true,
                            wordWrap: "on",
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="javascript" className="mt-3">
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setFullscreenEditor("javascript")}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <div className="rounded-lg overflow-hidden border">
                        <Editor
                          height="calc(100vh - 320px)"
                          defaultLanguage="javascript"
                          value={javascript}
                          onChange={(value) => onJavascriptChange(value || "")}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 15,
                            lineNumbers: "on",
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            readOnly,
                            automaticLayout: true,
                            wordWrap: "on",
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Preview Side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFullscreenPreview(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="rounded-lg overflow-hidden border bg-white" style={{ height: 'calc(100vh - 320px)' }}>
                  <iframe
                    ref={iframeRef}
                    title="Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fullscreen Editor */}
        {fullscreenEditor && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {fullscreenEditor === "html" && <FileCode className="w-4 h-4" />}
                  {fullscreenEditor === "css" && <Palette className="w-4 h-4" />}
                  {fullscreenEditor === "javascript" && <Code2 className="w-4 h-4" />}
                  {fullscreenEditor.toUpperCase()} Editor
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenEditor(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage={fullscreenEditor}
                  value={
                    fullscreenEditor === "html" ? html :
                    fullscreenEditor === "css" ? css :
                    javascript
                  }
                  onChange={(value) => {
                    if (fullscreenEditor === "html") onHtmlChange(value || "");
                    else if (fullscreenEditor === "css") onCssChange(value || "");
                    else onJavascriptChange(value || "");
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 15,
                    lineNumbers: "on",
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly,
                    automaticLayout: true,
                    wordWrap: "on",
                    tabSize: 2,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Preview */}
        {fullscreenPreview && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Preview - Fullscreen
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenPreview(false)}
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
              <div className="flex-1 p-4">
                <div className="h-full rounded-lg overflow-hidden border bg-white">
                  <iframe
                    ref={iframeRef}
                    title="Preview Fullscreen"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Code Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html" className="text-sm">
                <FileCode className="w-4 h-4 mr-2" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="text-sm">
                <Palette className="w-4 h-4 mr-2" />
                CSS
              </TabsTrigger>
              <TabsTrigger value="javascript" className="text-sm">
                <Code2 className="w-4 h-4 mr-2" />
                JavaScript
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4">
              {renderEditor("html", html, onHtmlChange, "600px")}
            </TabsContent>

            <TabsContent value="css" className="mt-4">
              {renderEditor("css", css, onCssChange, "600px")}
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              {renderEditor("javascript", javascript, onJavascriptChange, "600px")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Live Preview</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFullscreenPreview(true)}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border bg-white" style={{ height: '600px' }}>
            <iframe
              ref={iframeRef}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Preview */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="w-4 h-4" />
                Preview - Fullscreen
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreenPreview(false)}
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </Button>
            </div>
            <div className="flex-1 p-4">
              <div className="h-full rounded-lg overflow-hidden border bg-white">
                <iframe
                  ref={iframeRef}
                  title="Preview Fullscreen"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
