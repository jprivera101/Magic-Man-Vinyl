import { Truck, ShieldCheck } from "lucide-react";

export function ShippingBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-deep-grove px-3 py-1 text-xs font-semibold text-vintage-cream">
        <Truck size={14} strokeWidth={2.5} />
        Envío gratis
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-golden-hour/20 px-3 py-1 text-xs font-semibold text-deep-grove">
        <ShieldCheck size={14} strokeWidth={2.5} />
        Incluye fundas internas y externas
      </span>
    </div>
  );
}
