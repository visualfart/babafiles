import { getDict, isLang, type Lang } from "@/i18n";
import { search } from "@/lib/queries";
import { SearchBox } from "@/components/SearchBox";
import { EntityRow } from "@/components/EntityRow";

export default async function Search({ params, searchParams }: {
  params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }>;
}) {
  const { lang: l } = await params; const { q = "" } = await searchParams;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const rows = await search(q);
  return (
    <div className="pt-6">
      <div className="max-w-[640px]"><SearchBox lang={lang} t={t} q={q} autoFocus /></div>
      <div className="mt-8">
        {q && rows.length === 0 && <p className="muted py-6">{lang === "hi" ? "कोई रिकॉर्ड नहीं मिला।" : "No record matches."}</p>}
        {rows.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
      </div>
    </div>
  );
}
