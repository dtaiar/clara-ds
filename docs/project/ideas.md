# Clara DS — Idea Log

**Status:** Working notes  
**Purpose:** Preserve promising directions without turning them into committed scope.

Ideas in this document are intentionally allowed to be incomplete, revised, or discarded. Moving an idea into Clara's architecture or product scope requires a separate decision.

---

## IDEA-001 — Clara Explorer / conversational Design System portal

**Status:** Adopted into Vertical Slice 01 — see [`docs/slices/01-intent-first-discovery.md`](../slices/01-intent-first-discovery.md)  
**Captured:** 2026-09-08  
**Adopted:** 2026-09-08

**Status history:** Captured as an exploratory idea (Explore later). Adopted as the first product surface for Vertical Slice 01 once that slice was defined. The sections below are preserved as originally written to keep the reasoning that led to adoption visible.

### Spark

A reference from Contra's homepage suggested a different way to think about a Design System documentation portal: instead of making navigation the only entry point, provide a prominent intent-driven query interface.

The reference is the interaction model — a large prompt/query surface with suggested starting queries — not Contra's visual identity or product purpose.

Reference: https://contra.com/

### Initial concept

Clara could eventually ship a real web product built with Clara itself: a portal for exploring the Design System through both conventional navigation and natural-language/product-intent queries.

Instead of requiring the user to already know that they need a specific component, the entry point could support questions such as:

```text
What should I use for a destructive action?

How do I build a settings form?

Show me components for collecting user input.

What pattern should I use when there is no data yet?

How should this component behave on mobile?
```

Suggested queries could help unfamiliar consumers discover the vocabulary and capabilities of the system.

### Why this might matter to Clara

This could become more than a documentation website.

It may provide a concrete product surface for testing several Clara hypotheses simultaneously:

- discoverability over memorization;
- one source, multiple consumers;
- components plus composition knowledge;
- structured knowledge retrieval;
- human-facing access to the same knowledge exposed to agents;
- Clara building a real product using Clara.

Conceptually:

```text
                  Clara Knowledge
                       │
              ┌────────┴────────┐
              │                 │
        Clara Explorer       Clara CLI
        human interface     agent interface
              │                 │
              └────────┬────────┘
                       │
                 shared knowledge
```

### Potential portfolio value

If the idea survives validation, the portal could play two roles:

1. **A Clara product** — a useful interface for exploring the system.
2. **A Clara proof** — a real interface built using the tokens, components, recipes, patterns, themes, and knowledge architecture it documents.

This creates a useful recursive constraint: if Clara cannot build its own system portal coherently, that may expose weaknesses in Clara itself.

### Important distinction

This idea should not become “an AI chat box for documentation” by default.

The product question is broader:

> Can a Design System be discovered from user intent rather than requiring consumers to know its inventory first?

Natural language may be one interface for that capability, alongside search, filters, conventional navigation, relationships, examples, and structured browsing.

### Open questions

- Is conversational discovery actually better for some Design System tasks, or merely novel?
- What should happen when Clara has no supported answer?
- Can the same query be resolved through Clara Knowledge for both the web portal and CLI?
- Should results return components, patterns, templates, guidance, or combinations of them?
- How do we make provenance visible so users know why Clara recommends something?
- Could the portal itself become part of the first vertical slice, or would that prematurely expand scope?

### Original decision (at capture, 2026-09-08)

**Document, do not commit to building yet.**

When the first vertical slice is defined, evaluate whether a minimal version of this portal is a useful test surface. If it adds unnecessary scope, preserve the idea for a later phase or discard it.

### Current status (2026-09-08)

Vertical Slice 01 — Intent-first Discovery has since been defined, and it names a minimal Clara Explorer as its first product surface. This resolves the open question above ("Could the portal itself become part of the first vertical slice?") in favor of adoption: a minimal Explorer is in scope for Slice 01, as described in [`docs/slices/01-intent-first-discovery.md`](../slices/01-intent-first-discovery.md).

This idea is no longer "explore later." Its scope for Slice 01 is deliberately small — the entry surface only (typography, intent input, primary action, suggestion chips, layout) — not the full conversational-portal concept sketched above. The broader portal concept (patterns/templates results, provenance display, full CLI parity) remains an idea to revisit once the slice's minimal surface is built and evaluated, not committed scope today.
