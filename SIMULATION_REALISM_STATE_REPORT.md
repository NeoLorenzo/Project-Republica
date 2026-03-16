# SIMULATION REALISM STATE REPORT

**Date:** 2026-03-13  
**Project:** Project Republica  
**Audited Area:** Phase-1 economic simulation realism re-audit  
**Applied Standard Source:** `SIMULATION_SCOPE_AND_REALISM_MANIFESTO.md`

## 1. Scope and Method

### 1.1 Files and Runtime Paths Audited
- Engine code: `engine/state.js`, `engine/rules.js`, `engine/gameLoop.js`, `engine/equationEngine.js`
- Runtime registries: `engine/policies.csv`, `engine/metrics.csv`, `engine/relationships.csv`, `engine/calibration_targets_template.csv`
- UI/transparency path: `ui/render.js`, `ui/forceGraph.js`, `ui/inputs.js`
- Ops/docs contracts: `README.md`, `engine/EDGE_POLICY.md`, `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`, `docs/operations/VALIDATION_RUNBOOK.md`

### 1.2 Re-Audit Protocol Executed
- Static registry topology and schema contract audit.
- Deterministic 60-turn no-policy run using runtime loaders and turn loop.
- Identity residual checks each turn.
- One-turn perturbation sweep across all active policy levers.
- Calibration fit check against `locked_value/tolerance/bounds` at initialization.
- Split-flow coefficient physical plausibility audit.
- Documentation/runtime contract consistency check.

## 2. Executive Verdict

**Current realism state:** deterministic accounting integrity remains strong, but behavioral and policy-transmission realism is now weaker than the prior report baseline, and multiple governance/docs contracts are out of sync with runtime behavior.

**Overall realism maturity (Phase-1 economic target):** **4/10**

### 2.1 Dimension Scores
- Hard Math deterministic accounting realism: **9/10**
- Behavioral macro transmission realism: **1/10**
- Policy agency realism (beyond fiscal arithmetic): **1/10**
- Calibration realism (start-state + no-policy plausibility): **4/10**
- Transparency realism (traceability UX contract): **3/10**

### 2.2 Core Finding
The simulation still behaves as a reliable accounting machine, but current active runtime topology has regressed to an even thinner behavioral layer than previously reported, with almost no macro-policy behavioral transmission.

## 3. What Is Already Realistic (Still Working)

1. Deterministic GDP identity is exactly enforced at runtime: `gdp = C + I + G + NX`.
2. Debt-ratio identity is exactly enforced at runtime: `debt_to_gdp = (budget.debt / gdp) * 100`.
3. Budget stock-flow arithmetic remains deterministic and coherent in `calculateBudget`.
4. Initialization still recomputes derived economy metrics and budget at `m0` with `applyMonthlyDebtFlow: false`.
5. Active relationship registry guardrails remain strict: approved-only rows, no unknown nodes, no self-links, no duplicate source-target pairs, no policy inbound edges.
6. Required accounting edge enforcement remains fail-fast at load time.
7. Deterministic ownership guard for accounting-derived nodes remains enforced during seeding/calibration.
8. Runtime determinism is reproducible given fixed files and startup state.

## 4. Re-Audit Deviations Register (Current Runtime)

