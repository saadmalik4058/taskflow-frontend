// components/layout/coming-soon.tsx
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonPageProps {
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
}

export function ComingSoonPage({ title, description, note, icon: Icon }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card>
        <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Icon className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-ink">Coming in a later phase</h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">{note}</p>
        </CardContent>
      </Card>
    </div>
  );
}
