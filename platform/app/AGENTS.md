<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI/UX direction: UNDECIDED — including all copy and page structure

No visual design direction (theme, type, color, layout, spacing, motion,
iconography) AND no copy direction (voice, tone, terminology, naming,
marketing language) has been chosen for this app. Styling was torn down to
an unstyled semantic-HTML baseline and, on 2026-08-27, the founder lifted
the copy freeze as well; `app/globals.css` is intentionally empty.

The current markup AND the current strings are non-binding placeholders
inherited from a torn-down design. Do not infer, imitate, match, or
preserve them — including the ALL-CAPS status badges, the systems
terminology ("Submission Engine", "Learner Cockpit", "Git Ingestion
Protocol", "Meridian Map"), and the footer voice. Do not mine git history
for the removed design; it was removed so no session gets anchored to it.

What IS binding for a redesign session:

1. Routes, functionality, and data flows are preserved.
2. Content-as-data rendering and the honesty rules hold (honest
   placeholders, no fake states, no fake telemetry, no invented content).
3. The demo harnesses stay green: a session that changes copy or structure
   updates the demo greps to match the new copy (the greps assert
   placeholder copy; updating them is expected, not a violation) and
   re-runs demo-rebate, demo-gates, demo-map, and demo-practice before
   closing.
4. Every new word of copy is written under the humanizer and copywriting
   skills (a quality bar, not a voice).

Before writing any stylesheet or any copy, record BOTH the visual
direction and the copy direction in the repo-root `build-state.md`
decisions log.
