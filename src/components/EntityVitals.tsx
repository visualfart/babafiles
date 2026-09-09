import type { Dict } from "@/i18n";
import { computeAge, country } from "@/lib/fmt";
import { CalendarIcon, ClockIcon, PinIcon, BuildingIcon } from "./icons";

/** Icon-led biographical facts -- born, current age (or age at death), base, organisations --
 * scanned in one glance before the prose, per the newspaper rethink. */
export function EntityVitals({
  born, died, baseLocation, countryCode, organisations, t,
}: {
  born: string | null; died: string | null; baseLocation: string | null; countryCode: string;
  organisations: string[]; t: Dict;
}) {
  const bornYear = born ? born.slice(0, 4) : null;
  const age = computeAge(born, died);
  const items: { icon: React.ReactNode; value: string; label: string }[] = [];

  if (bornYear) items.push({ icon: <CalendarIcon className="faint" />, value: bornYear, label: t.entity.born });
  if (age !== null) {
    items.push(died
      ? { icon: <ClockIcon className="faint" />, value: String(age), label: t.entity.died_at }
      : { icon: <ClockIcon className="faint" />, value: String(age), label: t.entity.age_now });
  }
  if (baseLocation) items.push({ icon: <PinIcon className="faint" />, value: `${baseLocation}${countryCode ? `, ${country(countryCode)}` : ""}`, label: t.entity.base });
  if (organisations.length > 0) items.push({ icon: <BuildingIcon className="faint" />, value: organisations.join(" · "), label: t.entity.organisations });

  if (items.length === 0) return null;

  return (
    <div className="flex gap-x-7 gap-y-2.5 flex-wrap mt-5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2.5">
          {it.icon}
          <div><span className="tnum text-[13px]">{it.value}</span><span className="faint text-[11px]"> · {it.label}</span></div>
        </div>
      ))}
    </div>
  );
}
