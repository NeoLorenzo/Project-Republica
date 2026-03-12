# Edge Policy

Purpose: define edge governance and runtime constraints.

This document is normative.

## 1. Computation Modes
- `behavioral_contribution`: simulation-active equation contribution edges.
- `accounting_trace`: deterministic-authority trace edges for graph/governance.

Deterministic calculators remain source-of-truth for accounting identities.

## 2. Sign Contract
Allowed signs:
- `positive`
- `negative`
- `mixed`

Rules:
- Behavioral edges must use `positive` or `negative`.
- `mixed` is allowed only for `accounting_trace` edges.
- Non-mixed edges must pass sign/equation sample checks.

## 3. Structural Guardrails
- no self-links
- no duplicate `source,target`
- no inbound edges to policy nodes
- `inertia` integer >= 1
- equation required and DSL-valid

## 4. Required Accounting Edge Sets (Fail-Fast)
Startup must fail if any required edge is missing, wrong-sign, or wrong mode.

### Budget and Debt Chain
- fiscal-cost policy -> `budget.expenditure` (positive)
- tax policy -> `tax_revenue` (positive)
- non-tax revenue policy -> `budget.income` (positive)
- `tax_revenue -> budget.income` (positive)
- `budget.income -> budget.deficit` (negative)
- `budget.expenditure -> budget.deficit` (positive)
- `budget.deficit -> budget.debt` (positive)
- `budget.debt -> debt_to_gdp` (positive)
- `gdp -> debt_to_gdp` (negative)

### GDP Identity Trace Chain
- `consumption -> gdp` (positive)
- `investment -> gdp` (positive)
- `gdp_gov_consumption_G_eur_m -> gdp` (positive)
- `netExports -> gdp` (mixed)

## 5. Active Registry Policy
- Active runtime file is `engine/relationships.csv`.
- Active rows must all be `status=approved`.
- Rejected/historical rows are tracked in Git history (commit diffs).
