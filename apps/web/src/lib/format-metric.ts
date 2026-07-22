export function formatMetricValue(value: number | null | undefined, unit?: "count" | "percent" | "currency" | "none"): string {
  if (value === null || value === undefined) return "—";
  switch (unit) {
    case "currency":
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
    case "percent":
      return `${value}%`;
    default:
      return value.toLocaleString("en-US");
  }
}
