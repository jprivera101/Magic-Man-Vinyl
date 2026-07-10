import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-deep-grove/10 text-deep-grove">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-deep-grove/60">{label}</p>
        <p className="font-display truncate text-xl font-bold text-deep-grove">
          {value}
        </p>
      </div>
    </div>
  );
}
