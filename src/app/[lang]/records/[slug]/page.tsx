import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLang, pick, type Lang } from "@/i18n";
import { getEntityFull } from "@/lib/queries";
import { TierBadge } from "@/components/TierBadge";
import { SourceRefs } from "@/components/SourceRef";
import { OverviewStrip } from "@/components/OverviewStrip";
import { EntityVitals } from "@/components/EntityVitals";
import { SectionTabs } from "@/components/SectionTabs";
import { SourceGroups } from "@/components/SourceGroups";
import { ConnectionsGraph, type ConnectionNode } from "@/components/ConnectionsGraph";
import { ExternalLinkIcon } from "@/components/icons";
import { fmtDate, fmtDayMonth, groupByYear, country } from "@/lib/fmt";

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

  const connectionNodes: ConnectionNode[] = rels.map((r) => {
    const otherId = r.fromId === e.id ? r.toId : r.fromId;
    const other = d.relEntities.get(otherId);
    // key on the relationship's own id, not otherId -- a subject can have more than one
    // documented relationship with the same person (e.g. family and shared_stage).
    return { id: otherId, key: r.id, nameEn: other?.nameEn ?? otherId, nameHi: other?.nameHi ?? null, overallTier: other?.overallTier ?? null, relType: r.type };
  });

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
          <EntityVitals born={e.born} died={e.died} baseLocation={e.baseLocation} countryCode={e.country}
            organisations={e.organisations} t={t} />
          {e.aliases.length > 0 && (
            <div className="muted text-[12.5px] mt-4"><span className="label">{t.entity.aliases}</span> {e.aliases.join(" · ")}</div>
          )}
        </div>
        {e.image && (
          <figure className="md:justify-self-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/entities/${e.image.file}`} alt={pick(lang, e.nameEn, e.nameHi)}
              className="w-[180px] h-[180px] object-cover grayscale contrast-[1.05]" />
            <figcaption className="faint text-[10px] mt-2 leading-snug italic">
              <a href={e.image.source_url}>{e.image.credit}</a> · {e.image.licence}
            </figcaption>
          </figure>
        )}
      </header>

      <div className="mt-3 faint text-[11.5px]">{t.entity.updated} <span className="tnum">{fmtDate(e.updatedAt.slice(0, 10), lang)}</span></div>

      <OverviewStrip cases={cases} sourcesTotal={sources.length} sourcesArchived={sources.filter((s) => s.archiveUrl).length} lang={lang} t={t} />

      <div className="mt-8">
        <SectionTabs tabs={[
          { id: "cases", label: t.entity.cases, count: cases.length },
          { id: "record", label: t.entity.claims, count: claims.length },
          { id: "timeline", label: t.entity.timeline, count: events.length },
          { id: "relationships", label: t.entity.relationships, count: rels.length },
          { id: "sources", label: t.entity.sources, count: sources.length },
        ]} />
      </div>

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
        <section id="cases" className="mt-12 scroll-mt-14">
          <h2>{t.entity.cases}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {cases.map((c) => (
              <div key={c.id} className="border hair rounded-[10px] p-5">
                <div className="flex justify-between gap-4 items-start">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <TierBadge tier={c.tier} t={t} />
                      <span className="faint text-[12px]">
                        {[c.jurisdictionRegion, country(c.jurisdictionCountry), c.filedYear ? String(c.filedYear) : null].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <Link href={`/${lang}/cases/${c.id}`} className="block font-medium text-[15px] mt-2.5">{pick(lang, c.titleEn, c.titleHi)}</Link>
                    {c.court && <div className="muted text-[12px] mt-1">{c.court}</div>}
                    <div className="text-[13px] mt-2 max-w-[64ch]">{c.status}{c.appealStatus ? <span className="muted"> · {t.case.appeal}: {c.appealStatus}</span> : null}</div>
                  </div>
                  <Link href={`/${lang}/cases/${c.id}`} aria-label={pick(lang, c.titleEn, c.titleHi)} className="faint flex-none mt-1">
                    <ExternalLinkIcon />
                  </Link>
                </div>
                <div className="mt-3.5"><SourceRefs ids={d.caseSources.get(c.id) ?? []} index={index} lang={lang} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {claims.length > 0 && (
        <section id="record" className="mt-12 scroll-mt-14">
          <h2>{t.entity.claims}</h2>
          <ol className="mt-4 flex flex-col gap-2">
            {claims.map((c, i) => (
              <li key={c.id} id={c.id} className="border hair rounded-[10px] p-4">
                <div className="flex items-center gap-2.5">
                  <span className="faint tnum text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                  <TierBadge tier={c.tier} t={t} />
                </div>
                <p className="measure mt-2 text-[13.5px] leading-relaxed">{pick(lang, c.statementEn, c.statementHi)}</p>
                <div className="mt-2 flex gap-3 flex-wrap items-baseline text-[12px]">
                  {c.date && <span className="muted tnum">{fmtDate(c.date, lang)}</span>}
                  {c.caseId && caseById.get(c.caseId) && (
                    <Link href={`/${lang}/cases/${c.caseId}`} className="muted">{pick(lang, caseById.get(c.caseId)!.titleEn, caseById.get(c.caseId)!.titleHi)}</Link>
                  )}
                  <SourceRefs ids={d.claimSources.get(c.id) ?? []} index={index} lang={lang} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {e.responseTextEn && (
        <section className="mt-12">
          <h2>{t.entity.response}</h2>
          <blockquote className="mt-4 measure pl-5 border-l-2 hair text-[14px] italic">
            {pick(lang, e.responseTextEn, e.responseTextHi)}
            <div className="mt-2 not-italic"><SourceRefs ids={e.responseSourceId ? [e.responseSourceId] : []} index={index} lang={lang} /></div>
          </blockquote>
        </section>
      )}

      {events.length > 0 && (
        <section id="timeline" className="mt-12 scroll-mt-14">
          <h2>{t.entity.timeline}</h2>
          <div className="mt-6 relative pl-7">
            <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px" style={{ background: "var(--rule)" }} />
            {groupByYear(events.map((ev) => ({ ...ev, date: ev.date }))).map(([year, evs], gi, arr) => (
              <div key={year} className={gi < arr.length - 1 ? "relative mb-7" : "relative"}>
                <div className="absolute -left-7 top-[3px] w-[11px] h-[11px] rounded-full" style={{ background: "var(--ink)" }} />
                <div className="text-[13px] font-medium tnum">{year}</div>
                <div className="mt-2.5 flex flex-col gap-2 text-[13px]">
                  {evs.map((ev) => (
                    <div key={ev.id}>
                      {fmtDayMonth(ev.date, lang) && <span className="faint tnum mr-2.5">{fmtDayMonth(ev.date, lang)}</span>}
                      {pick(lang, ev.labelEn, ev.labelHi)}{" "}
                      <SourceRefs ids={d.eventSources.get(ev.id) ?? []} index={index} lang={lang} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {rels.length > 0 && (
        <section id="relationships" className="mt-12 scroll-mt-14">
          <div className="flex items-baseline justify-between">
            <h2>{t.entity.relationships}</h2>
            <Link href={`/${lang}/network?focus=${e.id}`} className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--accent-2)" }}>
              {t.entity.open_network} <ExternalLinkIcon />
            </Link>
          </div>

          <div className="mt-4">
            <ConnectionsGraph subjectName={pick(lang, e.nameEn, e.nameHi)} nodes={connectionNodes} lang={lang} t={t} />
          </div>

          <div className="mt-1.5">
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
        <section id="sources" className="mt-12 pb-4 scroll-mt-14">
          <div className="flex items-baseline justify-between">
            <h2>{t.entity.sources}</h2>
            <div className="faint text-[11px]">{sources.length} {t.entity.grouped_by_type}</div>
          </div>
          <div className="mt-5">
            <SourceGroups sources={sources} index={index} lang={lang} t={t} />
          </div>
        </section>
      )}
    </article>
  );
}
