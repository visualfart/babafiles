import { isAdverse, type Tier } from "@/lib/tiers";
import type { Dict } from "@/i18n";

export function TierBadge({ tier, t }: { tier: Tier | string | null | undefined; t: Dict }) {
  if (!tier) return null;
  const tt = tier as Tier;
  const cls = isAdverse(tt) ? "adverse"
    : tt === "allegation" ? "allegation"
    : tt === "no_record_found" ? "none"
    : "favourable";
  const label = (t.tiers as Record<string, string>)[tt] ?? tt;
  return <span className={`badge ${cls}`}>{label}</span>;
}
