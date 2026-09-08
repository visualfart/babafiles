import fs from "node:fs";
import { db } from "../src/db/client";
import * as t from "../src/db/schema";

async function main() {
  const out = "public/data";
  fs.mkdirSync(out, { recursive: true });
  const dump = {
    generated_at: new Date().toISOString(),
    licence: "CC-BY-4.0",
    entities: await db.select().from(t.entities),
    sources: await db.select().from(t.sources),
    cases: await db.select().from(t.cases),
    case_sources: await db.select().from(t.caseSources),
    claims: await db.select().from(t.claims),
    claim_sources: await db.select().from(t.claimSources),
    events: await db.select().from(t.events),
    event_sources: await db.select().from(t.eventSources),
    relationships: await db.select().from(t.relationships),
    relationship_sources: await db.select().from(t.relationshipSources),
  };
  fs.writeFileSync(`${out}/babafiles.json`, JSON.stringify(dump, null, 2));
  console.log(`wrote ${out}/babafiles.json (${dump.entities.length} entities)`);
}
main().catch((e) => { console.error(e); process.exit(1); });
