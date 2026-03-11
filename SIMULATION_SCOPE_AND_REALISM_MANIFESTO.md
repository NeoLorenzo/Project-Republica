# SIMULATION_SCOPE_AND_REALISM_MANIFESTO

## Constitutional Status
This document is the constitutional design authority for Project Republica.

- It defines what this game is.
- It defines what this game is not.
- Every new system, mechanic, UI feature, and code change must be checked against this manifesto before implementation.

If a proposal violates this document, the proposal is rejected unless this manifesto is explicitly amended first.

## 1. The Core Vision & USP (Unique Selling Proposition)

### The Goal
The game is conceptually *Democracy 4*, but with actual realistic depth and true systemic player agency.

### The Flaw of Democracy 4
*Democracy 4* relies on an intricate web of arbitrary "if-then" sliders and hidden multipliers (for example, cutting welfare can magically trigger a "Poverty" event based on developer bias).  
It is a vibes-based political compass.

### Our Solution: Systemic Gravity
Our engine is built on actual macroeconomic physics (Eurostat matrices), not vibes.

Example constitutional behavior:
- If the player cuts `GF1002_Old_Age_Pensions`, exact Euros are mathematically removed from `Household_Disposable_Income`.
- Households then reduce spending in categories such as Housing and Restaurants.
- Real GDP declines through the identity channels.
- Business revenues weaken.
- Unemployment rises.
- Poverty pressure emerges as a mathematical consequence, not as a scripted ideological event.

Design principle:
- The player fights economic gravity, not the developer.

## 2. The Two-Layer Architecture
To keep the game fun and the engine lightning-fast, the simulation is split into two strict layers.

### Layer A: The Hard Math (10/10 Realism)
Deterministic accounting identity layer.

- GDP identity: `GDP = C + I + G + NX`
- Treasury deficit accounting
- National debt accumulation
- Trade balance accounting
- Every Euro is tracked deterministically

Rule:
- Hard Math is the source of truth. No soft system may violate accounting identities.

### Layer B: The Soft Abstractions (6/10 Realism)
Behavioral response layer that translates hard outcomes into human/economic reactions.

- We do not use ultra-heavy 50-variable academic equations.
- We use clean, tunable elasticity modifiers (for example, Marginal Propensity to Consume).
- Soft parameters must remain interpretable, calibratable, and fast.

Rule:
- Soft Abstractions can shape distribution, timing, and behavior, but cannot create or destroy Euros outside Hard Math.

## 3. The "Blood Oath" (Strict Anti-Goals / Out of Scope)
To prevent simulation death-by-complexity, we swear to never include the following:

### No Agent-Based Modeling (ABM)
- We will not simulate millions of individual citizens.
- We use Aggregated Cohorts (for example: Working Class, Retirees, High Earners).

### No Micro-Geography
- This is a national simulator, not a city builder.
- We do not track which province builds a specific hospital.
- The economy is modeled as a single national pool.

### No Financial Microstructure
- We track National Debt and Central Bank base rates.
- We do not simulate stock order books, derivatives microstructure, or individual bank balance sheets.

### No Real-Time Pacing
- The simulation advances in discrete turns (Monthly or Quarterly).
- Real-time macro pacing is forbidden due to readability and decision-noise costs.

### No Dynamic Rest-of-World (ROW)
- Foreign demand, global oil prices, and ECB rates are exogenous (scripts/events).
- The outside world acts on the player.
- The player does not simulate the outside world.

## 4. Player Agency & Levers
The player is the primary allocator of resources and rules.

### Fiscal Levers
- Exact Euro allocations across the 66 COFOG government spending nodes.

### Tax Levers
- VAT (affects consumption prices)
- Income Tax (drains disposable income)
- Corporate Tax (affects private investment)

### Regulatory Levers
- Minimum wage
- Retirement age
- Carbon targets

Design requirement:
- Every lever must have a transparent and auditable pathway into Hard Math and/or Soft Abstractions.

## 5. UI/UX Philosophy: The Math IS the UI
Because outcomes are systemic and cascading, hidden math is unacceptable.

### Transparency Mandate
- The UI must include a built-in Accounting Trace (interactive Sankey-style flow).
- A player must be able to click `Consumption` and see exactly which cohort reduced spending.
- A player must be able to click that cohort and see exactly which policy/tax drained their wallet.
- Causality must be inspectable end-to-end.

Design rule:
- If the player cannot trace an outcome, the feature is incomplete.

## 6. Phased Development Rule

### Phase 1 (Current)
- 100% focus on Country Management and the economic engine.

### Phase 2 (Future)
- Political mechanics, elections, voter opinion.

Hard gate:
- No political mechanics may be coded until Phase 1 is demonstrably and consistently complete.

## Constitutional Compliance Checklist (Required Before Any Merge)
Every PR/change must pass all checks:

1. Does this preserve deterministic Hard Math identities?
2. Does this stay within declared Soft Abstraction boundaries?
3. Does this violate any Blood Oath anti-goal?
4. Does this improve or preserve player agency through explicit levers?
5. Is causality visible in the Accounting Trace UI pathway?
6. Is this work in the correct phase (Phase 1 vs Phase 2)?

If any answer is "no," do not merge.
