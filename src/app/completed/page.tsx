// app/completed/page.tsx
import { CheckCircle2 } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon";

export default function CompletedPage() {
  return (
    <ComingSoonPage
      title="Completed"
      description="Everything you have finished."
      note="Completed tasks will use the same Created by me / Assigned to me scope tabs as My Tasks."
      icon={CheckCircle2}
    />
  );
}
