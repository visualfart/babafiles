import Link from "next/link";
import { TierBadge } from "./TierBadge";
import { pick, type Dict, type Lang } from "@/i18n";

export interface EntityRowData {
  id: string; nameEn: string; nameHi: string | null; overallTier: string | null;
  baseLocation: string | null; type: string; activityStatus: string | null; summaryEn: string; summaryHi: string | null;
}

export function EntityRow({ e, lang, t, showSummary = true }: { e: EntityRowData; lang: Lang; t: Dict; showSummary?: boolean }) {
  const act = e.activityStatus ? (t.activity as Record<string, string>)[e.activityStatus] : null;
  return (
    <div className="row">
      <div className="pt-[2px]"><TierBadge tier={e.overallTier} t={t} /></div>
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <Link href={`/${lang}/records/${e.id}`} className="text-[15px] font-medium">{pick(lang, e.nameEn, e.nameHi)}</Link>
          <span className="faint text-[12px]">{[e.baseLocation, act].filter(Boolean).join(" · ")}</span>
        </div>
        {showSummary && <p className="muted mt-1 measure text-[13px]">{pick(lang, e.summaryEn, e.summaryHi)}</p>}
      </div>
    </div>
  );
}
