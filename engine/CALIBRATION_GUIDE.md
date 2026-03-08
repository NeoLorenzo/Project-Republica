# Calibration Guide (Portugal Jan 2024)

## Why This Exists
You now have a broad node/edge graph. Calibration is the step that makes the simulation start near real-world Portugal (January 2024) and remain plausible when turns advance with no player actions.

Without calibration, the model can still be mathematically valid but begin off-equilibrium, so values drift until they find an internal balance that may not match reality.

---

## The Goal of Calibration
Calibration has 2 explicit goals:

1. **Static fit at start**
- At game start, key simulated metrics should match your target dataset (or be within defined tolerance).

2. **Dynamic fit under no-policy play**
- If the player does nothing, the model should remain stable and plausible over a validation horizon (for example 60 turns), instead of drifting to unrealistic values.

In short: **match Jan 2024 and stay believable over time**.

---

## What Calibration Is (and Is Not)

Calibration is:
- Choosing parameter values (and sometimes base anchors) so model outputs match reference data.
- A constrained optimization problem with realism guardrails.

Calibration is not:
- Manually forcing every node to never move.
- Replacing causal relationships with arbitrary curve fitting.

You still want dynamics; calibration just ensures those dynamics are centered around reality.

---

## Data Inputs You Already Have
Primary file:
- `engine/calibration_targets_template.csv`
- Concrete schema reference: `docs/data/CALIBRATION_TARGETS_SPEC.md`

Current columns and purpose:
- `metric_id`: exact node ID to evaluate
- `display_name`: human-readable label
- `unit`: reporting unit
- `cadence`: update speed expectation (`monthly`, `quarterly`, `annual`, `structural`, `multi_year`)
- `locked_value`: Jan-2024 target value (or best available lagged proxy)
- `weight`: importance in objective function
- `tolerance`: acceptable error band before penalty grows
- `min_bound`, `max_bound`: hard realism bounds
- `source`, `notes`: provenance and caveats

Supporting files:
- `engine/calibration_targets_template.csv` now also carries mapping metadata (`node_id`, `storage_path`, cadence/rounding fields)
- `engine/relationships.csv` (active graph edges and governance source of truth; runtime filters to `status=approved`)

---

## Calibration Layers (Recommended)
Use this order so attribution stays clean.

### Layer 1: Start-State / Anchor Calibration
Tune node base anchors so turn-0 matches target values.

What to tune:
- registry `initial_value` in `policies.csv` / `metrics.csv` for node-level starting values
- optionally `simulationConfig.baseValues` for simulation-enabled metric anchors

What not to tune yet:
- edge weights/inertia

Success:
- weighted static error at turn 0 is low
- no node violates bounds

### Layer 2: Dynamic Calibration (No-Policy)
Tune dynamics so 60-turn no-policy behavior is stable and plausible.

What to tune:
- selected edge `weight`
- selected edge `inertia`

Keep guardrails:
- preserve edge signs unless causal review approves sign flip
- keep policy caps/floors from `EDGE_POLICY.md`

Success:
- core macro convergence remains near-zero in last 12 turns
- high-priority metrics stay near targets or trend plausibly

### Layer 3: Formula Bridge Calibration
Only after graph-side calibration is reasonably good.

Reason:
- budget/politics formulas can dominate some outcomes; if they are disconnected from graph outputs, some targets stay flat or insensitive.

What to tune:
- bridge coefficients from graph outputs into budget/political equations

Success:
- previously stubborn metrics become controllable without destabilizing core metrics

---

## Objective Function (How to Score Fit)
Use a single scalar score so runs are comparable.

For each metric `i`:
- error: `e_i = sim_i - target_i`
- tolerance-adjusted residual: `r_i = max(0, |e_i| - tolerance_i)`
- normalized residual: `n_i = r_i / max(tolerance_i, small_scale_i)`
- weighted term: `w_i * n_i`

Total score:
- `J = Sum_i(w_i * n_i) + stability_penalty + bound_penalty + drift_penalty`

Recommended penalties:
- `stability_penalty`: core last-12 span above threshold
- `bound_penalty`: any bound violation
- `drift_penalty`: no-policy trend diverges from expected cadence behavior

Lower `J` is better.

---

## Cadence-Aware Expectations
Different metrics should move at different speeds. Use cadence to avoid false failures.

- `monthly`: can move noticeably in 60 turns
- `quarterly`: should move, but smoother/slower
- `annual`: modest movement expected
- `multi_year` / `structural`: often nearly flat over 60 turns; do not over-penalize tiny movement

Practical rule:
- For structural/multi-year metrics, focus more on staying in tolerance and realistic direction than large short-run delta.

---

## Suggested Calibration Workflow

1. **Freeze model version**
- Use current `relationships.csv` and a snapshot of target CSV.

2. **Baseline run**
- 60-turn no-policy run; capture per-metric first/final, last-12 span, bounds, NaN checks.

3. **Compute baseline score `J0`**
- Store score and per-metric contributions.

4. **Anchor pass (Layer 1)**
- Tune only base anchors/state starts to reduce static mismatch.

5. **Dynamic pass (Layer 2)**
- Tune approved edge parameters with small bounded steps.
- Prefer local search (coordinate descent / hill-climb) over large random jumps.

6. **Re-score and compare**
- Accept parameter changes only if score improves and guardrails remain satisfied.

7. **Repeat until plateau**
- Stop when score improvement per iteration is negligible.

8. **Publish calibrated baseline artifact**
- Save final score, parameter set, and validation report.

---

## Guardrails During Calibration

Hard guardrails:
- No unknown nodes / duplicate edges / self-links
- No NaN/Infinity
- Respect `EDGE_POLICY.md` caps/floors
- Keep causal sign unless explicitly re-reviewed

Behavioral guardrails:
- Core last-12 spans near zero for:
  - `gdp`
  - `unemployment_rate`
  - `inflation_consumer_prices`
- No explosive divergence:
  - max late-run per-turn change < 3x early-run median per-turn change

---

## What to Do About Lagged Real-World Data
Some metrics are not available for Jan 2024.

Use this policy:
1. Keep best available observed value as `locked_value`
2. Reduce `weight` and/or widen `tolerance` for lagged series
3. Document lag in `notes`

This avoids overfitting to stale proxies while still using the information.

---

## Recommended Deliverables (When You Start Calibration Work)

1. `engine/calibration_report_baseline.md`
- Baseline score + per-metric errors + stability diagnostics

2. `engine/calibration_report_final.md`
- Final score + delta vs baseline + gate outcomes

3. Optional: `engine/calibration_config.json`
- Solver settings (iterations, step sizes, thresholds)

---

## Acceptance Criteria for "Calibrated"
A calibration pass is accepted only if all are true:

1. Parse/runtime clean, finite values
2. Core macro last-12 span near-zero
3. No bound violations
4. Total score improves materially vs baseline
5. High-priority anchors (weight >= 0.8) are within tolerance or have documented exceptions

---

## What This Means for Your Current Priorities (QOL First)
You can delay implementation and still prepare correctly by doing only planning/data hygiene now:

- Keep target CSV quality high (source + notes + realistic tolerance)
- Keep mapping metadata accurate
- Keep edge governance strict
- Define final calibration gates before coding solver logic

Then, when ready, implement calibration as a deterministic pipeline, not ad-hoc tweaking.

---

## One-Sentence Definition
**Calibration is the process of tuning model anchors and dynamics so the simulation starts at Jan-2024 Portugal values and remains stable/plausible under no-policy turns.**
