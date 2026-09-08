import { sql } from "drizzle-orm";
import { db, client } from "../src/db/client";
import * as t from "../src/db/schema";
import { highestTier, type Tier } from "../src/lib/tiers";
import { loadAll, printIssues } from "./load";

async function main() {
  const strict = process.argv.includes("--strict");
  const { files, issues } = loadAll({ strict });
  const errors = printIssues(issues);
  if (errors > 0) {
    console.error(`\nseed aborted: ${errors} error(s)`);
    process.exit(1);
  }
  const now = new Date().toISOString();

  await client.execute("PRAGMA foreign_keys = OFF");
  // Full rebuild: the YAML files are the source of truth and the dataset is small.
  for (const table of [
    "relationship_sources", "relationships", "event_sources", "events", "claim_sources",
    "claims", "case_sources", "cases", "sources", "entities",
  ]) {
    await client.execute(`DELETE FROM ${table}`);
  }

  let counts = { entities: 0, sources: 0, cases: 0, claims: 0, events: 0, relationships: 0 };

  for (const ef of files.values()) {
    const tiers: Tier[] = [...ef.cases.map((c) => c.tier), ...ef.claims.map((c) => c.tier)];
    const overall = ef.is_subject ? (highestTier(tiers) ?? "no_record_found") : null;

    await db.insert(t.entities).values({
      id: ef.id, type: ef.type, isSubject: ef.is_subject, nameEn: ef.name_en, nameHi: ef.name_hi ?? null,
      aliases: ef.aliases, born: ef.born ?? null, died: ef.died ?? null, baseLocation: ef.base_location ?? null,
      country: ef.country, countriesOfOperation: ef.countries_of_operation, organisations: ef.organisations,
      activityStatus: ef.activity_status ?? null, abap2017List: ef.abap_2017_list, overallTier: overall,
      summaryEn: ef.summary_en, summaryHi: ef.summary_hi ?? null, hiReviewed: ef.hi_reviewed,
      responseTextEn: ef.response_from_subject?.text_en ?? null,
      responseTextHi: ef.response_from_subject?.text_hi ?? null,
      responseSourceId: ef.response_from_subject?.source_id ?? null,
      registersChecked: ef.registers_checked, image: ef.image ?? null, updatedAt: now,
    });
    counts.entities++;

    for (const s of ef.sources) {
      await db.insert(t.sources).values({
        id: s.id, entityId: ef.id, url: s.url, title: s.title ?? null, publisher: s.publisher, type: s.type,
        publishedAt: s.published_at ?? null, language: s.language, archiveUrl: s.archive_url ?? null,
        capturedAt: s.captured_at ?? null, sha256: s.sha256 ?? null, note: s.note ?? null,
      });
      counts.sources++;
    }
  }

  // Second pass so that cross-file source references and relationship endpoints resolve.
  for (const ef of files.values()) {
    for (const c of ef.cases) {
      await db.insert(t.cases).values({
        id: c.id, entityId: ef.id, titleEn: c.title_en, titleHi: c.title_hi ?? null,
        jurisdictionCountry: c.jurisdiction_country, jurisdictionRegion: c.jurisdiction_region ?? null,
        court: c.court ?? null, caseNumber: c.case_number ?? null, filedYear: c.filed_year ?? null,
        caseType: c.case_type, statutes: c.statutes, status: c.status, tier: c.tier,
        verdictDate: c.verdict_date ?? null, sentenceOrRemedy: c.sentence_or_remedy ?? null,
        appealStatus: c.appeal_status ?? null, summaryEn: c.summary_en, summaryHi: c.summary_hi ?? null,
      });
      for (const sid of new Set(c.source_ids)) await db.insert(t.caseSources).values({ caseId: c.id, sourceId: sid });
      counts.cases++;
    }
    for (const [i, c] of ef.claims.entries()) {
      await db.insert(t.claims).values({
        id: c.id, entityId: ef.id, caseId: c.case_id ?? null, statementEn: c.statement_en,
        statementHi: c.statement_hi ?? null, tier: c.tier, date: c.date ?? null, position: i,
      });
      for (const sid of new Set(c.source_ids)) await db.insert(t.claimSources).values({ claimId: c.id, sourceId: sid });
      counts.claims++;
    }
    for (const [i, e] of ef.events.entries()) {
      const id = `${ef.id}-ev-${i}`;
      await db.insert(t.events).values({
        id, entityId: ef.id, caseId: e.case_id ?? null, date: e.date, kind: e.kind,
        labelEn: e.label_en, labelHi: e.label_hi ?? null,
      });
      for (const sid of new Set(e.source_ids)) await db.insert(t.eventSources).values({ eventId: id, sourceId: sid });
      counts.events++;
    }
    for (const [i, r] of ef.relationships.entries()) {
      const id = `${ef.id}-rel-${i}`;
      await db.insert(t.relationships).values({
        id, fromId: ef.id, toId: r.to_id, type: r.type, periodStart: r.period_start ?? null,
        periodEnd: r.period_end ?? null, descriptionEn: r.description_en, descriptionHi: r.description_hi ?? null,
      });
      for (const sid of new Set(r.source_ids)) await db.insert(t.relationshipSources).values({ relationshipId: id, sourceId: sid });
      counts.relationships++;
    }
  }
  await client.execute("PRAGMA foreign_keys = ON");
  await client.execute("INSERT INTO entities_fts(entities_fts) VALUES('rebuild')");
  const check = await db.get<{ n: number }>(sql`select count(*) as n from entities`);
  console.log(`seeded`, counts, `(db entities: ${check?.n})`);
}
main().catch((e) => { console.error(e); process.exit(1); });
