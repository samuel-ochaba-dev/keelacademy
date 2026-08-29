# Task 2 Brief: Global Shell & Layout

## Goal
Implement a cohesive, polished site layout with modern navigation (`SiteHeader`), educational philosophy footer (`SiteFooter`), and main layout wrapper in `platform/app/`.

## Files
- Modify: `platform/app/components/site-header.tsx`
- Modify: `platform/app/components/site-footer.tsx`
- Modify: `platform/app/app/layout.tsx`

## Requirements
1. `components/site-header.tsx`:
   - Keel Academy brandmark / logo with live "Verification Active" badge / pulse indicator.
   - Primary links:
     - `Curriculum` -> `/curriculum`
     - `Meridian Map` -> `/map`
     - `Verification & Submissions` -> `/me` (or submission history)
     - `Pricing & Rebates` -> `/pricing`
   - User account & session actions:
     - When signed in: display user email/id pill, link to `/me`, and Sign Out button (`/sign-out`).
     - When signed out: display Sign In (`/sign-in`) and Get Started / Sign Up (`/sign-up`) action buttons.
   - Fully styled with precision technical theme: sticky top header, frosted blur background (`backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800`), responsive layout.
2. `components/site-footer.tsx`:
   - Professional, honest engineering footer:
     - Brand identity & summary: "Keel Academy is a self-operating school for autonomous AI engineering. Zero teaching staff. Automated multi-layer verification. Real production deliverables."
     - Core links organized into categories:
       - **Curriculum**: Phase 0-3 Foundation, Meridian Pipeline, Verification Engine, Defend Your Work.
       - **Platform**: Submission Protocol, Sandbox CI, Spaced Retrieval, Completion Rebates.
       - **Principles**: Radical Honesty, Zero Mentors / Zero Fluff, Proof Before Credentials.
     - Bottom line: Copyright, version tag (`v2.0-clean-slate`), and offline status indicator if running locally.
3. `app/layout.tsx`:
   - Set up root html/body with `bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans antialiased`.
   - Embed `SiteHeader` at the top and `SiteFooter` at the bottom, wrapping `{children}` in a `flex-1` container.
   - Metadata: Title: "Keel Academy — The Self-Operating School for AI Engineers", description: "Zero teaching staff. Automated multi-layer verification. Real production deliverables."

## Report Contract
Write complete report to `.superpowers/sdd/2026-08-29-ui-full-implementation/task-2-report.md`.
Return status: `DONE`, commits list, one-line summary, concerns.
