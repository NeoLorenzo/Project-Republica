# SIMULATION REALISM STATE REPORT

**Date:** 2026-03-12  
**Project:** Project Republica  
**Audited Area:** Phase-1 economic simulation realism
**Applied Standard Source:** `SIMULATION_SCOPE_AND_REALISM_MANIFESTO.md`
**Prompt Clarification Applied:** User-confirmed realism standard is `SIMULATION_SCOPE_AND_REALISM_MANIFESTO.md`

## 1. Scope and Method

### 1.1 Files and Runtime Paths Audited
- Engine code: `engine/state.js`, `engine/rules.js`, `engine/gameLoop.js`, `engine/equationEngine.js`
- Runtime registries: `engine/policies.csv`, `engine/metrics.csv`, `engine/relationships.csv`, `engine/calibration_targets_template.csv`
- Source register data: `data/non_runtime_csv/master_source_register.csv`
- UI transparency path: `ui/render.js`, `ui/forceGraph.js`
- Manifest and ops docs: `SIMULATION_SCOPE_AND_REALISM_MANIFESTO.md`, `docs/operations/VALIDATION_RUNBOOK.md`, `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`

### 1.2 Test Protocol Executed
- Static graph and registry topology audit.
- Deterministic 60-turn no-policy run.
- Identity residual checks each turn.
- One-turn perturbation test across all 84 policy levers.
- Calibration fit check against `locked_value/tolerance/bounds`.
- Split-flow coefficient consistency audit.
- UI traceability contract audit against manifesto requirement.

## 2. Executive Verdict

**Current realism state:** strong deterministic accounting core, severely underdeveloped behavioral economics layer, and major initialization/calibration incoherence.

**Overall realism maturity (Phase-1 economic target):** **5/10**

### 2.1 Dimension Scores
- Hard Math deterministic accounting realism: **9/10**
- Behavioral macro transmission realism: **2/10**
- Policy agency realism (beyond fiscal arithmetic): **3/10**
- Calibration realism (start-state + no-policy plausibility): **4/10**
- Transparency realism (traceability UX contract): **3/10**

### 2.2 Core Finding
The model already behaves like a coherent accounting machine, but not yet like a realistic macroeconomy. The main realism blocker is missing behavioral propagation, not arithmetic correctness.

## 3. What Is Already Realistic (Successful Parallels)

1. Deterministic GDP identity is exactly enforced: `gdp = C + I + G + NX` with zero residual in tested 60-turn runs.
2. Debt ratio identity is exactly enforced: `debt_to_gdp = (budget.debt / gdp) * 100` with zero residual in tested runs.
3. Budget debt stock updates consistently from monthlyized deficit (`annualDeficit/12`) in `calculateBudget`.
4. Government spending is modeled with high COFOG granularity (66 spending levers within 84 total policies).
5. Government split-flow decomposition exists (`P3`, `P51G`, `D62`, `D4`, residual) and drives deterministic channels.
6. Split-flow coefficients are internally conservative by source (sum near 1.0 for all 66 audited source nodes).
7. Active relationship registry is strict and fail-fast (`approved` only, no unknown nodes, no self-links, no duplicate pairs).
8. Required accounting edge set is enforced at load time.
9. Policy-node exogeneity is enforced (no inbound edges to policy nodes).
10. Data provenance scaffolding exists and cites official sources (Eurostat/INE style source registers).
11. Consumption, investment, and government datasets include consistency-check artifacts.
12. Runtime determinism is reproducible with fixed files and state.
13. Accounting aggregate ownership is now explicit: formula-owned nodes (including `gdp`, `debt_to_gdp`, and budget stock/flow nodes) are derived-only at runtime, with seed/calibration locks ignored.

## 4. Realism Deviations Register (Comprehensive)

The table below prioritizes gaps by realism impact.

