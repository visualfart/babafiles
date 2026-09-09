import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import * as t from "@/db/schema";
import { ADVERSE_TIERS, TIERS, type Tier } from "./tiers";

export type Entity = typeof t.entities.$inferSelect;
export type Source = typeof t.sources.$inferSelect;
export type Case = typeof t.cases.$inferSelect;
export type Claim = typeof t.claims.$inferSelect;
export type Event = typeof t.events.$inferSelect;
export type Relationship = typeof t.relationships.$inferSelect;


async function linkMap(
  tbl: "case_sources" | "claim_sources" | "event_sources" | "relationship_sources",
  keyCol: string, ids: string[],
): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  if (ids.length === 0) return m;
  const res = await db.all<{ k: string; s: string }>(
    sql`SELECT ${sql.raw(keyCol)} AS k, source_id AS s FROM ${sql.raw(tbl)} WHERE ${sql.raw(keyCol)} IN ${ids}`,
  );
  for (const r of res) {
    const k = String(r.k); const s = String(r.s);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(s);
  }
  return m;
}

export async function listSubjects(opts: {
  adverse?: boolean; type?: string; tier?: Tier; country?: string; activityStatus?: string;
} = {}) {
  const conds = [eq(t.entities.isSubject, true)];
  if (opts.type) conds.push(eq(t.entities.type, opts.type));
  if (opts.tier) conds.push(eq(t.entities.overallTier, opts.tier));
  else if (opts.adverse === true) conds.push(inArray(t.entities.overallTier, [...ADVERSE_TIERS]));
  else if (opts.adverse === false) conds.push(eq(t.entities.overallTier, "no_record_found"));
  if (opts.country) conds.push(eq(t.entities.country, opts.country));
  if (opts.activityStatus) conds.push(eq(t.entities.activityStatus, opts.activityStatus));
  const rows = await db.select().from(t.entities).where(and(...conds)).orderBy(t.entities.nameEn);
  // Order by tier rank then name so the most serious records lead.
  const rank = (x: string | null) => (x ? TIERS.indexOf(x as Tier) : 99);
  return rows.sort((a, b) => rank(a.overallTier) - rank(b.overallTier) || a.nameEn.localeCompare(b.nameEn));
}

/** Counts for the Browse page's facet sidebar: by type, by base country, by activity status.
 * Each facet is counted independently of the others (not narrowed by the current selection)
 * so a reader can always see the full breakdown, not just what's left after filtering. */
export async function facetCounts() {
  const [byType, byCountry, byActivity] = await Promise.all([
    db.select({ k: t.entities.type, n: sql<number>`count(*)` }).from(t.entities).where(eq(t.entities.isSubject, true)).groupBy(t.entities.type),
    db.select({ k: t.entities.country, n: sql<number>`count(*)` }).from(t.entities).where(eq(t.entities.isSubject, true)).groupBy(t.entities.country),
    db.select({ k: t.entities.activityStatus, n: sql<number>`count(*)` }).from(t.entities).where(eq(t.entities.isSubject, true)).groupBy(t.entities.activityStatus),
  ]);
  const toMap = (rows: { k: string | null; n: number }[]) => Object.fromEntries(rows.filter((r) => r.k).map((r) => [r.k as string, r.n]));
  return { byType: toMap(byType), byCountry: toMap(byCountry), byActivity: toMap(byActivity) };
}

export async function recentlyUpdated(limit = 8) {
  return db.select().from(t.entities).where(eq(t.entities.isSubject, true)).orderBy(desc(t.entities.updatedAt)).limit(limit);
}

