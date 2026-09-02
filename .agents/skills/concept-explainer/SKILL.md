---
name: concept-explainer
description: Use this skill whenever a lesson needs to explain a genuinely hard, abstract, or commonly-misunderstood concept — things like recursion, closures, async/await, Big-O notation, the CSS box model, pointers, database indexes, or React's rendering model. Trigger it for requests like "explain X simply", "I need a good analogy for Y", "learners keep getting confused about Z", "make this explanation more intuitive", or "why doesn't anyone understand this the first time." This is about the explanation technique for one specific concept — pair it with lesson-architecture for whole-lesson sequencing and lesson-voice-and-tone for prose style.
---

# Concept Explainer

Some ideas are hard not because they're complicated, but because they're explained backwards: definition first, motivation never. This skill is a technique library for explaining a single hard concept so that it actually clicks, rather than just being technically stated.

## Why order beats precision

A precise definition given before the learner has any felt need for it usually doesn't stick — there's nothing for it to attach to. The techniques below are all, in one way or another, about giving the learner a reason to want the explanation before delivering it, and about building a working mental model before formal vocabulary.

## Techniques

**Lead with the problem, not the definition.** Before naming or defining the concept, show the pain of not having it — a piece of code that's awkward or broken without it, or a question that's hard to answer without it. Let the learner feel the gap the concept fills. Only then introduce the concept as the thing that closes that gap.

**Build intuition before formalism.** Give a working, plain-language mental model first ("think of it as..."), and only introduce the correct technical term and precise definition once that model is in place. Introducing correct terminology too early forces the learner to hold an unfamiliar word and an unfamiliar idea simultaneously; sequencing them cuts that load in half.

**Pick one well-mapped analogy, not several loose ones.** A single concrete, familiar analogy that maps cleanly onto the concept's _structure_ (not just its vibe) is far more useful than three vague ones. Good analogy sources are physical and everyday — spatial arrangements, containers, journeys, familiar objects — because they let the learner reason using intuitions they already have. Explicitly call out where the analogy breaks down once it's served its purpose, so it doesn't quietly mislead the learner into overextending it.

**Show, then explain, then show again.** Demonstrate the concept's behavior first ("watch what happens when..."), explain the mechanism that produces that behavior, and then apply the same mechanism to a second, slightly different example so the learner can confirm they generalized correctly rather than just memorized the first case.

**Use predict-then-check to force active engagement.** Before revealing an outcome, ask the learner to guess it. This turns a passive read into a small test the learner grades themselves on, which is a much stronger driver of retention than reading the answer straight away.

**Name the specific wrong assumption, don't just state the right one.** Most hard concepts have a predictable, specific misconception that learners bring to them (e.g., "I assumed CSS width was always a hard constraint" before learning about flexible layout algorithms). State that assumption explicitly, explain concretely why it's wrong and exactly where it breaks, rather than only presenting the correct model and hoping the old one quietly fades. Misconceptions that are never directly confronted tend to survive alongside the new, correct information instead of being replaced by it.

**Connect to "why," not just "what."** When it's genuinely illuminating, briefly explain why a language or system was designed the way it is. Causal understanding ("it works this way _because_ of this constraint") is stickier than a memorized rule, because it lets the learner rederive the rule later instead of just recalling it.

**Order examples from simplest to real-world.** Start with the smallest example that isolates the concept cleanly, with no unrelated complexity mixed in. Only after that lands should you move to messier, real-world cases with edge cases and interactions with other concepts.

**Let interesting-but-nonessential tangents be optional.** Not every fascinating side detail belongs in the main explanatory path. Push genuinely optional depth into an aside, footnote, or "if you're curious" callout so the primary explanation stays lean and the tangent is available without costing every reader the detour.

## A worked example: explaining recursion

Weak order (definition-first): "Recursion is when a function calls itself. Here's the syntax. Here's a factorial example."

Stronger order (problem-first, misconception-aware):

1. Pose a problem that's awkward to solve with a simple loop (e.g., traversing a nested folder structure of unknown depth).
2. Let the learner feel why a fixed-depth loop doesn't work here — the depth isn't known in advance.
3. Introduce the idea, in plain language, of "a function that hands off a smaller version of the same problem to itself" — before writing any code.
4. Name the specific thing beginners get wrong: assuming they need to mentally track every call at once, like a loop counter. Explain why that's not how to reason about it — each call only needs to trust that the _smaller_ version of the problem gets solved correctly (the recursive leap of faith).
5. Show the base case explicitly as "the smallest version of the problem we can answer directly, without recursing" — and flag forgetting it as the single most common bug.
6. Only now introduce formal vocabulary: base case, recursive case, call stack.
7. Apply the same reasoning to a second, structurally different example (e.g., a tree instead of a list) to confirm the model generalizes.

## Quick self-check

- Does the explanation open with a problem/pain point, or with a definition?
- Is there exactly one primary analogy, clearly mapped, with its breaking point acknowledged?
- Is the specific wrong assumption learners bring named and directly addressed?
- Is there at least one predict-then-check moment?
- Does formal terminology arrive after the intuition, not before it?
- Are edge cases and tangents kept out of the main path until the core idea has landed?