| ID | Severity | Deviation | Evidence | Realism Impact | Required Correction |
|---|---|---|---|---|---|
| D-02 | Critical | Behavioral network is near-empty | 6 behavioral edges out of 690 total; 684 accounting-trace edges | Economy behaves mostly as static accounting, not adaptive macro system | Expand behavioral layer to cover demand, labor, prices, income, investment, external channels |
| D-03 | Critical | Most simulation-enabled metrics are behaviorally disconnected | 45 simulation-enabled metrics; 42 have zero behavioral inbound edges | Sim-enabled domain mostly frozen and non-economic | Add inbound dynamics or reclassify as deterministic/non-simulated |
| D-04 | Critical | Most player levers lack behavioral pathways | 84 policies total; only 3 have any behavioral edges (`incomeTax`, `vat`, `carbonTax`) | Agency is mostly fiscal bookkeeping, not macro steering | Add causal channels from fiscal/tax/regulatory levers to endogenous macro metrics |
| D-05 | Critical | Labor market realism missing | `unemployment_rate` has exactly 1 behavioral inbound edge (`central_bank_policy_rate`); 0/84 policy perturbations change unemployment | No demand-to-employment transmission | Add Okun-style and labor-demand channels (GDP gap, wages, hiring costs, sector demand) |
| D-06 | High | Inflation model too narrow | Inflation only responds behaviorally to VAT and carbon tax; no wage/import/output-gap channels | Price dynamics are structurally incomplete | Add wage-price, import-price, demand pressure, expectations/exogenous energy channels |
| D-07 | High | Real disposable income is a sink node | `real_household_disposable_income` has inbound edges only; no outbound effects to `consumption` etc. | Income changes do not propagate to aggregate demand | Add outbound edges from real disposable income to consumption/savings/poverty/happiness |
| D-08 | Critical | `nominal_minimum_wage` lever is inert | Exists in `policies.csv` and `state.js`, absent from `relationships.csv` and engine logic | Regulatory lever has zero simulation effect | Add minimum wage transmission to labor costs, employment, wages, inflation, disposable income |
| D-09 | High | `tax_revenue` metric is static | `economy.tax_revenue` is initialized in `state.js` and referenced in required edges but never recomputed in deterministic formulas; policy sensitivity = 0 | Reported tax metric can diverge from actual fiscal mechanics | Deterministically compute tax-revenue ratio or re-scope metric/unit to actual series |
| D-10 | High | No-policy real activity is static | 60-turn no-policy GDP span in last 12 months = 0; C/I/NX effectively flat | No endogenous business-cycle behavior | Introduce behavioral links from prices/income/labor/expectations into C and I (and optionally NX via exogenous shocks) |
| D-11 | High | No-policy unemployment and inflation drift from level effects | m0->m60: unemployment 6.50->6.97, inflation 2.70->3.26 with no policy change | Baseline not in equilibrium despite no shocks | Use delta-from-baseline equations (`x - x*`) or add intercept calibration so baseline is stationary |
| D-12 | Resolved | Turn-1 fiscal discontinuity | Resolved on 2026-03-13: initialization now recomputes budget arithmetic at `m0` using runtime budget logic while preserving opening debt stock | Closed: removes artificial `m0 -> m1` fiscal jump | Implemented in `engine/state.js` + `engine/rules.js` (`calculateBudget(..., { applyMonthlyDebtFlow: false })`) |
| D-13 | Resolved | Initialization GDP discontinuity and mismatch | Resolved on 2026-03-13: deterministic aggregate ownership is enforced (`gdp` and related accounting aggregates are formula-derived, not seed/calibration-owned), and startup anchors now align to deterministic init baseline (`311,423.22`) | Closed: removes conflicting GDP start anchors and startup mismatch messaging | Implemented by enforcing derived-only ownership in runtime seed/calibration paths and reconciling GDP baseline references |
| D-14 | Critical | Calibration mismatch is severe when properly evaluated | 458 rows checked; 13 out-of-tolerance; 1 out-of-bounds (`gdp_gov_exp_other_eur_m`) | Model is not truly calibrated at start-state for key macro nodes | Recalibrate locked values and deterministic derivations jointly |
| D-15 | High | Calibration parser drops `tolerance` and `weight` fields | `parseCalibrationTargetsCsv` validates these fields but does not return them in parsed row object | Runtime calibration diagnostics can silently under-report fit quality | Return and use `tolerance` and `weight` in calibration scoring and reports |
| D-16 | High | Government consumption target inconsistency | `gdp_gov_consumption_G_eur_m` locked target 27,412 vs runtime 46,027.35 and transmission matrix total P3 44,853.2 | Competing definitions of "G" degrade calibration realism | Choose one authoritative definition (National Accounts P3) and align all targets/derivations |
| D-17 | High | Transfer-consumption baseline mismatch | Accounting trace uses `x_raw - 27441.895` while deterministic consumption baseline uses metric initial (currently 0 after calibration lock) | Double-counting control is inconsistent across systems | Unify baseline anchor in one source of truth and remove hard-coded constant divergence |
| D-18 | High | Split-flow coefficients contain non-physical values | 11 negative coefficients; 4 coefficients >1; extremes: +3.782609 and -2.86413 | Can create negative or exaggerated channel flows even if sums equal 1 | Constrain coefficients to [0,1] unless explicitly justified by signed balancing methodology |
| D-19 | High | Residual government "other" channel violates bounds | `gdp_gov_exp_other_eur_m` runtime 12,235.60 vs bound max 5,000 | Indicates mis-specified split structure or outdated bounds | Re-estimate split matrix and/or update realistic bounds with source justification |
| D-20 | Resolved | `gdp_demand_share` contract is inert | Resolved on 2026-03-13: runtime no longer uses policy-share fallback for `G`; contract de-scoped to accounting-owned `G` path (split-flow/P3) and docs aligned | Closed: removes dead fallback contract and doc/runtime mismatch | Implemented by removing policy-based `G` fallback from `engine/rules.js` and updating node/runbook docs |
| D-21 | Medium | Data artifact files are not runtime authoritative | `data/non_runtime_csv/policy_edge_weights.csv` and `data/non_runtime_csv/gdp_gov_exp_transmission_matrix.csv` are present but not loaded directly by runtime code | Risk of stale governance and silent divergence | Add explicit generation/validation pipeline tying these files to runtime `relationships.csv` |
| D-22 | Medium | Temporal dynamics are under-parameterized | Inertia distribution: 689 edges with inertia=2, 1 edge inertia=3; target_class mostly `fast` | Timing realism is too uniform across fundamentally different processes | Add process-specific time constants and cadence classes (labor/price/fiscal/demographic) |
| D-23 | Medium | External sector is static in operation | NX and trade components remain fixed under no-policy; no active exogenous ROW shock pipeline | Misses realistic external-demand/import-price disturbances | Add explicit exogenous shock/event mechanism for trade and imported inflation |
| D-24 | High | Manifesto transparency contract not met in UI | Force graph + tooltips + budget pies exist, but no aggregate->cohort->lever accounting trace journey | Players cannot inspect causality end-to-end as constitution requires | Implement accounting-trace drilldown (Sankey/path explorer with click-through causality) |
| D-25 | Medium | Accounting trace coefficients can mislead interpretation | Budget trace edges use `0.95*x` patterns while deterministic formulas are identity exact | Visual trace may imply non-identity elasticities | Align accounting-trace coefficients to identity-compatible visual semantics |
| D-26 | Medium | Simulation ownership conflict risk in C/I/NX | `consumption`, `investment`, and `netExports` are sim-enabled, but deterministic recompute assigns these values from component arithmetic | Future behavioral edges may be silently overwritten | Ownership guardrails added (derived nodes now excluded from seed/calibration ownership), but finalize by either disabling simulation ownership for C/I/NX or introducing an explicit behavioral-to-deterministic bridge contract |
| D-27 | Low | Anchor representation inconsistency in `state.js` | `simulationConfig.baseValues` comment says normalized, but includes raw-like values for some metrics before seeding | Maintenance and onboarding confusion | Keep only normalized anchors or derive all anchors from registry at init |

