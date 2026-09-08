import type { Lang, Dict } from "@/i18n";

export function SearchBox({ lang, t, q, autoFocus }: { lang: Lang; t: Dict; q?: string; autoFocus?: boolean }) {
  return (
    <form action={`/${lang}/search`} method="get" role="search">
      <input type="search" name="q" defaultValue={q ?? ""} placeholder={t.home.search_placeholder}
        autoComplete="off" autoFocus={autoFocus} aria-label={t.home.search_placeholder} />
    </form>
  );
}
