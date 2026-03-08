# Edge Policy

Purpose: define exactly how simulation edges are allowed to exist, how they function, and how realism is protected without sacrificing playability.

This document is normative. If an edge violates this policy, it must not be approved.

Related contracts:
- `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`
- `docs/engine/POLICY_NODE_CONSTRAINTS.md`

## 1. Design Intent
Edges are not decorative and are not statistical correlations. Each edge represents a direct real-world causal mechanism. The graph has two computation modes:
- Influence edges: weighted/inertial propagation inside the simulation loop.
- Accounting edges: deterministic arithmetic ownership and traceability links for precision-critical identities.

The model must stay both:
- Realistic: causal structure matches how the world works.
- Playable: behavior is stable, interpretable, and responsive.

If realism and playability conflict, realism wins. Non-realistic edges must be removed or explicitly marked for urgent correction.

## 1.1 Edge Computation Modes (Normative)
### Influence Edges
Use when target updates are behaviorally modeled (weighted, inertial, bounded). These edges are simulation-active.

### Accounting Edges
Use when target updates must be exact and are computed by deterministic arithmetic. These edges are governance and traceability links in the graph.

Accounting edge rules:
- Source of truth is the designated deterministic calculator, not weighted propagation.
- Signs and directions must still be mechanistically correct.
- Required accounting edge sets are validated fail-fast at load time.
- Accounting edges may use stronger display weights for legibility if explicitly documented.

This pattern is reusable beyond budget whenever precision requirements demand deterministic arithmetic.

## 2. Causal Standard (Hard Requirement)
An edge is valid only if all are true:
1. Direct mechanism exists from source to target.
2. Mechanism is not just correlation or co-movement.
3. Direction is causally defensible (source causes target, not only vice versa).
4. Sign is mechanism-consistent (positive or negative).
5. Effect timescale is plausible for chosen inertia.

If any item fails, edge is rejected.

## 3. Correlation Is Not Causation
The following are forbidden:
- Correlation-only edges.
- Proxy edges that skip required mediators.
- "Looks right in aggregate" edges with no direct mechanism.

Examples:
- Invalid: `gdp -> renewable_energy_consumption` if rationale is only historical correlation.
- Invalid: `poverty_headcount_ratio -> incarceration_rate` as a direct edge if the mechanism is actually mediated (for example via criminality/policing/judicial throughput).

Policy for mediated relationships:
- If relationship is real but indirect, add intermediate node(s) and split into direct edges.
- Do not compress multi-step chains into one direct edge unless evidence explicitly supports a direct channel.

## 4. Playability Constraint (Without Unrealistic Shortcuts)
Playability controls are allowed only through:
- sensible weight bounds,
- inertia classes,
- sparse graph design,
- staged rollout and validation.

Playability must not be achieved by adding unrealistic causal shortcuts.

If a non-realistic edge is currently needed to keep gameplay functional:
1. mark it as urgent correction in `review_notes` using `URGENT_CORRECTION:<reason>`;
2. create a replacement plan with direct mediator chain;
3. remove the shortcut edge in the next edge batch.

No edge may remain in production long-term if it fails causal realism.

## 5. Evidence Standard
Every edge must have:
- non-empty `causal_mechanism` (one clear mechanism sentence),
- non-empty `evidence_source`,
- `evidence_strength` in `{high, medium, low}`.

Evidence quality guidance:
- high: strong domain literature or institutional evidence for this channel,
- medium: mixed but credible evidence,
- low: plausible but uncertain channel (use lower weight, stricter review).

Low evidence does not bypass the direct-causality requirement.

## 6. Structural Guardrails
### Inertia Floors
- fast target: `inertia >= 2`
- medium target: `inertia >= 4`
- slow target: `inertia >= 8`

### Initial Weight Caps (absolute value)
- fast target: `|weight| <= 0.60`
- medium target: `|weight| <= 0.40`
- slow target: `|weight| <= 0.25`

### Topology Rules
- self-links: forbidden
- duplicate `source,target` pair: forbidden
- bidirectional pairs: forbidden by default; require explicit documented justification
- sparsity default for new targets: start with 1 to 3 inbound edges
- government policy nodes are exogenous player controls: inbound edges to policy nodes are forbidden

## 6.1 Accounting Required Edge Sets (Fail-Fast)
Accounting sets are mandatory structural contracts. Startup must fail if any required accounting edge is missing or has wrong sign.

### Budget Accounting Set (Current)
Required approved edges:
- every policy with fiscal cost (`base_cost != 0` or `cost_slope != 0`) must include `policy_id -> budget.expenditure`
- every policy with `revenue_channel=tax` must include `policy_id -> tax_revenue`
- `tax_revenue -> budget.income` with positive sign
- `budget.income -> budget.deficit` with negative sign
- `budget.expenditure -> budget.deficit` with positive sign
- `budget.deficit -> budget.debt` with positive sign

Budget computation authority:
- deterministic arithmetic in `calculateBudget()` remains source of truth for `budget.income`, `budget.expenditure`, `budget.deficit`, and `budget.debt`.
- required budget accounting edges are governance and traceability links, not the arithmetic engine.

Identity-chain magnitude exception:
- `budget.income -> budget.deficit`, `budget.expenditure -> budget.deficit`, and `budget.deficit -> budget.debt` may use `|weight|=0.95`.
- this exception exists only for these three budget accounting identity links.

Future accounting domains:
- additional deterministic domains may define their own required accounting edge set with the same fail-fast pattern.
- each new set must name its deterministic calculator and required sign conventions.

## 7. Edge Lifecycle
1. Add or update edge row directly in `engine/relationships.csv` using the extended schema.
2. Set `status=in_review` while drafting.
3. Review against Sections 2 to 6.
4. Set `status=approved` only after passing review; set `status=rejected` if invalid.
5. Runtime includes only rows where `status=approved`.
6. Run no-policy stability checks before and after each edge batch.
7. If any approved edge is later found non-causal, tag urgent correction and schedule removal.

## 8. Required Review Checklist (Per Edge)
An edge can be approved only if reviewer can answer "yes" to all:
1. Is there a direct real-world mechanism from source to target?
2. Is this edge causal rather than correlational?
3. Are we avoiding skipped mediators?
4. Are sign, weight, and inertia plausible?
5. Is the target not a player-controlled government policy node?
6. Is evidence documented and strength rated?
7. Is the computation mode clear (influence vs accounting) and consistent with runtime ownership?
8. Would this edge still be defensible if shown to a subject-matter expert?

## 9. `relationships.csv` Field Contract (Extended Schema)
- `source`: node id causing effect
- `target`: node id receiving effect
- `sign`: `positive` or `negative`
- `weight`: effect size within policy caps
- `inertia`: integer inertia for response speed
- `target_class`: `fast`, `medium`, or `slow`
- `causal_mechanism`: explicit direct mechanism
- `evidence_source`: citation or rationale source
- `evidence_strength`: `high`, `medium`, or `low`
- `bidirectional_pair_id`: empty unless approved two-way pair
- `status`: `approved`, `in_review`, or `rejected`
- `review_notes`: reviewer notes, including `URGENT_CORRECTION:<reason>` when applicable

## 10. Enforcement Rule
Production graph policy:
- runtime loads only rows with `status=approved`,
- rows marked `in_review` or `rejected` must not affect simulation behavior,
- any edge failing this policy is either rejected or marked urgent correction and removed on next batch,
- realism violations are treated as model defects, not balancing preferences.
