"use client";

import { motion } from "framer-motion";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Lock, Code2, FileCode, Palette } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
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
  updatedAt?: Date;
  user: {
    name: string | null;
    username: string | null;
    image?: string | null;
  };
}

interface RuneCardProps {
  rune: Rune;
  isDashboard?: boolean;
}

const MotionCard = motion.create(Card);

export function RuneCard({ rune, isDashboard = false }: RuneCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate the HTML content for srcdoc
  const previewHtml = `
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
        padding: 0.5rem;
        overflow: hidden;
        transform: scale(0.45);
        transform-origin: top left;
        width: 222%;
        height: 222%;
      }
      ${rune.css || ''}
    </style>
  </head>
  <body>
    ${rune.html || ''}
    <script>
      try {
        ${rune.javascript || ''}
      } catch (error) {
        console.error('Rune error:', error);
      }
    </script>
  </body>
</html>
  `;

  const hasCode = !!(rune.html?.trim() || rune.css?.trim() || rune.javascript?.trim());

  const cardLink = isDashboard ? `/dashboard/runes/${rune.id}/edit` : `/runes/${rune.id}`;

  return (
    <Link href={cardLink}>
      <MotionCard 
        className="group hover:border-primary/50 transition-all h-full flex flex-col"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Preview */}
        <div className="aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative border-b">
          <>
            <iframe
              ref={iframeRef}
              title={`Preview of ${rune.title}`}
              srcDoc={previewHtml}
              className="w-full h-full border-0 pointer-events-none bg-white"
              sandbox="allow-scripts"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 flex gap-1">
                {rune.html?.trim() && (
                    <div className="px-2 py-1 rounded bg-orange-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <FileCode className="w-3 h-3" />
                      HTML
                    </div>
                  )}
                  {rune.css?.trim() && (
                    <div className="px-2 py-1 rounded bg-blue-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      CSS
                    </div>
                  )}
                  {rune.javascript?.trim() && (
                    <div className="px-2 py-1 rounded bg-yellow-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <Code2 className="w-3 h-3" />
                      JS
                    </div>
                  )}
                </div>
              </div>
            </>
        </div>

        <CardHeader className="pb-3 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {rune.title}
            </h3>
            {!rune.isPublic && (
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          
          {rune.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {rune.description}
            </p>
          )}

          {/* Tags */}
          {rune.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {rune.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {rune.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{rune.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardFooter className="pt-3 border-t flex-col gap-3">
          {/* Stats */}
          <div className="w-full flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{rune.views.toLocaleString()}</span>
            </div>
            
            <span className="text-xs ml-auto">
              {formatRelativeTime(rune.updatedAt || rune.createdAt)}
            </span>
          </div>

          {/* Author */}
          <div className="w-full flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={rune.user.image || ""} />
              <AvatarFallback className="text-xs">
                {(rune.user.username || rune.user.name || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {rune.user.username || rune.user.name || "Unknown"}
            </span>
          </div>
        </CardFooter>

        {/* Hover Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg" />
        </div>
      </MotionCard>
    </Link>
  );
}
