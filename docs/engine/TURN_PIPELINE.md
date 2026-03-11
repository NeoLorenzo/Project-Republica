# Turn Pipeline

## Deterministic Lifecycle
Turn processing is orchestrated by `processNextTurn()` in `engine/gameLoop.js`.

Execution order:
1. Guard: ensure state exists and relationship data is loaded.
2. Relationship simulation:
   - call `stepRelationshipSimulation(state)`
   - evaluates approved behavioral equations
   - updates simulation-enabled nodes only
3. Budget recomputation:
   - `calculateBudget(state)` (deterministic authority for budget nodes)
4. Derived deterministic recomputation:
   - `recomputeDerivedEconomyMetrics(state)`
   - computes `government_expenditure` (total government expenditure)
   - computes `gdp_gov_consumption_G_eur_m` (GDP component G)
   - computes deterministic GDP identity (`C+I+G+NX`)
   - recomputes `debt_to_gdp`
5. Deterministic population recomputation:
   - `recomputeDerivedPopulationMetrics(state)`
   - computes annualized births/deaths/migration flows
   - computes monthly stock update for `population.total`
   - recomputes mortality-tree aggregates
6. Turn advancement:
   - increment month/year counters

## Why Order Matters
- Behavioral simulation must run before deterministic recomputation to provide latest C/I/NX values.
- Budget recomputation must run before derived metrics so government-demand arithmetic uses current fiscal entries.
- Population recomputation runs after simulation updates so fertility/mortality driver nodes are up to date before stock-flow accounting is applied.

## Reproducibility Guarantees
- Same code + same CSVs + same initial state => same no-policy trajectory.
- Active relationships come from `engine/relationships.csv` only.
- `engine/relationships_archive.csv` is non-runtime.

