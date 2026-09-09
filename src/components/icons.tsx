// Stroke-based, 24px-grid icons in one consistent style. Never emoji.
type P = { className?: string };
const base = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;

export function CalendarIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
}
export function ClockIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
}
export function PinIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.3" /></svg>;
}
export function BuildingIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><path d="M4 21V8l8-5 8 5v13M4 21h16M9 21v-6h6v6" /></svg>;
}
export function GavelIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><path d="M12 3v2M5 8l7-3 7 3M4 8h16M6 8v9M18 8v9M3 21h18M9 12v3M15 12v3" /></svg>;
}
export function ShieldIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" /></svg>;
}
export function NewspaperIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><rect x="3" y="5" width="18" height="15" rx="1.5" /><path d="M7 9h6M7 12.5h10M7 16h10" /><path d="M17 5v4h4" /></svg>;
}
export function DocIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><path d="M6 3h9l5 5v13H6z" /><path d="M15 3v5h5" /></svg>;
}
export function SearchIcon({ className }: P) {
  return <svg {...base} className={className} aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
}
export function ExternalLinkIcon({ className }: P) {
  return <svg {...base} width={11} height={11} className={className} aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg>;
}
