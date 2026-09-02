---
name: lesson-authoring
description: Use this skill as the entry point whenever asked to write a brand-new lesson, module, or chapter for an online coding/technical school from scratch — from intake through a shippable draft. Trigger it for requests like "write a lesson on X for our course", "author module 3 of the curriculum", "turn this rough outline into a full lesson", "draft the next chapter on Y", or "this lesson needs a rewrite, start over." It orchestrates lesson-architecture, concept-explainer, lesson-voice-and-tone, and interactive-example-design into one authoring pass, and adds the intake questions and final QA checklist that no single one of those skills covers alone. Not for marketing/landing page copy — use course-sales-copywriting for that instead.
---

# Lesson Authoring

The four craft skills — `lesson-architecture`, `concept-explainer`, `lesson-voice-and-tone`, and `interactive-example-design` — are each precise about _one_ dimension of a good lesson. None of them, alone, tells you what order to work in, what to find out before you start typing, or how to check a finished draft against all four standards at once. That's what this skill is for: it's the workflow that sequences the others, plus the two things they don't cover — intake and final QA.

## Why sequence matters

Applying these skills out of order wastes work. A beautifully-voiced pass over a badly-sequenced outline just means rewriting warm prose after the structure changes. Designing an interactive demo before deciding whether a concept even needs `concept-explainer`'s full treatment means possibly building a widget for something that only needed two sentences. Work top-down: structure first, then explanation technique for the hard parts, then voice throughout, then interactivity, then a single QA pass at the end.

## Step 0: Intake

