import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { EntityFileSchema, checkRules, type EntityFile, type ValidationIssue } from "../src/lib/validation";

export const DATA_DIR = path.join(process.cwd(), "data", "entities");

export function loadAll(opts: { strict: boolean }): {
  files: Map<string, EntityFile>;
  issues: ValidationIssue[];
} {
  const files = new Map<string, EntityFile>();
  const issues: ValidationIssue[] = [];
  const names = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml")).sort()
    : [];
  for (const name of names) {
    const file = path.join("data/entities", name);
    let raw: unknown;
    try {
      raw = parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
    } catch (e) {
      issues.push({ file, path: "", level: "error", message: `YAML parse error: ${(e as Error).message}` });
      continue;
    }
    const parsed = EntityFileSchema.safeParse(raw);
    if (!parsed.success) {
      for (const iss of parsed.error.issues) {
        issues.push({ file, path: iss.path.join("."), level: "error", message: iss.message });
      }
      continue;
    }
    const expected = name.replace(/\.ya?ml$/, "");
    if (parsed.data.id !== expected) {
      issues.push({ file, path: "id", level: "error", message: `id "${parsed.data.id}" must match filename "${expected}"` });
    }
    files.set(parsed.data.id, parsed.data);
  }
  issues.push(...checkRules(files, opts));
  return { files, issues };
}

export function printIssues(issues: ValidationIssue[]): number {
  let errors = 0;
  for (const i of issues) {
    if (i.level === "error") errors++;
    console.log(`${i.level === "error" ? "ERROR" : "warn "} ${i.file}${i.path ? " :: " + i.path : ""} — ${i.message}`);
  }
  return errors;
}