export async function getEntityFull(id: string) {
  const entity = (await db.select().from(t.entities).where(eq(t.entities.id, id)))[0];
  if (!entity) return null;
  const [cases, claims, events, relsOut, relsIn] = await Promise.all([
    db.select().from(t.cases).where(eq(t.cases.entityId, id)).orderBy(t.cases.filedYear),
    db.select().from(t.claims).where(eq(t.claims.entityId, id)).orderBy(t.claims.position),
    db.select().from(t.events).where(eq(t.events.entityId, id)).orderBy(t.events.date),
    db.select().from(t.relationships).where(eq(t.relationships.fromId, id)),
    db.select().from(t.relationships).where(eq(t.relationships.toId, id)),
  ]);
  const rels = [...relsOut, ...relsIn];
  const [cs, cls, evs, rls] = await Promise.all([
    linkMap("case_sources", "case_id", cases.map((c) => c.id)),
    linkMap("claim_sources", "claim_id", claims.map((c) => c.id)),
    linkMap("event_sources", "event_id", events.map((e) => e.id)),
    linkMap("relationship_sources", "relationship_id", rels.map((r) => r.id)),
  ]);
  const sourceIds = new Set<string>();
  for (const m of [cs, cls, evs, rls]) for (const ids of m.values()) ids.forEach((s) => sourceIds.add(s));
  if (entity.responseSourceId) sourceIds.add(entity.responseSourceId);
  const sources = sourceIds.size
    ? await db.select().from(t.sources).where(inArray(t.sources.id, [...sourceIds]))
    : [];
  // Stable citation numbering: order of first use across claims, cases, events, relationships.
  const order: string[] = [];
  const push = (ids: string[] | undefined) => ids?.forEach((s) => { if (!order.includes(s)) order.push(s); });
  claims.forEach((c) => push(cls.get(c.id)));
  cases.forEach((c) => push(cs.get(c.id)));
  events.forEach((e) => push(evs.get(e.id)));
  rels.forEach((r) => push(rls.get(r.id)));
  if (entity.responseSourceId) push([entity.responseSourceId]);
  const index = new Map(order.map((s, i) => [s, i + 1]));
  const byId = new Map(sources.map((s) => [s.id, s]));
  const orderedSources = order.map((s) => byId.get(s)).filter((s): s is Source => !!s);

  const relEntityIds = [...new Set(rels.flatMap((r) => [r.fromId, r.toId]))].filter((x) => x !== id);
  const relEntities = relEntityIds.length
    ? await db.select().from(t.entities).where(inArray(t.entities.id, relEntityIds)) : [];

  return {
    entity, cases, claims, events, rels, sources: orderedSources, index,
    caseSources: cs, claimSources: cls, eventSources: evs, relSources: rls,
    relEntities: new Map(relEntities.map((e) => [e.id, e])),
  };
}

export async function getCaseFull(id: string) {
  const c = (await db.select().from(t.cases).where(eq(t.cases.id, id)))[0];
  if (!c) return null;
  const entity = (await db.select().from(t.entities).where(eq(t.entities.id, c.entityId)))[0];
  const claims = await db.select().from(t.claims).where(eq(t.claims.caseId, id)).orderBy(t.claims.position);
  const events = await db.select().from(t.events).where(eq(t.events.caseId, id)).orderBy(t.events.date);
  const [cs, cls, evs] = await Promise.all([
    linkMap("case_sources", "case_id", [id]),
    linkMap("claim_sources", "claim_id", claims.map((x) => x.id)),
    linkMap("event_sources", "event_id", events.map((x) => x.id)),
  ]);
  const order: string[] = [];
  const push = (ids?: string[]) => ids?.forEach((s) => { if (!order.includes(s)) order.push(s); });
  push(cs.get(id)); claims.forEach((x) => push(cls.get(x.id))); events.forEach((x) => push(evs.get(x.id)));
  const sources = order.length ? await db.select().from(t.sources).where(inArray(t.sources.id, order)) : [];
  const byId = new Map(sources.map((s) => [s.id, s]));
  return {
    c, entity, claims, events, caseSources: cs, claimSources: cls, eventSources: evs,
    sources: order.map((s) => byId.get(s)).filter((s): s is Source => !!s),
    index: new Map(order.map((s, i) => [s, i + 1])),
  };
}

