import Link from "next/link";
import { getDict, isLang, type Lang } from "@/i18n";
import { listSubjects, stats } from "@/lib/queries";
import { EntityRow } from "@/components/EntityRow";
import { CountBars } from "@/components/CountBars";
import { ADVERSE_TIERS } from "@/lib/tiers";
import { country } from "@/lib/fmt";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = (isLang(l) ? l : "en") as Lang;
  const t = getDict(lang);
  const [adverse, noRecord, s] = await Promise.all([listSubjects({ adverse: true }), listSubjects({ adverse: false }), stats()]);
  const adverseCount = ADVERSE_TIERS.reduce((n, tier) => n + (s.byTier[tier] ?? 0), 0);
  const totalRecords = adverseCount + noRecord.length;
  const foreignCases = s.countries.filter((c) => c.country !== "IN").reduce((n, c) => n + c.n, 0);
  const coveragePct = s.sources > 0 ? Math.round((s.archived / s.sources) * 100) : 0;

  const tierRows = ADVERSE_TIERS.map((tier) => ({
    key: tier, label: (t.tiers as Record<string, string>)[tier], n: s.byTier[tier] ?? 0, href: `/${lang}/records?tier=${tier}`,
  }));
  const countryRows = s.countries
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((c) => ({ key: c.country, label: country(c.country), n: c.n }));

  // Donut ring geometry: circumference of r=46 is ~289; offset hides the uncovered arc.
  const RING_C = 2 * Math.PI * 46;
  const ringOffset = RING_C * (1 - coveragePct / 100);

  return (
    <div>
      {/* Lead report: headline + justified drop-cap lead, with a boxed index/search sidebar */}
      <section className="pt-8 grid md:grid-cols-[1fr_300px] gap-10 md:gap-12 items-start">
        <div>
          <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase muted">{t.home.kicker}</div>
          <h1 className="mt-3 text-[32px]">{t.home.dek}</h1>
          <p className="mt-5 text-[13.5px] leading-[1.65] max-w-[60ch] text-justify">
            {lang === "en" ? (
              <>
                <span aria-hidden className="brand float-left leading-[0.78] font-semibold pr-1.5" style={{ fontSize: "44px" }}>
                  {t.home.lead.charAt(0)}
                </span>
                {t.home.lead.slice(1)}
              </>
            ) : t.home.lead}
          </p>
        </div>

        <div className="border hair p-5" style={{ borderColor: "var(--ink)" }}>
          <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-center border-b hair pb-2.5" style={{ borderColor: "var(--ink)" }}>
            {t.home.index_title}
          </div>
          <form action={`/${lang}/search`} method="get" role="search" className="mt-4 relative">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-0 top-[9px] faint" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input type="search" name="q" placeholder={t.home.search_placeholder} aria-label={t.home.search_placeholder}
              autoComplete="off" className="w-full bg-transparent border-0 border-b pl-[22px] pb-1.5 text-[13px] outline-none"
              style={{ borderColor: "var(--ink)" }} />
          </form>
          <dl className="border-t hair mt-4 pt-3.5 text-[11.5px] muted flex flex-col gap-1.5">
            <div className="flex justify-between"><dt>{t.common.records}</dt><dd className="tnum" style={{ color: "var(--ink)" }}>{totalRecords}</dd></div>
            <div className="flex justify-between"><dt>{lang === "hi" ? "विदेश में दर्ज" : "Filed abroad"}</dt><dd className="tnum" style={{ color: "var(--ink)" }}>{foreignCases}</dd></div>
            <div className="flex justify-between"><dt>{t.common.sources}</dt><dd className="tnum" style={{ color: "var(--ink)" }}>{s.sources}</dd></div>
          </dl>
        </div>
      </section>

      {/* Box score: the four top-line numbers between double rules */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-y-8 mt-12 py-6"
        style={{ borderTop: "3px double var(--ink)", borderBottom: "1px solid var(--ink)" }}
      >
        {[
          [adverseCount, t.common.records], [s.cases, t.common.cases], [s.claims, t.common.claims], [`${s.archived}/${s.sources}`, t.home.sources_archived],
        ].map(([n, label]) => (
          <div key={String(label)}>
            <div className="text-[28px] tnum leading-none">{n}</div>
            <div className="label mt-2">{label}</div>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="kicker"><span>{t.home.by_numbers}</span></div>
        <div className="mt-7 grid gap-x-14 gap-y-10 md:grid-cols-[1.3fr_1fr_auto] items-start">
          <div>
            <h2>{t.home.stats}</h2>
            <CountBars rows={tierRows} />
          </div>
          {countryRows.length > 1 && (
            <div>
              <h2>{t.home.jurisdictions}</h2>
              <CountBars rows={countryRows} />
            </div>
          )}
          <div className="text-center">
            <h2 className="text-left">{lang === "hi" ? "कवरेज" : "Coverage"}</h2>
            <svg width="108" height="108" viewBox="0 0 108 108" className="mt-3.5" role="img" aria-label={`${coveragePct}% ${t.home.sources_archived}`}>
              <circle cx="54" cy="54" r="46" fill="none" stroke="var(--rule-2)" strokeWidth="10" />
              <circle cx="54" cy="54" r="46" fill="none" stroke="var(--accent-2)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={RING_C} strokeDashoffset={ringOffset} transform="rotate(-90 54 54)" />
              <text x="54" y="50" textAnchor="middle" fontSize="20" fontFamily="var(--font-mono)" fill="var(--ink)">{coveragePct}%</text>
              <text x="54" y="66" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)">
                {lang === "hi" ? "संग्रहीत" : "archived"}
              </text>
            </svg>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="kicker"><span>{t.home.register}</span></div>
        <div className="flex justify-end mt-2">
          <Link href={`/${lang}/records`} className="text-[11.5px] muted">{t.common.all} {totalRecords} →</Link>
        </div>
        <div className="mt-2">
          {adverse.length === 0 && <p className="muted py-6">{t.common.none}</p>}
          {adverse.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
        </div>
      </section>

      {noRecord.length > 0 && (
        <section className="mt-16">
          <div className="kicker"><span>{t.home.also_checked}</span></div>
          <p className="muted mt-4 measure text-[13px]">{t.entity.no_record_note}</p>
          <div className="mt-4">
            {noRecord.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} showSummary={false} />)}
          </div>
        </section>
      )}
    </div>
  );
}
