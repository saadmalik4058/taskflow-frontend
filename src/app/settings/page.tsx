// app/settings/page.tsx
import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Your account details."
      note="A read-only profile view will live here. Editing profile details and changing passwords needs backend endpoints that do not exist yet."
      icon={Settings}
    />
  );
}
