/**
 * Archive every source lacking archive_url on the Wayback Machine and write the capture
 * URL, date and a SHA-256 of the captured text back into the YAML file.
 *
 *   npm run archive              archive all unarchived sources
 *   npm run archive -- --check   report only
 *   npm run archive -- --only=asaram
 *
 * Optional: WAYBACK_ACCESS_KEY / WAYBACK_SECRET_KEY from https://archive.org/account/s3.php
 * raise the rate limit. Without them the public endpoint is used with a slow cadence.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseDocument } from "yaml";

const DATA = path.join(process.cwd(), "data", "entities");
const check = process.argv.includes("--check");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const AK = process.env.WAYBACK_ACCESS_KEY, SK = process.env.WAYBACK_SECRET_KEY;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function availability(url: string): Promise<string | null> {
  const r = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
  if (!r.ok) return null;
  const j = (await r.json()) as { archived_snapshots?: { closest?: { available: boolean; url: string; timestamp: string } } };
  const c = j.archived_snapshots?.closest;
  return c?.available ? c.url.replace(/^http:/, "https:") : null;
}

async function saveNow(url: string): Promise<string | null> {
  if (AK && SK) {
    const r = await fetch("https://web.archive.org/save", {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `LOW ${AK}:${SK}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url, capture_all: "1", skip_first_archive: "1" }),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { job_id?: string };
    if (!j.job_id) return null;
    for (let i = 0; i < 30; i++) {
      await sleep(5000);
      const s = await fetch(`https://web.archive.org/save/status/${j.job_id}`, { headers: { Accept: "application/json", Authorization: `LOW ${AK}:${SK}` } });
      const sj = (await s.json()) as { status: string; timestamp?: string; original_url?: string };
      if (sj.status === "success" && sj.timestamp) return `https://web.archive.org/web/${sj.timestamp}/${sj.original_url ?? url}`;
      if (sj.status === "error") return null;
    }
    return null;
  }
  // Public endpoint: a GET to /save/<url> returns the capture via redirect or Content-Location.
  const r = await fetch(`https://web.archive.org/save/${url}`, { redirect: "follow" });
  const loc = r.headers.get("content-location") ?? r.url;
  const m = loc.match(/\/web\/(\d{14})/);
  if (r.ok && m) return `https://web.archive.org/web/${m[1]}/${url}`;
  return null;
}

async function hashOf(archiveUrl: string): Promise<string | null> {
  try {
    const r = await fetch(archiveUrl);
    if (!r.ok) return null;
    const html = await r.text();
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return crypto.createHash("sha256").update(text).digest("hex");
  } catch { return null; }
}

async function main() {
  const files = fs.readdirSync(DATA).filter((f) => /\.ya?ml$/.test(f) && (!only || f.includes(only)));
  let missing = 0, done = 0, failed = 0;
  for (const f of files) {
    const p = path.join(DATA, f);
    const doc = parseDocument(fs.readFileSync(p, "utf8"));
    const sources = doc.get("sources") as { items?: unknown[] } | undefined;
    if (!sources?.items) continue;
    let changed = false;
    for (const item of sources.items as Array<{ get: (k: string) => unknown; set: (k: string, v: unknown) => void }>) {
      const url = String(item.get("url") ?? "");
      const have = item.get("archive_url");
      if (have || !url) continue;
      missing++;
      if (check) { console.log(`missing  ${f} :: ${url}`); continue; }
      let arch = await availability(url);
      if (!arch) { arch = await saveNow(url); await sleep(AK ? 1000 : 15000); }
      if (!arch) { failed++; console.log(`FAILED   ${f} :: ${url}`); continue; }
      const sha = await hashOf(arch);
      item.set("archive_url", arch);
      item.set("captured_at", new Date().toISOString().slice(0, 10));
      if (sha) item.set("sha256", sha);
      changed = true; done++;
      console.log(`archived ${f} :: ${arch}`);
    }
    if (changed) fs.writeFileSync(p, doc.toString({ lineWidth: 0 }));
  }
  console.log(`\n${missing} unarchived, ${done} archived now, ${failed} failed`);
  process.exit(check && missing > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
