---
name: lesson-voice-and-tone
description: Use this skill whenever writing or revising any learner-facing prose for an online coding/technical school — lesson body text, exercise intros, hint and error-message copy, module summaries, or marketing/landing copy for a course. Trigger it for requests like "write a lesson on X", "make this explanation less dry", "this reads like a textbook", "punch up this course description", or any drafting/editing task where the audience is a student. This governs line-level voice (word choice, sentence rhythm, warmth); pair it with lesson-architecture for whole-lesson structure and concept-explainer for how to explain a specific hard idea.
---

# Lesson Voice and Tone

This skill captures the narrative voice used by the most effective interactive coding-education writers online today — writers like Josh Comeau, whose CSS and React tutorials are widely regarded as some of the clearest technical writing on the web. The goal isn't to imitate any one person's prose, but to reproduce the _underlying craft decisions_ that make their writing feel like a knowledgeable friend explaining something over coffee, rather than a manual.

## Why this matters

Most technical writing defaults to a "neutral" register that is actually just distant and a little cold. That distance is a real cost: learners disengage, skim past exactly the sentence that would have prevented their confusion, and walk away thinking the _subject_ is dry when really the _prose_ was dry. Warmth isn't decoration — it's what keeps someone reading long enough to actually learn.

## Core voice principles

**Write as "we," address the reader as "you."** Frame discovery as something you and the reader do together ("let's see what happens if...") rather than something you hand down to them ("the following demonstrates..."). This turns a lecture into a collaboration.

**Lead with your own past confusion.** Before explaining a hard concept, it's powerful to briefly admit that you found it confusing too, or that you held the wrong mental model for years. This isn't false modesty — it signals to the learner that their confusion is normal and expected, not a sign they're behind. Do this sparingly (once or twice per lesson, not every paragraph) so it stays genuine.

**State the promise early and plainly.** Within the first few sentences, say explicitly what the learner will be able to do or understand by the end. Don't bury the point under throat-clearing ("In this lesson, we will be discussing..."). Just say the thing: "By the end of this, you'll know exactly why your CSS margins keep collapsing — and how to stop it happening."

**Give your writing a bolded spine.** Bold the one or two sentences per section that carry the actual point, so a learner skimming (which almost everyone does, at least once) can follow the argument from bold phrase to bold phrase. If you bold everything, this stops working — reserve it for genuine load-bearing sentences.

**Name the difficulty out loud.** When something is genuinely hard or a lesson has been dense, say so ("that was a lot — if your head's spinning a little, that's a completely normal reaction"). This does two things: it validates the learner's experience instead of letting them silently conclude they're not smart enough, and it gives them permission to reread rather than push on confused.

**Prefer plain words, and define jargon the instant it appears.** Don't say "leverage" when you mean "use." When you do need precise technical vocabulary, introduce it right at the moment it's needed, in the same breath as a plain-language gloss — don't assume prior exposure just because a term is "basic."

**Calibrate humor as warmth, not as a joke-delivery mechanism.** Light, self-aware asides work well (an amusing analogy, a dry aside about a particularly ugly browser quirk). Humor should never punch down at the learner's confusion, and it should never get in the way of someone who just wants the answer — it's seasoning, not the meal.

**Avoid gatekeeping language.** Cut words like "obviously," "simply," "just," and "trivially" before a step. What's obvious to the writer is frequently the exact step where a learner gets stuck, and these words silently tell them something is wrong with _them_ when it isn't.

**Use short sentences to change gears.** A short, plain sentence ("Let's test it." / "Here's the problem.") between longer explanatory ones works as a breath — it signals a transition and re-engages attention right before you introduce the next idea.

**Use emoji and visual flourishes sparingly, for warmth, never for substance.** An occasional ✨ or 😅 can land well at a genuine emotional beat (relief, humor, celebration). If you find yourself using one to spice up an otherwise flat sentence, fix the sentence instead.

**End with encouragement and forward motion, not just a summary.** Don't just restate what was covered. Acknowledge the effort it took, and point toward what's next and why it matters, so the learner closes the lesson with momentum rather than a flat feeling of "okay, done."

## Before / after

Flat, textbook register:

> Closures are a feature of JavaScript in which an inner function has access to the outer (enclosing) function's variables. This is due to lexical scoping. Consider the following example.

Warmer, direct-address register:

> Here's something that trips up almost everyone the first time they see it: a function can "remember" variables from a scope that has already finished running. It feels like it shouldn't be possible — the outer function is done, its variables should be gone, right? Let's look at an example and see exactly what's going on.

Notice what changed: it's not that facts were removed, it's that the second version opens with the _feeling_ of encountering the concept (surprise, "that shouldn't be possible"), names the specific misconception the reader probably already has, and promises a concrete look rather than a definition.

## Quick self-check before shipping a lesson draft

- Does the opening state a concrete promise, or does it throat-clear?
- Is there at least one moment of shared vulnerability or "here's the confusing part" honesty?
- Read only the bolded sentences in a section — do they tell the story on their own?
- Cross out "obviously," "simply," "just," "easily" — does removing them ever lose real meaning? (Usually not.)
- Does every technical term get defined the moment it's introduced, even ones that feel "basic"?
- Does the ending look forward, or does it just stop?
