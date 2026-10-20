import { cn } from "cn";

interface MoonLogoProps {
  className?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  dotClassName?: string;
  orientation?: "vertical" | "horizontal";
  symbolClassName?: string;
}

interface MoonSymbolProps {
  className?: string;
  dotClassName?: string;
}

function MoonSymbol({ className, dotClassName }: MoonSymbolProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      fill="none"
    >
      <path
        d="M20 74 V39 L50 63 L80 39 V74"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="38"
        cy="21"
        r="5"
        className={cn("fill-sand", dotClassName)}
      />
      <circle
        cx="62"
        cy="21"
        r="5"
        className={cn("fill-sand", dotClassName)}
      />
    </svg>
  );
}

export function MoonLogo({
  className,
  showWordmark = true,
  showTagline = false,
  dotClassName,
  orientation = "vertical",
  symbolClassName,
}: MoonLogoProps) {
  const isVertical = orientation === "vertical";
  return (
    <span
      className={cn(
        "inline-flex",
        isVertical
          ? "flex-col items-center"
          : "flex-row items-center gap-2.5",
        className,
      )}
    >
      <MoonSymbol
        className={cn(
          isVertical ? "h-8 w-8" : "h-7 w-7",
          isVertical && showWordmark ? "mb-1.5" : null,
          symbolClassName,
        )}
        dotClassName={dotClassName}
      />
      {showWordmark ? (
        <span
          className={cn(
            "flex flex-col leading-none",
            isVertical ? "items-center" : "items-start",
          )}
        >
          <span className="font-heading text-lg font-semibold tracking-[0.28em]">
            MÖÖN
          </span>
          {showTagline ? (
            <span
              className={cn(
                "mt-1 text-[0.625rem] uppercase tracking-[0.32em] opacity-70",
                isVertical && "text-center",
              )}
            >
              Contemporary Footwear
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

export { MoonSymbol };
