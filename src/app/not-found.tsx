import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap pt-20">
      <div className="label">404</div>
      <p className="mt-3">No such page. <Link href="/en" className="underline underline-offset-4">Home</Link></p>
    </div>
  );
}
