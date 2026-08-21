# Worked Example — "Untangling Git"

A short, complete demonstration of the technique end to end, for a fictional
course. Everything below is original, invented for this example — never
reuse it verbatim for a real project. It exists to show the pattern in
motion, not to be copy-pasted.

## Input (what the user gave us)

- **Course**: teaches Git to backend developers who "know the five
  commands" but panic at merge conflicts, rebasing, and detached HEAD
  states.
- **Instructor**: 12 years as a backend engineer, ran internal Git
  workshops at two companies, once accidentally force-pushed over a
  teammate's work in their second year (real, embarrassing, usable).
- **Format**: interactive course with a real sandboxed Git playground (a
  live terminal in the browser) plus short video walkthroughs.
- **Price**: $149 one-time, 30-day refund, no subscription.
- **Proof**: 3 real testimonials, 1 real company logo (a mid-size startup),
  no big-name endorsers yet.

## Output (drafted copy)

### Hero

> **Stop fearing `git rebase`.**
>
> An interactive course that teaches backend developers the mental model
> behind Git, not just the commands to memorize.
>
> Taught by [Name] — 12 years of backend work, and at least one Git
> disaster you'll hear about.

### Pain section

> You know the five commands. `add`, `commit`, `push`, `pull`, `status`.
> You've been using them for years.
>
> Then a merge conflict shows up, or someone mentions rebasing, and
> something changes. You start Googling the exact same Stack Overflow
> answer you Googled last time. You copy the commands without really
> knowing why they worked. And when it works, you feel relief, not
> understanding.
>
> That's not because Git is impossible. It's because almost nobody teaches
> you the actual model Git uses to track your work — just the incantations
> that usually get you unstuck.

### Reframe + pivot

> Git isn't actually that complicated, once you can see the tree it's
> building behind the scenes. Most of the terrifying stuff — rebasing,
> detached HEAD, force-pushing — makes total sense once you have that
> picture in your head.
>
> I want to give you that picture.

### Curriculum module example

> **Module 2 — Rebasing Without Losing Your Mind**
>
> Rebasing has a terrifying reputation, mostly because most tutorials show
> you the command without showing you what's actually moving.
>
> _By the end of this module, you'll be able to picture exactly what a
> rebase does to your commit tree before you run it, and undo it calmly if
> it goes sideways._
>
> - What a rebase actually rewrites (and why your commit hashes change)
> - The three genuinely different `git rebase` outcomes you'll run into
> - Recovering from a bad rebase using the reflog, live in the sandbox

### Bio snippet

> In my second year as a backend developer, I force-pushed over three days
> of a teammate's work. Not because I was reckless — because I didn't
> actually understand what `push --force` did, only that it "fixed" my
> broken branch.
>
> I've spent the years since then actually learning Git properly, and
> running internal workshops to teach other engineers the same mental
> model. This course is that workshop, built for the internet.

### FAQ snippet

> **Is there a subscription, or does this expire?**
> Nope — it's a one-time $149 payment. You keep access for as long as the
> course exists, including future updates.
>
> **I already use Git every day. Will I actually learn anything?**
> If you've never had a rebase go wrong on you, maybe not! But if you've
> ever quietly Googled "how to undo a git rebase" at 2am, this course is
> built for exactly that moment.

## What to notice

- Every "hype" claim is replaced by a concrete, checkable detail (a
  specific bug, a specific command, a specific real mistake).
- The bio uses one true, embarrassing story instead of a credentials list
  alone — it does more trust-building work than "12 years of experience"
  by itself.
- The FAQ answer admits a real limitation ("maybe not!") before making its
  case — that's what makes the case that follows credible.
- Nothing here is a fabricated statistic, quote, or logo. Real numbers
  ($149, 12 years, 30-day refund) are the user's actual facts; anything not
  provided (testimonial text, the company logo) stays out of this draft
  rather than getting invented.
