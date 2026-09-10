# Agent Knowledge Discovery — Evidence

**Status:** Project evidence, not product documentation, and not a benchmark.

This record preserves two exploratory tests run with fresh, unfamiliar AI-agent
sessions after Clara's first Pattern Knowledge record
(`docs/knowledge/destructive-confirmation.json`) was implemented. It exists
because the observations currently live only in experiment transcripts, not
in the repository — this file is the durable record of what was observed,
nothing more.

As with the rest of `docs/evidence/`, this preserves observed behavior for a
specific run. It is not re-verified on every change to the repository and
should not be read as a live guarantee.

## Purpose

To check, honestly, whether an AI agent with no prior knowledge of Clara —
not told the Pattern name, not told where Clara Knowledge lives, not given
Clara's component or Pattern vocabulary — could discover and reason from the
same structured Knowledge record the human-facing Explorer consumes, starting
only from a plain product-intent sentence.

This is a discoverability check, not a search-quality benchmark and not an
agent-performance evaluation. See Limitations below for what it does not show.

## Setup

- Two separate, fresh agent sessions. Each session had no prior conversation
  history with Clara and was not given Clara's vocabulary, the Pattern name,
  or the Knowledge record's file path.
- Each session was given only a plain-language product-intent sentence and
  asked to investigate the repository and reason about the problem.
- Both runs were performed after `docs/knowledge/destructive-confirmation.json`
  (Clara's first Pattern Knowledge record) existed in the repository.
- This record reflects the experiment as described by the project owner. It
  is not a transcript re-captured or independently re-verified inside this
  repository — per the project's evidence model
  (`docs/project/foundation.md`), it is recorded here as provided rather than
  invented or embellished.

## Experiment 1

**Product intent given:** "I need users to confirm before deleting something."

**Not given:** the Pattern name, the Knowledge record's location, which files
to inspect, or Clara's component/Pattern vocabulary.

**Observed result:**

- The agent inspected the repository and discovered
  `docs/knowledge/destructive-confirmation.json`.
- It identified Destructive Confirmation as the relevant Pattern.
- It used the Knowledge record to explain the Pattern's purpose, composition,
  and trade-offs.
- It identified Clara Button as an existing capability.
- It correctly identified the missing Dialog/overlay capability, the missing
  destructive Button treatment, and the missing danger semantic role.
- It surfaced Undo-after as an alternative.
- It distinguished claims directly supported by the repository from its own
  inference.
- It did not invent Clara capabilities that don't exist.

**Important limitation:** the given product intent was semantically very
close to the Pattern's filename (`destructive-confirmation.json`) and to the
record's own `demonstratedIntent` string. This run does not demonstrate
robust semantic discoverability — a near-literal match was available for the
agent to find.

## Experiment 2

**Product intent given:** "Users sometimes remove customer records by
mistake, and we need to make that less risky."

Again, the agent was not given Clara's vocabulary or the Knowledge record's
location.

**Observed result:**

- The agent again discovered `docs/knowledge/destructive-confirmation.json`,
  from a prompt with no literal overlap with the Pattern's filename or its
  `demonstratedIntent` string.
- It used the Pattern to reason about the problem rather than jumping
  directly to a Dialog or other component.
- It recognized that confirmation should not be applied blindly.
- It surfaced reversibility and action frequency as information it would need
  before recommending confirmation.
- It found the Undo-after relationship recorded in the Pattern.
- It identified existing and missing Clara capabilities.
- It separated claims supported by the repository from its own inference.

**Most importantly:** the agent explicitly reported that its discovery was
still primarily driven by repository structure and descriptive filenames,
not by demonstrated semantic retrieval. It also observed that the relevant
reasoning was distributed across the Knowledge record, the slice
documentation, the learning log, and the implementation — not contained in
one place.

## Observed evidence

Claims below are limited to what both runs actually showed:

- An unfamiliar agent, given only a product-intent sentence and no Clara
  vocabulary, was able to locate `docs/knowledge/destructive-confirmation.json`
  in both runs.
- In both runs, the agent used the Pattern's structured content (purpose,
  composition, trade-offs) to reason about the problem, rather than
  resolving directly to a named component.
- In both runs, the agent correctly distinguished capabilities Clara already
  has from capabilities it is missing, without inventing capabilities that
  don't exist.
- In both runs, the agent surfaced the Undo-after alternative already
  recorded in the Pattern, rather than proposing an unrecorded alternative.
- In both runs, the agent distinguished claims directly supported by the
  repository from its own inference.
- In Experiment 2 specifically, the agent additionally recognized that the
  Pattern (confirmation) should not be applied unconditionally, and surfaced
  reversibility and frequency as missing product context — reasoning present
  in the Pattern record's own `whenNotToUse` field, not invented by the agent.

## Limitations

- **These experiments do not demonstrate general semantic search or
  retrieval.** Repository structure and descriptive naming materially
  contributed to discovery in both runs — most explicitly self-reported by
  the agent in Experiment 2.
- Experiment 1's intent was near-literal to the Pattern's filename and
  `demonstratedIntent` string, which limits what it shows on its own.
  Experiment 2 reduces but does not eliminate this concern — the agent
  itself flagged that structure and naming, not semantic understanding, were
  still doing the work.
- Two sessions against one Pattern record. This does not generalize across
  agents, across Patterns, or across a larger or restructured repository.
- No performance, efficiency, or accuracy metric was measured in either run.
- This is not evidence of production readiness, of an agent-facing product,
  or of any CLI/API — none of those exist in Clara today.
- This record was not independently re-captured or re-verified from a raw
  transcript inside this repository; it reflects the experiment as reported
  by the project owner.

## Portfolio-safe interpretation

**Safe conclusion:**

> An unfamiliar AI agent was able to discover and reason from the same Clara
> Knowledge record consumed by the human Explorer, without being given the
> Pattern name or Knowledge location.

**Paired limitation, to be stated alongside it, not omitted:**

> These experiments do not demonstrate general semantic search or retrieval.
> Repository structure and descriptive naming materially contributed to
> discovery.

**Do not claim, from this evidence:**

- semantic search;
- improved AI performance;
- benchmark results;
- production readiness;
- generalization across agents;
- generalization across Patterns;
- measurable efficiency gains.
