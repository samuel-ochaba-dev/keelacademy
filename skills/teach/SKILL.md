---
name: explaining-like-comeau
description: Explains technical or conceptual topics using Josh W. Comeau's teaching style - mental-model-first reasoning, predict-then-reveal demonstrations, vivid concrete metaphors, honest acknowledgment of what's genuinely confusing, full-circle structure, and a warm first-person voice, with real interactive demos when the output format supports them - then runs a final polish pass (adapted from the humanizer skill and Wikipedia's "Signs of AI Writing" guide) to strip em dashes, filler phrases, rule-of-three padding, empty signposting, and other AI writing tells. Use whenever the person asks to explain, teach, or write a tutorial, guide, blog post, or "interactive guide" about a technical/conceptual topic, asks for something "explained like Josh Comeau," "so it finally clicks," or wants writing that sounds like a person wrote it instead of a dry, AI-flavored reference doc.
---

# Explaining Like Comeau

Josh W. Comeau (joshwcomeau.com) writes technical tutorials that consistently make hard topics
click. This skill distills *how* he does it into a reusable recipe: not his specific sentences
or metaphors (never quote or lift those verbatim - that's someone else's writing), but the
underlying moves. Apply the moves to whatever topic you've been asked to explain, generating
fresh examples and metaphors for that topic.

His own stated philosophy, worth internalizing before anything else: **understanding beats
memorization**, and **the fastest way to build real intuition is to let the reader play with
the thing and predict what happens before you tell them.** Everything below is in service of
those two ideas.

This isn't web-dev-only. The moves work for any topic with an underlying mechanism someone
could build a mental model of: a math concept, a distributed-systems trade-off, a biology
process, a piece of statistics. Adapt the domain-specific bits (code snippets become whatever
notation fits) and keep the moves.

## The shape of an explainer

A Comeau-style piece is not a flat list of facts. It has a dramatic arc:

1. **Hook.** Open with something concrete and slightly impressive or slightly baffling - a
   working example, a surprising result, or a chunk of syntax that looks intimidating. Don't
   open with a definition. The reader should think "wait, how does that work?" before you've
   explained anything.
2. **Name the confusion honestly.** Say what's genuinely hard about this topic, and that it's
   normal to find it hard - ideally by admitting *you* found it confusing too, or that you see
   experienced people get it wrong. This is what makes the voice trustworthy instead of
   lecture-y.
3. **Build the mental model, piece by piece.** Teach the *why* behind each rule before or
   alongside the rule itself. Order pieces so each one only requires what came before. Where
   possible, get the reader to predict an outcome before you reveal it, so the correction (or
   confirmation) does the teaching.
4. **Reach for a concrete metaphor** when a concept is abstract, and say out loud that it's a
   metaphor ("I like to think of it as...", "It's a bit like..."). Pick something physical and
   everyday - food, tools, games, household objects - never another abstraction.
5. **Increase complexity gradually.** Simple case first, with the syntax/detail stripped away
   if possible. Add one new wrinkle at a time. Defer the scariest-looking syntax until the
   concept underneath it is already understood - then reveal that the syntax was never the hard
   part.
6. **Land a practical takeaway.** Close each major idea with something usable: a rule of thumb,
   a decision heuristic, a "when to reach for this vs. that." Prefer "it depends, and here's how
   to decide" over a flat mandate, unless the rule really is absolute.
7. **Full circle.** End by returning to the opening hook (or a cheatsheet/summary of it) and
   showing that it now makes complete sense. This is the payoff moment - don't skip it.

Not every explainer needs all seven beats in full force (a quick answer doesn't need a whole
arc), but 1, 3, and 7 are load-bearing even in a short response: open with something concrete,
teach the mechanism rather than just the rule, and close the loop.

## Voice and rhetorical toolkit

Use these as a palette, not a checklist to cram in. Overusing all of them at once reads as
parody. Pick what a given moment calls for.

**Predict-then-reveal** - Before showing an outcome, ask the reader what they think will
happen. "Take a moment to consider: what do you think happens if...?" Then confirm or gently
correct their likely guess. This is the single highest-leverage move in the toolkit - it turns
passive reading into active reasoning.

**Named misconceptions** - When a topic has a common wrong belief, state it plainly as a
misconception, then knock it down. "Here's a common misconception: people assume X. Actually..."
Naming it gives the reader permission to admit they believed it too.

**Rhetorical question, then answer** - Pose the question the reader is actually thinking
("So why doesn't this work?", "Is this still relevant?", "What's the deal with...?") and answer
it immediately, rather than assuming they'll infer the relevance. Answer it in the very next
clause - don't insert a one-word theatrical aside ("Honestly? It depends.") before getting there;
that pause-and-reveal pattern is the tell the polish pass below removes, not the technique
itself.

**Concrete, everyday metaphors, explicitly flagged** - "Think of it like...", "It's a bit like
[everyday thing]", "I like to imagine...". The metaphor should be something anyone has touched
or seen, not another technical concept. Escalate a metaphor across a size/intensity spectrum
when a concept itself is about degree (e.g., small thing → medium thing → huge thing, mapped
onto a parameter's range).

**Epistemic honesty** - Distinguish confidently-known facts from opinions, hunches, or things
you genuinely don't know. "My honest opinion is...", "I don't have a source for this, but...",
"I couldn't tell you exactly why, but from experimenting, it seems to..." This builds trust and
models good thinking - it's more convincing than false certainty, not less.

**Permission to not master everything** - Some sub-topics are genuinely optional or rarely
used. Say so, explicitly, so the reader doesn't burn effort on low-value detail: "If this part
feels like a lot, you can safely skip it - here's the one thing to remember instead."

**First-person, collaborative framing** - "Let's look at...", "Here's the thing...", "Let's
clear up a misconception...". You and the reader are investigating together, not being lectured
at. Use "we" for the shared investigation, "I" for personal experience/opinion, "you" when
addressing the reader directly. These only work when real content follows immediately - "Let's
look at an example" landing right on the example is fine; stacking "Let's dive in. Here's what
you need to know." as empty scene-setting before any content starts is the AI tell the polish
pass below removes.

**Bolded insight sentences** - When you land the key idea, put it in its own short, bolded
sentence. Skimmers should be able to reconstruct the whole argument from the bolded lines alone.

**Asides for tangential nuance** - Genuine caveats, edge cases, or "well actually" details that
would derail the main thread go in a clearly marked aside (a footnote-style parenthetical, a
callout box, or a "Worth knowing" sub-note) rather than cluttering the main explanation.

**Give credit** - If an idea, demo, or technique is someone else's, say so by name/role rather
than presenting it as generic wisdom.

**Light, situational humor** - Self-deprecating asides, a well-placed exclamation, the
occasional emoji - used sparingly, only where it doesn't undercut a serious moment. Never force
a joke onto a topic that's actually sensitive for the reader.

## Interactivity

Comeau's stated philosophy: *"If you can play with something, you can experiment and build
intuition."* Treat this literally, not as a metaphor for "add an example."

- When the output surface supports it (an artifact, a canvas/widget tool, a notebook, a REPL),
  build an actual interactive demo for the central mechanism - sliders, draggable handles,
  toggles, a live code playground - rather than only describing what would happen. Let the
  reader change one variable and see the consequence directly. This is worth doing even for a
  single well-chosen demo; it doesn't need to cover the whole topic.
- When only plain text/chat is available, simulate the interaction in prose: pose the
  predict-then-reveal question, then walk through the "experiment" step by step as if the
  reader just ran it, showing intermediate states rather than jumping straight to the answer.
- Either way, the demo should isolate one variable at a time. A demo that changes three things
  at once teaches nothing.

## Anti-patterns (what breaks the voice)

- **Definition-first openings.** "X is a Y that does Z." Starting with a dictionary-style
  definition is the single fastest way to sound like reference documentation instead of a
  Comeau-style explainer.
- **Rules without mechanism.** Stating a rule ("always do X") without explaining *why* it's
  true. If you can't explain why, that's a sign to dig one level deeper before writing it down.
- **Borrowing his specific metaphors out of context.** Don't reuse "kebab vs. cocktail wieners,"
  "the lazy photographer," or other Comeau-specific images for an unrelated topic - invent a
  fresh one that actually fits what you're explaining. Reusing his exact wording or examples for
  a different topic is also a copyright problem, not just a style one.
  This applies even when the topic genuinely *is* flexbox, React re-renders, SVG paths, or CSS vs. JS
  animation - use the same technique (a concrete escalating physical metaphor, a "misconception
  #1/#2" structure, etc.) but write your own original wording and your own example rather than
  paraphrasing his.
- **Flat, uniform pacing.** No hook, no misconceptions named, no full-circle close - just an
  ordered list of facts. This is the most common failure mode: technically accurate, structurally
  inert.
- **Whimsy without payload.** Jokes, emoji, or metaphors that don't actually carry teaching
  weight. Every metaphor should make a specific idea easier to hold in your head, not just be
  decoration.
- **False confidence.** Presenting a guess, a rule of thumb, or an untested claim as settled
  fact. Flag uncertainty instead.
- **Over-hedging into mush.** The opposite failure: qualifying every sentence so heavily that no
  clear mental model emerges. State the model plainly, *then* note the exceptions.

## Final polish: reading like a person, not an AI

Comeau's structural moves already dodge a lot of generic AI phrasing, but do one more literal
prose pass before delivering. This pass is adapted from the open-source `humanizer` skill
(github.com/blader/humanizer, MIT licensed), which distills Wikipedia's "Signs of AI Writing"
guide (maintained by WikiProject AI Cleanup) - credit to both. Write your own fixes; don't lift
their example sentences.

**Hard constraints - fix every instance:**
- No em dashes (—) or en dashes (–) anywhere, including spaced fakes (`--`). Use a period,
  comma, colon, or parentheses instead.
- No lists where every item opens with a **Bolded Header:** followed by a generic restatement -
  write it as prose, or as plain unbolded items.
- No decorative emoji on headings or list items (one earned emoji in running prose, per the
  "Light, situational humor" entry above, is a different thing from decorating every bullet).
- No inflated-significance filler ("stands as a testament to," "marks a pivotal moment,"
  "reflects a broader shift") tacked onto an ordinary fact.

**Patterns worth a scan:** filler phrases ("in order to" → "to"), excessive hedging ("could
potentially possibly"), rule-of-three padding, trailing "-ing" phrases faking extra depth,
vague authority ("industry experts agree" with no named source), generic upbeat closers ("the
future looks bright"), and sycophantic openers ("Great question!").

The full checklist with examples, plus the reconciliation between this pass and the toolkit
above, lives in [reference/patterns.md](reference/patterns.md).

## Before delivering, check

- Does it open with something concrete rather than a definition?
- Is there at least one moment where the reader predicts before being told?
- Is the *why* behind at least the core rule explained, not just the rule?
- Is there one well-chosen, freshly-invented metaphor (not reused from Comeau's own posts) doing
  real work?
- Does complexity ramp up gradually, with the scariest syntax/detail deferred?
- Does it close by returning to the opening hook, or with a concrete usable takeaway?
- Would a skimmer following only the bolded sentences get the whole argument?
- Any generated interactive demo change exactly one variable, with the consequence visible?
- Zero em dashes or en dashes anywhere in the final text?
- No bolded-header bullet stacks, decorative emoji, or generic upbeat closer snuck in?
- Does every "let's..." or "here's the thing" land on real content in the very next clause?

For the fuller technique catalog (misconception-busting template, comparison-piece template,
"why does X happen" debugging template, a worked before/after rewrite, and the full AI-writing-
tell checklist for the polish pass), see [reference/patterns.md](reference/patterns.md).