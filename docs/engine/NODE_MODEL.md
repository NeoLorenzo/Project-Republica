# Node Model

Authoritative runtime registries:
- `engine/policies.csv`
- `engine/metrics.csv`

## Node Taxonomy
### Policy Nodes (Exogenous)
- Player-controlled policy levers.
- Stored via `policies.csv` `storage_path` entries under `state.policies.*`.
- Include fiscal coefficients and `gdp_demand_share` used by deterministic government-demand mapping.

### Simulation Metric Nodes (Endogenous)
- Tracked under `state.simulation.nodes` with normalized values.
- Updated via inbound behavioral edge contributions plus inertia.
- Examples include `consumption`, `investment`, `netExports`, labor/inflation/social metrics.

### Deterministic Metric Nodes (Non-Simulated)
- Defined in `metrics.csv` with `simulation_enabled=no`.
- Updated by deterministic arithmetic.

Examples:
- Budget accounting nodes: `budget.income`, `budget.expenditure`, `budget.deficit`, `budget.debt`
- GDP identity nodes: `gdp`, `government_demand`
- Derived ratio: `debt_to_gdp`

## GDP Ownership Contract
GDP is deterministic and identity-owned:
- `gdp = consumption + investment + government_demand + netExports`

Where:
- `consumption`, `investment`, `netExports` are million-EUR component nodes.
- `government_demand` is deterministic, computed from policy expenditure entries using `gdp_demand_share`.

## Normalization Model
- Simulation-enabled metric nodes use `min/max` normalization.
- Deterministic nodes bypass behavioral propagation and are set directly by arithmetic.

## Inertia Behavior
- Only simulation-enabled nodes use inertia stepping.
- Effective inertia is scaled by equation-derived inbound magnitude hints.