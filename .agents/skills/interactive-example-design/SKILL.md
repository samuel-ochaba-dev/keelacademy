---
name: interactive-example-design
description: Use this skill when designing hands-on interactive elements for a lesson — live code playgrounds, adjustable parameter demos/sliders, "predict the output" mini-quizzes, or practice exercises. Trigger it for requests like "add an interactive demo for X", "design a practice exercise for this lesson", "make this concept something learners can actually play with", or when building lesson content for a platform with embedded code editors or widgets. Also use it to review whether an existing exercise set is well-graduated in difficulty.
---

# Interactive Example Design

Reading about a concept and manipulating it are different learning experiences, and the second one is usually stronger. This skill covers how to design the interactive pieces of a lesson — demos, playgrounds, and exercises — so that they build a clean mental model rather than just being a fun toy bolted onto the text.

## Why interactivity has to be designed, not just added

An interactive widget only teaches something if manipulating it produces a clear, attributable change the learner can reason about. A demo with five knobs the learner can turn at once, or a wide-open blank code editor, technically qualifies as "interactive" but often teaches very little — there's too much surface area for the learner to isolate cause and effect. Good interactive design is really about _constraint_: showing exactly the right amount of freedom for the concept at hand.

## Principles for demos

**Isolate one variable at a time.** A demo introducing a single property or parameter should let the learner change only that thing, so the cause-and-effect relationship is unambiguous. Only combine multiple variables into one demo after each has been introduced and understood individually — combining early muddies which change caused which effect.

**Make the invisible visible.** Concepts that involve normally-invisible state — box boundaries, spacing, an axis a layout algorithm is using, execution order — benefit enormously from a demo that draws that state on screen (outlines, labeled axes, highlighted regions). Learners can then see the _mechanism_ producing an outcome, not just the outcome itself.

**Gate exploration with a prediction.** Right before (or immediately after introducing) an interactive demo, ask the learner to predict what a specific change will do, before they try it. This turns free-form poking into a small experiment the learner is testing a hypothesis with, which engages them more than exploration with no stakes.

**Include at least one demo that looks like something real.** Alongside minimal, isolated demos, include one demo per lesson (or major section) that resembles an actual UI pattern or real code a learner might write — a nav bar, a form, a card layout, a genuine function signature — so the abstract mechanism is visibly connected to something they'll actually build.

**Constrain the playground for beginners.** Especially early in a course, prefer a playground with preset starter code and a bounded scope over a blank editor. A blank canvas asks a beginner to solve two problems at once (what to build, and how) when the lesson is only trying to teach one. Open up scope gradually as a learner's course progresses.

## Principles for exercises

**Graduate difficulty explicitly, in three tiers:**

1. **Warm-up** — a single concept, applied directly, with an answer that should feel obvious if the lesson landed. This is a confidence check, not a challenge.
2. **Application** — combine 2-3 concepts from the lesson (or recent lessons) in a small, realistic task.
3. **Stretch / challenge** — open-ended: "here's a bug, find and fix it," or "build this from scratch given only a description or mockup." This tier is optional for the learner and should be clearly labeled as such, so skipping it doesn't feel like failure.

**Provide reasoning, not just an answer key.** A model solution should come with a short explanation of _why_ it works and what would go wrong with a plausible alternative approach — otherwise learners checking their work can only pattern-match against the sample answer rather than verify their own reasoning.

**Design for productive failure.** Where possible, exercises should be structured so an incorrect approach produces a visible, informative failure (a broken layout, a wrong output) rather than a silent one — a learner who sees exactly how their attempt failed learns more than one who's just told "incorrect."

**Plan a non-interactive fallback.** Any widget-based demo or exercise needs a fallback for learners who can't use it as built — keyboard-only navigation, a small/mobile screen, or a screen reader. At minimum this means a static image or written walkthrough that conveys the same idea, so the lesson doesn't have a hole in it for those learners. Build this alongside the interactive version, not as an afterthought once it's already shipped.

## Quick self-check

- Does each demo change exactly one thing at a time, or does it bundle several?
- Is any normally-invisible mechanism (spacing, order, boundaries) drawn visibly?
- Is there a predict-before-reveal moment attached to the demo?
- Is there at least one demo that resembles a real, recognizable UI pattern or piece of code?
- Do exercises clearly separate warm-up, application, and optional stretch tiers?
- Does the answer key explain reasoning, not just show the solution?
- Is there a static fallback for learners who can't use the interactive version?
