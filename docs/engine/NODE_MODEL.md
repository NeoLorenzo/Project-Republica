# Node Model

Authoritative runtime registries:
- `engine/policies.csv`
- `engine/metrics.csv`

## Node Taxonomy
### Policy Nodes (Exogenous)
- Player-controlled policy levers.
- Stored via `policies.csv` `storage_path` entries under `state.policies.*`.
- Include fiscal coefficients used for deterministic budget entry calculation.
- Legacy `gdp_demand_share` column values, if present in `policies.csv`, are ignored by runtime.

### Simulation Metric Nodes (Endogenous)
- Tracked under `state.simulation.nodes` with normalized values.
- Updated via inbound behavioral edge contributions plus inertia.
- Examples include `consumption`, `investment`, `netExports`, labor/inflation/social metrics.

### Deterministic Metric Nodes (Non-Simulated)
- Defined in `metrics.csv` with `simulation_enabled=no`.
- Updated by deterministic arithmetic.

Examples:
- Budget accounting nodes: `budget.income`, `budget.expenditure`, `budget.deficit`, `budget.debt`
- Government expenditure node: `government_expenditure`
- GDP identity nodes: `gdp`, `gdp_gov_consumption_G_eur_m`
- Derived ratio: `debt_to_gdp`
- Population stock-flow nodes: `births_annual`, `deaths_annual`, `migration_in_annual`, `migration_out_annual`, `population_change_annual`, `population.total`

## GDP Ownership Contract
GDP is deterministic and identity-owned:
- `gdp = consumption + investment + gdp_gov_consumption_G_eur_m + netExports`

Where:
- `consumption`, `investment`, `netExports` are million-EUR component nodes.
- `government_expenditure` is deterministic total government expenditure (COFOG-mapped aggregate).
- `gdp_gov_consumption_G_eur_m` is deterministic GDP component `G`, sourced from accounting totals (split-flow `P3` first, then COFOG `p3` aggregate, with node-value fallback only if accounting sources are unavailable).

## Normalization Model
- Simulation-enabled metric nodes use `min/max` normalization.
- Deterministic nodes bypass behavioral propagation and are set directly by arithmetic.

## Inertia Behavior
- Only simulation-enabled nodes use inertia stepping.
- Effective inertia is scaled by equation-derived inbound magnitude hints.

