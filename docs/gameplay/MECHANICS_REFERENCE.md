# Mechanics Reference

## Core Loop
- One turn represents one month.
- Player adjusts policy levers (subject to action points).
- Turn processing applies simulation dynamics and recomputes budget/politics.

## Player Control vs Simulation Control
- Player directly controls policy nodes (`state.policies`).
- Simulation updates simulation-enabled metric nodes via approved relationships and inertia.
- Deterministic accounting/derived metrics (for example budget nodes and `debt_to_gdp`) are computed by arithmetic helpers, not weighted edge propagation.

## Action Points
- Default: 3 action points per turn.
- Reset each turn after processing.

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
