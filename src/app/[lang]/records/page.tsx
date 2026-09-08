import Link from "next/link";
import { getDict, isLang, type Lang } from "@/i18n";
import { listSubjects } from "@/lib/queries";
import { EntityRow } from "@/components/EntityRow";
import { TIERS, type Tier } from "@/lib/tiers";

export default async function Records({ params, searchParams }: {
  params: Promise<{ lang: string }>; searchParams: Promise<{ tier?: string }>;
}) {
  const { lang: l } = await params; const { tier } = await searchParams;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const sel = TIERS.includes(tier as Tier) ? (tier as Tier) : undefined;
  const rows = await listSubjects(sel ? { tier: sel } : {});
  return (
    <div className="pt-6">
      <h1>{t.nav.records}</h1>
      <div className="mt-6 flex gap-x-4 gap-y-2 flex-wrap text-[12px]">
        <Link href={`/${lang}/records`} className={sel ? "muted" : "underline underline-offset-4"}>{t.common.all}</Link>
        {TIERS.map((x) => (
          <Link key={x} href={`/${lang}/records?tier=${x}`} className={sel === x ? "underline underline-offset-4" : "muted"}>
            {(t.tiers as Record<string, string>)[x]}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        {rows.length === 0 && <p className="muted py-6">{t.common.none}</p>}
        {rows.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
      </div>
    </div>
  );
}
