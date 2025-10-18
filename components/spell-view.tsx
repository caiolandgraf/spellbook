"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/code-editor";
import { CodeRunner } from "@/components/code-runner";
import {
    Copy,
    Edit,
    Eye,
    Heart,
    MoreVertical,
    Share2,
    Trash,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime, getLanguageColor } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface SpellViewProps {
  spell: {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    isPublic: boolean;
    tags: string[];
    views: number;
    executions: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
    spellbook: {
      id: string;
      name: string;
    } | null;
  };
  isOwner: boolean;
}

export function SpellView({ spell, isOwner }: SpellViewProps) {
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if spell is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/spells/${spell.id}/favorite`);
        const data = await response.json();
        setIsFavorited(data.favorited);
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };

    checkFavorite();
  }, [spell.id]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(spell.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSpell = async () => {
    const url = window.location.href.replace("/dashboard/spell/", "/spells/");
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard! 🔗");
  };

  const toggleFavorite = async () => {
    setIsLoadingFavorite(true);
    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch(`/api/spells/${spell.id}/favorite`, {
        method,
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        if (!isFavorited) {
          toast.success("Added to favorites! ❤️");
        } else {
          toast.success("Removed from favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleEdit = () => {
    window.location.href = `/dashboard/spell/${spell.id}/edit`;
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this spell? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/spells/${spell.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Spell deleted successfully! 🗑️");
        // Redirect to spells page after deletion
        setTimeout(() => {
          window.location.href = "/spells";
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete spell");
      }
    } catch (error) {
      console.error("Error deleting spell:", error);
      toast.error("Failed to delete spell");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{spell.title}</h1>
            {!spell.isPublic && (
              <Badge variant="secondary">Private</Badge>
            )}
          </div>
          
          {spell.description && (
            <p className="text-muted-foreground text-lg mb-4">
              {spell.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {spell.user.image && (
                <Image
                  src={spell.user.image}
                  alt={spell.user.name || "User"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <Link
                href={spell.user.username ? `/u/${spell.user.username}` : '#'}
                className="hover:text-primary transition-colors"
              >
                {spell.user.name}
              </Link>
            </div>
            
            <span>•</span>
            
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getLanguageColor(spell.language) }}
              />
              <span className="capitalize">{spell.language}</span>
            </div>

            {spell.spellbook && (
              <>
                <span>•</span>
                <Link
                  href={`/spellbooks/${spell.spellbook.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {spell.spellbook.name}
                </Link>
              </>
            )}

            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{spell.views} views</span>
            </div>

            <span>•</span>
            <span>{formatRelativeTime(spell.updatedAt)}</span>
          </div>

          {/* Tags */}
          {spell.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {spell.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={copyCode}>
            <Copy className={copied ? "text-primary" : ""} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={shareSpell}>
            <Share2 />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            disabled={isLoadingFavorite}
            className={isFavorited ? "text-red-500 border-red-500" : ""}
          >
            <Heart className={isFavorited ? "fill-current" : ""} />
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={isDeleting}>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-500" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeEditor
          value={spell.code}
          onChange={() => {}}
          language={spell.language}
          readOnly
        />

        <CodeRunner code={spell.code} language={spell.language} />
      </div>
    </div>
  );
}
