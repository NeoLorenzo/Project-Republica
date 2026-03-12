# Change Playbook

Use this sequence for safe model changes.

## Standard Sequence
1. Edit `engine/policies.csv`, `engine/metrics.csv`, and/or `engine/relationships.csv` with clear rationale.
2. Keep `engine/relationships.csv` approved-only.
3. Keep rejected/historical rows in Git history (commit diffs), not in a runtime CSV.
4. Run validation runbook checks.
5. Confirm deterministic identities and no-policy stability.
6. Update docs and record rationale in `review_notes`.

## GDP Identity Changes
When changing GDP mechanics:
- preserve deterministic ownership (`C+I+G+NX`)
- update GDP trace edges in `relationships.csv`
- update policy `gdp_demand_share` values in `policies.csv`
- revalidate identity tolerance and debt ratio consistency

## Edge Change Guidance
- Behavioral edges must use `positive|negative` signs.
- `mixed` sign is allowed only for `accounting_trace` edges.
- Accounting edges are trace/governance links; deterministic calculators remain authoritative.

## Rollback Strategy
- Restore prior snapshots/commit for CSV and rules files.
- Use Git history for rejected/historical edge rows.
- Re-run validation to confirm baseline behavior.

## Release Gate
Do not ship if any fail:
- parser errors
- required accounting edge failures
- GDP identity mismatch
- NaN/Infinity
- undocumented contract changes