export async function getSourceFull(id: string) {
  const s = (await db.select().from(t.sources).where(eq(t.sources.id, id)))[0];
  if (!s) return null;
  const q = async (tbl: string, col: string) =>
    (await db.all<{ k: string }>(sql`SELECT ${sql.raw(col)} AS k FROM ${sql.raw(tbl)} WHERE source_id = ${id}`)).map((r) => String(r.k));
  const [claimIds, caseIds, eventIds, relIds] = await Promise.all([
    q("claim_sources", "claim_id"), q("case_sources", "case_id"), q("event_sources", "event_id"), q("relationship_sources", "relationship_id"),
  ]);
  const [claims, cases, events, rels] = await Promise.all([
    claimIds.length ? db.select().from(t.claims).where(inArray(t.claims.id, claimIds)) : [],
    caseIds.length ? db.select().from(t.cases).where(inArray(t.cases.id, caseIds)) : [],
    eventIds.length ? db.select().from(t.events).where(inArray(t.events.id, eventIds)) : [],
    relIds.length ? db.select().from(t.relationships).where(inArray(t.relationships.id, relIds)) : [],
  ]);
  const entity = (await db.select().from(t.entities).where(eq(t.entities.id, s.entityId)))[0];
  return { s, entity, claims, cases, events, rels };
}

export async function search(q: string) {
  const term = q.trim();
  if (!term) return [];
  // Prefix-match each token; quote to neutralise FTS operators.
  const match = term.split(/\s+/).map((w) => `"${w.replace(/"/g, "")}"*`).join(" ");
  const res = await db.all<Record<string, unknown>>(
    sql`SELECT e.* FROM entities_fts f JOIN entities e ON e.id = f.id
        WHERE entities_fts MATCH ${match} AND e.is_subject = 1 ORDER BY bm25(entities_fts) LIMIT 50`,
  );
  return res.map((r) => ({
    id: String(r.id), nameEn: String(r.name_en), nameHi: r.name_hi ? String(r.name_hi) : null,
    overallTier: r.overall_tier ? String(r.overall_tier) : null, baseLocation: r.base_location ? String(r.base_location) : null,
    type: String(r.type), activityStatus: r.activity_status ? String(r.activity_status) : null,
    summaryEn: String(r.summary_en), summaryHi: r.summary_hi ? String(r.summary_hi) : null,
  }));
}

export async function stats() {
  const tiers = await db.select({ tier: t.entities.overallTier, n: sql<number>`count(*)` })
    .from(t.entities).where(eq(t.entities.isSubject, true)).groupBy(t.entities.overallTier);
  const [claims, sources, cases, archived, countries] = await Promise.all([
    db.get<{ n: number }>(sql`select count(*) as n from claims`),
    db.get<{ n: number }>(sql`select count(*) as n from sources`),
    db.get<{ n: number }>(sql`select count(*) as n from cases`),
    db.get<{ n: number }>(sql`select count(*) as n from sources where archive_url is not null`),
    db.select({ c: t.cases.jurisdictionCountry, n: sql<number>`count(*)` }).from(t.cases).groupBy(t.cases.jurisdictionCountry),
  ]);
  return {
    byTier: Object.fromEntries(tiers.map((r) => [r.tier ?? "none", r.n])) as Record<string, number>,
    claims: claims?.n ?? 0, sources: sources?.n ?? 0, cases: cases?.n ?? 0, archived: archived?.n ?? 0,
    countries: countries.map((r) => ({ country: r.c, n: r.n })),
  };
}

export async function graph() {
  const rels = await db.select().from(t.relationships);
  const ids = [...new Set(rels.flatMap((r) => [r.fromId, r.toId]))];
  const nodes = ids.length ? await db.select({
    id: t.entities.id, nameEn: t.entities.nameEn, nameHi: t.entities.nameHi, type: t.entities.type,
    overallTier: t.entities.overallTier, isSubject: t.entities.isSubject,
  }).from(t.entities).where(inArray(t.entities.id, ids)) : [];
  return { nodes, links: rels.map((r) => ({ source: r.fromId, target: r.toId, type: r.type, id: r.id })) };
}

export async function listCorrections() {
  return db.select().from(t.corrections).orderBy(desc(t.corrections.date));
}

export async function relatedSubjectsOf(id: string) {
  return db.select().from(t.relationships).where(or(eq(t.relationships.fromId, id), eq(t.relationships.toId, id)));
}
