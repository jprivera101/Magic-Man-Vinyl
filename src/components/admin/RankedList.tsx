import type { LucideIcon } from "lucide-react";

export function RankedList({
  title,
  icon: Icon,
  items,
  emptyText,
}: {
  title: string;
  icon: LucideIcon;
  items: { label: string; value: string }[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10 sm:p-6">
      <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-semibold text-deep-grove">
        <Icon size={18} />
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-deep-grove/50">{emptyText}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl bg-deep-grove/5 px-3 py-2"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-golden-hour/20 text-xs font-bold text-golden-hour-dark">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-grove">
                {item.label}
              </span>
              <span className="flex-shrink-0 text-sm font-semibold text-retro-rust">
                {item.value}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
