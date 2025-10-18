import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Code2, Eye } from "lucide-react";

interface DashboardStatsProps {
  spellsCount: number;
  spellbooksCount: number;
  totalViews: number;
}

export function DashboardStats({
  spellsCount,
  spellbooksCount,
  totalViews,
}: DashboardStatsProps) {
  const stats = [
    {
      name: "Total Spells",
      value: spellsCount,
      icon: Code2,
      color: "text-primary",
    },
    {
      name: "Spellbooks",
      value: spellbooksCount,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      name: "Total Views",
      value: totalViews,
      icon: Eye,
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
