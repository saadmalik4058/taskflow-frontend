// lib/project-colors.ts
// Deterministic project colours until the backend stores a colour per project.

const PROJECT_PALETTE = ["#4338CA", "#0E7490", "#B45309"] as const;

export function getProjectColor(projectId: string): string {
  let hash = 0;

  for (let index = 0; index < projectId.length; index += 1) {
    hash = (hash * 31 + projectId.charCodeAt(index)) >>> 0;
  }

  return PROJECT_PALETTE[hash % PROJECT_PALETTE.length];
}
