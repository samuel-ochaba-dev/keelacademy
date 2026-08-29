# Task 6 Brief: Account Dashboard, Map, Pricing & Checkout

## Goal
Implement the student account dashboard (`app/me/page.tsx`), the visual Meridian progression map (`app/map/page.tsx`), transparent pricing (`app/pricing/page.tsx`), checkout (`app/checkout/page.tsx`), curriculum directory (`app/curriculum/page.tsx`), and auth screens (`app/sign-in/page.tsx`, `app/sign-up/page.tsx`, `app/sign-out/page.tsx`).

## Files
- Modify: `platform/app/app/me/page.tsx`
- Modify: `platform/app/app/map/page.tsx`
- Modify: `platform/app/app/pricing/page.tsx`
- Modify: `platform/app/app/checkout/page.tsx`
- Modify: `platform/app/app/curriculum/page.tsx`
- Modify: `platform/app/app/sign-in/page.tsx`
- Modify: `platform/app/app/sign-up/page.tsx`
- Modify: `platform/app/app/sign-out/page.tsx`

## Requirements
1. **Account Dashboard (`app/me/page.tsx`)**:
   - Student profile card with email, active enrollment status, and enrollment date.
   - **Live Rebate Tracker**:
     - Visual progress meter of earned refunds (e.g. `$300 earned / $600 max rebate`).
     - Breakdown of milestones: Phase 5 Integration Gate ($300) and Capstone Delivery ($300) with window expiry countdown / status chips.
   - **Enrolled Units Grid**: Quick-resume cards with unit ID, title, phase, and progress state.
   - **Submission History Feed**: Chronological list of student submissions with commit SHA, unit link, timestamp, and instant verdict chips.
2. **Meridian Progression Map (`app/map/page.tsx`)**:
   - Visual node map / tree graph of the 12 phases and their pipeline components:
     - Ingestion & Triage -> Extraction & Schemas -> RAG & Retrieval -> Agent Orchestration -> Eval & Guardrails -> Discovery Simulation -> Capstone.
   - Live gate status indicators (Locked, Unlocked, Completed) and phase badge summaries.
3. **Transparent Pricing (`app/pricing/page.tsx`)**:
   - One-time tuition card ($1,950 one-time, or configurable).
   - **Completion Rebate Guarantee**: Up to $600 (30%) refunded automatically upon verified gate completions.
   - Feature comparison: Self-Operating vs Traditional Mentors (highlighting unlimited verification reps, private golden sets, sandboxed environments).
   - CTA to `/checkout`.
4. **Checkout (`app/checkout/page.tsx`)**:
   - Clear enrollment summary, payment method breakdown (Stripe integration or offline dev checkout), and guarantee reminder.
5. **Curriculum Index (`app/curriculum/page.tsx`)**:
   - Comprehensive phase-by-phase directory listing all units, lesson titles, and verification criteria counts.
6. **Auth Pages (`sign-in`, `sign-up`, `sign-out`)**:
   - Styled dark-first login, registration, and logout confirmation cards with support for offline dev credentials and Clerk.

## Report Contract
Write complete report to `.superpowers/sdd/2026-08-29-ui-full-implementation/task-6-report.md`.
Return status: `DONE`, commits list, one-line summary, concerns.
