# Keel Academy Full UI & Copy Redesign Specification

**Date:** 2026-08-29  
**Status:** Approved  
**Author:** AI Engineer / Lead Designer  

---

## 1. Executive Summary & Goals

This specification defines the clean-slate visual design system, UI components, and brand copy for the Keel Academy learner application (`platform/app`).

### Core Objectives
1. **Precision Technical Aesthetic**: Establish a modern, dark-first, high-density technical developer aesthetic (deep zinc/slate, crisp borders, monospace code accents, vibrant functional badges).
2. **Honest & Direct Copywriting**: Replace all temporary unstyled placeholder strings with clear, benefit-driven, fluff-free copy adhering to the Keel Academy honesty rules and conversion copywriting standards.
3. **Preserve Functionality & Demos**: Retain all existing server-side routes, data flow contracts (content-as-data, reader service API), and ensure all verification test suites and demo scripts (`demo-rebate`, `demo-gates`, `demo-map`, `demo-practice`) pass.

---

## 2. Design System Architecture

### 2.1 Theme & Color Palette
Tailwind CSS v4 variables defined in `app/globals.css`:
- **Backgrounds**:
  - Base: `#09090b` (zinc-950)
  - Surface Raised: `#18181b` (zinc-900)
  - Surface Overlay / Cards: `#27272a` (zinc-800)
- **Borders & Dividers**:
  - Subtle: `rgba(255, 255, 255, 0.08)` / `zinc-800`
  - Strong: `rgba(255, 255, 255, 0.16)` / `zinc-700`
- **Text & Foreground**:
  - Primary: `#f4f4f5` (zinc-100)
  - Secondary / Muted: `#a1a1aa` (zinc-400)
  - Tertiary / Subtle: `#71717a` (zinc-500)
- **Functional & Accent Colors**:
  - Primary Action / Interactive: Cyan / Sky (`#0ea5e9` / `#38bdf8`)
  - Verification Pass / Verified Gates / Earned Rebate: Emerald (`#10b981` / `#34d399`)
  - Pending / Active Grading / In Progress: Amber (`#f59e0b` / `#fbbf24`)
  - Verification Fail / Blocked / Error: Rose / Red (`#f43f5e` / `#fb7185`)

### 2.2 Typography & Spacing
- **Sans-Serif Font**: `Inter`, `-apple-system`, `system-ui` for readable prose and structured interface tables.
- **Monospace Font**: `JetBrains Mono`, `Geist Mono`, `ui-monospace` for code snippets, criterion keys, test IDs, and SHA hashes.
- **Micro-Interactions & Surfaces**: Subtle hover transitions (`transition-colors duration-150`), crisp border radiuses (`rounded-lg`, `rounded-md`), and high-contrast focus rings for accessibility.

---

## 3. Route & Component Architecture

### 3.1 Global Chrome (`SiteHeader`, `SiteFooter`)
- **`components/site-header.tsx`**:
  - Brand identity: `Keel Academy` logo with live status indicator.
  - Primary Navigation: `Curriculum`, `Meridian Map`, `Verification & Submissions`, `Pricing`.
  - Auth Action: Session status, User email badge / `/me` link, Sign In / Sign Up / Sign Out buttons.
- **`components/site-footer.tsx`**:
  - Philosophy statement: "Zero teaching staff. 4-layer verification engine. Pure engineering competence."
  - Quick links to curriculum, methodology, honest pricing, and git submission protocol.

### 3.2 Homepage (`app/page.tsx`)
- **Hero Section**:
  - Headline: "The Self-Operating School for AI Engineers."
  - Subheadline: "No video lectures. No teaching assistants. Ship real autonomous systems against automated test suites and a multi-layer verification judge."
  - Action CTAs: `Explore Curriculum` (Primary) and `View Grading Architecture` (Secondary).
- **Core Pillars**:
  1. *Layered Verification Engine*: Deterministic sandbox checks + LLM rubric judge + defend-your-work interviews.
  2. *The Meridian System*: A single, continuous end-to-end production AI pipeline across 150+ units.
  3. *Honest Commitment & Rebates*: Pay for the bar, earn back completion rebates when you ship verified systems.

### 3.3 Unit Workspace (`app/units/[id]/page.tsx` & `components/unit/*`)
- Structured layout with 5 distinct pedagogical tabs/sections:
  1. **Learn**: High-readability technical documentation styling with clean prose formatting, callout notes, and code blocks.
  2. **Practice**: Interactive tab hosting worked examples (annotated parallel tasks) and completion problems with live gap checks.
  3. **Build**: Clear deliverable specifications, required CLI contracts (`--data`, `--out`, `--log`), and git push instructions.
  4. **Verify**: The explicit multi-criterion rubric table, Layer 1 automated test expectations, and Layer 3 defense preview.
  5. **Unstuck**: Anticipated common failure modes, sandbox tips, and concierge prompts.

### 3.4 Submission HUD & Verdicts (`app/submissions/[id]/page.tsx`, `components/submission/*`)
- **Real-Time Status Banner**: Queued, Grading, Graded, or Error.
- **Layer 1 Matrix**: Sandbox checks, execution time, memory usage, exit code, and test assertions.
- **Layer 2 Matrix**: Rubric criteria breakdown with exact quotes of submitted code cited as evidence.
- **Layer 3 Matrix**: Defend-your-work questions tied to specific lines of the submission.
- **Action Toolbar**: "Submit New Revision" / "View in Meridian Map".

### 3.5 Account & Progress Dashboard (`app/me/page.tsx`, `app/map/page.tsx`)
- **`/me`**:
  - Student profile, active enrollments, and live Rebate Tracker (showing earned refunds and upcoming window milestones).
  - Chronological submission stream with instant verdict status chips.
- **`/map`**:
  - Visual node map of the 12 phases and Meridian pipeline components (ingestion, triage, extraction, evaluation, orchestration, simulation).

### 3.6 Pricing & Checkout (`app/pricing/page.tsx`, `app/checkout/page.tsx`)
- Transparent one-time tuition model.
- Detailed breakdown of the completion rebate mechanism (earned cash back for shipping on schedule).
- Zero-TA positioning statement explaining why no human mentors exist.

---

## 4. Copywriting & Voice Standards

1. **Active, Clear, and Direct**: No passive constructions or fluff adjectives like "revolutionary" or "cutting-edge".
2. **Technical Honesty**: Clearly declare time commitments (700–950 hours) and prerequisites.
3. **No False Promises**: We guarantee a verified, defended portfolio and machine-checked competence—not client guarantees.

---

## 5. Verification & Testing Gate
All changes must be validated against:
1. `npm run build` & `npm run lint` in `platform/app`.
2. Content schema validation (`python content/tools/validate-all.py` or equivalent).
3. Demo harness checks in `platform/grading` to ensure updated copy strings are matched cleanly.
