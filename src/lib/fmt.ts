import type { Lang } from "@/i18n";

const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_HI = ["जन","फ़र","मार्च","अप्रैल","मई","जून","जुल","अग","सित","अक्टू","नव","दिस"];

/** Formats YYYY, YYYY-MM or YYYY-MM-DD without pretending to more precision than the record has. */
export function fmtDate(d: string | null | undefined, lang: Lang): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  if (!m) return y;
  if (!day) return `${months[+m - 1]} ${y}`;
  return `${+day} ${months[+m - 1]} ${y}`;
}

/** Day-and-month only, for a compact timeline where the year is shown once per group. */
export function fmtDayMonth(d: string | null | undefined, lang: Lang): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  const months = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  if (!m) return "";
  return day ? `${+day} ${months[+m - 1]}` : months[+m - 1];
}

/** Groups date-bearing rows by year, preserving input order within each year. */
export function groupByYear<T extends { date: string }>(items: T[]): [string, T[]][] {
  const order: string[] = [];
  const m = new Map<string, T[]>();
  for (const it of items) {
    const y = it.date.slice(0, 4);
    if (!m.has(y)) { m.set(y, []); order.push(y); }
    m.get(y)!.push(it);
  }
  return order.map((y) => [y, m.get(y)!]);
}

/** Age now (or at death, if died is set). Year-precision only, matching the record's own precision. */
export function computeAge(born: string | null | undefined, died?: string | null | undefined): number | null {
  const bornYear = born ? parseInt(born.slice(0, 4), 10) : NaN;
  if (Number.isNaN(bornYear)) return null;
  const endYear = died ? parseInt(died.slice(0, 4), 10) : new Date().getFullYear();
  if (Number.isNaN(endYear)) return null;
  const age = endYear - bornYear;
  return age >= 0 && age < 130 ? age : null;
}

export const COUNTRY: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia", NP: "Nepal",
  DE: "Germany", CH: "Switzerland", MU: "Mauritius", BO: "Bolivia", PY: "Paraguay", EC: "Ecuador",
  AE: "United Arab Emirates", SG: "Singapore", MY: "Malaysia", LK: "Sri Lanka", TT: "Trinidad and Tobago",
};
export const country = (c: string) => COUNTRY[c] ?? c;
