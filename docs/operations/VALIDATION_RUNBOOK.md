# Validation Runbook

Use this after edge/data/engine changes.

## 1. Registry Integrity
Check relationship registry basics:
- header/schema valid
- no duplicate source-target pairs
- no self-links
- status values valid

## 2. Parser Validation
- `loadRelationshipsCsv()` must succeed.
- Extended schema must enforce status filtering.
- Legacy 4-column compatibility should still parse.

## 3. Runtime Smoke (No-Policy)
Run a deterministic 60-turn no-policy simulation and verify:
- no NaN/Infinity
- run completes without parser/runtime errors

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
