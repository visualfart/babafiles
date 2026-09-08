import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLang } from "@/i18n";

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
  return (
    <div lang={lang} className="min-h-screen flex flex-col">
      <header className="wrap w-full flex items-baseline justify-between py-7 gap-6 flex-wrap">
        <Link href={`/${lang}`} className="brand text-[15px] font-medium tracking-tight">{t.site.name}</Link>
        <nav className="flex gap-5 flex-wrap text-[12px] muted">
          {nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href={`/${other}`} className="faint">{t.common.lang}</Link>
        </nav>
      </header>
      <main className="wrap w-full flex-1 pb-24">{children}</main>
      <footer className="wrap w-full py-10 text-[12px] muted rule">
        <div className="flex justify-between flex-wrap gap-4">
          <span className="brand">{t.site.name} · CC-BY-4.0 data · MIT code</span>
          <a href="https://github.com/visualfart/babafiles" className="brand">github.com/visualfart/babafiles</a>
        </div>
      </footer>
    </div>
  );
}