## 5. Runtime Evidence Snapshot

### 5.1 Topology
- Total edges: **690**
- Behavioral edges: **6**
- Accounting-trace edges: **684**
- Simulation-enabled metrics: **45**
- Simulation-enabled metrics with behavioral inbound: **3**
- Simulation-enabled metrics without behavioral inbound: **42**
- Policies with any behavioral edge: **3 / 84**

### 5.2 No-Policy Trajectory (Selected)
- `m0`: GDP 311,423.22 | unemployment 6.50 | inflation 2.70 | debt/GDP 84.77
- `m1`: GDP 311,423.22 | unemployment 6.66 | inflation 2.98 | debt/GDP 84.83
- `m12`: GDP 311,423.22 | unemployment 6.97 | inflation 3.26 | debt/GDP 85.42
- `m60`: GDP 311,423.22 | unemployment 6.97 | inflation 3.26 | debt/GDP 88.03

### 5.3 Identity Integrity
- Max GDP identity residual over tested 60 turns: **0**
- Max debt-ratio residual over tested 60 turns: **0**

### 5.4 Policy Sensitivity Coverage (1-turn perturbation, 84 levers)
- GDP affected by **65** levers
- Unemployment affected by **0** levers
- Inflation affected by **2** levers
- Real disposable income affected by **1** lever
- Budget income affected by **16** levers
- Budget expenditure affected by **66** levers
- Deficit affected by **82** levers
- Debt affected by **82** levers
- Debt-to-GDP affected by **83** levers
- `tax_revenue` affected by **0** levers
- Fully inert policy across tracked outputs: **`nominal_minimum_wage`**

