# Mechanics Reference

## Core Loop
- One turn represents one month.
- Player adjusts policy levers (subject to action points).
- Turn processing applies simulation dynamics and recomputes budget/politics.

## Player Control vs Simulation Control
- Player directly controls policy nodes (`state.policies`).
- Simulation controls endogenous outcome nodes via approved relationships and inertia.

## Action Points
- Default: 3 action points per turn.
- Reset each turn after processing.

## Win / Lose Conditions (Current Project Rules)
### Victory
- approval > 80
- gdp growth > 3%
- happiness > 75
- minimum 20 turns played

### Game Over
- debt > 200% of GDP
- stability < 20
- happiness < 20
- inflation > 15
- unemployment > 20

## Turn Progression
- Starts January 2024
- Month increments each turn
- Year increments after month 12

## Relationship Runtime Rule
- Only approved edges from `engine/relationships.csv` are active.
