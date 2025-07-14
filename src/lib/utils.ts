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
