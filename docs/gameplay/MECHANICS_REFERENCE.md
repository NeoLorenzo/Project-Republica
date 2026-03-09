# Mechanics Reference

## Core Loop
- One turn represents one month.
- Player adjusts policy levers.
- Turn processing applies simulation dynamics and recomputes budget/derived metrics.

## Player Control vs Simulation Control
- Player directly controls policy nodes (`state.policies`).
- Simulation updates simulation-enabled metric nodes via approved relationships and inertia.
- Deterministic accounting/derived metrics (for example budget nodes, `government_demand`, `gdp`, and `debt_to_gdp`) are computed by arithmetic helpers, not behavioral edge propagation.

## Win / Lose Conditions
- No enforced runtime win/lose gate is currently documented in engine turn logic.
- UI includes `renderGameOver(...)` support, but threshold policy should be treated as a separate design contract until explicitly wired.

## Turn Progression
- Starts January 2024
- Month increments each turn
- Year increments after month 12

## Relationship Runtime Rule
- Only approved edges from `engine/relationships.csv` are active.
- Budget accounting required edges are validated fail-fast, while budget arithmetic remains deterministic in `calculateBudget()`.
- GDP trace edges are accounting-trace only; deterministic GDP identity is computed in `recomputeDerivedEconomyMetrics()`.