| ID | Severity | Deviation | Evidence | Realism Impact | Required Correction |
|---|---|---|---|---|---|
| D-01 | Resolved | Prior realism report was materially stale vs runtime (resolved 2026-03-13) | Report has been re-baselined to active registries/runtime outputs and rewritten with current evidence snapshots | Closed: realism governance baseline is now current | Keep this report updated after any topology/registry/runtime-contract change |
| D-02 | Critical | Behavioral network is near-empty | Active edges: 829 total, only 3 behavioral and 826 accounting-trace | Economy behaves almost entirely as static accounting | Expand behavioral layer for demand, labor, prices, investment, external channels |
| D-03 | Critical | Policy behavioral agency is effectively zero | 68 active policies; 0 with any behavioral edge | Player policy mainly alters accounting totals, not endogenous macro dynamics | Add policy -> behavioral metric pathways with auditable mechanisms |
| D-04 | Critical | Simulation-enabled metrics are mostly behaviorally disconnected | 42 simulation-enabled metrics; only 2 have behavioral inbound (`unemployment_rate`, `real_household_disposable_income`) | Sim-enabled space is mostly inert/frozen around baseline anchors | Add behavioral inbound coverage or reclassify metrics as deterministic |
| D-05 | Critical | Labor market realism missing from player agency | `unemployment_rate` has 1 behavioral inbound (`central_bank_policy_rate`) and 0/68 policy perturbations affect unemployment | No labor-demand transmission from fiscal/regulatory controls | Add Okun-style and labor-demand channels linked to policy families |
| D-06 | High | Inflation channel too narrow and policy-inert | Inflation has no policy sensitivity in one-turn perturbation (0/68) | Price-level dynamics do not respond to player action | Add wage, import-price, demand-pressure, expectations channels and policy links |
| D-07 | High | `real_household_disposable_income` is a sink node | Inbound behavioral edges exist, outbound behavioral edges = 0 | Income changes do not propagate to demand/welfare outcomes | Add outbound links to consumption, savings, poverty, wellbeing |
| D-08 | Critical | `nominal_minimum_wage` lever remains fully inert | Present in `policies.csv`; no edges in active relationships; perturbation has zero tracked effects | Regulatory lever has zero simulation function | Add minimum-wage transmission chain (wages, prices, employment, income) |
| D-09 | High | Revenue side is static in operation | `govt_revenue_total_eur_m` is read by budget math but not recomputed by deterministic formulas each turn; perturbation sensitivity = 0 | Reported fiscal income can decouple from policy intent | Add deterministic revenue recompute pipeline or explicit exogenous contract |
| D-10 | High | No-policy real activity remains static with drift artifact | 60-turn no-policy run: GDP flat at 283,981.33; unemployment drifts 6.50 -> 6.97; inflation flat 2.70; debt ratio rises 92.96 -> 115.34 | Baseline lacks realistic endogenous cycle behavior and stationarity | Introduce centered/delta equations and richer endogenous propagation |
| D-11 | High | Calibration parser drops `weight` and `tolerance` fields post-parse | Fields validated but omitted from returned calibration row objects | Runtime calibration diagnostics cannot use declared tolerances/weights | Return/store `weight` and `tolerance`; use in scoring and reporting |
| D-12 | High | Split-flow coefficients include non-physical values | 15 split coefficients outside [0,1]; extremes `+3.782609` and `-2.86413` | Can imply non-physical allocation behavior despite conservative sums | Constrain/justify coefficient domain and document signed-balancing method |
| D-13 | High | Residual government "other" channel violates bounds | `gdp_gov_exp_other_eur_m` runtime 12,235.60 vs bound max 5,000 | Indicates split/bounds mismatch and calibration incoherence | Re-estimate split matrix and/or update bounds with source justification |
| D-14 | High | Docs/runtime contract drift on budget edge model | Docs still reference `tax_revenue -> budget.income` and policy->budget chains, runtime enforces `govt_revenue_total_eur_m -> budget.deficit` and `government_expenditure -> budget.deficit` | Maintenance and validation governance become misleading | Update EDGE/registry/runbook docs to match active runtime contract |
| D-15 | Medium | Budget chart decomposition is non-informative with current policy registry | All policies currently have zero fiscal coefficients and `revenue_channel=none`; pie chart slices empty while totals are nonzero | UI suggests traceability but cannot explain budget composition | Restore fiscal coefficient data or redesign chart contract around active aggregates |
| D-16 | Medium | Temporal dynamics are under-parameterized | Inertia distribution: 828 edges inertia=2, 1 edge inertia=3; target_class mostly `fast` | Process timing realism too uniform | Introduce process-specific cadence/inertia families |
| D-17 | Medium | External sector is deterministic-static in operation | Trade aggregates remain fixed under no-policy run; no active exogenous ROW shock pipeline | Misses external-demand and imported-price disturbances | Add explicit exogenous shock/event mechanism |
| D-18 | High | Manifesto transparency contract still not met in UI | Force graph/tooltips/pies exist, but no aggregate->cohort->lever causal drilldown journey | Users cannot inspect end-to-end causality as required | Implement accounting-trace drilldown/path explorer |

## 5. Runtime Evidence Snapshot (Current Re-Audit)

### 5.1 Registry/Topology Snapshot
- Node registry total: **647**
- Policies: **68**
- Metrics: **579**
- Simulation-enabled metrics: **42**
- Relationship edges total: **829**
- Behavioral edges: **3**
- Accounting-trace edges: **826**
- Policies with any behavioral edge: **0 / 68**
- Simulation-enabled metrics with behavioral inbound: **2 / 42**

### 5.2 Active Behavioral Edge Set
- `central_bank_policy_rate -> unemployment_rate`
- `inflation_consumer_prices -> real_household_disposable_income`

### 5.3 No-Policy Trajectory (60-turn)
- `m0`: GDP **283,981.33** | unemployment **6.50** | inflation **2.70** | debt/GDP **92.96**
- `m1`: GDP **283,981.33** | unemployment **6.66** | inflation **2.70** | debt/GDP **93.34**
- `m12`: GDP **283,981.33** | unemployment **6.97** | inflation **2.70** | debt/GDP **97.44**
- `m60`: GDP **283,981.33** | unemployment **6.97** | inflation **2.70** | debt/GDP **115.34**

