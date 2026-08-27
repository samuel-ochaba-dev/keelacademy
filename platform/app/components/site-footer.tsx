import Link from "next/link";
import { listUnits } from "@/lib/content";

export function SiteFooter() {
  const units = listUnits();
  const first = units[0];

  return (
    <footer>
      <div>
        {/* Brand */}
        <div>
          <div>
            <span>Keel Academy</span>
          </div>
          <p>
            The engineering school for production AI. Build one continuous pipeline across 13 phases,
            verified on every git push by deterministic containers and evidence-backed code grading.
          </p>
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

      <div>
        <div>
          <p>
            SPECS: Unit 3.2.1 live with ephemeral container grading. Full 13-phase curriculum is an open, published architecture.
          </p>
          <p>© 2026 KEEL ACADEMY · ZERO MARKETING CRUFT</p>
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
      <p>{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
