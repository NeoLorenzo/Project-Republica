# Tax Base Proxy Expansion Stage 2

## Purpose
Stage 2 expands deterministic tax-base coverage using explicit macro proxies where strict legal-base nodes are not yet present.

This stage follows the manifesto constraints:
- Hard-math deterministic edges only.
- Clear source-to-tax traceability in the graph.
- Proxy mappings are explicitly labeled as proxies (not strict legal 1:1).

## Calibration Rule
For each mapped tax stream:

`proxy_rate = baseline_tax_stream_value / baseline_proxy_base_value`

Then:
- Set `policies.tax_rate_*` initial value to `proxy_rate`.
- Add paired accounting edges:
  - `proxy_base -> tax_stream` with `equation=x_raw`
  - `tax_rate_policy -> tax_stream` with `equation=x_raw`
- Runtime applies deterministic product for mapped leaves:
  - `tax_stream = current_proxy_base * current_tax_rate_policy`

Baseline source year: 2023 registry seed values.

## Stage-2 Added Proxy Mappings

### High-confidence macro proxies
1. Value added tax
- `consumption -> tax_pt_d211_c01_eur_m`
- Rate: `0.1330484324`

2. Import levies
- `imports_goods_total_eur_m -> tax_pt_d2121_c01_eur_m`
- Rate: `0.0028945757`

3. Sugary-drinks excise
- `gdp_consumption_food_and_non_CP012_non_alcoholic_beverages_eur_m -> tax_pt_d214a_c06_eur_m`
- Rate: `0.0229073467`

4. Municipal tourist tax
- `exports_services_ebops_sd_eur_m -> tax_pt_d59b_c01_eur_m`
- Rate: `0.0027624656`

### Bundled sin-tax proxy families
Tobacco bundle proxy base: `gdp_consumption_alcoholic_bev_CP022_tobacco_eur_m`
- `-> tax_pt_d214a_c01_eur_m` at `0.1810419737`
- `-> tax_pt_d2122c_c01_eur_m` at `0.3290235451`

Alcohol bundle proxy base: `gdp_consumption_alcoholic_bev_CP021_alcoholic_beverages_eur_m`
- `-> tax_pt_d214a_c02_eur_m` at `0.0000717211`
- `-> tax_pt_d214a_c03_eur_m` at `0.0446442886`
- `-> tax_pt_d214a_c04_eur_m` at `0.0437667595`
- `-> tax_pt_d2122c_c02_eur_m` at `0.0002953223`
- `-> tax_pt_d2122c_c03_eur_m` at `0.0309497733`
- `-> tax_pt_d2122c_c04_eur_m` at `0.0047124996`

## Strict 1:1 Mapping Retained
- `gdp_consumption_transport_CP071_purchase_of_vehicles_eur_m -> tax_pt_d214d_c01_eur_m`
- Rate: `0.0556012827`
- Status: `REALISTIC_LOCKED_1TO1`

## Explicitly Parked / Exogenous (No Stage-2 Proxy Edge)
To avoid semantic mismatch and non-physical rates, these were not mapped in Stage 2:
- Insurance-premium tax streams (`tax_pt_d214b_c03_eur_m`, `tax_pt_d214g_*`)
- Water-resource fee streams (`tax_pt_d29f_c01_eur_m`, `tax_pt_d59f_c04_eur_m`)

They remain exogenous until legally aligned base nodes are added.

## Files Updated
- `engine/relationships.csv`
- `engine/policies.csv`
- `engine/state.js`
- `engine/rules.js` (deterministic rate*base accounting execution for mapped tax leaves)
