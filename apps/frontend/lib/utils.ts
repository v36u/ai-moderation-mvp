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

export function generateRandomHexColor() {
  const randomInt = Math.floor(Math.random() * 0x1000000);
  const hex = randomInt.toString(16).padStart(6, "0");
  return `#${hex}`;
}
