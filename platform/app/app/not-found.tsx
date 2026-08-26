import Link from "next/link";
import { IconArrowRight, IconKeelLogo } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="shell flex max-w-lg flex-col items-start py-28 space-y-4">
      <div className="flex items-center gap-2 font-mono text-xs text-fail">
        <span className="size-1.5 rounded-full bg-fail" />
        <span>HTTP 404 · ROUTE TARGET NOT FOUND</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        We couldn&apos;t find that page.
      </h1>

      <p className="text-xs leading-relaxed text-ink-2">
        The link may have moved, or that unit isn&apos;t published yet. Check the curriculum map to explore available units.
      </p>

      <div className="flex flex-wrap gap-3 pt-2 font-mono text-xs">
        <Link href="/" className="btn-primary">
          <span>RETURN HOME</span>
          <IconArrowRight size={12} />
        </Link>
        <Link href="/curriculum" className="btn-ghost">
          <span>VIEW CURRICULUM</span>
        </Link>
      </div>
    </div>
  );
}
