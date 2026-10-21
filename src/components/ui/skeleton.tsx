// components/ui/skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-[hsl(var(--muted))]",
        {
          "h-4 w-full": variant === "text",
          "rounded-full": variant === "circular",
          "rounded-lg": variant === "rectangular",
        },
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton variant="rectangular" width="72px" height="24px" />
          <Skeleton variant="rectangular" width="96px" height="24px" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="text" width="100px" />
        <Skeleton variant="text" width="100px" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="80px" />
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width="36px" height="36px" />
          <Skeleton variant="rectangular" width="36px" height="36px" />
        </div>
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProjectListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}