export interface SectionTab { id: string; label: string; count: number }

/** A sticky jump-bar with per-section counts, so a 2,000-word record page never forces a
 * blind scroll to discover what's below. */
export function SectionTabs({ tabs }: { tabs: SectionTab[] }) {
  const visible = tabs.filter((s) => s.count > 0);
  if (visible.length === 0) return null;
  return (
    <div className="sticky top-0 z-10 border-b hair" style={{ background: "var(--paper)" }}>
      <div className="flex gap-6 overflow-x-auto">
        {visible.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="text-[12px] muted py-3 whitespace-nowrap">
            {s.label} <span className="faint tnum">{s.count}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
