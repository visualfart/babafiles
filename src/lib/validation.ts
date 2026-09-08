import { z } from "zod";
import {
  TIERS, SOURCE_TYPES, ENTITY_TYPES, ACTIVITY_STATUSES, CASE_TYPES, EVENT_KINDS,
  RELATIONSHIP_TYPES, isAdverse, type Tier,
} from "./tiers";

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "slug must be [a-z0-9-]");
const isoDate = z
  .union([z.string(), z.date(), z.number()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)))
  .pipe(z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "date must be YYYY, YYYY-MM or YYYY-MM-DD"));
const optDate = isoDate.optional().nullable();
const optStr = z.string().optional().nullable();

export const SourceSchema = z.object({
  id: slug,
  url: z.string().url(),
  title: optStr,
  publisher: z.string().min(1),
  type: z.enum(SOURCE_TYPES),
  published_at: optDate,
  language: z.string().default("en"),
  archive_url: z.string().url().optional().nullable(),
  captured_at: optDate,
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional().nullable(),
  note: optStr,
});

export const CaseSchema = z.object({
  id: slug,
  title_en: z.string().min(1),
  title_hi: optStr,
  jurisdiction_country: z.string().length(2),
  jurisdiction_region: optStr,
  court: optStr,
  case_number: optStr,
  filed_year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  case_type: z.enum(CASE_TYPES),
  statutes: z.array(z.string()).default([]),
  status: z.string().min(1),
  tier: z.enum(TIERS),
  verdict_date: optDate,
  sentence_or_remedy: optStr,
  appeal_status: optStr,
  summary_en: z.string().min(1),
  summary_hi: optStr,
  source_ids: z.array(slug).min(1),
});

export const ClaimSchema = z.object({
  id: slug,
  case_id: slug.optional().nullable(),
  statement_en: z.string().min(10),
  statement_hi: optStr,
  tier: z.enum(TIERS),
  date: optDate,
  source_ids: z.array(slug).min(1, "every claim needs at least one source"),
});

export const EventSchema = z.object({
  date: isoDate,
  kind: z.enum(EVENT_KINDS),
  label_en: z.string().min(1),
  label_hi: optStr,
  case_id: slug.optional().nullable(),
  source_ids: z.array(slug).min(1),
});

export const RelationshipSchema = z.object({
  to_id: slug,
  type: z.enum(RELATIONSHIP_TYPES),
  period_start: optDate,
  period_end: optDate,
  description_en: z.string().min(1),
  description_hi: optStr,
  source_ids: z.array(slug).min(1),
});

export const RegisterCheckSchema = z.object({
  register: z.string().min(1),
  checked_on: isoDate,
  query: optStr,
});

export const EntityFileSchema = z.object({
  id: slug,
  type: z.enum(ENTITY_TYPES),
  is_subject: z.boolean().default(true),
  name_en: z.string().min(1),
  name_hi: optStr,
  aliases: z.array(z.string()).default([]),
  born: optDate,
  died: optDate,
  base_location: optStr,
  country: z.string().length(2),
  countries_of_operation: z.array(z.string().length(2)).default([]),
  organisations: z.array(z.string()).default([]),
  activity_status: z.enum(ACTIVITY_STATUSES).optional().nullable(),
  abap_2017_list: z.boolean().default(false),
  summary_en: z.string().min(1),
  summary_hi: optStr,
  hi_reviewed: z.boolean().default(false),
  response_from_subject: z
    .object({ text_en: z.string().min(1), text_hi: optStr, source_id: slug })
    .optional()
    .nullable(),
  registers_checked: z.array(RegisterCheckSchema).default([]),
  sources: z.array(SourceSchema).default([]),
  cases: z.array(CaseSchema).default([]),
  claims: z.array(ClaimSchema).default([]),
  events: z.array(EventSchema).default([]),
  relationships: z.array(RelationshipSchema).default([]),
});
export type EntityFile = z.infer<typeof EntityFileSchema>;
export type Source = z.infer<typeof SourceSchema>;

export interface ValidationIssue {
  file: string;
  path: string;
  message: string;
  level: "error" | "warning";
}

const BANNED_OWN_VOICE = /\b(fake|fraudster|conman|con-man|charlatan)\b/i;

/**
 * Cross-file rules from EDITORIAL_POLICY.md. `strict` makes missing archive_url an error
 * (CI); otherwise it is a warning so local research can proceed before archiving.
 */
