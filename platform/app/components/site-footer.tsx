import Link from "next/link";
import { listUnits } from "@/lib/content";
import { IconKeelLogo } from "@/components/icons";

export function SiteFooter() {
  const units = listUnits();
  const first = units[0];

  return (
    <footer className="border-t border-line bg-raised/40">
      <div className="shell-wide grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 text-ink">
            <span className="grid size-8 place-items-center rounded-lg border border-line-strong bg-raised text-accent">
              <IconKeelLogo size={16} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Keel Academy</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-3">
            A self-paced engineering school for production AI. One client, thirteen phases, and
            every deliverable graded by deterministic tests, a calibrated rubric judge, and a
            defend-your-work interview.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-ink-3">
            <span className="live-dot" aria-hidden />
            GRADING PIPELINE OPERATIONAL
          </p>
        </div>

        <FooterColumn
          title="Curriculum"
          links={[
            { href: "/curriculum", label: "13-Phase Map" },
            ...(first
              ? [{ href: `/units/${first.id}`, label: `Unit ${first.id} (live)` }]
              : []),
            { href: "/curriculum#capstone", label: "Capstone Standard" },
          ]}
        />

        <FooterColumn
          title="Verification"
          links={[
            { href: "/submit", label: "Submission Guide" },
            { href: "/#verification", label: "Four-Layer Engine" },
            { href: "/#method", label: "The Unit Loop" },
          ]}
        />

        <FooterColumn
          title="Accountability"
          links={[
            { href: "/pricing", label: "Pricing & Rebate" },
            { href: "/pricing#commitment", label: "Commitment Screen" },
            { href: "/faq", label: "FAQ" },
            { href: "/me", label: "Dashboard" },
          ]}
        />
      </div>

      <div className="border-t border-line">
        <div className="shell-wide flex flex-col gap-2 py-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            Honest status: Unit 3.2.1 is live with automated sandboxed grading. The full 13-phase
            curriculum is a published, open spec built phase by phase.
          </p>
          <p className="font-mono">© 2026 Keel Academy</p>
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
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-sm text-ink-3 transition-colors hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
