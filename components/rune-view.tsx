"use client";

import { RuneEditor } from "@/components/rune-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Globe, Lock, Copy, Code2, Monitor, FileCode, Palette, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface Rune {
  id: string;
  title: string;
  description: string | null;
  html: string;
  css: string;
  javascript: string;
  isPublic: boolean;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface RuneViewProps {
  rune: Rune;
}

export function RuneView({ rune }: RuneViewProps) {
  const [showCode, setShowCode] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/runes/${rune.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasHTML = rune.html.trim().length > 0;
  const hasCSS = rune.css.trim().length > 0;
  const hasJS = rune.javascript.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/runes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Runes
              </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="mb-6 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          <CardHeader className="relative space-y-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                {/* Title and visibility */}
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{rune.title}</h1>
                    {rune.description && (
                      <p className="text-muted-foreground text-base md:text-lg">{rune.description}</p>
                    )}
                  </div>
                  {rune.isPublic ? (
                    <Badge variant="outline" className="gap-1 flex-shrink-0">
                      <Globe className="w-3 h-3" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 flex-shrink-0">
                      <Lock className="w-3 h-3" />
                      Private
                    </Badge>
                  )}
                </div>

                {/* Author and Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm border-t border-b py-3">
                  <Link 
                    href={`/u/${rune.user.username || ""}`} 
                    className="flex items-center gap-2 hover:text-primary transition-colors group"
                  >
                    <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={rune.user.image || ""} />
                      <AvatarFallback>
                        {(rune.user.name || rune.user.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {rune.user.username || rune.user.name || "Unknown"}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{rune.views.toLocaleString()} views</span>
                  </div>

                  <span className="text-muted-foreground">
                    Updated {formatRelativeTime(rune.updatedAt)}
                  </span>
                </div>

                {/* Tech badges and Tags */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {hasHTML && (
                      <Badge variant="outline" className="gap-1">
                        <FileCode className="w-3 h-3 text-orange-500" />
                        HTML
                      </Badge>
                    )}
                    {hasCSS && (
                      <Badge variant="outline" className="gap-1">
                        <Palette className="w-3 h-3 text-blue-500" />
                        CSS
                      </Badge>
                    )}
                    {hasJS && (
                      <Badge variant="outline" className="gap-1">
                        <Code2 className="w-3 h-3 text-yellow-500" />
                        JavaScript
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {rune.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {rune.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 lg:w-auto w-full">
                <div className="flex gap-2">
                  <Button 
                    variant={showCode ? "default" : "outline"} 
                    className="flex-1 lg:flex-none"
                    onClick={() => setShowCode(true)}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Code
                  </Button>
                  <Button 
                    variant={!showCode ? "default" : "outline"} 
                    className="flex-1 lg:flex-none"
                    onClick={() => setShowCode(false)}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
                <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Share"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Editor/Preview */}
        {showCode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code2 className="w-4 h-4" />
              <span>Source Code</span>
            </div>
            <RuneEditor
              html={rune.html}
              css={rune.css}
              javascript={rune.javascript}
              onHtmlChange={() => {}}
              onCssChange={() => {}}
              onJavascriptChange={() => {}}
              readOnly
              sideBySide={true}
            />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full bg-white border-t" style={{ height: "calc(100vh - 400px)", minHeight: "600px" }}>
                <iframe
                  title="Rune Preview"
                  srcDoc={`
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
                          ${rune.css}
                        </style>
                      </head>
                      <body>
                        ${rune.html}
                        <script>
                          try {
                            ${rune.javascript}
                          } catch (error) {
                            console.error('Runtime Error:', error);
                            document.body.innerHTML += '<div style="color: red; padding: 1rem; margin-top: 1rem; background: #fee; border: 1px solid red; border-radius: 4px;"><strong>Error:</strong> ' + error.message + '</div>';
                          }
                        </script>
                      </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
