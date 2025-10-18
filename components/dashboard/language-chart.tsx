"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguageColor } from "@/lib/utils";

interface LanguageChartProps {
  data: Record<string, number>;
}

export function LanguageChart({ data }: LanguageChartProps) {
  const languages = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const total = languages.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages Used</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {languages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No language data yet</p>
          </div>
        ) : (
          languages.map(([language, count]) => {
            const percentage = Math.round((count / total) * 100);
            return (
              <div key={language}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(language) }}
                    />
                    <span className="text-sm font-medium capitalize">
                      {language}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getLanguageColor(language),
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
