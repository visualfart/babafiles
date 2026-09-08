import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLang, pick, type Lang } from "@/i18n";
import { getEntityFull } from "@/lib/queries";
import { TierBadge } from "@/components/TierBadge";
import { SourceRefs } from "@/components/SourceRef";
import { fmtDate, country } from "@/lib/fmt";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang: l } = await params;
  const d = await getEntityFull(slug);
  if (!d) return {};
  const lang = (isLang(l) ? l : "en") as Lang;
  return { title: pick(lang, d.entity.nameEn, d.entity.nameHi), description: pick(lang, d.entity.summaryEn, d.entity.summaryHi) };
}

export default async function Record({ params }: Props) {
  const { lang: l, slug } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const d = await getEntityFull(slug);
  if (!d) notFound();
  const { entity: e, cases, claims, events, rels, sources, index } = d;
  const act = e.activityStatus ? (t.activity as Record<string, string>)[e.activityStatus] : null;
  const isNoRecord = e.overallTier === "no_record_found";
  const showHiNotice = lang === "hi" && !e.hiReviewed;
  const caseById = new Map(cases.map((c) => [c.id, c]));

  return (
    <article className="pt-6">
      <header className="grid gap-6 md:grid-cols-[1fr_180px] items-start">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <TierBadge tier={e.overallTier} t={t} />
            {act && <span className="label">{act}</span>}
            {e.abap2017List && <span className="label" title={t.entity.abap}>ABAP 2017</span>}
          </div>
          <h1 className="mt-4">{pick(lang, e.nameEn, e.nameHi)}</h1>
          {lang === "hi" && e.nameHi && <div className="muted mt-1">{e.nameEn}</div>}
          {lang === "en" && e.nameHi && <div className="muted mt-1">{e.nameHi}</div>}
          <p className="mt-5 measure text-[15px] leading-relaxed">{pick(lang, e.summaryEn, e.summaryHi)}</p>
          {showHiNotice && <p className="faint text-[12px] mt-2">{t.entity.unreviewed_hi}</p>}
        </div>
        {e.image && (
          <figure className="md:justify-self-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/entities/${e.image.file}`} alt={pick(lang, e.nameEn, e.nameHi)}
              className="w-[180px] h-[180px] object-cover grayscale contrast-[1.05]" />
            <figcaption className="faint text-[10px] mt-2 leading-snug">
              <a href={e.image.source_url}>{e.image.credit}</a> · {e.image.licence}
            </figcaption>
          </figure>
        )}
      </header>

      <dl className="kv mt-10 text-[13px]">
        {e.aliases.length > 0 && <><dt>{t.entity.aliases}</dt><dd>{e.aliases.join(" · ")}</dd></>}
        {e.baseLocation && <><dt>{t.entity.base}</dt><dd>{e.baseLocation}{e.country ? `, ${country(e.country)}` : ""}</dd></>}
        {e.organisations.length > 0 && <><dt>{t.entity.organisations}</dt><dd>{e.organisations.join(" · ")}</dd></>}
        {(e.born || e.died) && <><dt>{lang === "hi" ? "जन्म / मृत्यु" : "Born / died"}</dt><dd className="tnum">{fmtDate(e.born, lang)}{e.died ? ` – ${fmtDate(e.died, lang)}` : ""}</dd></>}
        <dt>{t.entity.updated}</dt><dd className="tnum">{fmtDate(e.updatedAt.slice(0, 10), lang)}</dd>
      </dl>

      {isNoRecord && (
        <section className="mt-12">
          <h2>{t.entity.registers}</h2>
          <p className="muted mt-2 measure text-[13px]">{t.entity.no_record_note}</p>
          <div className="mt-4">
            {e.registersChecked.map((r, i) => (
              <div key={i} className="row text-[13px]">
                <div className="tnum muted">{fmtDate(r.checked_on, lang)}</div>
                <div>{r.register}{r.query ? <span className="faint"> · {r.query}</span> : null}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {cases.length > 0 && (
        <section className="mt-12">
          <h2>{t.entity.cases}</h2>
          <div className="mt-4">
            {cases.map((c) => (
              <div key={c.id} className="row">
                <div className="pt-[2px]"><TierBadge tier={c.tier} t={t} /></div>
                <div>
                  <Link href={`/${lang}/cases/${c.id}`} className="font-medium">{pick(lang, c.titleEn, c.titleHi)}</Link>
                  <div className="muted text-[12px] mt-1">
                    {[c.court, c.jurisdictionRegion, country(c.jurisdictionCountry), c.filedYear ? String(c.filedYear) : null].filter(Boolean).join(" · ")}
                  </div>
                  <div className="text-[13px] mt-2">{c.status}{c.appealStatus ? <span className="muted"> · {t.case.appeal}: {c.appealStatus}</span> : null}</div>
                  <div className="mt-1"><SourceRefs ids={d.caseSources.get(c.id) ?? []} index={index} lang={lang} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {claims.length > 0 && (
        <section className="mt-12">
          <h2>{t.entity.claims}</h2>
          <ol className="mt-4">
            {claims.map((c, i) => (
              <li key={c.id} id={c.id} className="row">
                <div className="flex items-start gap-3 md:block">
                  <span className="faint tnum text-[12px] md:block md:mb-2">{String(i + 1).padStart(2, "0")}</span>
                  <TierBadge tier={c.tier} t={t} />
                </div>
                <div>
                  <p className="measure">{pick(lang, c.statementEn, c.statementHi)}</p>
                  <div className="mt-2 flex gap-3 flex-wrap items-baseline text-[12px]">
                    {c.date && <span className="muted tnum">{fmtDate(c.date, lang)}</span>}
                    {c.caseId && caseById.get(c.caseId) && (
                      <Link href={`/${lang}/cases/${c.caseId}`} className="muted">{pick(lang, caseById.get(c.caseId)!.titleEn, caseById.get(c.caseId)!.titleHi)}</Link>
                    )}
                    <SourceRefs ids={d.claimSources.get(c.id) ?? []} index={index} lang={lang} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {e.responseTextEn && (
        <section className="mt-12">
          <h2>{t.entity.response}</h2>
          <blockquote className="mt-4 measure pl-5 border-l hair text-[14px]">
            {pick(lang, e.responseTextEn, e.responseTextHi)}
            <div className="mt-2"><SourceRefs ids={e.responseSourceId ? [e.responseSourceId] : []} index={index} lang={lang} /></div>
          </blockquote>
        </section>
      )}

      {events.length > 0 && (
        <section className="mt-12">
          <h2>{t.entity.timeline}</h2>
          <div className="mt-4">
            {events.map((ev) => (
              <div key={ev.id} className="row text-[13px]">
                <div className="tnum muted">{fmtDate(ev.date, lang)}</div>
                <div>
                  {pick(lang, ev.labelEn, ev.labelHi)}{" "}
                  <SourceRefs ids={d.eventSources.get(ev.id) ?? []} index={index} lang={lang} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {rels.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2>{t.entity.relationships}</h2>
            <Link href={`/${lang}/network?focus=${e.id}`} className="text-[12px] muted">{t.nav.network} →</Link>
          </div>
          <div className="mt-4">
            {rels.map((r) => {
              const otherId = r.fromId === e.id ? r.toId : r.fromId;
              const other = d.relEntities.get(otherId);
              return (
                <div key={r.id} className="row text-[13px]">
                  <div className="label pt-[3px]">{r.type.replace(/_/g, " ")}</div>
                  <div>
                    <Link href={`/${lang}/records/${otherId}`} className="font-medium">{other ? pick(lang, other.nameEn, other.nameHi) : otherId}</Link>
                    {(r.periodStart || r.periodEnd) && <span className="muted tnum"> · {fmtDate(r.periodStart, lang)}{r.periodEnd ? ` – ${fmtDate(r.periodEnd, lang)}` : ""}</span>}
                    <p className="muted mt-1 measure">{pick(lang, r.descriptionEn, r.descriptionHi)}</p>
                    <div className="mt-1"><SourceRefs ids={d.relSources.get(r.id) ?? []} index={index} lang={lang} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="mt-12">
          <h2>{t.entity.sources}</h2>
          <ol className="mt-4">
            {sources.map((s) => (
              <li key={s.id} id={`src-${s.id}`} className="row text-[13px]">
                <div className="tnum faint">[{index.get(s.id)}]</div>
                <div>
                  <Link href={`/${lang}/sources/${s.id}`}>{s.title ?? s.url}</Link>
                  <div className="muted text-[12px] mt-1">
                    {s.publisher} · {(t.source.types as Record<string, string>)[s.type]}{s.publishedAt ? ` · ${fmtDate(s.publishedAt, lang)}` : ""}
                    {s.archiveUrl ? <> · <a href={s.archiveUrl}>{t.source.archived}</a></> : <span className="faint"> · {t.source.not_archived}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
