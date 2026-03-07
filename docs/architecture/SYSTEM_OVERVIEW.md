# System Overview

## Module Boundaries
- `engine/state.js`: baseline state values, policy storage, initialization
- `engine/rules.js`: relationship parsing, simulation math, budget/political helper math
- `engine/gameLoop.js`: turn orchestration (`processNextTurn`)
- `ui/render.js`: DOM rendering
- `ui/inputs.js`: user input wiring
- `ui/forceGraph.js`: graph visualization
- `main.js`: app initialization and start/turn event flow

## Turn Data Flow
1. Application loads state (`initializeGameState`).
2. Relationship registry loads (`loadRelationshipsCsv`).
3. On turn:
   - relationship simulation step executes (`stepRelationshipSimulation`)
   - budget recalculates (`calculateBudget`)
   - political metrics recalculate (`calculatePoliticalMetrics`)
   - turn date advances and action points reset
4. UI re-renders current state.

## Source-of-Truth Ownership
- Relationship network and governance status: `engine/relationships.csv`
- Edge admissibility rules: `engine/EDGE_POLICY.md`
- Calibration targets and mapping contract: `engine/calibration_targets_template.csv`
- Calibration process strategy: `engine/CALIBRATION_GUIDE.md`
- Historical pre-migration intake data: `engine/archive/edge_intake_legacy.csv`

## Determinism Expectations
- No-policy runs should be deterministic given fixed files and code.
- Validation should always use fixed turn horizon (typically 60 turns) and identical startup state.
