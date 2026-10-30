// app/calendar/page.tsx
import { CalendarDays } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon";

export default function CalendarPage() {
  return (
    <ComingSoonPage
      title="Calendar"
      description="See tasks by due date."
      note="The month grid and date-only due-date formatting will be built in the Calendar phase."
      icon={CalendarDays}
    />
  );
}
