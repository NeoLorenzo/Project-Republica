# Simulation Realism State Report (Scope-Filtered)

**Date:** 2026-03-11  
**Project:** Project Republica  
**Scope Authority:** `SIMULATION_SCOPE_AND_REALISM_MANIFESTO.md`

## 1. Scope Filter Applied
This report evaluates realism only inside the constitutional scope:

- Core Vision and USP (systemic gravity, math-first causality)
- Two-layer architecture (Hard Math + Soft Abstractions)
- Player agency through fiscal/tax/regulatory levers
- UI/UX transparency requirement ("The Math IS the UI")
- Phase 1 priority (country-management economic engine)

The following are intentionally **not** treated as realism gaps in this report:

- No ABM
- No micro-geography
- No financial microstructure
- No real-time pacing
- No dynamic rest-of-world simulation
- No Phase 2 political systems

## 2. Executive Assessment
**Current state:** strong deterministic accounting core, weak behavioral transmission layer.

### Realism Scores (Within Scope Only)
- Core USP ("fight economic gravity"): **6/10**
- Hard Math layer (deterministic accounting): **8/10**
- Soft Abstraction layer (behavioral reactions): **2/10**
- Player agency realization: **6/10**
- UI/UX math transparency: **4/10**
- Overall Phase-1 realism maturity: **5/10**

## 3. Evidence Summary

### 3.1 Model Structure
- Total active edges: **690**
- Behavioral edges: **6**
- Accounting trace edges: **684**
- Simulation-enabled metrics: **45**
- Simulation-enabled metrics with any behavioral inbound edges: **3**
- Simulation-enabled metrics without behavioral inbound edges: **42**

Behaviorally connected metrics are only:
- `unemployment_rate` (1 inbound behavioral edge)
- `inflation_consumer_prices` (2)
- `real_household_disposable_income` (3)

### 3.2 No-Policy Runtime Dynamics (Observed)
No-policy trajectory (selected checkpoints):

- `m0`: GDP 311,423.22; unemployment 6.50; inflation 2.70; debt/GDP 84.77
- `m1`: GDP 311,423.22; unemployment 6.66; inflation 2.98; debt/GDP 84.83
- `m12`: GDP 311,423.22; unemployment 6.97; inflation 3.26; debt/GDP 85.42
- `m60`: GDP 311,423.22; unemployment 6.97; inflation 3.26; debt/GDP 88.03

Interpretation:
- Accounting stocks/flows are stable and deterministic.
- Core real activity components (`C`, `I`, `G`, `NX`) are effectively flat in no-policy baseline.
- Debt/GDP rises through persistent deficit accumulation.

### 3.3 Policy Sensitivity (1-turn perturbation over 84 policy levers)
Number of levers causing non-zero change:

- GDP: **65**
- Unemployment: **0**
- Inflation: **2**
- Real disposable income: **1**
- Budget income: **16**
- Budget expenditure: **66**
- Deficit: **82**
- Debt: **82**
- Debt/GDP: **83**

Interpretation:
- Fiscal-accounting responsiveness is strong.
- Labor-market and broad behavioral responsiveness is extremely narrow.

### 3.4 Systemic Gravity Test (Pension Cut Pathway)
Tested lever: `gdp_gov_exp_social_protection_GF1002_old_age_eur_m`  
Change: 28,484.7 -> 19,939.2

Observed one-turn deltas:
- Household transfer income (D62): **-8,319.60**
- Household consumption from transfers: **-5,407.74**
- Aggregate consumption: **-5,407.74**
- GDP: **-5,433.12**
- Government expenditure: **-8,545.50**
- Deficit: **-8,545.50**
- Unemployment: **0.00**

Interpretation:
- The accounting-to-demand cascade works (good USP alignment).
- Employment transmission from demand shock is currently missing (major realism shortfall within scope).

### 3.5 Calibration Fit at Initialization
Calibration targets out-of-tolerance at initialization: **13**

Largest misses include:
- `households_total`
- `household_transfer_income_d62_eur_m`
- `gdp`
- `household_consumption_from_transfers_eur_m`
- `consumption`

Interpretation:
- Deterministic closure is functioning, but start-state realism calibration is not yet locked.

## 4. What Is Realistic Right Now (In-Scope)

1. Deterministic accounting identities are consistently enforced.
2. Fiscal and budget arithmetic behaves coherently under policy changes.
3. COFOG-based spending levers can materially move `G`, transfers, deficits, and debt.
4. The model demonstrates true systemic causality in key identity channels (not event scripting).

## 5. In-Scope Realism Gaps (Prioritized)

### High Priority
1. Behavioral layer coverage is too sparse (6 behavioral edges total).
2. Demand-to-labor transmission is absent in practice (`0/84` policy levers move unemployment).
3. Baseline calibration consistency is weak (13 initialization misses).

### Medium Priority
1. Tax and regulatory channels mostly route to fiscal totals, not broad macro behavior.
2. Inflation channel is too narrow (effectively VAT and carbon-tax pass-through only).

### Lower Priority
1. Transparency UX is still graph-centric; no dedicated accounting-trace journey from aggregate -> cohort -> draining lever.

## 6. Constitution Compliance Verdict
Inside current scope, the simulation is:

- **Compliant in architecture intent** (hard deterministic core + soft layer separation).
- **Partially compliant in USP** (systemic gravity exists, but incomplete second-order behavior).
- **Not yet compliant in realism depth target** for behavioral dynamics and full player-agency transmission.

## 7. Practical Phase-1 Conclusion
The project has a credible deterministic macro-accounting backbone.  
The main blocker to "realistic depth and true systemic agency" is not accounting; it is the underdeveloped behavioral transmission network and calibration closure at initialization.
