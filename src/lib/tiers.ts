export const TIERS = [
  "convicted",
  "civil_judgment",
  "wanted",
  "charged",
  "under_investigation",
  "regulatory_action",
  "allegation",
  "acquitted",
  "discharged",
  "closed",
  "no_record_found",
] as const;
export type Tier = (typeof TIERS)[number];

/** Tiers that count as adverse for stats, lists and graph colouring. */
export const ADVERSE_TIERS: readonly Tier[] = [
  "convicted",
  "civil_judgment",
  "wanted",
  "charged",
  "under_investigation",
  "regulatory_action",
];

/** Ordering used to derive an entity's overall tier (index 0 is highest). */
export const TIER_RANK: Record<Tier, number> = Object.fromEntries(
  TIERS.map((t, i) => [t, i]),
) as Record<Tier, number>;

export function isAdverse(t: Tier): boolean {
  return ADVERSE_TIERS.includes(t);
}

export function highestTier(tiers: Tier[]): Tier | null {
  if (tiers.length === 0) return null;
  return tiers.reduce((best, t) => (TIER_RANK[t] < TIER_RANK[best] ? t : best));
}

export const SOURCE_TYPES = ["court", "official", "major_outlet", "other"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const ENTITY_TYPES = [
  "person",
  "organisation",
  "temple_trust",
  "company",
  "political_party",
  "other",
] as const;

export const ACTIVITY_STATUSES = [
  "active",
  "imprisoned",
  "absconding",
  "deceased",
  "inactive",
] as const;

export const CASE_TYPES = [
  "criminal",
  "civil",
  "regulatory",
  "immigration",
  "charity_regulator",
  "inquiry",
] as const;

export const EVENT_KINDS = [
  "arrest", "fir", "chargesheet", "verdict", "sentence", "bail", "parole", "appeal",
  "acquittal", "death", "incident", "raid", "notice", "other",
] as const;

export const RELATIONSHIP_TYPES = [
  "endorsement", "shared_stage", "donation", "land_grant", "board_member",
  "business_ownership", "parole_timing", "family", "legal_representation", "other",
] as const;
