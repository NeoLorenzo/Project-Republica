# Validation Runbook

Use this after edge/data/engine changes.

## 1. Registry Integrity
Check node + relationship registry basics:
- `policies.csv` header/schema valid
- `metrics.csv` header/schema valid
- policy IDs unique in `policies.csv`
- metric IDs unique in `metrics.csv`
- no cross-file ID collisions
- policy storage paths resolve to numeric state fields
- metric storage paths resolve to numeric state fields
- policy `ui_order` deterministic
- metric `ui_order` deterministic
- policy `revenue_channel` values valid (`tax|non_tax|none`)
- header/schema valid
- no duplicate source-target pairs
- no self-links
- status values valid
- legacy non-node accounting targets are absent (`income`, `expenditure`, `deficit`, `debt`)
- no approved edge targets a policy node
- required budget accounting edges are present and sign-correct:
  - cost policies -> `budget.expenditure`
  - tax policies (`revenue_channel=tax`) -> `tax_revenue`
  - `tax_revenue -> budget.income` (positive)
  - `budget.income -> budget.deficit` (negative)
  - `budget.expenditure -> budget.deficit` (positive)
  - `budget.deficit -> budget.debt` (positive)

## 2. Parser Validation
- `loadPoliciesCsv()` must succeed.
- `loadMetricsCsv()` must succeed.
- `loadRelationshipsCsv()` must succeed.
- Extended schema must enforce status filtering.
- Legacy 4-column compatibility should still parse.
- Missing required budget edge must fail with explicit edge ID.
- Wrong sign on a required budget edge must fail with explicit edge ID.

## 3. Runtime Smoke (No-Policy)
Run a deterministic 60-turn no-policy simulation and verify:
- no NaN/Infinity
- run completes without parser/runtime errors
- budget values are produced by `calculateBudget()` (no weighted-edge budget arithmetic regression)
- `economy.debt_to_gdp` remains finite and equals `(budget.debt / gdp) * 100` with zero-safe behavior

## 4. Core Stability Check
For last 12 turns, verify spans near zero for:
- `gdp`
- `unemployment_rate`
- `inflation_consumer_prices`

## 5. Bounds Safety
Confirm simulated values remain within configured node bounds.

## 6. Failure Triage Order
1. Schema/parser issues
2. Node ID mismatch or invalid edges
3. Numerical instability (NaN/divergence)
4. Macro stability regression
5. Calibration fit drift

## Recommended Artifacts
- before/after metric table
- last-12 spans
- gate pass/fail matrix
