import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that merges Tailwind classnames
 * and ensures valid class strings.
 *
 * @param {...(string | undefined | null | boolean)} inputs - The classnames to merge
 * @returns {string} A single string containing all valid classnames
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
