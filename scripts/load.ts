import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { EntityFileSchema, ImageSchema, checkRules, type EntityFile, type ValidationIssue } from "../src/lib/validation";

export const DATA_DIR = path.join(process.cwd(), "data", "entities");
export const IMAGE_DIR = path.join(process.cwd(), "data", "images");

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
    // Optional sidecar: data/images/<id>.yaml holds the image block so image sourcing can
    // proceed independently of research edits to the entity file.
    const sidecar = path.join(IMAGE_DIR, name.replace(/\.ya?ml$/, ".yaml"));
    if (!parsed.data.image && fs.existsSync(sidecar)) {
      const img = ImageSchema.safeParse(parse(fs.readFileSync(sidecar, "utf8")));
      if (img.success) {
        const f = path.join(process.cwd(), "public", "images", "entities", img.data.file);
        if (fs.existsSync(f)) parsed.data.image = img.data;
        else issues.push({ file: `data/images/${name}`, path: "file", level: "warning", message: `image file missing: public/images/entities/${img.data.file}` });
      } else {
        for (const iss of img.error.issues) issues.push({ file: `data/images/${name}`, path: iss.path.join("."), level: "error", message: iss.message });
      }
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
