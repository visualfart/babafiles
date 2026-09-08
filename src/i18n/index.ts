import en from "./en.json";
import hi from "./hi.json";

export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];
export type Dict = typeof en;

export function isLang(x: string): x is Lang {
  return (LANGS as readonly string[]).includes(x);
}

export function getDict(lang: Lang): Dict {
  return lang === "hi" ? (hi as Dict) : en;
}

/** Pick the localised field with English fallback. */
export function pick(lang: Lang, en: string | null | undefined, hi: string | null | undefined): string {
  if (lang === "hi" && hi) return hi;
  return en ?? "";
}
