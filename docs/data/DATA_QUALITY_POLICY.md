# Data Quality Policy

## Objective
Keep calibration grounded in real data while preventing unstable overfitting to stale or weak series.

## Source Quality Tiers
- Tier A: primary official/statistical authority for Portugal or EU context
- Tier B: reputable international datasets with acceptable lag
- Tier C: proxy/lagged/derived data with uncertainty

## Required Metadata per Metric
- clear source in `source`
- caveats in `notes`
- cadence classification
- realistic bounds
- tolerance aligned with data quality and lag

## Handling Lagged Data
If Jan 2024 value is unavailable:
1. use latest high-quality observation
2. reduce `weight` and/or widen `tolerance`
3. record lag in `notes`

## Tolerance and Weight Policy
- High-confidence near-current data: higher `weight`, tighter `tolerance`
- Lagged or noisy data: lower `weight`, wider `tolerance`
- Structural indicators: avoid forcing short-run movement; emphasize bounds and direction

## Citation Formatting Guidance
Use concise source strings:
- `Institution | Dataset | Period`
- Examples:
  - `INE | Employment Survey | Jan 2024`
  - `OECD | Health Statistics | 2022`

## Review Triggers
Reassess data quality when:
- source updates significantly
- definition changes
- metric behavior repeatedly conflicts with known reality
