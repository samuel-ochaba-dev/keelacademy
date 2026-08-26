import Link from "next/link";
import { listUnits } from "@/lib/content";
import { IconKeelLogo } from "@/components/icons";

export function SiteFooter() {
  const units = listUnits();
  const first = units[0];

  return (
    <footer className="border-t border-line bg-raised/70">
      <div className="shell-wide grid gap-12 py-14 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
        {/* Brand + system telemetry */}
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 text-ink">
            <span className="grid size-7 place-items-center rounded border border-line-strong bg-inset text-accent">
              <IconKeelLogo size={15} />
            </span>
            <span className="text-sm font-semibold tracking-tight">Keel Academy</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            The engineering school for production AI. Build one continuous pipeline across 13 phases,
            verified on every git push by deterministic containers and evidence-backed code grading.
          </p>
          <div className="mt-5 flex items-center gap-3 font-mono text-[11px] text-ink-3">
            <span className="inline-flex items-center gap-1.5 rounded border border-line bg-inset px-2 py-0.5">
              <span className="size-1.5 rounded-full bg-pass" />
              <span>RUNNER v3.2.1-LIVE</span>
            </span>
            <span className="text-ink-4">SHA: 8f9b2d1</span>
          </div>
        </div>

        <FooterColumn
          title="CURRICULUM"
          links={[
            { href: "/curriculum", label: "13-Phase Pipeline Spec" },
            ...(first
              ? [{ href: `/units/${first.id}`, label: `Unit ${first.id} [Live Workbench]` }]
              : []),
            { href: "/curriculum#capstone", label: "Section 14 Capstone Standard" },
          ]}
        />

        <FooterColumn
          title="VERIFICATION"
          links={[
            { href: "/submit", label: "Git Ingestion Protocol" },
            { href: "/#verification", label: "4-Layer Evaluation Engine" },
            { href: "/#method", label: "The 5-Step Unit Loop" },
          ]}
        />

        <FooterColumn
          title="ACCOUNTABILITY"
          links={[
            { href: "/pricing", label: "Tuition & 30% Rebates" },
            { href: "/pricing#commitment", label: "Commitment Screen" },
            { href: "/faq", label: "Production FAQ" },
            { href: "/me", label: "Learner Cockpit" },
          ]}
        />
      </div>

      <div className="border-t border-line bg-inset/40">
        <div className="shell-wide flex flex-col gap-2 py-4 text-[11px] font-mono text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-ink-3">
            SPECS: Unit 3.2.1 live with ephemeral container grading. Full 13-phase curriculum is an open, published architecture.
          </p>
          <p className="text-ink-4">© 2026 KEEL ACADEMY · ZERO MARKETING CRUFT</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-mono text-[11px] font-medium tracking-wider text-ink uppercase">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-xs text-ink-3 transition-colors hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
