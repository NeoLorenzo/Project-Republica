# Relationship Registry Spec

Authoritative file: `engine/relationships.csv`

## Canonical Extended Schema
Header:
```text
source,target,sign,weight,inertia,target_class,causal_mechanism,evidence_source,evidence_strength,bidirectional_pair_id,status,review_notes
```

## Status Values
- `approved`
- `in_review`
- `rejected`

Runtime inclusion rule:
- only `status=approved` rows are loaded into simulation.

## Legacy Compatibility
Parser also accepts legacy 4-column CSV:
```text
Source,Target,Weight,Inertia
```
Legacy rows are treated as implicitly approved.

## Required Validations (Extended Mode)
- required columns present
- `sign` in `{positive, negative}`
- `target_class` in `{fast, medium, slow}`
- `evidence_strength` in `{high, medium, low}`
- `status` in `{approved, in_review, rejected}`
- `weight` numeric
- `inertia` integer >= 1
- `causal_mechanism` non-empty
- `evidence_source` non-empty
- no duplicate `source,target`
- no self-links
- source and target must be known node IDs
- accounting blocklist targets are forbidden
- if extended CSV contains zero approved rows, load fails

## Runtime Failure Modes
Load should fail with actionable errors for:
- unknown nodes
- invalid enums
- malformed rows
- duplicates/self-links
- no approved rows in extended schema

## Change Control
- Edit this file in tandem with parser changes in `engine/rules.js`.
- Any schema change must update:
  - `engine/EDGE_POLICY.md`
  - `README.md`
  - this spec
