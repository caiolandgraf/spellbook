"use client";

import { LayoutDashboard } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { LanguageChart } from "./language-chart";
import { RecentSpells } from "./recent-spells";
import { DashboardStats } from "./stats";

interface DashboardAnimationsProps {
  userName: string;
  spellsCount: number;
  spellbooksCount: number;
  recentSpells: any[];
  languageStats: Record<string, number>;
}

export function DashboardAnimations({
  userName,
  spellsCount,
  spellbooksCount,
  recentSpells,
  languageStats,
}: DashboardAnimationsProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <LayoutDashboard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName}! ✨</h1>
          <p className="text-sm text-muted-foreground">
            Manage your spells and spellbooks from your dashboard
          </p>
        </div>
      </div>

      {/* Stats */}
      <StaggerContainer staggerDelay={0.05}>
        <StaggerItem>
          <DashboardStats
            spellsCount={spellsCount}
            spellbooksCount={spellbooksCount}
            totalViews={spellsCount * 10}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Grid Layout */}
      <StaggerContainer
        staggerDelay={0.05}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <StaggerItem>
          <RecentSpells spells={recentSpells} />
        </StaggerItem>
        <StaggerItem>
          <LanguageChart data={languageStats} />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
