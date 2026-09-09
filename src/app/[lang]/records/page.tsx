import Link from "next/link";
import { getDict, isLang, type Lang } from "@/i18n";
import { listSubjects, facetCounts, stats } from "@/lib/queries";
import { EntityRow } from "@/components/EntityRow";
import { TIERS, ENTITY_TYPES, ACTIVITY_STATUSES, type Tier } from "@/lib/tiers";
import { country } from "@/lib/fmt";

type SP = { tier?: string; type?: string; country?: string; activity?: string };

function FacetLink({
  href, label, n, on,
}: { href: string; label: string; n: number; on: boolean }) {
  return (
    <Link href={href} className="flex justify-between items-center py-1.5 text-[12.5px]"
      style={{ color: on ? "var(--ink)" : "var(--ink-2)", fontWeight: on ? 600 : 400 }}>
      <span>{label}</span>
      <span className="faint tnum text-[11px]">{n}</span>
    </Link>
  );
}

export default async function Records({ params, searchParams }: {
  params: Promise<{ lang: string }>; searchParams: Promise<SP>;
}) {
  const { lang: l } = await params;
  const sp = await searchParams;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);

  const tier = TIERS.includes(sp.tier as Tier) ? (sp.tier as Tier) : undefined;
  const type = sp.type && (ENTITY_TYPES as readonly string[]).includes(sp.type) ? sp.type : undefined;
  const activity = sp.activity && (ACTIVITY_STATUSES as readonly string[]).includes(sp.activity) ? sp.activity : undefined;
  const countryCode = sp.country;

  const [rows, facets, s] = await Promise.all([
    listSubjects({ tier, type, country: countryCode, activityStatus: activity }),
    facetCounts(),
    stats(),
  ]);

  const total = Object.values(facets.byType).reduce((a, b) => a + b, 0);
  const qs = (overrides: Partial<SP>) => {
    const merged = { ...sp, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return `/${lang}/records${s ? `?${s}` : ""}`;
  };
  const topCountries = Object.entries(facets.byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="pt-6">
      <h1>{t.browse.title}</h1>

      <div className="mt-9 grid md:grid-cols-[210px_1fr] gap-10 items-start">
        <div className="flex flex-col gap-6 md:sticky md:top-6">
          <div>
            <h2>{t.browse.type}</h2>
            <div className="mt-2.5">
              <FacetLink href={qs({ type: undefined })} label={t.browse.all_types} n={total} on={!type} />
              {ENTITY_TYPES.filter((x) => facets.byType[x]).map((x) => (
                <FacetLink key={x} href={qs({ type: x })} label={(t.types as Record<string, string>)[x]} n={facets.byType[x]} on={type === x} />
              ))}
            </div>
          </div>
          <div className="border-t hair pt-5">
            <h2>{t.browse.status}</h2>
            <div className="mt-2.5">
              {TIERS.filter((x) => s.byTier[x]).map((x) => (
                <FacetLink key={x} href={qs({ tier: tier === x ? undefined : x })} label={(t.tiers as Record<string, string>)[x]} n={s.byTier[x]} on={tier === x} />
              ))}
            </div>
          </div>
          {topCountries.length > 1 && (
            <div className="border-t hair pt-5">
              <h2>{t.browse.jurisdiction}</h2>
              <div className="mt-2.5">
                {topCountries.map(([code, n]) => (
                  <FacetLink key={code} href={qs({ country: countryCode === code ? undefined : code })} label={country(code)} n={n} on={countryCode === code} />
                ))}
              </div>
            </div>
          )}
          <div className="border-t hair pt-5">
            <h2>{t.browse.activity}</h2>
            <div className="mt-2.5">
              {ACTIVITY_STATUSES.filter((x) => facets.byActivity[x]).map((x) => (
                <FacetLink key={x} href={qs({ activity: activity === x ? undefined : x })} label={(t.activity as Record<string, string>)[x]} n={facets.byActivity[x]} on={activity === x} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-3 text-[12px]">
            <span className="muted tnum">{rows.length} {t.common.records}</span>
            <span className="faint">{t.browse.sorted_by}</span>
          </div>
          {rows.length === 0 && <p className="muted py-6">{t.common.none}</p>}
          {rows.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
        </div>
      </div>
    </div>
  );
}
