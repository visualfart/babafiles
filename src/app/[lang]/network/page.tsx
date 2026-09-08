import { getDict, isLang, type Lang } from "@/i18n";
import { graph } from "@/lib/queries";
import { NetworkGraph } from "@/components/NetworkGraph";
import { isAdverse, type Tier } from "@/lib/tiers";

export default async function Network({ params, searchParams }: {
  params: Promise<{ lang: string }>; searchParams: Promise<{ focus?: string }>;
}) {
  const { lang: l } = await params; const { focus } = await searchParams;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const g = await graph();
  const nodes = g.nodes.map((n) => ({ ...n, adverse: !!n.overallTier && isAdverse(n.overallTier as Tier) }));
  return (
    <div className="pt-6">
      <h1>{t.nav.network}</h1>
      <p className="muted mt-3 measure text-[13px]">
        {lang === "hi"
          ? "हर रेखा एक प्रलेखित संबंध है जिसका कम से कम एक स्रोत है। भरे हुए बिंदु = प्रतिकूल रिकॉर्ड वाले विषय; खाली बिंदु = अन्य। एक संबंध का होना अपने-आप में गलत काम का प्रमाण नहीं है; विवरण के लिए रिकॉर्ड खोलें।"
          : "Every line is a documented relationship with at least one source. Filled dots are subjects with an adverse record; hollow dots are everyone else. A relationship is not itself evidence of wrongdoing. Open the record for the detail."}
      </p>
      <div className="mt-8">
        {nodes.length === 0
          ? <p className="muted py-6">{t.common.none}</p>
          : <NetworkGraph nodes={nodes} links={g.links} lang={lang} focus={focus} />}
      </div>
    </div>
  );
}
