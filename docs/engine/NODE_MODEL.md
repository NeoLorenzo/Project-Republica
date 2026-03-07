# Node Model

## Node Taxonomy
### Policy Nodes (Exogenous)
- Player-controlled policy levers.
- Stored under `state.policies`.
- Treated as external inputs to the simulation.

Examples:
- `incomeTax`, `corporateTax`, `vat`
- `healthcareSpending`, `educationSpending`, `welfareSpending`
- `housingPolicy.*`, `laborPolicy.*`, `taxPolicy.*`

### Simulation Nodes (Endogenous)
- Tracked under `state.simulation.nodes` with normalized values.
- Synced into `state.economy`, `state.population`, `state.politics`.
- Evolve via inbound approved edges + inertia.

## Normalization Model
- Each simulation node has `min`, `max`, `k`, `modifierRange`.
- Raw value <-> normalized value transforms:
  - normalize: `(raw - min) / (max - min)` clamped to `[0,1]`
  - denormalize: `min + normalized * (max - min)`

## Inertia Behavior
- A node computes a target from inbound weighted impacts.
- Current value moves toward target by `1 / effectiveInertia` per turn.
- Effective inertia is weighted by inbound edge magnitudes.

## Rounding and Storage
- Certain economy nodes are integers (for example `gdp`, `nominal_minimum_wage`).
- Legacy population headline nodes are integer-rounded.
- Most other synced values are rounded to 1 decimal place.
- Official mapping details live in `engine/calibration_targets_template.csv` columns:
  - `storage_path`
  - `rounding_rule`
  - `inertia_class`
