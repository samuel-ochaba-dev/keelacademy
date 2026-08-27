# Keel Academy learner app

## UI/UX STATUS: UNDECIDED — including all copy

**No UI/UX direction AND no copy direction has been decided for this app.**
A previous design system and a later full redesign were both fully torn
down at the founder's direction, and on 2026-08-27 the copy freeze was
lifted too. What remains is deliberate: every surface renders as plain,
unstyled semantic HTML with zero CSS applied.

Do not treat anything about the current presentation as a design decision
— not the structure, ordering, markup patterns, and NOT the copy strings
either. The current text (ALL-CAPS badges, "Submission Engine", "Learner
Cockpit", "Meridian Map", the footer voice) is placeholder copy inherited
from the torn-down design; it carries no voice decision and will be
rewritten from scratch. Do not mine git history for the removed design.

A future session chooses the visual direction and writes the copy from
scratch, recording both decisions in the repo-root `build-state.md`
decisions log before writing either.

What IS decided and must be preserved: routes, functionality, data flows,
content-as-data rendering, and the honesty rules. The demo harnesses
(demo-rebate, demo-gates, demo-map, demo-practice) grep the current
placeholder copy — a session that rewrites copy updates those greps to
match and re-runs all four demos green before closing.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Keel Academy learner app

Server-rendered Next.js app. Content (units, lessons, checks) is read as
data from the content tree; grading state comes over HTTP from the grading
core (read-only reader), never from a direct database connection.

S2.5 surfaces: offline-or-Clerk auth (see `lib/auth.ts`), `/me` (enrollments
plus your own submissions), `/sign-in` `/sign-up` `/sign-out`, Stripe
checkout via the grading core's enroll service, and account-gated verdict
pages. Server env (never committed; `NEXT_PUBLIC_` carries only the public
Clerk publishable key):

    KEEL_READER_URL     read-only grading endpoint (S2.4)
    KEEL_ENROLL_URL     enrollment service base URL
    KEEL_ENROLL_SECRET  shared app token for that service
    KEEL_OFFLINE_AUTH_SECRET  signs offline-fake session cookies (dev only)
    KEEL_OFFLINE_AUTH_STORE  offline identity store path (default /tmp)
    CLERK_SECRET_KEY / NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  real wiring

Without Clerk keys the app runs in offline mode: the deterministic auth fake
(pages say so) plus, when the enroll service points at the fake Stripe, the
whole sign-up -> checkout -> enrollment loop with no credentials and no
network. Production wiring: `platform/FOUNDER-WIRING.md`.
