import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(
    classes
      .filter((c): c is string => Boolean(c) && typeof c === 'string')
      .map((c) => c.trim())
      .join(" ")
  );
}


