# Unit 0.2: How the curriculum and grading loop work

::: phase learn

Your code is not graded on impressions. Every submission runs through four verification stages, in a fixed order, so that a passing unit means the work actually runs and actually meets the rubric.

## Why grading works this way

### Why self-paced technical courses fail

Traditional self-paced online courses report single-digit completion rates. Three forces that a good workplace supplies are usually missing:

1. **Judgment:** Knowing whether an implementation is production-grade or merely appears to work on one clean input.
2. **Unblocking:** Targeted diagnostic help when you are stuck on an environment error or a subtle edge case at midnight.
3. **Pressure:** Deadlines and social accountability that stop the drift.

Here each of the three is a system you can see and use:

- Judgment comes from the four verification stages below.
- Unblocking comes from the assistant at the bottom of every unit page, which explains freely while you are still learning and works questions through with you once you are building, together with the Unstuck entries written for the errors this curriculum actually produces.
- Pressure comes from your pod, the public build log, and the rebate milestones.

That is also why a completion percentage is not a measurement here. A course can report that you finished 80% of it and tell you nothing about whether any of it runs. What this curriculum records is the opposite: not what you watched, but what shipped and held up under the checks.

### The four verification stages

No single grading technique can evaluate an AI engineering submission:

- Simple string matching misses valid variations.
- Grading by a language model alone is open to prompt injection and to invented verdicts.
- Self-reporting invites self-deception and makes the credential worthless.

So verification runs in four stages, each catching what the one before it cannot:

```mermaid The order the four stages run in, and what has to be true to reach the next one
flowchart TB
  A["1. Automated checks<br/>containerized tests, schemas, exit codes"]
  B["2. Rubric review<br/>evidence quoted from your code"]
  C["3. Defend your work<br/>questions generated from your commits"]
  D["4. Recorded walkthrough<br/>unscripted video of the running system"]
  A -- "every check exits zero" --> B
  B -- "gate units only" --> C
  C -- "phase projects and the capstone" --> D
```

1. **Automated checks.** Cheap, fast, containerized execution: pytest suites, exit codes, JSON schema compliance, and record-count assertions. If your code crashes or drops records, it stops here.
2. **Rubric review.** An automated reviewer scores the submission against the unit's published rubric, 3 to 5 criteria, and must quote the line of your code that decided each verdict. It reads the rubric and the submission, nothing else.
3. **Defend your work.** On gate units, the platform generates questions from your own commits ("Why chunk size 500 here? What happens when the purchase order number is missing?") and you answer them.
4. **Recorded walkthrough.** On phase integration projects and the capstone, you submit an unscripted screen recording of your system running.

### Checkpoint

> **Predict, then check.** A submission runs clean in the container, every check exits zero, and the reviewer confirms all five rubric criteria with a quoted line for each. The student's own notes say they never really understood the retry logic they pasted in.
>
> Has this unit passed?

Yes. Both stages measured exactly what they measure, and neither of them claims to have read your mind. That is not a hole in the process, it is what the third stage exists for: on a gate unit you answer questions generated from those same commits, and pasted logic you cannot explain is precisely where that goes wrong. The four are not four opinions about one thing. They are four different things being measured.

## What that means for your submissions

### Why automated checks always run before rubric review

Reviewing broken code wastes budget and produces confusing feedback. If your script crashes with a `SyntaxError`, or writes 15 records out of 20, a reviewer reading only the source can still conclude the architecture looks sound. It is not sound: it does not run.

Automated checks are the filter:

- The code must execute inside an isolated Docker sandbox.
- Every unit test and contract check must exit zero.
- Submitted schemas must parse without error.

Only after that does rubric review look at whether your prompting, error handling, and structure satisfy the rubric.

### The parallel business track (Phase 11)

Technical ability without business positioning produces unemployed engineers. Phase 11 (Positioning, Discovery Calls, Scoping, Pricing, Proposals, and Client Delivery) runs in parallel with Phases 1 through 10.

If you wait until Phase 10 to learn how to talk to clients, you will experience the classic graduate trap: technical competence paired with zero commercial momentum. Pairing business milestones with technical phases ensures that when you finish the technical capstone, you already have outreach underway.

