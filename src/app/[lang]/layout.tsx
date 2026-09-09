import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLang } from "@/i18n";

const DATELINE_EN = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const DATELINE_HI = new Intl.DateTimeFormat("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function LangLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const other = lang === "en" ? "hi" : "en";
  const nav: [string, string][] = [
    [`/${lang}/records`, t.nav.records],
    [`/${lang}/temples`, t.nav.temples],
    [`/${lang}/network`, t.nav.network],
    [`/${lang}/methodology`, t.nav.methodology],
    [`/${lang}/corrections`, t.nav.corrections],
    [`/${lang}/about`, t.nav.about],
  ];
  const dateline = (lang === "hi" ? DATELINE_HI : DATELINE_EN).format(new Date());

  return (
    <div lang={lang} className="min-h-screen flex flex-col">
      <header className="w-full" style={{ borderBottom: "3px double var(--ink)" }}>
        <div className="wrap w-full pt-4 pb-3.5">
          <div className="flex justify-between items-baseline gap-4 flex-wrap font-mono text-[9.5px] tracking-[0.08em] uppercase muted">
            <span>{lang === "hi" ? "खंड I" : "Vol. I"}</span>
            <span className="tnum">{dateline}</span>
          </div>
          <div className="text-center mt-2.5">
            <Link href={`/${lang}`} className="brand inline-block text-[34px] leading-none tracking-[0.01em]">{t.site.name}</Link>
            <div className="italic text-[11.5px] muted mt-1.5">{t.site.tagline}</div>
          </div>
        </div>
        <nav className="border-t hair" style={{ borderColor: "var(--ink)" }}>
          <div className="wrap w-full flex justify-center gap-7 flex-wrap py-2 text-[11.5px] tracking-[0.03em] uppercase">
            {nav.map(([href, label]) => <Link key={href} href={href} className="muted">{label}</Link>)}
            <Link href={`/${other}`} className="faint">{t.common.lang}</Link>
          </div>
        </nav>
      </header>
      <main className="wrap w-full flex-1 pb-24">{children}</main>
      <footer className="wrap w-full py-10 text-[12px] muted rule">
        <div className="flex justify-between flex-wrap gap-4">
          <span className="brand text-[14px]">{t.site.name} · CC-BY-4.0 data · MIT code</span>
          <a href="https://github.com/visualfart/babafiles">github.com/visualfart/babafiles</a>
        </div>
      </footer>
    </div>
  );
}
