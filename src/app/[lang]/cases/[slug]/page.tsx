import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLang, pick, type Lang } from "@/i18n";
import { getCaseFull } from "@/lib/queries";
import { TierBadge } from "@/components/TierBadge";
import { SourceRefs } from "@/components/SourceRef";
import { fmtDate, country } from "@/lib/fmt";

export default async function CasePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: l, slug } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const d = await getCaseFull(slug);
  if (!d) notFound();
  const { c, entity, claims, events, sources, index } = d;
  return (
    <article className="pt-6">
      <div className="text-[12px] muted"><Link href={`/${lang}/records/${entity.id}`}>{pick(lang, entity.nameEn, entity.nameHi)}</Link></div>
      <div className="mt-3"><TierBadge tier={c.tier} t={t} /></div>
      <h1 className="mt-4">{pick(lang, c.titleEn, c.titleHi)}</h1>
      <p className="mt-5 measure text-[15px] leading-relaxed">{pick(lang, c.summaryEn, c.summaryHi)}</p>
      <div className="mt-2"><SourceRefs ids={d.caseSources.get(c.id) ?? []} index={index} lang={lang} /></div>

      <dl className="kv mt-10 text-[13px]">
        <dt>{t.case.jurisdiction}</dt><dd>{[c.jurisdictionRegion, country(c.jurisdictionCountry)].filter(Boolean).join(", ")}</dd>
        {c.court && <><dt>{t.case.court}</dt><dd>{c.court}</dd></>}
        {c.caseNumber && <><dt>{t.case.number}</dt><dd>{c.caseNumber}</dd></>}
        {c.filedYear && <><dt>{t.case.filed}</dt><dd className="tnum">{c.filedYear}</dd></>}
        <dt>{t.case.type}</dt><dd>{c.caseType.replace(/_/g, " ")}</dd>
        {c.statutes.length > 0 && <><dt>{t.case.statutes}</dt><dd>{c.statutes.join(" · ")}</dd></>}
        <dt>{t.case.status}</dt><dd>{c.status}</dd>
        {c.verdictDate && <><dt>{t.case.verdict}</dt><dd className="tnum">{fmtDate(c.verdictDate, lang)}</dd></>}
        {c.sentenceOrRemedy && <><dt>{t.case.sentence}</dt><dd>{c.sentenceOrRemedy}</dd></>}
        {c.appealStatus && <><dt>{t.case.appeal}</dt><dd>{c.appealStatus}</dd></>}
      </dl>

      {claims.length > 0 && (
        <section className="mt-12"><h2>{t.entity.claims}</h2>
          <ol className="mt-4">{claims.map((x, i) => (
            <li key={x.id} className="row">
              <div className="flex items-start gap-3 md:block"><span className="faint tnum text-[12px] md:block md:mb-2">{String(i + 1).padStart(2, "0")}</span><TierBadge tier={x.tier} t={t} /></div>
              <div><p className="measure">{pick(lang, x.statementEn, x.statementHi)}</p>
                <div className="mt-2 flex gap-3 text-[12px]">{x.date && <span className="muted tnum">{fmtDate(x.date, lang)}</span>}<SourceRefs ids={d.claimSources.get(x.id) ?? []} index={index} lang={lang} /></div></div>
            </li>))}</ol>
        </section>
      )}
      {events.length > 0 && (
        <section className="mt-12"><h2>{t.entity.timeline}</h2>
          <div className="mt-4">{events.map((ev) => (
            <div key={ev.id} className="row text-[13px]"><div className="tnum muted">{fmtDate(ev.date, lang)}</div>
              <div>{pick(lang, ev.labelEn, ev.labelHi)} <SourceRefs ids={d.eventSources.get(ev.id) ?? []} index={index} lang={lang} /></div></div>))}</div>
        </section>
      )}
      {sources.length > 0 && (
        <section className="mt-12"><h2>{t.entity.sources}</h2>
          <ol className="mt-4">{sources.map((s) => (
            <li key={s.id} className="row text-[13px]"><div className="tnum faint">[{index.get(s.id)}]</div>
              <div><Link href={`/${lang}/sources/${s.id}`}>{s.title ?? s.url}</Link>
                <div className="muted text-[12px] mt-1">{s.publisher} · {(t.source.types as Record<string, string>)[s.type]}{s.publishedAt ? ` · ${fmtDate(s.publishedAt, lang)}` : ""}
                  {s.archiveUrl ? <> · <a href={s.archiveUrl}>{t.source.archived}</a></> : <span className="faint"> · {t.source.not_archived}</span>}</div></div>
            </li>))}</ol>
        </section>
      )}
    </article>
  );
}
