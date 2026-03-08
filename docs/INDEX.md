# Documentation Index

This repository uses decentralized documentation. `README.md` is the front door; detailed contracts and runbooks live here.

## Live Deployment
- Public URL: `https://neolorenzo.github.io/Project-Republica/`

## Start Here by Role
### Gameplay Designer
- `docs/gameplay/MECHANICS_REFERENCE.md`
- `engine/EDGE_POLICY.md`
- `docs/engine/POLICY_NODE_CONSTRAINTS.md`

### Simulation Engineer
- `docs/architecture/SYSTEM_OVERVIEW.md`
- `docs/engine/TURN_PIPELINE.md`
- `docs/engine/NODE_MODEL.md`
- `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`
- `docs/operations/VALIDATION_RUNBOOK.md`
- `engine/policies.csv`
- `engine/metrics.csv`

### Data / Calibration Maintainer
- `engine/CALIBRATION_GUIDE.md`
- `docs/data/CALIBRATION_TARGETS_SPEC.md`
- `docs/data/DATA_QUALITY_POLICY.md`
- `docs/operations/CHANGE_PLAYBOOK.md`

## Documentation Map
- `docs/architecture/SYSTEM_OVERVIEW.md`
- `docs/engine/TURN_PIPELINE.md`
- `docs/engine/NODE_MODEL.md`
- `docs/engine/RELATIONSHIP_REGISTRY_SPEC.md`
- `docs/engine/POLICY_NODE_CONSTRAINTS.md`
- `docs/data/CALIBRATION_TARGETS_SPEC.md`
- `docs/data/DATA_QUALITY_POLICY.md`
- `docs/gameplay/MECHANICS_REFERENCE.md`
- `docs/operations/VALIDATION_RUNBOOK.md`
- `docs/operations/CHANGE_PLAYBOOK.md`
- `docs/contributing/DOC_STANDARDS.md`
- `engine/EDGE_POLICY.md` (authoritative policy)
- `engine/CALIBRATION_GUIDE.md` (authoritative calibration strategy)
- `engine/policies.csv` (authoritative policy registry)
- `engine/metrics.csv` (authoritative metric registry)

## Documentation Completeness Checklist
- [ ] README links to docs index and does not duplicate deep specs
- [ ] Relationship schema doc matches `engine/relationships.csv` parser behavior
- [ ] Calibration schema doc matches `engine/calibration_targets_template.csv`
- [ ] Policy node constraints documented and aligned with edge policy
- [ ] Validation runbook commands still execute
- [ ] No broken links from this index
