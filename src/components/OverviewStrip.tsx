import type { Dict, Lang } from "@/i18n";
import { TIER_RANK, type Tier } from "@/lib/tiers";
import { country } from "@/lib/fmt";
import type { Case } from "@/lib/queries";

/** A scannable "at a glance" row of numbers before the detailed case-by-case text below —
 * so the shape of the record is visible without reading every case. */
export function OverviewStrip({ cases, sourcesTotal, sourcesArchived, lang, t }: {
  cases: Case[]; sourcesTotal: number; sourcesArchived: number; lang: Lang; t: Dict;
}) {
  if (cases.length === 0) return null;
  const byTier = new Map<Tier, number>();
  for (const c of cases) byTier.set(c.tier as Tier, (byTier.get(c.tier as Tier) ?? 0) + 1);
  const tierEntries = [...byTier.entries()].sort((a, b) => TIER_RANK[a[0]] - TIER_RANK[b[0]]);
  const years = cases.map((c) => c.filedYear).filter((y): y is number => !!y);
  const countries = [...new Set(cases.map((c) => c.jurisdictionCountry))];

  const tiles: { n: string | number; label: string }[] = [
    ...tierEntries.map(([tier, n]) => ({ n, label: (t.tiers as Record<string, string>)[tier] })),
  ];
  if (years.length) tiles.push({ n: Math.min(...years), label: lang === "hi" ? "पहला मामला" : "First on record" });
  if (countries.length > 1) tiles.push({ n: countries.length, label: lang === "hi" ? "क्षेत्राधिकार" : "Jurisdictions" });
  else if (countries.length === 1) tiles.push({ n: country(countries[0]), label: lang === "hi" ? "क्षेत्राधिकार" : "Jurisdiction" });
  tiles.push({ n: `${sourcesArchived}/${sourcesTotal}`, label: lang === "hi" ? "स्रोत संग्रहीत" : "Sources archived" });

  return (
    <div className="flex gap-x-8 gap-y-4 flex-wrap py-5 mt-9 rule border-b">
      {tiles.map((x, i) => (
        <div key={i}>
          <div className="text-[22px] tnum leading-none">{x.n}</div>
          <div className="label mt-1.5">{x.label}</div>
        </div>
      ))}
    </div>
  );
}
