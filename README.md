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
- `engine/policies.csv`: authoritative policy registry (mutable policy metadata, bounds, initial values, fiscal coefficients)
- `engine/metrics.csv`: authoritative metric registry (immutable metric metadata, bounds, initial values, simulation defaults)
- `engine/relationships.csv`: master edge registry (runtime loads only rows with `status=approved`)
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
- Budget accounting values (`budget.income`, `budget.expenditure`, `budget.deficit`, `budget.debt`) are computed by deterministic arithmetic (`calculateBudget()`), while required accounting edges are enforced for governance/traceability.
- The repository may include active WIP changes; validate behavior after structural edits.
