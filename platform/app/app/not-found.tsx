import Link from "next/link";
import { IconArrowRight, IconKeelLogo } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="shell flex max-w-lg flex-col items-start py-28">
      <span className="grid size-12 place-items-center rounded-xl border border-line-strong bg-raised text-accent">
        <IconKeelLogo size={26} />
      </span>

      <p className="mt-8 font-mono text-xs tracking-[0.1em] text-ink-3 uppercase">404 / not found</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        The requested page does not exist.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        The resource may have moved, or the unit ID in the URL is not in the current curriculum
        catalog.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Return to homepage
          <IconArrowRight size={15} />
        </Link>
        <Link href="/curriculum" className="btn-ghost">
          Inspect curriculum
        </Link>
      </div>
    </div>
  );
}
