# Relationship Registry Spec

Authoritative file: `engine/relationships.csv`

## Canonical Extended Schema
Header:
```text
source,target,sign,weight,inertia,target_class,causal_mechanism,evidence_source,evidence_strength,bidirectional_pair_id,status,review_notes
```

## Status Values
- `approved`
- `in_review`
- `rejected`

Runtime inclusion rule:
- only `status=approved` rows are loaded into simulation.

## Computation Semantics (Hybrid)
- Influence edges: weighted/inertial propagation used by the simulation loop.
- Accounting edges: structural/governance links for deterministic arithmetic domains.
- Accounting edges are still validated for sign/direction and required-set completeness.
- Budget accounting values remain arithmetic source-of-truth in `calculateBudget()`; required budget edges are governance/traceability constraints.

## Legacy Compatibility
Parser also accepts legacy 4-column CSV:
```text
Source,Target,Weight,Inertia
```
Legacy rows are treated as implicitly approved.

## Required Validations (Extended Mode)
- required columns present
- `sign` in `{positive, negative}`
- `target_class` in `{fast, medium, slow}`
- `evidence_strength` in `{high, medium, low}`
- `status` in `{approved, in_review, rejected}`
- `weight` numeric
- `inertia` integer >= 1
- `causal_mechanism` non-empty
- `evidence_source` non-empty
- no duplicate `source,target`
- no self-links
- source and target must be known node IDs
- legacy non-node accounting targets are forbidden (`income`, `expenditure`, `deficit`, `debt`)
- approved rows may not target policy nodes (policies are exogenous)
- if extended CSV contains zero approved rows, load fails
- required budget accounting edge set must be complete and sign-correct (see below)

## Required Budget Accounting Edges (Fail-Fast)
Runtime validates these edges during `loadRelationshipsCsv()` and blocks startup if missing or wrong-sign:
- for each fiscal-cost policy row in `policies.csv` (`base_cost != 0` or `cost_slope != 0`): `policy_id -> budget.expenditure` (positive)
- for each tax policy row in `policies.csv` (`revenue_channel=tax`): `policy_id -> tax_revenue` (positive)
- `tax_revenue -> budget.income` (positive)
- `budget.income -> budget.deficit` (negative)
- `budget.expenditure -> budget.deficit` (positive)
- `budget.deficit -> budget.debt` (positive)

Notes:
- This required set is enforced regardless of other optional edges.
- Additional deterministic domains can adopt the same required-set + fail-fast pattern.

## Runtime Failure Modes
Load should fail with actionable errors for:
- unknown nodes
- invalid enums
- malformed rows
- duplicates/self-links
- no approved rows in extended schema

## Change Control
- Edit this file in tandem with parser changes in `engine/rules.js`.
- Any schema change must update:
  - `engine/EDGE_POLICY.md`
  - `README.md`
  - this spec
