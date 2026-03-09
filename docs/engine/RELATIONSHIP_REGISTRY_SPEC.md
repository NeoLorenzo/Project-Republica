# Relationship Registry Spec

Authoritative files:
- Active runtime registry: `engine/relationships.csv`
- Non-runtime history archive: `engine/relationships_archive.csv`

## Active Schema (Strict)
Header:
```text
source,target,sign,equation,edge_mode,inertia,target_class,causal_mechanism,evidence_source,evidence_strength,bidirectional_pair_id,status,review_notes
```

## Active Registry Rules
- All rows must be `status=approved`.
- Draft/rejected rows must not appear in `engine/relationships.csv`.
- Rejected/historical rows are stored in `engine/relationships_archive.csv`.

## Computation Semantics
- Behavioral edges (`edge_mode=behavioral_contribution`):
  - `equation` is mandatory.
  - Equation is evaluated each turn to produce contribution to target raw impact.
  - Contributions are summed per target, then node shaping/inertia is applied.
- Accounting trace edges (`edge_mode=accounting_trace`):
  - Kept for governance/traceability and graph topology.
  - Do not own accounting state updates.
  - Deterministic arithmetic remains source-of-truth in `calculateBudget()` and `recomputeDerivedEconomyMetrics()`.

## Sign Contract
Allowed signs:
- `positive`
- `negative`
- `mixed`

Rules:
- `mixed` is allowed only when `edge_mode=accounting_trace`.
- Behavioral edges must use `positive` or `negative`.
- Sign/equation sample validation:
  - `positive`: sampled equation output must not be negative.
  - `negative`: sampled equation output must not be positive.
  - `mixed`: sign consistency check is skipped, finite-check still applies.

## Equation DSL Contract
Allowed operators:
- `+ - * / ^`

Allowed functions:
- `abs,min,max,pow,sqrt,log,exp,clamp`

Allowed variables:
- `x,x_raw,x_min,x_max,target_min,target_max`

## Required Validations
- required columns present
- `sign` in `{positive, negative, mixed}`
- `edge_mode` in `{behavioral_contribution, accounting_trace}`
- `target_class` in `{fast, medium, slow}`
- `evidence_strength` in `{high, medium, low}`
- `status` must be `approved`
- `equation` must be present and parse successfully
- equation sample evaluation must be finite
- no duplicate `source,target`
- no self-links
- source and target must be known node IDs
- legacy non-node accounting targets are forbidden (`income`, `expenditure`, `deficit`, `debt`)
- active rows may not target policy nodes
- required accounting edges must use `edge_mode=accounting_trace`
- required accounting edge set must be complete and sign-correct

## Required Accounting Edge Set (Fail-Fast)
Runtime blocks startup if any required accounting edge is missing or wrong-sign:
- each fiscal-cost policy (`base_cost != 0` or `cost_slope != 0`) -> `budget.expenditure` (positive)
- each tax policy (`revenue_channel=tax`) -> `tax_revenue` (positive)
- each non-tax policy with non-zero revenue coefficients -> `budget.income` (positive)
- `tax_revenue -> budget.income` (positive)
- `budget.income -> budget.deficit` (negative)
- `budget.expenditure -> budget.deficit` (positive)
- `budget.deficit -> budget.debt` (positive)
- `budget.debt -> debt_to_gdp` (positive)
- `gdp -> debt_to_gdp` (negative)
- `consumption -> gdp` (positive)
- `investment -> gdp` (positive)
- `government_demand -> gdp` (positive)
- `netExports -> gdp` (mixed)

## Runtime Failure Modes
Load must fail with actionable errors for:
- malformed rows/header mismatch
- unknown nodes or invalid enums
- invalid equation syntax/variables/functions
- non-finite equation evaluations
- sign/equation mismatch for non-mixed signs
- duplicate/self-link violations
- any row with `status != approved`
- missing required accounting edges or wrong signs