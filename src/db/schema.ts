import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

export const entities = sqliteTable("entities", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  isSubject: integer("is_subject", { mode: "boolean" }).notNull().default(true),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi"),
  aliases: text("aliases", { mode: "json" }).$type<string[]>().notNull().default([]),
  born: text("born"),
  died: text("died"),
  baseLocation: text("base_location"),
  country: text("country").notNull(),
  countriesOfOperation: text("countries_of_operation", { mode: "json" }).$type<string[]>().notNull().default([]),
  organisations: text("organisations", { mode: "json" }).$type<string[]>().notNull().default([]),
  activityStatus: text("activity_status"),
  abap2017List: integer("abap_2017_list", { mode: "boolean" }).notNull().default(false),
  overallTier: text("overall_tier"),
  summaryEn: text("summary_en").notNull(),
  summaryHi: text("summary_hi"),
  hiReviewed: integer("hi_reviewed", { mode: "boolean" }).notNull().default(false),
  responseTextEn: text("response_text_en"),
  responseTextHi: text("response_text_hi"),
  responseSourceId: text("response_source_id"),
  image: text("image", { mode: "json" })
    .$type<{ file: string; source_url: string; licence: string; credit: string; caption_en?: string | null; caption_hi?: string | null } | null>(),
  registersChecked: text("registers_checked", { mode: "json" })
    .$type<{ register: string; checked_on: string; query?: string | null }[]>()
    .notNull()
    .default([]),
  updatedAt: text("updated_at").notNull(),
}, (t) => [index("entities_tier_idx").on(t.overallTier), index("entities_type_idx").on(t.type)]);

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title"),
  publisher: text("publisher").notNull(),
  type: text("type").notNull(),
  publishedAt: text("published_at"),
  language: text("language").notNull().default("en"),
  archiveUrl: text("archive_url"),
  capturedAt: text("captured_at"),
  sha256: text("sha256"),
  note: text("note"),
});

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  titleEn: text("title_en").notNull(),
  titleHi: text("title_hi"),
  jurisdictionCountry: text("jurisdiction_country").notNull(),
  jurisdictionRegion: text("jurisdiction_region"),
  court: text("court"),
  caseNumber: text("case_number"),
  filedYear: integer("filed_year"),
  caseType: text("case_type").notNull(),
  statutes: text("statutes", { mode: "json" }).$type<string[]>().notNull().default([]),
  status: text("status").notNull(),
  tier: text("tier").notNull(),
  verdictDate: text("verdict_date"),
  sentenceOrRemedy: text("sentence_or_remedy"),
  appealStatus: text("appeal_status"),
  summaryEn: text("summary_en").notNull(),
  summaryHi: text("summary_hi"),
}, (t) => [index("cases_entity_idx").on(t.entityId), index("cases_tier_idx").on(t.tier)]);

export const caseSources = sqliteTable("case_sources", {
  caseId: text("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.caseId, t.sourceId] })]);

export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  caseId: text("case_id").references(() => cases.id, { onDelete: "set null" }),
  statementEn: text("statement_en").notNull(),
  statementHi: text("statement_hi"),
  tier: text("tier").notNull(),
  date: text("date"),
  position: integer("position").notNull().default(0),
}, (t) => [index("claims_entity_idx").on(t.entityId)]);

export const claimSources = sqliteTable("claim_sources", {
  claimId: text("claim_id").notNull().references(() => claims.id, { onDelete: "cascade" }),
  sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.claimId, t.sourceId] })]);

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  caseId: text("case_id").references(() => cases.id, { onDelete: "set null" }),
  date: text("date").notNull(),
  kind: text("kind").notNull(),
  labelEn: text("label_en").notNull(),
  labelHi: text("label_hi"),
}, (t) => [index("events_entity_idx").on(t.entityId)]);

export const eventSources = sqliteTable("event_sources", {
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.eventId, t.sourceId] })]);

export const relationships = sqliteTable("relationships", {
  id: text("id").primaryKey(),
  fromId: text("from_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  toId: text("to_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  descriptionEn: text("description_en").notNull(),
  descriptionHi: text("description_hi"),
}, (t) => [index("rel_from_idx").on(t.fromId), index("rel_to_idx").on(t.toId)]);

export const relationshipSources = sqliteTable("relationship_sources", {
  relationshipId: text("relationship_id").notNull().references(() => relationships.id, { onDelete: "cascade" }),
  sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.relationshipId, t.sourceId] })]);

export const corrections = sqliteTable("corrections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  entityId: text("entity_id"),
  claimId: text("claim_id"),
  descriptionEn: text("description_en").notNull(),
  descriptionHi: text("description_hi"),
  reason: text("reason").notNull(),
});

export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  jurisdiction: text("jurisdiction"),
  note: text("note"),
  status: text("status").notNull(),
  reason: text("reason"),
  sourceUrl: text("source_url"),
});
