import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayDecimalAsPercentage(decimal: number) {
  const percentage = decimal * 100;
  const displayedPercentage = percentage.toFixed(2);
  return `${displayedPercentage}%`;
}
