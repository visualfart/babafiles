import { loadAll, printIssues } from "./load";

const strict = process.argv.includes("--strict");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const { files, issues } = loadAll({ strict });
const filtered = only ? issues.filter((i) => i.file.includes(only)) : issues;
const errors = printIssues(filtered);
const warnings = filtered.length - errors;
console.log(`\n${files.size} entity file(s), ${errors} error(s), ${warnings} warning(s)${strict ? " [strict]" : ""}`);
process.exit(errors > 0 ? 1 : 0);
