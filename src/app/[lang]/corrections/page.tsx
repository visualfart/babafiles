import { getDict, isLang, pick, type Lang } from "@/i18n";
import { listCorrections } from "@/lib/queries";
import { fmtDate } from "@/lib/fmt";

export default async function Corrections({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const rows = await listCorrections();
  return (
    <div className="pt-6">
      <h1>{t.nav.corrections}</h1>
      <p className="muted mt-3 measure text-[13px]">
        {lang === "hi"
          ? "किसी तथ्यात्मक दावे में हर बदलाव यहाँ तारीख और कारण के साथ दर्ज होता है। सुधार अनुरोध के लिए दावे की आईडी और उसे खंडित करने वाला स्रोत बताएँ।"
          : "Every change to a factual claim is listed here with the date and reason. To request a correction, name the claim id and the source that contradicts it. The subject of a record has the same correction rights as anyone else."}
      </p>
      <div className="mt-8">
        {rows.length === 0 && <p className="muted py-6">{lang === "hi" ? "अभी तक कोई सुधार नहीं।" : "No corrections yet."}</p>}
        {rows.map((r) => (
          <div key={r.id} className="row text-[13px]">
            <div className="tnum muted">{fmtDate(r.date, lang)}</div>
            <div><p className="measure">{pick(lang, r.descriptionEn, r.descriptionHi)}</p><p className="faint text-[12px] mt-1">{r.reason}{r.claimId ? ` · ${r.claimId}` : ""}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
