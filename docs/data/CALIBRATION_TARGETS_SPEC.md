# Calibration Targets Spec

Authoritative file: `engine/calibration_targets_template.csv`

## Purpose
Defines real-world calibration targets and mapping metadata in a single table.

## Schema (Current)
- `metric_id`: stable metric key
- `node_id`: simulation node ID linked to runtime state
- `storage_path`: dot path to synced state field
- `exists_in_current_sim`: `yes`/`no` indicator
- `inertia_class`: `fast`/`medium`/`slow`
- `influence_role`: `driver`/`target`/`both` (project convention)
- `update_cadence_class`: pacing class for expectations
- `rounding_rule`: display/sync rounding convention (`0dp`, `1dp`, `2dp`)
- `closest_existing_field`: legacy or nearest field reference
- `display_name`: human-readable metric name
- `unit`: reporting unit
- `cadence`: data cadence (`monthly`, `quarterly`, `annual`, `structural`, `multi_year`)
- `locked_value`: target baseline value
- `weight`: objective importance weight
- `tolerance`: acceptable deviation before significant penalty
- `min_bound`: lower realism bound
- `max_bound`: upper realism bound
- `source`: citation/source trace
- `notes`: calibration context notes
- `mapping_notes`: mapping implementation notes

## Constraints
- `metric_id` must be unique
- `node_id` must resolve to a known registry node ID (`policies.csv` or `metrics.csv`)
- `min_bound <= locked_value <= max_bound`
- `weight >= 0`
- `tolerance > 0`
- `cadence` must be one of the allowed cadence enums

## Cadence Semantics
- `monthly`: short-run movement expected in 60-turn tests
- `quarterly`: moderate movement expected
- `annual`: slower movement, trend focus
- `structural`: near-flat in short horizons is acceptable
- `multi_year`: lagged and slow-moving indicators

## Usage
- Calibration scoring uses `locked_value`, `weight`, `tolerance`, and bounds.
- Mapping fields (`node_id`, `storage_path`, rounding/cadence classes) are used to align CSV metrics with runtime state and diagnostics.

## Change Control
When adding/removing metrics:
1. update this CSV
2. ensure node exists in runtime where required
3. update calibration docs if semantics changed
