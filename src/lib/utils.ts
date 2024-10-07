import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// TODO: Maybe improve performance
export function getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
