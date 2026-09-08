import Link from "next/link";
import { getDict, isLang, type Lang } from "@/i18n";
import { listSubjects, stats } from "@/lib/queries";
import { SearchBox } from "@/components/SearchBox";
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

  const tierRows = ADVERSE_TIERS.map((tier) => ({
    key: tier, label: (t.tiers as Record<string, string>)[tier], n: s.byTier[tier] ?? 0, href: `/${lang}/records?tier=${tier}`,
  }));
  const countryRows = s.countries
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((c) => ({ key: c.country, label: country(c.country), n: c.n }));

  return (
    <div>
      <section className="pt-10 pb-14">
        <p className="measure text-[17px] leading-relaxed">{t.home.lead}</p>
        <div className="mt-10 max-w-[640px]"><SearchBox lang={lang} t={t} autoFocus /></div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-y-8 py-8 rule">
        {[
          [adverseCount, t.common.records], [s.cases, t.common.cases], [s.claims, t.common.claims], [`${s.archived}/${s.sources}`, t.home.sources_archived],
        ].map(([n, label]) => (
          <div key={String(label)}>
            <div className="text-[28px] tnum leading-none">{n}</div>
            <div className="label mt-2">{label}</div>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
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
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <h2>{t.nav.records}</h2>
          <Link href={`/${lang}/records`} className="text-[12px] muted">{t.common.all} →</Link>
        </div>
        <div className="mt-4">
          {adverse.length === 0 && <p className="muted py-6">{t.common.none}</p>}
          {adverse.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
        </div>
      </section>

      {noRecord.length > 0 && (
        <section className="mt-16">
          <h2>{t.home.no_record_section}</h2>
          <p className="muted mt-2 measure text-[13px]">{t.entity.no_record_note}</p>
          <div className="mt-4">
            {noRecord.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} showSummary={false} />)}
          </div>
        </section>
      )}
    </div>
  );
}
