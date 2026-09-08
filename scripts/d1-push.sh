#!/usr/bin/env bash
# Push schema and data to the Cloudflare D1 database.
#   scripts/d1-push.sh schema   apply drizzle migrations + FTS to remote D1
#   scripts/d1-push.sh data     replace all data on remote D1 with the local SQLite contents
set -euo pipefail
DB=babafiles
LOCAL=.data/babafiles.db
case "${1:-}" in
  schema)
    for f in src/db/migrations/*.sql; do
      echo "== $f"; npx wrangler d1 execute "$DB" --remote --yes --file="$f" | tail -2
    done ;;
  data)
    out=$(mktemp).sql
    {
      echo "PRAGMA defer_foreign_keys = true;"
      for t in relationship_sources relationships event_sources events claim_sources claims case_sources cases sources entities candidates corrections; do
        echo "DELETE FROM $t;"
      done
      for t in entities sources cases case_sources claims claim_sources events event_sources relationships relationship_sources candidates corrections; do
        sqlite3 "$LOCAL" ".mode insert $t" "SELECT * FROM $t;"
      done
      echo "INSERT INTO entities_fts(entities_fts) VALUES('rebuild');"
    } > "$out"
    echo "== $(grep -c '^INSERT' "$out") rows -> $DB (remote)"
    npx wrangler d1 execute "$DB" --remote --yes --file="$out" | tail -3
    rm -f "$out" ;;
  *) echo "usage: $0 schema|data"; exit 1 ;;
esac
