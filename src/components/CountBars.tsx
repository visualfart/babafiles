import Link from "next/link";

export interface CountRow { key: string; label: string; n: number; href?: string; }

/** Compact horizontal bar list: label, thin bar, tabular count. Used wherever a wall of
 * records is better skimmed as a distribution than read as a list. */
export function CountBars({ rows, dense = false }: { rows: CountRow[]; dense?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className={dense ? "mt-3" : "mt-4"}>
      {rows.map((r) => {
        const inner = (
          <>
            <span className="text-[11px] muted truncate">{r.label}</span>
            <span className="h-[6px] bg-[var(--rule-2)]">
              <span className="block h-full bg-[var(--ink)]" style={{ width: r.n ? `${Math.max(4, (r.n / max) * 100)}%` : "0%" }} />
            </span>
            <span className="tnum text-[12px] text-right">{r.n}</span>
          </>
        );
        const cls = "grid grid-cols-[128px_1fr_30px] items-center gap-3 py-[5px]";
        return r.href
          ? <Link key={r.key} href={r.href} className={`${cls} group`}>{inner}</Link>
          : <div key={r.key} className={cls}>{inner}</div>;
      })}
    </div>
  );
}
