---
name: lesson-architecture
description: Use this skill whenever planning or restructuring the shape of a full lesson, tutorial, module, or chapter for an online coding/technical school — deciding what comes first, how concepts are sequenced, where exercises and recaps go, and how the lesson opens and closes. Trigger it for requests like "write a lesson on X", "outline a module covering Y", "this lesson feels like a wall of text, help me restructure it", or "how should I sequence these topics." This governs whole-lesson shape; pair it with lesson-voice-and-tone for line-level prose and concept-explainer for explaining a specific hard idea within a section.
---

# Lesson Architecture

A lesson that teaches the same facts as another lesson can still land completely differently depending on the order things arrive in and where the reader is allowed to pause. This skill lays out a reusable blueprint — modeled on the structure used by the best interactive coding tutorials online — for shaping a lesson so that difficulty is introduced gradually and the learner never has to hold more new information than they can absorb.

## Why sequencing is the real content

A learner's working memory fills up fast. Two lessons can contain identical facts and produce wildly different outcomes depending on whether those facts arrive one at a time with room to breathe, or all at once in a dense block. Architecture — not just word choice — is a primary lever for how much of a lesson actually sticks.

## The blueprint

**1. Hook before formalism.** Open with something concrete: a live demo, a surprising outcome, a "guess what this does" question, or a glimpse of the payoff (what the learner will be able to build once they understand this). Do this _before_ any formal definition. A definition-first opening asks the learner to care about an abstraction before they've seen why it matters; a hook-first opening earns their attention first.

**2. Name the promise.** In a sentence or two, say exactly what mental model or capability the learner will walk away with. Be concrete enough that they could tell, later, whether the lesson delivered.

**3. Meet the learner's current (incomplete) model.** Briefly describe the naive assumption most learners bring to this topic — not to mock it, but so the lesson has something to push against. It's much easier to update a mental model the reader can see named on the page than to silently overwrite one that was never acknowledged.

**4. Introduce exactly one new idea per section.** For each concept:

- a short, plain-language explanation
- a concrete example or interactive demo showing it in action
- one paragraph connecting it back to the bigger picture ("why this matters" / "where you'll use this")

Resist the urge to introduce two related properties or ideas in the same breath just because they're related — sequence them, even if it means a slightly longer lesson. Related concepts are exactly where learners conflate things.

**5. Predict-then-reveal checkpoints.** Periodically stop and ask the learner to guess an outcome before showing it ("what do you think happens if we change this value?"). This briefly converts a passive read into active recall, which is one of the most reliable ways to make material stick.

**6. Call out gotchas where they'd actually happen, not in a FAQ at the end.** If there's a common mistake associated with a concept, flag it as a distinct callout right after introducing that concept — at the exact point a learner would naturally trip over it — rather than bundling all caveats into a troubleshooting section nobody reads until they're already stuck.

**7. Chunk with recap checkpoints.** After a dense stretch (roughly: whenever three or more new ideas have piled up without a pause), insert a short recap — a few bullet points restating what's been covered — before moving on. Treat this as a checkpoint for cognitive load, not filler; it's the moment a learner can confirm they're still following before more weight gets added.

**8. Close by acknowledging the climb, then synthesizing.** Don't just summarize facts. Name that the material was genuinely dense if it was, restate the big shift in understanding in one or two sentences, and give one concrete next action — an exercise, a challenge, or the next lesson.

**9. Bridge forward.** End by pointing to what comes next and briefly why it matters, so the learner carries momentum into the next lesson instead of landing on a flat stop.

## Template outline

```
# [Lesson Title — name the concept plainly]

[Hook: demo / surprising result / "guess what happens" — no definitions yet]

[1-2 sentence promise: what you'll understand by the end]

[Optional: name the naive assumption most learners start with]

## [Concept 1 — smallest useful unit]
- plain explanation
- concrete example / demo
- why it matters
- (if relevant) predict-then-reveal moment
- (if relevant) common-mistake callout right here

## [Concept 2 — builds on Concept 1]
- ...same pattern...

[Recap checkpoint after ~3 concepts]

## [Concept 3+ / more advanced combination]
- ...

## Closing
- acknowledge difficulty if the lesson was dense
- synthesize the big shift in understanding
- one concrete next action
- bridge to what's next
```

## Sizing a lesson

If a single lesson is accumulating more than 4-5 top-level new concepts, consider whether it should split into two lessons with a natural break at a recap checkpoint, rather than one very long lesson. A shorter lesson that ends on a genuine "I've got this" moment beats a longer one that trails off into fatigue.

## Common failure modes to check for

- **Definition-first opening.** If the lesson's first substantive sentence is a formal definition, move the hook in front of it.
- **Concept avalanche.** Two or more genuinely new ideas introduced in the same paragraph with no individual example for each.
- **Orphaned gotchas.** Caveats and edge cases all pushed to a single section at the end instead of living next to the concept they belong to.
- **No recap after a dense run.** Reread the lesson and mark where a learner would plausibly feel lost — if there's no checkpoint within the preceding stretch, add one.
- **Abrupt ending.** The lesson stops right after the last fact instead of closing the loop and pointing forward.