### 5.5 Calibration Fit (True tolerance check against raw calibration CSV)
- Rows checked: **458**
- Out-of-tolerance: **13**
- Out-of-bounds: **1**
- Largest tolerance breach ratio: **6117.75x** (`gdp_gov_exp_other_eur_m`)

Key out-of-tolerance nodes:
- `gdp_gov_exp_other_eur_m`
- `household_transfer_income_d62_eur_m`
- `household_consumption_from_transfers_eur_m`
- `gdp_gov_consumption_G_eur_m`
- `household_savings_from_transfers_eur_m`
- `gdp_gov_exp_d4_interest_total_eur_m`
- `public_investment_p51g_eur_m`
- `private_investment_eur_m`
- `gdp`
- `consumption`
- `debt_to_gdp`
- `households_total`
- `government_expenditure`

## 6. Priority Remediation Plan (To Reach Manifesto Realism Standard)

### P0: Baseline Coherence and Calibration Integrity
1. Fix calibration parser to retain and expose `weight` and `tolerance`.
2. (Done 2026-03-13) Budget is recomputed at initialization so turn 0 equals runtime arithmetic, without extra debt accumulation.
3. (Partially done 2026-03-13) Deterministic ownership enforced for aggregate accounting nodes (including budget stock/flow nodes) and GDP baseline reconciled; remaining baseline reconciliation pending for `consumption`, `G`, `D62`, and transfer consumption.
4. Remove hard-coded baseline mismatch (`x_raw - 27441.895`) unless mirrored in deterministic baseline source.
5. Re-estimate or constrain split-flow coefficients and eliminate non-physical negative/>1 shares unless fully justified.

### P1: Behavioral Macro Completion
1. Add labor demand and employment channels (GDP gap, labor cost, productivity proxies).
2. Add outbound links from `real_household_disposable_income` to consumption/savings/poverty metrics.
3. Extend inflation drivers beyond tax pass-through (wages, import prices, demand pressure, expectations proxies).
4. Move from level-only equations to centered/delta equations to avoid no-policy drift artifacts.
5. Activate currently inert regulatory levers (`nominal_minimum_wage` first).

### P2: Policy Agency and Transparency Contract
1. Ensure every player lever has at least one auditable causal path into hard math and/or soft abstractions.
2. Implement manifesto-required accounting trace UX: aggregate -> cohort/channel -> draining lever.
3. Harmonize accounting-trace visual coefficients with deterministic identity semantics.

### P3: Governance and Data Pipeline Hardening
1. Establish authoritative generation pipeline from source matrices to runtime `relationships.csv`.
2. Add automated checks that prevent stale matrix/edge divergence.
3. (Done 2026-03-13) Reconciled docs/contracts by de-scoping inactive `gdp_demand_share` runtime path and documenting accounting-owned `G`.

## 7. Acceptance Gates for "Realism-Ready" Status

The model should not be considered realism-complete until all gates pass:

1. **Stationary baseline gate:** no-policy run has realistic drift profile with explicit justification.
2. **Transmission gate:** each major macro target (`GDP`, unemployment, inflation, disposable income) responds to multiple relevant policy families.
3. **Calibration gate:** no high-priority target out of tolerance at initialization.
4. **Physical plausibility gate:** no non-justified negative or >1 split coefficients in monetary allocation channels.
5. **Agency gate:** no inert player levers in active policy set.
6. **Transparency gate:** user can trace outcomes end-to-end in UI, not only view static graph links.

## 8. Final Assessment

Project Republica already has a credible deterministic accounting skeleton and strong governance scaffolding.  
To meet the manifesto standard of "realistic depth and true systemic player agency," the next required work is not more accounting identity code; it is behavioral transmission completeness, initialization coherence, calibration rigor, and full causal trace UX.
