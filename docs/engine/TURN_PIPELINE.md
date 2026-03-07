# Turn Pipeline

## Deterministic Lifecycle
Turn processing is orchestrated by `processNextTurn()` in `engine/gameLoop.js`.

Execution order:
1. Guard: ensure state exists and relationship data is loaded.
2. Relationship simulation:
   - call `stepRelationshipSimulation(state)` from `engine/rules.js`
   - applies edge impacts, computes targets, applies inertia, syncs to state
3. Budget recomputation:
   - `calculateBudget(state)`
4. Political metric recomputation:
   - `calculatePoliticalMetrics(state)`
5. Turn advancement:
   - increment month/year counters
6. Reset action points.

## Why Order Matters
- Relationship simulation must run before budget/politics so derived metrics use latest state.
- Reordering changes outputs and invalidates calibration baselines.

## Reproducibility Guarantees
- Same code + same CSV files + same initial state => same no-policy trajectory.
- Validation runs should always report:
  - final metric values
  - last-12-turn spans
  - finite checks (no NaN/Infinity)
