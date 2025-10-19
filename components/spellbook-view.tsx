"use client";

import {
  BookOpen,
  Edit,
  Lock,
  MoreVertical,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SpellCard } from "@/components/spell-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface SpellbookViewProps {
  spellbook: {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
    spells: Array<{
      id: string;
      title: string;
      description: string | null;
      language: string;
      isPublic: boolean;
      tags: string[];
      views: number;
      updatedAt: Date;
    }>;
    _count: {
      spells: number;
    };
  };
  isOwner: boolean;
}

export function SpellbookView({ spellbook, isOwner }: SpellbookViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this spellbook?")) return;

    try {
      const response = await fetch(`/api/spellbooks/${spellbook.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/spellbooks");
    } catch (error) {
      console.error("Error deleting spellbook:", error);
      alert("Failed to delete spellbook");
    }
  };

  // Filter spells
  const filteredSpells = spellbook.spells.filter((spell) => {
    const matchesSearch =
      spell.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      !selectedLanguage || spell.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  // Get unique languages
  const languages = Array.from(
    new Set(spellbook.spells.map((spell) => spell.language))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{spellbook.name}</h1>
              {!spellbook.isPublic && (
                <Badge variant="secondary">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>

          {spellbook.description && (
            <p className="text-muted-foreground text-lg mb-4">
              {spellbook.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {spellbook.user.image && (
                <Image
                  src={spellbook.user.image}
                  alt={spellbook.user.name || "User"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <Link
                href={
                  spellbook.user.username
                    ? `/u/${spellbook.user.username}`
                    : "#"
                }
                className="hover:text-primary transition-colors"
              >
                {spellbook.user.name}
              </Link>
            </div>

            <span>•</span>
            <span>{spellbook._count.spells} spells</span>

            <span>•</span>
            <span>Updated {formatDate(spellbook.updatedAt)}</span>
          </div>

          {/* Tags */}
          {spellbook.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {spellbook.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button asChild>
                <Link href={`/dashboard/spell/new?spellbookId=${spellbook.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spell
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/spellbooks/${spellbook.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search spells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {languages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedLanguage === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage(null)}
            >
              All
            </Button>
            {languages.map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Spells Grid */}
      {filteredSpells.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-2xl font-semibold mb-2">
            {searchQuery || selectedLanguage
              ? "No spells found"
              : "No spells yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery || selectedLanguage
              ? "Try adjusting your search or filters"
              : "Add your first spell to this spellbook"}
          </p>
          {isOwner && !searchQuery && !selectedLanguage && (
            <Button asChild>
              <Link href={`/dashboard/spell/new?spellbookId=${spellbook.id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Spell
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={{
                ...spell,
                spellbook: {
                  name: spellbook.name,
                },
              }}
              isLoggedIn={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
