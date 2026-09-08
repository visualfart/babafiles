import Link from "next/link";
import type { Lang } from "@/i18n";

/** Compact numbered citation list used under claims, cases, events and relationships. */
export function SourceRefs({
  ids, index, lang,
}: { ids: string[]; index: Map<string, number>; lang: Lang }) {
  return (
    <span className="faint text-[11px] tnum whitespace-nowrap">
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && " "}
          <Link href={`/${lang}/sources/${id}`} className="hover:text-[var(--ink)]">[{index.get(id) ?? "?"}]</Link>
        </span>
      ))}
    </span>
  );
}
