# Patterns Reference

Deeper catalog for the explaining-like-comeau skill. Read this when you want a template for a
specific kind of piece, or want to see the technique applied end-to-end.

## Contents

- Four explainer shapes (templates)
- Phrase bank (functions, not scripts to copy verbatim)
- Worked example: before/after rewrite
- AI-writing-tell checklist (final polish pass)
- Calibrating for length

## Four explainer shapes

Pick whichever matches the request; blend if the topic calls for it.

### 1. Concept explainer ("how does X actually work")

The default shape, matching the seven-beat arc in SKILL.md.

```
Hook: a working example or surprising result
Name the confusion: what's genuinely hard here, normalized
Core mechanism, taught bottom-up:
  - simplest case, syntax stripped away
  - predict-then-reveal for the first non-obvious behavior
  - one concrete metaphor introduced explicitly
  - add complexity in small increments, one new idea per step
  - defer the most intimidating syntax until the concept is solid
Practical synthesis: a rule of thumb or decision heuristic
Full circle: return to the hook, now fully explained
```

### 2. Misconception-busting piece ("why doesn't X do what I expect")

Use when the topic is dominated by one or two widely-held wrong beliefs (this is the shape of
Comeau's "Why React Re-Renders").

```
Hook: the surprising/counter-intuitive behavior itself, demonstrated
State "Misconception #1" plainly, in the reader's own likely words
Explain *why* the misconception is intuitive/reasonable to hold
Reveal the actual mechanism, and why it produces different behavior
Repeat for Misconception #2, #3 if there are more
Synthesis: restate the corrected mental model in one or two sentences
Bonus: practical tips that follow from the corrected model
```

Numbering misconceptions explicitly ("Misconception #1", "Misconception #2") gives the reader
a sense of progress and makes each correction feel like a discrete, earned win rather than one
long wall of correction.

### 3. Comparison piece ("X vs. Y", "should I use A or B")

Use when the request is a head-to-head (this is the shape of Comeau's "CSS vs. JavaScript").

```
Hook: pose the actual question a developer/reader has, plus your gut-check answer
Test the naive intuition directly - is it right, and for the reason people assume?
Build the comparison incrementally: two options, then introduce a third, then a fourth,
  narrating what changes at each addition rather than dumping a table upfront
Surface the non-obvious trade-off (the thing that made this worth writing about at all)
Give a concrete, opinionated decision rule ("when evaluating X, I ask myself...") -
  labeled as your judgment call, not universal law
Acknowledge the genuine counter-argument or the situations where the other choice wins
```

Comparison pieces earn their keep on the *nuance*, not the verdict. If the honest answer is
"it depends," say so, but still hand the reader a concrete way to decide for themselves.

### 4. "Why does X happen" / debugging-style piece

Use for troubleshooting-flavored explanations (a bug, an unexpected error, surprising output).

```
Hook: show the broken/surprising behavior exactly as the reader would encounter it
Resist the urge to explain immediately - first show that the "obvious" fix doesn't work,
  or that the obvious cause isn't the real one
Walk the actual causal chain one link at a time, confirming each link concretely
  (a log line, an intermediate value, a rendered result) before moving to the next
Name the root cause plainly once you reach it
Give the fix, and a generalized rule for recognizing this class of problem in the future
```

## Phrase bank

These are *functions*, not scripts - write your own wording each time. Listed so you can
recognize the move and reach for a fresh version of it, not so you can paste them in.

| Function | What it does |
|---|---|
| Hook opener | Drops the reader into a concrete example before any explanation |
| "Here's the thing" / "Here's the deal" | Signals the key insight is about to land |
| "Take a moment to consider..." | Invites a prediction before the reveal |
| "I like to think of it as..." | Explicitly flags an upcoming metaphor as a metaphor |
| "A reasonable person might assume..." | Sets up a misconception fairly, before correcting it |
| "My honest opinion is..." / "I don't have a source for this, but..." | Marks opinion or uncertainty as such |
| "If your brain feels overloaded, feel free to skip this part" | Explicit permission to deprioritize |
| "So, why does this matter?" | Anticipates and answers the reader's "so what" |
| "Let's revisit [the opening hook]" | Signals the full-circle close |

## Worked example: before/after rewrite

**Topic: why a `Promise.all` call sometimes fails silently for one item and takes down the
whole batch.**

**Before (reference-doc voice - avoid this):**

> `Promise.all()` takes an array of promises and returns a single promise. It resolves when
> all input promises resolve, or rejects as soon as one input promise rejects. If one promise
> rejects, the returned promise rejects immediately with that reason, and the results of the
> other promises are discarded. Use `Promise.allSettled()` if you need the results of every
> promise regardless of failure.

Technically correct, teaches nothing. No hook, no mechanism, no "why would this surprise you,"
no metaphor, flat pacing throughout.

**After (Comeau-style pass):**

> Say you're fetching data for ten dashboard widgets at once with `Promise.all`. Nine requests
> succeed. One — just one — 404s. What lands in your `.then()`? If you guessed "the nine good
> results, plus an error for the bad one," that's a very reasonable guess. It's also wrong: you
> get *nothing*. No dashboard. Just a rejected promise and nine wasted network requests.
>
> **Here's the mental model that actually explains this:** `Promise.all` isn't a results
> collector, it's an all-or-nothing bet. Think of it like a relay race where the whole team gets
> disqualified the instant any one runner drops the baton — it doesn't matter that the other nine
> runners already crossed the finish line. The race is over, and their times don't count.
>
> This is a deliberate design choice, not a bug: `Promise.all` assumes every result matters
> equally, so a partial success isn't actually a success at all. That's the right call when you
> genuinely can't proceed without all ten values. But for a dashboard, where widget #7 failing
> shouldn't blank out widgets #1 through #6, it's the wrong tool.
>
> That's exactly the gap `Promise.allSettled` fills. It runs the same race, but every runner's
> result gets recorded regardless of outcome — you get back an array of `{status, value}` or
> `{status, reason}` for each one, and you decide what "good enough" means.
>
> **Rule of thumb:** if failure of any one item should mean the whole operation failed, reach for
> `Promise.all`. If you want partial results and plan to handle failures item-by-item, reach for
> `Promise.allSettled` — and go check any dashboard-shaped code you've written with `Promise.all`,
> because this is a very easy mistake to make exactly once, painfully.

What changed: hook with a concrete scenario, predict-then-reveal ("If you guessed... that's a
reasonable guess. It's also wrong"), an explicit fresh metaphor (relay race, not anything from
Comeau's actual posts), an explanation of *why* the behavior is a deliberate trade-off rather
than an arbitrary fact, and a closing rule of thumb that's actionable.

## AI-writing-tell checklist (final polish pass)

Adapted from the `humanizer` skill (github.com/blader/humanizer, MIT license) and the Wikipedia
guide it's built on, "Signs of AI Writing" (maintained by WikiProject AI Cleanup). Full credit to
both sources - this is an independently-worded, condensed pass tuned to run alongside the Comeau
voice above, not a copy of their text or examples.

### Hard constraints

| Tell | Fix |
|---|---|
| Em dash / en dash (`—`, `–`, or spaced `--`) | Period, comma, colon, or parentheses |
| List where every item is **Bold Label:** + restatement | Rewrite as prose, or as plain items |
| Decorative emoji on headings/bullets | Remove; save emoji for a rare, earned moment in prose |
| Copula avoidance ("serves as," "stands as," "functions as" instead of "is") | Use "is" |

### Patterns worth a scan

- **Inflated significance** - "stands as a testament to," "marks a pivotal moment," "represents
  a broader shift" tacked onto an ordinary fact. Fix: state the plain fact and stop.
- **Filler phrases** - "in order to," "due to the fact that," "at this point in time." Fix: cut
  to "to," "because," "now."
- **Excessive hedging** - "could potentially possibly be argued." Fix: pick one confidence level
  and say it once.
- **Rule-of-three padding** - a fact stretched into three parallel items it doesn't structurally
  need. Fix: state the actual number of things, even if that's one or two.
- **Trailing "-ing" depth-fakers** - "...cementing its place as a key part of the workflow."
  Fix: cut it, or replace with a specific, checkable claim.
- **Vague authority** - "industry experts agree," "studies show," with no source named. Fix: name
  the source, or drop the claim.
- **Empty signposting** - "Let's dive in," "here's what you need to know," "without further ado."
  Fix: delete the announcement and start directly with the content. (This is genuinely different
  from Comeau's "Let's look at X" landing right on X - see the reconciliation note below.)
- **Generic upbeat closers** - "the future looks bright," "an exciting journey ahead." Fix: end
  on the actual, specific last point instead.
- **Sycophantic openers** - "Great question!," "You're absolutely right that..." Fix: just answer.
- **Elegant variation** - swapping in a new synonym every time you refer to the same thing, purely
  to avoid repeating a word ("the protagonist... the main character... the central figure...").
  Fix: reuse the plain term. Repeating a plain word is invisible to readers; synonym-cycling is
  not.
- **Theatrical rhetorical pause** - "Is it worth it? Honestly? It depends." Fix: answer directly
  in the very next clause; don't insert a one-word aside before the payoff.

### What NOT to flag

Some of the patterns above show up in genuinely good human writing and shouldn't be edited out
reflexively:

- One em dash or one "however" in isolation - the tell is a *cluster* of several patterns
  together, not a single instance.
- A short, punchy sentence used once for emphasis - the tell is a *run* of several in a row.
- Precise formal or technical vocabulary that the topic actually needs - don't flatten real
  precision into blandness while chasing "sounding human."
- Comeau's own signature moves, when the payload actually lands: a bolded insight sentence used
  sparingly, "Let's look at..." immediately followed by real content, "Here's the thing"
  immediately followed by a genuine non-obvious fact. These are the opposite of the empty
  versions of the same phrases - keep them.

### Reconciling this with the Comeau voice

Two moves from the main toolkit sit right next to patterns this checklist flags: "Here's the
thing" / "Here's the deal," and "Let's look at...". The test that separates them from the AI
tell isn't the phrase itself, it's whether real content follows in the very next clause. "Here's
the thing: the minimum size gotcha is what's actually causing this" delivers a specific,
non-obvious fact immediately. "Honestly? It depends" is a theatrical pause with no payload right
behind it - that's the tell. When editing a draft, try deleting the announcement phrase and
checking whether the sentence after it still stands on its own. If it does, the announcement
wasn't earning its keep and should go.

## Calibrating for length

The full seven-beat arc is for genuine tutorials/guides. For a shorter answer (a chat reply, a
paragraph), compress rather than drop the shape entirely:

- Always keep: a concrete opening, the *why* behind the core fact, and a closing takeaway.
- Cut first: the full misconception-numbering structure, multiple metaphors, bonus tips.
- A single well-chosen metaphor and one predict-then-reveal beat can carry a two-paragraph
  answer just as well as a full post - scale the *number* of moves, not their honesty or
  concreteness.