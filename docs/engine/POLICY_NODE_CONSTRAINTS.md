# Policy Node Constraints

## Core Contract
Player-controlled government policy nodes are exogenous controls.

Implication:
- policy nodes may have outgoing edges
- inbound edges to policy nodes are forbidden

This preserves player agency: government policy is set by the player, not dictated by model feedback.

## Policy Node IDs
Policy IDs are sourced from `engine/policies.csv`.

Runtime contract:
- policies are mutable by player
- metrics are immutable by player

## Edge Review Rule
Any approved row in `relationships.csv` where `target` resolves to a policy ID must be rejected.

## Validation Expectation
Model governance checks enforce this constraint at load time (fail-fast on approved policy-target edges).

## Related Docs
- `engine/EDGE_POLICY.md`
- `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`
