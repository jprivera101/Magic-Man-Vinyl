export function formatQuetzales(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(value);
}

const GUATEMALA_TIME_ZONE = "America/Guatemala";

export function formatFecha(date: Date): string {
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: GUATEMALA_TIME_ZONE,
  }).format(date);
}

export function formatFechaHora(date: Date): string {
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: GUATEMALA_TIME_ZONE,
  }).format(date);
}
