# Policy Node Constraints

## Core Contract
Player-controlled government policy nodes are exogenous controls.

Implication:
- policy nodes may have outgoing edges
- inbound edges to policy nodes are forbidden

This preserves player agency: government policy is set by the player, not dictated by model feedback.

## Policy Node IDs
From runtime policy-node list in `engine/rules.js`:
- `incomeTax`
- `corporateTax`
- `vat`
- `healthcareSpending`
- `educationSpending`
- `welfareSpending`
- `transportSpending`
- `digitalInfrastructure`
- `policeSpending`
- `justiceSpending`
- `greenEnergy`
- `carbonTax`
- `housingPolicy.maisHabitacao`
- `housingPolicy.goldenVisa`
- `housingPolicy.alTaxes`
- `housingPolicy.rentControl`
- `laborPolicy.minimumWage`
- `laborPolicy.fourDayWeek`
- `laborPolicy.youthJobs`
- `taxPolicy.nhrRegime`
- `taxPolicy.wealthTax`

## Edge Review Rule
Any row in `relationships.csv` where `target` is one of the IDs above must be rejected.

## Validation Expectation
Model governance checks should enforce this constraint before approving new edges.

## Related Docs
- `engine/EDGE_POLICY.md`
- `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`