Before drafting anything, establish (ask if it's missing and can't be reasonably inferred — but don't stall on minor items; assume sensible defaults and note the assumption):

- **Topic and scope.** What concept(s) does this lesson need to cover? Is it one idea or several?
- **Audience level.** Complete beginner, has fundamentals but shaky, or experienced dev leveling up a specific gap? This determines how much scaffolding versus how much speed.
- **Prerequisites.** What can be assumed as already known versus what needs a brief re-grounding?
- **Curriculum position.** What lesson comes immediately before this one, and what comes after? This feeds the "meet their current mental model" step and the closing bridge.
- **Scope target.** Rough length, or a signal for whether this topic should split into two lessons.
- **Platform capabilities.** Does the platform support embedded interactive widgets and live code playgrounds, or is this static text/video only? This determines whether `interactive-example-design` applies at all, or whether its techniques need a static substitute (see Step 3).
- **House style beyond the default voice.** Any brand-specific terminology, banned words, or existing style guide constraints that sit on top of `lesson-voice-and-tone`.

## Step 1: Outline with lesson-architecture

Produce the skeleton before writing any prose:

- The hook (demo, surprising result, or "guess what happens" question)
- The promise statement
- The naive assumption the lesson will push against, if there is one
- An ordered list of concepts, one per section
- Where recap checkpoints land (after roughly every 3 new concepts)
- The closing: acknowledgment, synthesis, next action, bridge forward

While outlining, tag each concept as either **plain** (a short, direct explanation will do) or **hard** (commonly confused, needs the full `concept-explainer` treatment). Also tag each section as **interactive-eligible** or **static-only** based on the platform capabilities from intake.

## Step 2: Draft section by section

- For **plain** concepts: write the explanation directly, following the outline's structure.
- For **hard** concepts: apply `concept-explainer` in full — lead with the problem, build intuition before formal vocabulary, pick one well-mapped analogy and flag where it breaks, name the specific wrong assumption learners bring, and include a predict-then-check moment.
- Apply `lesson-voice-and-tone` inline as you write each section, not as a separate pass afterward. It's easier to write warmly the first time — direct address, an honest admission of difficulty where it fits, a bolded spine of key sentences — than to retrofit warmth into already-flat prose.

## Step 3: Design interactive elements

For each section tagged interactive-eligible in Step 1, apply `interactive-example-design`: isolate one variable per demo, make invisible state visible, gate exploration behind a prediction, include at least one demo resembling a real pattern, and graduate any exercises from warm-up to application to optional stretch.

If the platform is static-only, don't skip the underlying techniques — translate them:

- A live demo becomes a worked example with before/after states shown explicitly.
- "Predict before reveal" becomes a direct rhetorical question to the reader, followed by the answer in the next paragraph, rather than an interactive gate.
- "Make invisible state visible" becomes an annotated diagram or labeled code comment instead of a live visualization.

The pedagogical function survives the format change even when the format itself has to.

## Step 4: Assemble and gap-check against the outline

- Confirm every item from the Step 1 outline actually made it into the draft, in order.
- Confirm recap checkpoints are physically present at the planned points, not just planned.
- Confirm the closing does all three things: acknowledges the climb if the lesson was dense, synthesizes the shift in understanding in a sentence or two, and points forward to what's next and why it matters.

## Step 5: Final QA — one combined pass

Run this single checklist instead of reopening all four skill files individually:

**Structure** (`lesson-architecture`)

- [ ] Opens with a hook, not a definition
- [ ] Promise is stated concretely in the first few sentences
- [ ] Exactly one new concept per section, each with its own example
- [ ] Gotchas live next to the concept they belong to, not exiled to the end
- [ ] Recap checkpoint present after any run of 3+ new concepts
- [ ] Closing acknowledges, synthesizes, and bridges forward

**Explanation** (`concept-explainer`, for sections tagged hard)

- [ ] Problem/pain shown before the concept is named
- [ ] Intuition built before formal terminology is introduced
- [ ] One well-mapped analogy used, with its breaking point acknowledged
- [ ] The specific wrong assumption learners bring is named and addressed directly
- [ ] At least one predict-then-check moment

**Voice** (`lesson-voice-and-tone`)

- [ ] Written in "we"/"you," not third person
- [ ] No "obviously," "simply," "just," or "easily" sitting in front of a step
- [ ] Bolded sentences alone tell the story if you skim only those
- [ ] Difficulty is named out loud somewhere if the lesson was genuinely dense

**Interactivity** (`interactive-example-design`, where applicable)

- [ ] Each demo isolates one variable
- [ ] A static fallback exists for anything interactive
- [ ] Exercises are graduated (warm-up / application / optional stretch)
- [ ] Answer explanations include reasoning, not just the solution

If a box can't be checked, that's the specific thing to fix — not a reason to rewrite the whole lesson from scratch.

## Worked example (condensed)

**Intake:** Topic is Big-O notation. Audience has fundamentals (knows loops and functions) but hasn't seen complexity analysis. Comes right after a lesson on loops; comes right before a lesson on choosing data structures. Platform supports interactive widgets. Target: one lesson, no split needed.

**Step 1 outline (excerpt):**

- Hook: two functions that both "find a value in a list," one visibly slower on a huge input — before any definition of Big-O
- Promise: "by the end, you'll be able to look at a piece of code and predict roughly how it'll behave as input grows"
- Naive assumption to push against: "faster code just means better code, regardless of input size"
- Concepts, in order: what "grows with input" means (plain) → O(1) vs O(n) (hard — classic point of confusion) → O(n²) via nested loops (hard) → why constants don't matter for Big-O (hard, frequently misunderstood) → recap checkpoint → picking the right approach in practice (plain)
- Closing: acknowledge that complexity analysis feels abstract at first, synthesize "you're now judging code by how it scales, not just whether it runs," bridge to the next lesson on data structures

**Step 2 draft excerpt, applying concept-explainer + voice to the O(1) vs O(n) section:**

> Here's a question that seems like it should have an obvious answer: is `array[500]` slower to look up than `array[5]`? Most people's gut says yes — surely reaching further into a list takes more work.
>
> It doesn't. And once you see why, a whole category of code behavior stops being mysterious.
>
> An array knows exactly where element 500 lives, the same way it knows where element 5 lives — it's just some arithmetic on a starting address. Grabbing it takes the same amount of work regardless of the array's size. We call this **O(1)**, or constant time: the work doesn't grow as the input grows.
>
> Now compare that to searching for a value you don't know the position of. There's no shortcut — in the worst case, you check every element until you find it (or don't). Double the list, and you roughly double the worst-case work. That's **O(n)**: the work scales directly with input size.
>
> Try it yourself: [interactive demo — a slider controls array size, and two counters tick up live showing "operations to fetch index N" staying flat, versus "operations to find value X" climbing with size]

**Step 3:** The demo above is tagged interactive-eligible — single variable (array size), invisible state made visible (a live operation counter), predict-gated ("before you drag the slider, guess whether the O(1) counter will move at all").

**Step 5 QA:** Hook present (two functions, one visibly slower) ✓. Promise concrete ✓. O(1)/O(n) section names the actual wrong assumption ("further = slower") before correcting it ✓. Demo isolates one variable ✓. Static fallback needed for this demo before shipping — not yet written, flagged for follow-up.

That last line is the point of the QA step: it catches a specific, fixable gap instead of a vague "looks good."

## When to route elsewhere instead

- Writing the course's landing page, FAQ, or enrollment copy → `course-sales-copywriting`, not this skill.
- A request that's purely about line-level tone on existing lesson text, with no structural or explanatory work needed → `lesson-voice-and-tone` alone is probably faster than the full pipeline.
