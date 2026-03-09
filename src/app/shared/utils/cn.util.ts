// Utility function to merge class names (clsx + tailwind-merge equivalent)
export function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs.filter(Boolean).join(' ');
}
