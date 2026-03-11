# Validation Runbook

Use this after edge/data/engine changes.

## 1. Registry Integrity
Check:
- `policies.csv` schema valid, including required `gdp_demand_share` in `[0,1]`
- `metrics.csv` schema valid
- policy IDs unique, metric IDs unique
- no cross-file ID collisions
- storage paths resolve to numeric state fields
- `relationships.csv` strict schema valid
- all active rows have `status=approved`
- no duplicate source-target pairs, no self-links
- edge modes valid (`behavioral_contribution|accounting_trace`)
- signs valid (`positive|negative|mixed`)
- `mixed` appears only on accounting trace edges
- no active edge targets policy nodes
- required accounting edge set present/sign-correct/mode-correct

## 2. Parser Validation
- `loadPoliciesCsv()` succeeds
- `loadMetricsCsv()` succeeds
- `loadRelationshipsCsv()` succeeds
- missing/invalid `gdp_demand_share` fails
- behavioral edge with `sign=mixed` fails
- missing required GDP identity trace edges fails

## 3. Runtime Determinism
Run 60-turn no-policy simulation and verify:
- no NaN/Infinity
- run completes without load/runtime errors
- GDP identity holds each turn:
  - `abs(gdp - (consumption + investment + gdp_gov_consumption_G_eur_m + netExports)) <= 1e-6`
- debt ratio consistency:
  - `debt_to_gdp == (budget.debt / gdp) * 100` (zero-safe)

## 4. Graph/UI Checks
- graph loads without crashes
- GDP has 4 accounting-trace inbound links (`C/I/G/NX`)
- `government_expenditure` (total expenditure) node renders with value
- `gdp_gov_consumption_G_eur_m` (GDP component G) node renders with value
- mixed-sign `netExports -> gdp` link polarity follows live evaluated contribution sign when available

## 5. Failure Triage Order
1. Schema/parser errors
2. Missing/invalid required accounting edges
3. Deterministic identity violations
4. Numerical instability
5. Stability drift

