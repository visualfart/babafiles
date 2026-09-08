import { marked } from "marked";
import { getDict, isLang, type Lang } from "@/i18n";
import { POLICY_EN, POLICY_HI } from "@/generated/policy";

export default async function Methodology({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const md = lang === "hi" && POLICY_HI ? POLICY_HI : POLICY_EN;
  const html = await marked.parse(md.replace(/^# .*\n/, ""));
  return (
    <div className="pt-6">
      <h1>{t.nav.methodology}</h1>
      {lang === "hi" && !POLICY_HI && <p className="faint text-[12px] mt-2">{t.entity.unreviewed_hi}</p>}
      <div className="prose mt-8 text-[14px]" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
