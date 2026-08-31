import { cn } from "@/lib/utils";

interface BrandLockupProps {
  /** "light" for dark/green surfaces, "dark" for white surfaces. */
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  /** Hide the "Yaba College of Technology" line (tight spaces). */
  compact?: boolean;
  className?: string;
}

const CREST = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
const WORD = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
const SUB = { sm: "text-[10px]", md: "text-[11px]", lg: "text-xs" };

/**
 * Institutional lockup: the official crest paired with a typographic wordmark.
 *
 * The college only publishes its logo as a 168x50 PNG whose wordmark is too
 * compressed to enlarge, so the crest is lifted out of that file and the
 * "YABATECH" wordmark is set in Outfit instead — crisp at any size.
 */
const BrandLockup = ({
  tone = "dark",
  size = "md",
  compact = false,
  className,
}: BrandLockupProps) => {
  const light = tone === "light";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/yabatech-crest.png"
        alt="Yaba College of Technology crest"
        width={49}
        height={50}
        className={cn("shrink-0 object-contain", CREST[size])}
      />
      <div className="min-w-0 leading-tight">
        <p
          className={cn(
            "font-semibold tracking-[0.08em]",
            WORD[size],
            light ? "text-white" : "text-foreground",
          )}
        >
          YABATECH
        </p>
        {!compact && (
          <p
            className={cn(
              "truncate font-medium uppercase tracking-[0.12em]",
              SUB[size],
              light ? "text-white/60" : "text-muted-foreground",
            )}
          >
            Yaba College of Technology
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandLockup;
