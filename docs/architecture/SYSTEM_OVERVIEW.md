# System Overview

## Module Boundaries
- `engine/state.js`: baseline state values, policy storage, initialization
- `engine/rules.js`: node/relationship registry parsing, simulation math, budget/derived-metric helper math
- `engine/gameLoop.js`: turn orchestration (`processNextTurn`)
- `ui/render.js`: DOM rendering
- `ui/inputs.js`: user input wiring
- `ui/forceGraph.js`: graph visualization
- `main.js`: app initialization and start/turn event flow

## Turn Data Flow
1. Policy registry loads (`loadPoliciesCsv`).
2. Metric registry loads (`loadMetricsCsv`).
3. Application loads state (`initializeGameState`).
4. Relationship registry loads (`loadRelationshipsCsv`).
5. On turn:
   - relationship simulation step executes (`stepRelationshipSimulation`)
   - budget recalculates (`calculateBudget`)
   - derived deterministic metrics recalculate (`recomputeDerivedEconomyMetrics`)
   - turn date advances
6. UI re-renders current state.

## Computation Model
- Influence model: approved relationship edges drive simulation-enabled metric updates with weight + inertia.
- Deterministic accounting model: precision-critical accounting nodes are calculated by arithmetic helpers, with required edge sets enforced for structural governance.
- Budget currently uses deterministic arithmetic authority (`calculateBudget`) with fail-fast required-edge validation.

## Source-of-Truth Ownership
- Policy identity/mutability/bounds/initial values/fiscal coefficients: `engine/policies.csv`
- Metric identity/bounds/initial values/simulation defaults/UI metadata: `engine/metrics.csv`
- Relationship network and governance status: `engine/relationships.csv`
- Edge admissibility rules: `engine/EDGE_POLICY.md`
- Calibration targets and mapping contract: `engine/calibration_targets_template.csv`
- Calibration process strategy: `engine/CALIBRATION_GUIDE.md`

## Determinism Expectations
- No-policy runs should be deterministic given fixed files and code.
- Validation should always use fixed turn horizon (typically 60 turns) and identical startup state.
