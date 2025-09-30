import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-12 w-12 bg-primary rounded-xl",
        className
      )}
    >
      <span className="text-2xl font-bold text-primary-foreground">VRS</span>
    </div>
  );
}
