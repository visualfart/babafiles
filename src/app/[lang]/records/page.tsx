import Link from "next/link";
import { getDict, isLang, type Lang } from "@/i18n";
import { listSubjects, stats } from "@/lib/queries";
import { EntityRow } from "@/components/EntityRow";
import { CountBars } from "@/components/CountBars";
import { TIERS, type Tier } from "@/lib/tiers";

export default async function Records({ params, searchParams }: {
  params: Promise<{ lang: string }>; searchParams: Promise<{ tier?: string }>;
}) {
  const { lang: l } = await params; const { tier } = await searchParams;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const sel = TIERS.includes(tier as Tier) ? (tier as Tier) : undefined;
  const [rows, s] = await Promise.all([listSubjects(sel ? { tier: sel } : {}), stats()]);
  const total = Object.values(s.byTier).reduce((a, b) => a + b, 0);
  const tierRows = TIERS.map((x) => ({
    key: x, label: (t.tiers as Record<string, string>)[x], n: s.byTier[x] ?? 0, href: `/${lang}/records?tier=${x}`,
  }));

  return (
    <div className="pt-6">
      <h1>{t.nav.records}</h1>
      <div className="mt-8 grid md:grid-cols-[1fr_auto] items-start gap-6">
        <CountBars rows={tierRows} dense />
        <Link href={`/${lang}/records`} className={`text-[12px] whitespace-nowrap tnum ${sel ? "muted" : "underline underline-offset-4"}`}>
          {t.common.all} ({total})
        </Link>
      </div>
      <div className="mt-8">
        {rows.length === 0 && <p className="muted py-6">{t.common.none}</p>}
        {rows.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
      </div>
    </div>
  );
}
