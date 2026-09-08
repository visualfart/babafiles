import fs from "node:fs";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
fs.mkdirSync(".data", { recursive: true });
const { db, client } = await import("../src/db/client");
// WAL lets the dev server (readers) and this script (writer) share the file without
// SQLITE_BUSY; it's a property of the file itself, so this only needs to run once.
await client.execute("PRAGMA journal_mode=WAL");
await migrate(db, { migrationsFolder: "src/db/migrations" });

// Full-text search over entities. External-content FTS5 table kept in sync by triggers.
await client.executeMultiple(`
CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
  id UNINDEXED, name_en, name_hi, aliases, organisations, summary_en, summary_hi,
  content='entities', content_rowid='rowid', tokenize='unicode61'
);
CREATE TRIGGER IF NOT EXISTS entities_ai AFTER INSERT ON entities BEGIN
  INSERT INTO entities_fts(rowid, id, name_en, name_hi, aliases, organisations, summary_en, summary_hi)
  VALUES (new.rowid, new.id, new.name_en, new.name_hi, new.aliases, new.organisations, new.summary_en, new.summary_hi);
END;
CREATE TRIGGER IF NOT EXISTS entities_ad AFTER DELETE ON entities BEGIN
  INSERT INTO entities_fts(entities_fts, rowid, id, name_en, name_hi, aliases, organisations, summary_en, summary_hi)
  VALUES ('delete', old.rowid, old.id, old.name_en, old.name_hi, old.aliases, old.organisations, old.summary_en, old.summary_hi);
END;
CREATE TRIGGER IF NOT EXISTS entities_au AFTER UPDATE ON entities BEGIN
  INSERT INTO entities_fts(entities_fts, rowid, id, name_en, name_hi, aliases, organisations, summary_en, summary_hi)
  VALUES ('delete', old.rowid, old.id, old.name_en, old.name_hi, old.aliases, old.organisations, old.summary_en, old.summary_hi);
  INSERT INTO entities_fts(rowid, id, name_en, name_hi, aliases, organisations, summary_en, summary_hi)
  VALUES (new.rowid, new.id, new.name_en, new.name_hi, new.aliases, new.organisations, new.summary_en, new.summary_hi);
END;
`);
console.log("migrated");
}
main().catch((e) => { console.error(e); process.exit(1); });
