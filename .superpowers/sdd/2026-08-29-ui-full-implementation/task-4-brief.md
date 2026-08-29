# Task 4 Brief: Unit Workspace & 5-Step Pedagogy

## Goal
Implement a world-class, precision technical Unit Workspace (`app/units/[id]/page.tsx` and all `components/unit/*` sections) that delivers the 5-step learning sequence: **Learn**, **Practice**, **Build**, **Verify**, and **Unstuck**.

## Files
- Modify: `platform/app/app/units/[id]/page.tsx`
- Modify: `platform/app/components/unit/learn-section.tsx`
- Modify: `platform/app/components/unit/practice-section.tsx`
- Modify: `platform/app/components/unit/build-section.tsx`
- Modify: `platform/app/components/unit/verify-section.tsx`
- Modify: `platform/app/components/unit/unstuck-section.tsx`

## Requirements
1. **Unit Header & Context HUD**:
   - Breadcrumbs: `Curriculum / Phase X / Unit ID`
   - Phase badge, estimated load, and verification tier badge (e.g. `Tier 1: Deterministic` / `Tier 2: Rubric Judge` / `Tier 3: Defend`).
   - Clean tabbed or segmented navigation for the 5 sections: `1. Learn`, `2. Practice`, `3. Build`, `4. Verify`, `5. Unstuck`.
2. **Section 1: Learn (`learn-section.tsx`)**:
   - Clean typography and formatting for the lesson text (Concept Core, Applied Context, Tool Specifics).
   - Crisp Markdown rendering with syntax-highlighted / styled code blocks, callouts, and key takeaway boxes.
   - Retrieval practice seeds / questions formatted with interactive reveal/check toggles.
3. **Section 2: Practice (`practice-section.tsx`)**:
   - **Worked Example**: Side-by-side or clean expandable display with line-by-line annotations explaining *why* decisions were made.
   - **Completion Problem**: The scaffolded challenge with gap markers (`GAP_...`), live gap count badge, and reference checking instructions.
4. **Section 3: Build (`build-section.tsx`)**:
   - Deliverable specification card: required repository structure (`extract_claims.py`, `schemas.py`, test files).
   - CLI contract table with exact flags (`--data`, `--out`, `--log`).
   - One-click copyable git push instructions and sandbox execution constraints (CPU, memory, timeout).
5. **Section 4: Verify (`verify-section.tsx`)**:
   - **Layer 1 Checks**: Matrix of deterministic automated checks with command and assertion types (`exit_zero`, `output_contains`).
   - **Layer 2 Rubric Matrix**: Criteria table detailing required behaviors and evidence expectations.
   - **Layer 3 Defend Preview**: Explanation of the code-specific follow-up questions asked upon passing L1–L2.
   - Direct CTA button: "Submit Your Repository" / "View Grading Verdicts".
6. **Section 5: Unstuck (`unstuck-section.tsx`)**:
   - Common failure modes accordion/cards pre-populated with actual pitfalls.
   - Concierge assistance card explaining teach mode vs guard mode.
   - Link to dedicated unit FAQ page (`/faq/[id]`).

## Report Contract
Write complete report to `.superpowers/sdd/2026-08-29-ui-full-implementation/task-4-report.md`.
Return status: `DONE`, commits list, one-line summary, concerns.
