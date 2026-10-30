// app/overview/page.tsx
import { LayoutDashboard } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon";

export default function OverviewPage() {
  return (
    <ComingSoonPage
      title="Overview"
      description="Your workspace at a glance."
      note="The completion ring, stat cards, project progress, and today's tasks will be built after the shell is approved."
      icon={LayoutDashboard}
    />
  );
}
