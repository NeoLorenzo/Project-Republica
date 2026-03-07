# Change Playbook

Use this sequence for safe model changes.

## Standard Sequence
1. Edit `engine/relationships.csv` (or calibration data) with clear rationale.
2. Run validation runbook checks.
3. Confirm no-policy stability and finite outputs.
4. Update docs impacted by the change.
5. Record rationale in `review_notes` (relationships) and commit message/changelog.

## Edge Change Guidance
- Draft with `status=in_review`.
- Approve only after causal and evidence checks pass.
- Runtime should remain unaffected by in-review rows.

## Data Change Guidance
- Update source and notes for modified calibration targets.
- Adjust weight/tolerance when data is lagged or uncertain.

## Rollback Strategy
- Revert status or row edits in `relationships.csv`.
- Re-run validation to confirm baseline behavior restored.

## Release Gate
Do not ship if any of these fail:
- parser errors
- NaN/Infinity
- core last-12 stability regression
- undocumented contract changes