### 5.4 Identity Integrity (60-turn run)
- Max GDP identity residual: **0**
- Max debt-ratio residual: **0**

### 5.5 Policy Sensitivity Coverage (1-turn perturbation, 68 levers)
- GDP affected by **65** levers
- Unemployment affected by **0** levers
- Inflation affected by **0** levers
- Real disposable income affected by **0** levers
- Govt revenue total affected by **0** levers
- Budget income affected by **0** levers
- Budget expenditure affected by **66** levers
- Deficit affected by **66** levers
- Debt affected by **66** levers
- Debt-to-GDP affected by **67** levers
- Fully inert policy across tracked outputs: **`nominal_minimum_wage`**

### 5.6 Calibration Fit at Initialization
- Rows checked (`exists_in_current_sim=yes` with numeric state path): **617**
- Out-of-tolerance: **12**
- Out-of-bounds: **1**
- Largest tolerance breach ratio: **6117.75x** (`gdp_gov_exp_other_eur_m`)

Out-of-tolerance nodes:
- `gdp_gov_exp_other_eur_m`
- `household_transfer_income_d62_eur_m`
- `household_consumption_from_transfers_eur_m`
- `gdp_gov_consumption_G_eur_m`
- `household_savings_from_transfers_eur_m`
- `gdp_gov_exp_d4_interest_total_eur_m`
- `public_investment_p51g_eur_m`
- `private_investment_eur_m`
- `gdp`
- `households_total`
- `debt_to_gdp`
- `government_expenditure`

### 5.7 Split-Flow Plausibility Snapshot
- Split source nodes audited: **66**
- Channel edges from split sources to (`G`, `P51G`, `D62`, `D4`, `other`): **210**
- Coefficients outside [0,1]: **15**
- Most extreme coefficients: **+3.782609**, **-2.86413**

## 6. Priority Remediation Plan

### P0: Baseline and Governance Coherence
1. Replace stale report claims with runtime-derived evidence (this re-audit baseline).
2. Reconcile docs/contracts (`README`, `EDGE_POLICY`, `RELATIONSHIP_REGISTRY_SPEC`, `VALIDATION_RUNBOOK`) with active runtime budget-edge model.
3. Fix calibration parser to retain and expose `weight` and `tolerance`.
4. Reconcile initialization anchors and calibration targets for `gdp`, `G`, `D62`, transfer-consumption, and residual-other channels.

### P1: Behavioral Macro Completion
1. Expand behavioral edge set from 3 edges to full macro transmission coverage.
2. Add outbound effects from real disposable income to demand and welfare channels.
3. Activate labor, wage, inflation, and employment policy transmission families.
4. Remove inert active levers (starting with `nominal_minimum_wage`).

### P2: Fiscal/Revenue Dynamics Completion
1. Implement deterministic recomputation or explicit modeled dynamics for `govt_revenue_total_eur_m`.
2. Restore meaningful fiscal coefficients in policy registry, or de-scope/replace budget-slice UI that depends on those coefficients.
3. Ensure one-turn policy sensitivity includes nontrivial macro and fiscal channels beyond expenditure-only movements.

### P3: Split-Flow and Calibration Hardening
1. Re-estimate/constrain split-flow coefficients to physically interpretable ranges (or explicitly justify signed decomposition methodology).
2. Eliminate `gdp_gov_exp_other_eur_m` bounds violations through matrix/bounds reconciliation.
3. Add automated checks for coefficient plausibility and calibration-bound violations in CI.

### P4: Transparency Contract Delivery
1. Implement aggregate -> channel/cohort -> lever causal drilldown UX.
2. Keep force-graph and pie views as overview layers, not primary traceability surface.

## 7. Acceptance Gates for "Realism-Ready" Status

The model should not be considered realism-complete until all gates pass:

1. **Stationary baseline gate:** no-policy trajectory shows justified drift profile; key macro nodes are not unintentionally frozen.
2. **Transmission gate:** each major macro target (GDP, unemployment, inflation, disposable income) responds to multiple relevant policy families.
3. **Calibration gate:** no high-priority initialization targets out of tolerance/out of bounds.
4. **Plausibility gate:** split-flow coefficients are physically justified and bounded by policy.
5. **Agency gate:** no inert policy levers in active policy set.
6. **Governance gate:** docs, validation runbook, and runtime contracts are synchronized.
7. **Transparency gate:** end-to-end causal trace journey is available in UI.

## 8. Final Assessment

Project Republica remains strongest in deterministic accounting integrity. The current blocker to manifesto-level realism is not identity math; it is the absence of behavioral transmission breadth, missing policy-to-behavior pathways, calibration/initialization incoherence in key government channels, and unresolved governance/traceability contract drift.
