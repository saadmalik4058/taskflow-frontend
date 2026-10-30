// lib/project-events.ts
export const PROJECTS_CHANGED_EVENT = "taskflow:projects-changed";

export function notifyProjectsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROJECTS_CHANGED_EVENT));
  }
}
