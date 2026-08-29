# Task 1 Brief: Design System & Styling Foundation

## Goal
Configure Tailwind CSS v4 in `platform/app/app/globals.css` with dark-first precision technical design tokens, and create core UI primitives in `platform/app/components/ui/`.

## Files
- Modify: `platform/app/app/globals.css`
- Create: `platform/app/components/ui/badge.tsx`
- Create: `platform/app/components/ui/button.tsx`
- Create: `platform/app/components/ui/card.tsx`

## Requirements
1. `platform/app/app/globals.css`:
   - Include `@import "tailwindcss";`
   - Set up `@layer base` or CSS custom properties for deep dark zinc theme:
     - bg: `#09090b` (zinc-950), text: `#f4f4f5` (zinc-100)
     - borders: `zinc-800` / `zinc-700`
     - surfaces: `zinc-900`
   - Provide styling for code blocks, pre tags, and clean font smoothing.
2. `components/ui/badge.tsx`:
   - Support variants: `default` (zinc), `success` (emerald), `warning` (amber), `danger` (rose), `info` (cyan/sky), `outline`.
   - Accessible, typed React component with `className` support.
3. `components/ui/button.tsx`:
   - Support variants: `primary` (sky/cyan or crisp high contrast white), `secondary` (zinc-800), `outline` (border-zinc-700), `ghost`, `danger`.
   - Support sizes: `sm`, `md`, `lg`.
   - Support `asChild` or standard HTML button attributes, plus link support.
4. `components/ui/card.tsx`:
   - Export `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
   - Dark technical aesthetic: `bg-zinc-900 border border-zinc-800 rounded-lg p-6` (or modular padding).

## Report Contract
Write complete report to `.superpowers/sdd/2026-08-29-ui-full-implementation/task-1-report.md`.
Return status: `DONE`, commits list, one-line summary, concerns.
