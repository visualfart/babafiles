import Link from "next/link";
import type { Dict, Lang } from "@/i18n";
import type { Source } from "@/lib/queries";
import { GavelIcon, ShieldIcon, NewspaperIcon, DocIcon } from "./icons";

const TYPE_ORDER = ["court", "official", "major_outlet", "other"] as const;
const TYPE_ICON: Record<string, React.ReactNode> = {
  court: <GavelIcon className="muted" />,
  official: <ShieldIcon className="muted" />,
  major_outlet: <NewspaperIcon className="muted" />,
  other: <DocIcon className="muted" />,
};

/** Sources grouped by evidentiary type -- a flat 37-row citation list becomes a handful of
 * scannable clusters, and puts "how much of this is actually a court record?" at a glance. */
export function SourceGroups({
  sources, index, lang, t,
}: { sources: Source[]; index: Map<string, number>; lang: Lang; t: Dict }) {
  const groups = TYPE_ORDER
    .map((type) => ({ type, items: sources.filter((s) => s.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ type, items }) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-2.5">
            {TYPE_ICON[type]}
            <div className="text-[12px] font-medium">{(t.source.type_plural as Record<string, string>)[type]}</div>
            <div className="faint tnum text-[11px]">{items.length}</div>
          </div>
          <div className="flex flex-col">
            {items.map((s) => (
              <div key={s.id} id={`src-${s.id}`} className="flex items-center gap-3 py-2 border-t hair text-[12px]">
                <span
                  className="w-[7px] h-[7px] rounded-full flex-none"
                  style={s.archiveUrl ? { background: "var(--ink)" } : { background: "var(--paper)", border: "1px solid var(--ink-3)" }}
                  title={s.archiveUrl ? t.source.archived : t.source.not_archived}
                />
                <Link href={`/${lang}/sources/${s.id}`} className="flex-1 truncate">{s.title ?? s.url}</Link>
                <span className="faint tnum text-[11px]">[{index.get(s.id)}]</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
