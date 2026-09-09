import { pick, type Dict, type Lang } from "@/i18n";
import { isAdverse, type Tier } from "@/lib/tiers";

export interface ConnectionNode {
  id: string; key: string; nameEn: string; nameHi: string | null; overallTier: string | null; relType: string;
}

/** A compact ego-network: the subject at centre with up to six documented connections arranged
 * in a circle, so a reader sees who's connected before ever leaving the profile page. */
export function ConnectionsGraph({
  subjectName, nodes, lang, t,
}: { subjectName: string; nodes: ConnectionNode[]; lang: Lang; t: Dict }) {
  const shown = nodes.slice(0, 6);
  const W = 640, H = 220, cx = W / 2, cy = 92, r = 78;
  const positions = shown.map((n, i) => {
    const angle = (i / shown.length) * 2 * Math.PI - Math.PI / 2;
    return { n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <div className="border hair rounded-[10px] p-4 md:p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" role="img" aria-label={t.entity.relationships}>
        {positions.map(({ n, x, y }) => (
          <line key={`l-${n.key}`} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--rule)" strokeWidth={1.5} />
        ))}
        {positions.map(({ n, x, y }) => {
          const adverse = n.overallTier && isAdverse(n.overallTier as Tier);
          const labelY = y < cy ? y - 16 : y + 22;
          return (
            <g key={n.key}>
              <circle cx={x} cy={y} r={13} fill={adverse ? "var(--accent)" : "var(--paper)"} stroke={adverse ? "var(--accent)" : "var(--ink-3)"} strokeWidth={1.5} />
              <text x={x} y={labelY} textAnchor="middle" fontSize={10.5} fill="var(--ink-2)" fontFamily="var(--font-sans)">
                {pick(lang, n.nameEn, n.nameHi)}
              </text>
              <text x={(cx + x) / 2} y={(cy + y) / 2 - 6} textAnchor="middle" fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-sans)">
                {n.relType.replace(/_/g, " ")}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={17} fill="var(--accent)" />
        <text x={cx} y={cy + 33} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-sans)">
          {subjectName}
        </text>
      </svg>
      {nodes.length > shown.length && (
        <div className="faint text-[11px] text-center mt-1">+{nodes.length - shown.length} more</div>
      )}
    </div>
  );
}
