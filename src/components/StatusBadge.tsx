import { Truck, Plane, MapPin, CheckCircle2 } from "lucide-react";
import type { $Enums } from "@/generated/prisma/client";

const ORDER_LABELS: Record<$Enums.OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_TRANSITO: "En tránsito",
  EN_GUATEMALA: "En Guatemala",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  RECHAZADO: "Rechazado",
};

const ORDER_STYLES: Record<$Enums.OrderStatus, string> = {
  PENDIENTE: "bg-golden-hour/20 text-golden-hour-dark",
  CONFIRMADO: "bg-green-100 text-green-800",
  EN_TRANSITO: "bg-sky-100 text-sky-700",
  EN_GUATEMALA: "bg-golden-hour/25 text-golden-hour-dark",
  ENVIADO: "bg-emerald-100 text-emerald-700",
  ENTREGADO: "bg-deep-grove/10 text-deep-grove",
  RECHAZADO: "bg-retro-rust/10 text-retro-rust-dark",
};

export function AvailabilityBadge({
  availableUnits,
  units,
}: {
  availableUnits: number;
  units: number;
}) {
  if (availableUnits <= 0) {
    return (
      <span className="inline-block rounded-full bg-retro-rust/10 px-2.5 py-1 text-xs font-semibold text-retro-rust-dark">
        Agotado
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
      {availableUnits} de {units} disponible{units === 1 ? "" : "s"}
    </span>
  );
}

export function OrderStatusBadge({
  status,
  label,
}: {
  status: $Enums.OrderStatus;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STYLES[status]}`}
    >
      {status === "EN_TRANSITO" && <Plane size={12} strokeWidth={2.5} />}
      {status === "EN_GUATEMALA" && <MapPin size={12} strokeWidth={2.5} />}
      {status === "ENVIADO" && <Truck size={12} strokeWidth={2.5} />}
      {status === "ENTREGADO" && <CheckCircle2 size={12} strokeWidth={2.5} />}
      {label ?? ORDER_LABELS[status]}
    </span>
  );
}