export function checkRules(
  files: Map<string, EntityFile>,
  opts: { strict: boolean },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sources = new Map<string, { src: Source; file: string }>();
  const entityIds = new Set(files.keys());
  const caseIds = new Set<string>();
  const claimIds = new Set<string>();

  for (const [file, ef] of files) {
    for (const s of ef.sources) {
      if (sources.has(s.id)) {
        issues.push({ file, path: `sources.${s.id}`, level: "error",
          message: `duplicate source id (also in ${sources.get(s.id)!.file})` });
      }
      sources.set(s.id, { src: s, file });
    }
    for (const c of ef.cases) {
      if (caseIds.has(c.id)) issues.push({ file, path: `cases.${c.id}`, level: "error", message: "duplicate case id" });
      caseIds.add(c.id);
    }
    for (const c of ef.claims) {
      if (claimIds.has(c.id)) issues.push({ file, path: `claims.${c.id}`, level: "error", message: "duplicate claim id" });
      claimIds.add(c.id);
    }
  }

  const sourceOk = (ids: string[], file: string, path: string, tier: Tier | null) => {
    const types = new Set<string>();
    for (const id of ids) {
      const s = sources.get(id);
      if (!s) { issues.push({ file, path, level: "error", message: `unknown source id ${id}` }); continue; }
      types.add(s.src.type);
    }
    if (tier && isAdverse(tier) && !types.has("court") && !types.has("official")) {
      issues.push({ file, path, level: "error",
        message: `tier ${tier} requires at least one court or official source` });
    }
    if (tier === "allegation" && !types.has("major_outlet") && !types.has("court") && !types.has("official")) {
      issues.push({ file, path, level: "error", message: "tier allegation requires a major_outlet source" });
    }
  };

  const ownVoice = (text: string | null | undefined, file: string, path: string) => {
    if (text && BANNED_OWN_VOICE.test(text)) {
      issues.push({ file, path, level: "error",
        message: `own-voice text uses a banned word (${text.match(BANNED_OWN_VOICE)![0]}); quote the record instead` });
    }
  };

  for (const [file, ef] of files) {
    ownVoice(ef.summary_en, file, "summary_en");
    if (ef.is_subject && !ef.summary_hi) {
      issues.push({ file, path: "summary_hi", level: opts.strict ? "error" : "warning", message: "summary_hi missing" });
    }
    if (ef.response_from_subject && !sources.has(ef.response_from_subject.source_id)) {
      issues.push({ file, path: "response_from_subject.source_id", level: "error", message: "unknown source id" });
    }
    for (const s of ef.sources) {
      if (!s.archive_url) {
        issues.push({ file, path: `sources.${s.id}.archive_url`, level: opts.strict ? "error" : "warning",
          message: "source not archived yet (run npm run archive)" });
      }
    }
    for (const c of ef.cases) {
      ownVoice(c.summary_en, file, `cases.${c.id}.summary_en`);
      sourceOk(c.source_ids, file, `cases.${c.id}.source_ids`, c.tier);
      if (c.jurisdiction_country !== "IN") {
        const local = c.source_ids.some((id) => {
          const s = sources.get(id);
          return s && (s.src.type === "court" || s.src.type === "official");
        });
        if (!local && isAdverse(c.tier)) {
          issues.push({ file, path: `cases.${c.id}`, level: "error",
            message: "foreign adverse case needs a court or official source" });
        }
      }
    }
    for (const c of ef.claims) {
      ownVoice(c.statement_en, file, `claims.${c.id}.statement_en`);
      sourceOk(c.source_ids, file, `claims.${c.id}.source_ids`, c.tier);
      if (c.case_id && !caseIds.has(c.case_id)) {
        issues.push({ file, path: `claims.${c.id}.case_id`, level: "error", message: `unknown case id ${c.case_id}` });
      }
    }
    for (const [i, e] of ef.events.entries()) {
      sourceOk(e.source_ids, file, `events[${i}].source_ids`, null);
      if (e.case_id && !caseIds.has(e.case_id)) {
        issues.push({ file, path: `events[${i}].case_id`, level: "error", message: `unknown case id ${e.case_id}` });
      }
    }
    for (const [i, r] of ef.relationships.entries()) {
      sourceOk(r.source_ids, file, `relationships[${i}].source_ids`, null);
      if (!entityIds.has(r.to_id)) {
        issues.push({ file, path: `relationships[${i}].to_id`, level: "error",
          message: `unknown entity ${r.to_id} (add a stub file in data/entities/)` });
      }
    }
    const tiers = [...ef.cases.map((c) => c.tier), ...ef.claims.map((c) => c.tier)];
    if (ef.is_subject && tiers.length === 0 && ef.registers_checked.length < 3) {
      issues.push({ file, path: "registers_checked", level: "error",
        message: "subject with no cases or claims must list at least 3 registers checked (tier no_record_found)" });
    }
    if (ef.is_subject && tiers.length > 0 && tiers.every((t) => t === "no_record_found") && ef.registers_checked.length < 3) {
      issues.push({ file, path: "registers_checked", level: "error", message: "no_record_found needs at least 3 registers checked" });
    }
  }
  return issues;
}
