import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { getDict, isLang, type Lang } from "@/i18n";

export default async function Methodology({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const file = lang === "hi" ? "EDITORIAL_POLICY.hi.md" : "EDITORIAL_POLICY.md";
  const p = path.join(process.cwd(), file);
  const md = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : fs.readFileSync(path.join(process.cwd(), "EDITORIAL_POLICY.md"), "utf8");
  const html = await marked.parse(md.replace(/^# .*\n/, ""));
  return (
    <div className="pt-6">
      <h1>{t.nav.methodology}</h1>
      {lang === "hi" && !fs.existsSync(p) && <p className="faint text-[12px] mt-2">{t.entity.unreviewed_hi}</p>}
      <div className="prose mt-8 text-[14px]" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