## Tracking your own progress

### Milestone tracking and time-boxing

- **Pacing:** 12 to 15 hours per week over 9 to 15 months (700 to 950 total hours).
- **Time-boxing:** Each sub-module carries an estimated duration. If you are stuck for more than 2 hours on one drill, read the Unstuck entries or ask about the unit before restarting from scratch.

### The states you will see on a submission

- `QUEUED`: the push arrived and is waiting for a worker.
- `GRADING`: checks are running now.
- `PASSED`: every automated check and every rubric criterion is met, each with quoted evidence.
- `NOT YET`: at least one criterion is unmet, with the failing check or the quoted line named. Fix and push again. Retries inside the sandbox carry no penalty.

::: phase practice

## Predict a verdict before you plan yours

Knowing what the four stages are is not the same as knowing where your own work would stop, and it is the second one that changes how you lay out your weeks. So read two situations and call the outcome before you write anything down.

::: route

**Where does it stop.** A student pushes a unit whose extractor handles 19 of 20 fixture records and silently drops the twentieth. The prompting is careful, the error handling is thorough, the structure is clean. Which stage ends this submission, and why is that the right place for it to end?

One good answer: the first. A dropped record is one record-count assertion away from being caught, so this never reaches a reviewer. That is the right place because a reviewer reading only the source would have called the architecture sound and been wrong. Careful prompting is not evidence that the thing runs. Fix the drop, push again, and what arrives is a submission worth reading.

**Two plans, and one of them will not survive.** Student A puts 14 hours a week into the build units and leaves the client-facing work until after the capstone. Student B puts 12 hours a week into the build units and gives the thirteenth to outreach, starting in month one. Which plan carries more risk, and what does that risk look like nine months in?

One good answer: Student A. Two extra hours a week buys perhaps one unit a month, and it costs the whole pipeline of conversations that takes months to warm up. Nine months in, A finishes the engineering with nothing in flight and starts from zero on the half that pays, while B finishes a little later with people already talking to them. Engineering time is the easier half to schedule, which is exactly why it expands to fill everything.

Now read a finished one. It answers the same question the workbench is about to ask you, with a note beside each part saying what that part earns. Read it for what a complete answer has to cover, not for sentences to reuse.

::: worked-example

Then the same answer with its load-bearing parts taken out. Recognising a good answer is easy. Producing one is the skill, and this is where the gap shows.

::: workbench

Last, close the lesson.

The drills below ask for these ideas back from memory. Anything you get wrong is scheduled to come back at you in a few days, which is the point of them rather than a penalty.

::: retrieval

::: phase build

## Now put your own dates on it

The plan you write here is the one you will be arguing with in month four, so put real dates on it rather than durations. A plan made of durations always fits. A plan made of dates tells you when you are behind, which is the only thing a plan is for.

::: deliverable

::: submission

::: phase verify

## What a reader has to find

Nothing here runs in a container, because a schedule has no exit code. So the whole of this unit sits with a reviewer who has your plan on one side and the rubric on the other, and who has to quote you back to yourself for every criterion. That is why a vague date is not a style problem in this unit. It is the thing that costs you a criterion.

::: prove-it

::: grading-modes

::: rubric

::: phase unstuck

## Two ways people misread this

Two readings of this unit go wrong often enough to be written down rather than left for you to find in month five.

::: unstuck

Both have the same shape: something that feels like progress standing in for something that was measured. If you catch yourself estimating your own state instead of reading it off a verdict, that is the one to look at.

::: phase ask

## Ask about the loop itself

There is an assistant on this page that has read this lesson and nothing else, so it answers about this curriculum's own loop rather than about study technique in general. Ask why a stage sits where it sits, or paste a draft of your schedule and ask what a reviewer would still have to guess at.

It is an AI, not a person, and it will not write your plan. Once you have finished the practice route above it stops handing over answers and works questions through with you instead.

::: ask

One thing to carry forward. Nothing here asks you to report your own progress, and that is deliberate. What gets recorded is what ran, what a reviewer could quote, and what you could explain when asked about it.

Unit 0.3 puts the first of those on your own machine: a containerized workspace, a spend ceiling on your provider account, and a test that proves both are real.
