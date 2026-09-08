import { getDict, isLang, type Lang } from "@/i18n";
import { listSubjects } from "@/lib/queries";
import { EntityRow } from "@/components/EntityRow";

export default async function Temples({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const rows = await listSubjects({ type: "temple_trust" });
  return (
    <div className="pt-6">
      <h1>{t.nav.temples}</h1>
      <div className="mt-8">
        {rows.length === 0 && <p className="muted py-6">{t.common.none}</p>}
        {rows.map((e) => <EntityRow key={e.id} e={e} lang={lang} t={t} />)}
      </div>
    </div>
  );
}
