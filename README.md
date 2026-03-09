# Project Republica: Portugal Simulation

Project Republica is a browser-based country-management and socio-economic simulation focused on Portugal (January 2024 baseline). The project separates simulation math from UI rendering and uses a CSV-driven relationship graph.

## Live Deployment
- Public URL: `https://neolorenzo.github.io/Project-Republica/`

## Quickstart
1. Start a local server:
```bash
python -m http.server 8000
```
2. Open:
```text
http://localhost:8000
```
3. Click `Start Game`.

## Architecture (High Level)
- `engine/`: simulation state, rules, turn loop, relationship registry
- `ui/`: rendering, interaction, graph visualization
- `main.js`: app wiring and startup flow

## Runtime Source-of-Truth Files
- `engine/policies.csv`: authoritative policy registry (includes fiscal coefficients and `gdp_demand_share` for deterministic government-demand mapping)
- `engine/metrics.csv`: authoritative metric registry (includes deterministic `gdp` and `government_demand` nodes)
- `engine/relationships.csv`: active equation-only edge registry (approved rows only)
- `engine/relationships_archive.csv`: non-runtime archive of rejected/historical edge rows
- `engine/calibration_targets_template.csv`: calibration targets plus metric mapping metadata
- `engine/EDGE_POLICY.md`: normative edge governance rules
- `engine/CALIBRATION_GUIDE.md`: calibration strategy and process

## Documentation
Use the docs index for all detailed documentation:
- `docs/INDEX.md`

Key deep links:
- `docs/architecture/SYSTEM_OVERVIEW.md`
- `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`
- `docs/engine/POLICY_NODE_CONSTRAINTS.md`
- `docs/data/CALIBRATION_TARGETS_SPEC.md`
- `docs/operations/VALIDATION_RUNBOOK.md`

## Notes
- Budget accounting values (`budget.income`, `budget.expenditure`, `budget.deficit`, `budget.debt`) are computed by deterministic arithmetic (`calculateBudget()`).
- GDP is deterministic and identity-owned in `recomputeDerivedEconomyMetrics()`:
  - `gdp = consumption + investment + government_demand + netExports`
- Behavioral edges use equation-based contribution runtime with a restricted DSL and no legacy weight fallback.