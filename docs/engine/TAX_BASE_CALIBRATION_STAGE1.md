# Tax Base Calibration Stage 1

Note: Stage 1 documents the strict initial lock. Additional proxy expansions are documented in `docs/engine/TAX_BASE_PROXY_STAGE2.md`.

## Purpose
This step introduces the first deterministic tax-base calibration links in the Phase-1 hard-math layer.

Scope of this stage:
- Add explicit `base -> tax_stream` deterministic edges for the highest-confidence 1:1 pairs.
- Compute initial tax-rate policy values from baseline data.
- Keep calibration transparent and auditable.

## Calibration Rule
For each mapped tax stream:

`calibrated_rate = baseline_tax_stream_value / baseline_tax_base_value`

Then:
- Set `policies.tax_rate_*` initial value to `calibrated_rate`.
- Set `tax_stream = calibrated_rate * tax_base` through an accounting edge equation.

## Stage-1 Mappings
Baseline source year in-node values: 2023 (registry seed values).

1. Motor-vehicle sales tax (REALISTIC_LOCKED_1TO1)
- Tax node: `tax_pt_d214d_c01_eur_m`
- Base node: `gdp_consumption_transport_CP071_purchase_of_vehicles_eur_m`
- Baseline values: `476.85 / 8576.241`
- Calibrated rate: `0.0556012827`
- Edge equation: `0.0556012827*x_raw`

## Files Updated
- `engine/relationships.csv`
- `engine/policies.csv`
- `engine/state.js`

## Why This Counts As Calibration
This is a direct data-driven calibration step:
- No behavioral elasticity was used.
- Rates are inferred from observed baseline tax and base magnitudes.
- The equations are deterministic and reproducible.

## Current Limitation
This stage currently keeps only one strict 1:1 pair. It does not yet cover:
- multi-base taxes,
- threshold/nonlinear tax schedules,
- or full legal-base decomposition.

Additional note:
- Non-strict proxy tobacco mappings were removed to preserve strict legal-base realism.
