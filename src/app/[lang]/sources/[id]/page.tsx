import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLang, pick, type Lang } from "@/i18n";
import { getSourceFull } from "@/lib/queries";
import { TierBadge } from "@/components/TierBadge";
import { fmtDate } from "@/lib/fmt";

export default async function SourcePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: l, id } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const d = await getSourceFull(id);
  if (!d) notFound();
  const { s, entity, claims, cases, events, rels } = d;
  return (
    <article className="pt-6">
      <div className="text-[12px] muted"><Link href={`/${lang}/records/${entity.id}`}>{pick(lang, entity.nameEn, entity.nameHi)}</Link> · {t.entity.sources}</div>
      <h1 className="mt-4 measure">{s.title ?? s.url}</h1>
      <dl className="kv mt-8 text-[13px]">
        <dt>{t.source.publisher}</dt><dd>{s.publisher}</dd>
        <dt>{t.source.type}</dt><dd>{(t.source.types as Record<string, string>)[s.type]}</dd>
        {s.publishedAt && <><dt>{t.source.published}</dt><dd className="tnum">{fmtDate(s.publishedAt, lang)}</dd></>}
        <dt>{t.source.original}</dt><dd className="break-all"><a href={s.url}>{s.url}</a></dd>
        <dt>{t.source.archived}</dt>
        <dd className="break-all">{s.archiveUrl ? <a href={s.archiveUrl}>{s.archiveUrl}</a> : <span className="faint">{t.source.not_archived}</span>}</dd>
        {s.capturedAt && <><dt>{t.source.captured}</dt><dd className="tnum">{fmtDate(s.capturedAt, lang)}</dd></>}
        {s.sha256 && <><dt>{t.source.hash}</dt><dd className="break-all text-[11px] faint">{s.sha256}</dd></>}
        {s.note && <><dt>Note</dt><dd className="muted">{s.note}</dd></>}
      </dl>

      <section className="mt-12">
        <h2>{t.source.cited_by}</h2>
        <div className="mt-4">
          {cases.map((c) => (
            <div key={c.id} className="row text-[13px]"><div className="pt-[2px]"><TierBadge tier={c.tier} t={t} /></div>
              <div><Link href={`/${lang}/cases/${c.id}`}>{pick(lang, c.titleEn, c.titleHi)}</Link></div></div>
          ))}
          {claims.map((c) => (
            <div key={c.id} className="row text-[13px]"><div className="pt-[2px]"><TierBadge tier={c.tier} t={t} /></div>
              <div><Link href={`/${lang}/records/${c.entityId}#${c.id}`} className="measure block">{pick(lang, c.statementEn, c.statementHi)}</Link></div></div>
          ))}
          {events.map((e) => (
            <div key={e.id} className="row text-[13px]"><div className="tnum muted">{fmtDate(e.date, lang)}</div><div>{pick(lang, e.labelEn, e.labelHi)}</div></div>
          ))}
          {rels.map((r) => (
            <div key={r.id} className="row text-[13px]"><div className="label pt-[3px]">{r.type.replace(/_/g, " ")}</div><div>{pick(lang, r.descriptionEn, r.descriptionHi)}</div></div>
          ))}
        </div>
      </section>
    </article>
  );
}
