# Documentation Standards

## Writing Style
- Be explicit and operational.
- Prefer concrete rules over vague guidance.
- Keep examples aligned with current file schemas.

## Required Sections for Technical Docs
- Purpose
- Source of truth
- Contracts/schema
- Validation/guardrails
- Change control

## Ownership Model
- Engine contracts: simulation maintainers
- Data contracts: calibration/data maintainers
- Operations runbooks: maintainers executing releases

## Update Triggers
Update docs when:
- `relationships.csv` schema or parser logic changes
- policy node list changes
- calibration CSV columns/semantics change
- turn pipeline order changes
- validation gates change

## Link Hygiene
- Every new doc must be linked from `docs/INDEX.md`.
- README should link to index and key entry docs only.

## Drift Prevention
- Treat docs as part of the contract, not optional commentary.
- If behavior changes and docs are stale, fix docs in the same change set.
