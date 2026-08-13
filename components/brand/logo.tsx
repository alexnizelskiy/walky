import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Render in white (for dark/photo backgrounds). */
  inverted?: boolean;
}

/**
 * walky wordmark — Belanosima, green (from Figma).
 */
export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <span
      className={cn(
        "font-logo text-[2rem] leading-none md:text-[2.6rem]",
        inverted ? "text-white" : "text-brand-500",
        className
      )}
    >
      walky
    </span>
  );
}
