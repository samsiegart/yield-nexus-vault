import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format APY percentage to 2 decimal places
 * @param apy - The APY value as a number
 * @returns Formatted string with % symbol
 */
export function formatApy(apy?: number | null): string {
  if (apy === null || apy === undefined || Number.isNaN(apy)) {
    return "—";
  }
  return `${apy.toFixed(2)}%`;
}

/** Format large USD amounts into human-friendly string e.g. 120.02M */
export function formatUsdCompact(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "TBD";
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });
  return `$${formatter.format(value)}`;
}
