# Keel Academy Full UI & Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete, clean-slate UI and high-converting, honest copywriting for the Keel Academy Next.js learner application.

**Architecture:** Tailwind CSS v4 styling system with a precision-technical dark aesthetic, modular React components for unit workflows, submissions HUD, and account dashboard, with zero breaking changes to existing data flows or server reader APIs.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Marked, YAML.

**Spec:** `docs/superpowers/specs/2026-08-29-ui-copy-design.md`

## Global Constraints
- Do not take hints from git history.
- Preserve all existing server routes, reader service integration, and authentication contracts.
- Use plainspoken, active, benefit-driven copy adhering to the copywriting skill (no corporate fluff or exaggerated hype).
- Verify with `npm run build` and `npm run lint` in `platform/app` upon completion.

---

### Task 1: Design System & Styling Foundation (`app/globals.css`, UI primitives)

**Files:**
- Modify: `platform/app/app/globals.css`
- Create: `platform/app/components/ui/badge.tsx`
- Create: `platform/app/components/ui/button.tsx`
- Create: `platform/app/components/ui/card.tsx`

- [ ] **Step 1: Configure Tailwind CSS v4 in `globals.css`**
  Add `@import "tailwindcss";` and custom dark/slate design tokens for surfaces, borders, text, and functional accents.

- [ ] **Step 2: Create reusable UI primitives**
  Implement accessible, typed primitives for Badges, Buttons, and Cards with status variants (emerald, amber, rose, sky, zinc).

---

### Task 2: Global Shell & Layout (`site-header.tsx`, `site-footer.tsx`, `layout.tsx`)

**Files:**
- Modify: `platform/app/components/site-header.tsx`
- Modify: `platform/app/components/site-footer.tsx`
- Modify: `platform/app/app/layout.tsx`

- [ ] **Step 1: Implement `site-header.tsx`**
  Build clean top navigation with Keel Academy logo, curriculum links, Meridian map shortcut, and live auth state.

- [ ] **Step 2: Implement `site-footer.tsx`**
  Build minimalist footer featuring the core philosophy and quick links.

- [ ] **Step 3: Update `layout.tsx`**
  Apply base theme classes, font family configuration, and structure.

---

### Task 3: Homepage & Value Proposition (`app/page.tsx`)

**Files:**
- Modify: `platform/app/app/page.tsx`

- [ ] **Step 1: Rewrite Hero Section**
  Apply conversion copywriting: "The Self-Operating School for AI Engineers" with clear action CTAs.

- [ ] **Step 2: Build Interactive Feature & Method Cards**
  Highlight 4-layer verification, the continuous Meridian project, and the completion rebate model.

---

### Task 4: Unit Workspace & 5-Step Pedagogy (`app/units/[id]/page.tsx` & components)

**Files:**
- Modify: `platform/app/app/units/[id]/page.tsx`
- Modify: `platform/app/components/unit/learn-section.tsx`
- Modify: `platform/app/components/unit/practice-section.tsx`
- Modify: `platform/app/components/unit/build-section.tsx`
- Modify: `platform/app/components/unit/verify-section.tsx`
- Modify: `platform/app/components/unit/unstuck-section.tsx`

- [ ] **Step 1: Style and format Unit Workspace header and navigation tabs**
- [ ] **Step 2: Refine Learn, Practice, Build, Verify, and Unstuck sections with rich technical styling**

---

### Task 5: Submissions HUD & Verification Verdicts (`app/submissions/[id]/page.tsx`)

**Files:**
- Modify: `platform/app/app/submissions/[id]/page.tsx`
- Modify: `platform/app/components/submission/verdict-view.tsx`
- Modify: `platform/app/components/submission/check-list.tsx`

- [ ] **Step 1: Implement real-time grading status banner**
- [ ] **Step 2: Render Layer 1 deterministic checks and Layer 2 LLM judge criteria with quoted evidence snippets**

---

### Task 6: Account Dashboard, Map, Pricing & Checkout

**Files:**
- Modify: `platform/app/app/me/page.tsx`
- Modify: `platform/app/app/map/page.tsx`
- Modify: `platform/app/app/pricing/page.tsx`
- Modify: `platform/app/app/checkout/page.tsx`

- [ ] **Step 1: Update `/me` with student profile and live Rebate Tracker**
- [ ] **Step 2: Style the `/map` Meridian progression graph**
- [ ] **Step 3: Update `/pricing` and `/checkout` with transparent tuition details**

---

### Task 7: Build & Verification Gate

- [ ] **Step 1: Run `npm run build` in `platform/app`**
- [ ] **Step 2: Run `npm run lint` in `platform/app`**
- [ ] **Step 3: Record UI and copy decisions in `build-state.md`**
