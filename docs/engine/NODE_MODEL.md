# Node Model

Authoritative runtime registries:
- `engine/policies.csv`
- `engine/metrics.csv`

## Node Taxonomy
### Policy Nodes (Exogenous)
- Player-controlled policy levers.
- Stored via `policies.csv` `storage_path` entries under `state.policies.*`.
- Treated as external inputs to the simulation.
- Include fiscal coefficients (`base_cost`, `cost_slope`, `base_revenue`, `revenue_slope`, `gdp_scaled`).

Examples:
- `incomeTax`, `corporateTax`, `vat`
- `public_expenditure_on_health`, `public_expenditure_on_education`, `welfareSpending`
- `military_expenditure`, `nominal_minimum_wage`, `housingPolicy.*`, `laborPolicy.*`, `taxPolicy.*`

### Simulation Metric Nodes (Endogenous)
- Tracked under `state.simulation.nodes` with normalized values.
- Synced into `state.economy`, `state.population`, `state.politics`.
- Evolve via inbound approved edges + inertia.
- Metrics are immutable to the player.

### Deterministic/Read-Only Metric Nodes (Non-Simulated)
- Defined in `metrics.csv` with `simulation_enabled=no`.
- Still immutable to the player and can be graph-visible.
- Not updated by weighted/inertial simulation propagation.
- Updated by deterministic arithmetic/derived logic where applicable.

Examples:
- Budget accounting nodes: `budget.income`, `budget.expenditure`, `budget.deficit`, `budget.debt`
- Derived ratio node: `debt_to_gdp`
- Registry-owned state metric: `population.total`

## Normalization Model
- Each simulation metric node has `min`, `max`, `k`, `modifier_range` from `metrics.csv`.
- Raw value <-> normalized value transforms:
  - normalize: `(raw - min) / (max - min)` clamped to `[0,1]`
  - denormalize: `min + normalized * (max - min)`
- For graph link effectiveness, metric normalization can also use registry `min/max` for non-simulated metrics when values are finite.

## Inertia Behavior
- A node computes a target from inbound weighted impacts.
- Current value moves toward target by `1 / effectiveInertia` per turn.
- Effective inertia is weighted by inbound edge magnitudes.

## Rounding and Storage
- Simulation and storage keep raw numeric precision.
- Rounding is display-only in UI formatters.
- Node metadata (`storage_path`, display metadata, mutability/type semantics) is sourced from `policies.csv` and `metrics.csv`.
- Official mapping details live in `engine/calibration_targets_template.csv` columns:
  - `storage_path`
  - `rounding_rule`
  - `inertia_class`
