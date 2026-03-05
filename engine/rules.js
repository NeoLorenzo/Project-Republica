// Mathematical relationships between game variables
// CSV-driven simulation math with bounded logistic targeting and inertia.
// NO UI CODE HERE - PURE MATH ONLY

const relationshipLoadState = {
    loaded: false,
    loading: false,
    error: null
};

let relationshipEdges = [];
let edgesByTarget = new Map();
let relationshipNodeIds = new Set();
let nodeConfigs = {};
const ACCOUNTING_TARGET_BLOCKLIST = new Set(['income', 'expenditure', 'deficit', 'debt']);

const POLICY_NODE_IDS = [
    'incomeTax',
    'corporateTax',
    'vat',
    'healthcareSpending',
    'educationSpending',
    'welfareSpending',
    'transportSpending',
    'digitalInfrastructure',
    'policeSpending',
    'justiceSpending',
    'greenEnergy',
    'carbonTax',
    'housingPolicy.maisHabitacao',
    'housingPolicy.goldenVisa',
    'housingPolicy.alTaxes',
    'housingPolicy.rentControl',
    'laborPolicy.minimumWage',
    'laborPolicy.fourDayWeek',
    'laborPolicy.youthJobs',
    'taxPolicy.nhrRegime',
    'taxPolicy.wealthTax'
];

const SIMULATED_NODE_DEFAULTS = {
    gdp: { min: 180000, max: 420000, k: 1.6, modifierRange: 0.28 },
    unemployment: { min: 0, max: 25, k: 1.7, modifierRange: 0.22 },
    inflation: { min: 0, max: 10, k: 1.7, modifierRange: 0.22 },
    consumption: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    investment: { min: 0, max: 100, k: 1.55, modifierRange: 0.28 },
    govSpending: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    netExports: { min: 0, max: 100, k: 1.5, modifierRange: 0.26 },
    happiness: { min: 0, max: 100, k: 1.6, modifierRange: 0.35 },
    health: { min: 0, max: 100, k: 1.6, modifierRange: 0.32 },
    education: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    safety: { min: 0, max: 100, k: 1.5, modifierRange: 0.28 },
    youthIndependence: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    rentBurden: { min: 0, max: 100, k: 1.6, modifierRange: 0.35 }
};

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeWithRange(value, min, max) {
    if (!Number.isFinite(value) || max <= min) return 0;
    return clamp01((value - min) / (max - min));
}

function denormalizeWithRange(value, min, max) {
    return min + (clamp01(value) * (max - min));
}

function logistic(x, k = 1.6) {
    return 1 / (1 + Math.exp(-k * x));
}

function parseCsvLine(line) {
    const out = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (ch === ',' && !inQuotes) {
            out.push(current.trim());
            current = '';
            continue;
        }
        current += ch;
    }
    out.push(current.trim());
    return out;
}

function getKnownNodeIds() {
    return new Set([
        ...POLICY_NODE_IDS,
        ...Object.keys(SIMULATED_NODE_DEFAULTS),
        'approval',
        'stability',
        'corruption'
    ]);
}

function parseCsv(csvText) {
    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) {
        throw new Error('relationships.csv must contain a header and at least one row.');
    }

    const header = parseCsvLine(lines[0]);
    const expected = ['Source', 'Target', 'Weight', 'Inertia'];
    if (header.length !== expected.length || expected.some((h, idx) => header[idx] !== h)) {
        throw new Error('Invalid CSV header. Expected: Source,Target,Weight,Inertia');
    }

    const knownNodes = getKnownNodeIds();
    const seenPairs = new Set();
    const parsedEdges = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
            continue;
        }
        const row = parseCsvLine(lines[i]);
        if (row.length !== 4) {
            throw new Error(`Invalid CSV row ${i + 1}: expected 4 columns.`);
        }

        const [source, target, weightRaw, inertiaRaw] = row;
        const weight = Number(weightRaw);
        const inertia = Number(inertiaRaw);
        const pairKey = `${source}->${target}`;

        if (!knownNodes.has(source)) throw new Error(`Unknown Source "${source}" on row ${i + 1}.`);
        if (!knownNodes.has(target)) throw new Error(`Unknown Target "${target}" on row ${i + 1}.`);
        if (ACCOUNTING_TARGET_BLOCKLIST.has(target)) {
            throw new Error(`Invalid Target "${target}" on row ${i + 1}. Accounting targets are forbidden in CSV.`);
        }
        if (source === target) throw new Error(`Self-link "${source}" on row ${i + 1} is not allowed.`);
        if (!Number.isFinite(weight)) throw new Error(`Invalid Weight "${weightRaw}" on row ${i + 1}.`);
        if (!Number.isInteger(inertia) || inertia < 1) throw new Error(`Invalid Inertia "${inertiaRaw}" on row ${i + 1}.`);
        if (seenPairs.has(pairKey)) throw new Error(`Duplicate edge "${pairKey}" on row ${i + 1}.`);

        seenPairs.add(pairKey);
        parsedEdges.push({
            source,
            target,
            weight,
            inertia,
            driver: `csv:${source}->${target}`
        });
    }

    return parsedEdges;
}

function rebuildEdgeIndexes(edges) {
    edgesByTarget = new Map();
    relationshipNodeIds = new Set();

    edges.forEach((edge) => {
        relationshipNodeIds.add(edge.source);
        relationshipNodeIds.add(edge.target);
        if (!edgesByTarget.has(edge.target)) edgesByTarget.set(edge.target, []);
        edgesByTarget.get(edge.target).push(edge);
    });
}

async function loadRelationshipsCsv(url = 'engine/relationships.csv') {
    relationshipLoadState.loading = true;
    relationshipLoadState.loaded = false;
    relationshipLoadState.error = null;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        const text = await response.text();
        const parsed = parseCsv(text);
        relationshipEdges = parsed;
        rebuildEdgeIndexes(relationshipEdges);

        relationshipLoadState.loading = false;
        relationshipLoadState.loaded = true;
        relationshipLoadState.error = null;
        return relationshipEdges;
    } catch (error) {
        relationshipEdges = [];
        rebuildEdgeIndexes(relationshipEdges);
        relationshipLoadState.loading = false;
        relationshipLoadState.loaded = false;
        relationshipLoadState.error = error?.message || 'Unknown error while loading relationships CSV.';
        throw error;
    }
}

function isRelationshipDataReady() {
    return relationshipLoadState.loaded === true && relationshipEdges.length > 0;
}

function getRelationshipRules() {
    return relationshipEdges.map((edge) => ({ ...edge }));
}

function getGraphLinksFromRules() {
    if (!isRelationshipDataReady()) return [];
    return relationshipEdges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        inertia: edge.inertia,
        driver: edge.driver,
        direct: true,
        polarity: edge.weight >= 0 ? 'positive' : 'negative',
        magnitude: Math.abs(edge.weight)
    }));
}

function getInboundEdges(targetId) {
    return edgesByTarget.get(targetId) || [];
}

function getStateValueByNodeId(state, nodeId) {
    if (!state || !nodeId) return null;

    if (nodeId.includes('.')) {
        const parts = nodeId.split('.');
        let current = state.policies;
        for (const part of parts) {
            if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, part)) {
                return null;
            }
            current = current[part];
        }
        return typeof current === 'number' ? current : null;
    }

    if (state.policies && typeof state.policies[nodeId] === 'number') return state.policies[nodeId];
    if (state.economy && typeof state.economy[nodeId] === 'number') return state.economy[nodeId];
    if (state.population && typeof state.population[nodeId] === 'number') return state.population[nodeId];
    if (state.politics && typeof state.politics[nodeId] === 'number') return state.politics[nodeId];
    return null;
}

function buildNodeConfigsFromState(state) {
    const nextConfigs = {};
    const anchoredBaseValues = state?.simulationConfig?.baseValues || {};
    Object.entries(SIMULATED_NODE_DEFAULTS).forEach(([nodeId, defaults]) => {
        const anchored = anchoredBaseValues[nodeId];
        const raw = getStateValueByNodeId(state, nodeId);
        const baseValue = Number.isFinite(anchored)
            ? clamp01(anchored)
            : normalizeWithRange(raw, defaults.min, defaults.max);
        nextConfigs[nodeId] = {
            ...defaults,
            baseValue: clamp01(baseValue)
        };
    });
    nodeConfigs = nextConfigs;
    return nodeConfigs;
}

function initializeSimulationNodes(state) {
    if (!state) return;
    const configs = buildNodeConfigsFromState(state);
    const simNodes = {};
    Object.keys(configs).forEach((nodeId) => {
        simNodes[nodeId] = {
            current: configs[nodeId].baseValue,
            target: configs[nodeId].baseValue
        };
    });

    state.simulation = {
        nodes: simNodes
    };
}

function ensureSimulationState(state) {
    if (!state) return;
    if (!state.simulation || !state.simulation.nodes) {
        initializeSimulationNodes(state);
        return;
    }

    if (Object.keys(nodeConfigs).length === 0) {
        buildNodeConfigsFromState(state);
    }

    Object.keys(nodeConfigs).forEach((nodeId) => {
        if (!state.simulation.nodes[nodeId]) {
            const cfg = nodeConfigs[nodeId];
            state.simulation.nodes[nodeId] = {
                current: cfg.baseValue,
                target: cfg.baseValue
            };
        }
    });
}

function getNormalizedValueByNodeId(state, nodeId, nodeSnapshot) {
    const sourceValue = getStateValueByNodeId(state, nodeId);

    if (POLICY_NODE_IDS.includes(nodeId)) {
        return clamp01((sourceValue ?? 0) / 100);
    }

    if (nodeSnapshot && nodeSnapshot[nodeId]) {
        return clamp01(nodeSnapshot[nodeId].current);
    }

    if (state.simulation && state.simulation.nodes && state.simulation.nodes[nodeId]) {
        return clamp01(state.simulation.nodes[nodeId].current);
    }

    const cfg = nodeConfigs[nodeId];
    if (cfg && Number.isFinite(sourceValue)) {
        return normalizeWithRange(sourceValue, cfg.min, cfg.max);
    }

    return 0;
}

function computeRawImpactSum(state, targetId, nodeSnapshot) {
    const inboundEdges = getInboundEdges(targetId);
    if (!inboundEdges.length) return 0;
    return inboundEdges.reduce((sum, edge) => {
        const sourceNorm = getNormalizedValueByNodeId(state, edge.source, nodeSnapshot);
        return sum + (edge.weight * sourceNorm);
    }, 0);
}

function computeTargetValueFromRaw(rawImpact, config) {
    const modifier = logistic(rawImpact, config.k) - 0.5;
    const scaledModifier = modifier * 2 * config.modifierRange;
    return clamp01(config.baseValue + scaledModifier);
}

function computeEffectiveInertia(inboundEdges) {
    if (!inboundEdges || inboundEdges.length === 0) return 3;
    let weightedSum = 0;
    let magnitudeSum = 0;
    inboundEdges.forEach((edge) => {
        const magnitude = Math.abs(edge.weight);
        weightedSum += edge.inertia * magnitude;
        magnitudeSum += magnitude;
    });
    if (magnitudeSum <= 0) return 3;
    return Math.max(1, weightedSum / magnitudeSum);
}

function applyInertiaStep(current, target, inertia) {
    const safeInertia = Math.max(1, inertia || 1);
    return clamp01(current + ((target - current) / safeInertia));
}

function computeNextSimulationNodes(state, nodeSnapshot) {
    const nextNodes = {};
    Object.keys(nodeConfigs).forEach((nodeId) => {
        const current = getNormalizedValueByNodeId(state, nodeId, nodeSnapshot);
        const inboundEdges = getInboundEdges(nodeId);
        const rawImpact = computeRawImpactSum(state, nodeId, nodeSnapshot);
        const target = computeTargetValueFromRaw(rawImpact, nodeConfigs[nodeId]);
        const inertia = computeEffectiveInertia(inboundEdges);
        const nextCurrent = applyInertiaStep(current, target, inertia);
        nextNodes[nodeId] = { current: nextCurrent, target };
    });
    return nextNodes;
}

function syncStateFromSimulation(state, previousGdpNorm) {
    if (!state?.simulation?.nodes) return;

    Object.entries(nodeConfigs).forEach(([nodeId, cfg]) => {
        const normValue = state.simulation.nodes[nodeId]?.current ?? cfg.baseValue;
        const rawValue = denormalizeWithRange(normValue, cfg.min, cfg.max);

        if (state.economy && Object.prototype.hasOwnProperty.call(state.economy, nodeId)) {
            state.economy[nodeId] = nodeId === 'gdp' || nodeId === 'debt'
                ? Math.round(rawValue)
                : Math.round(rawValue * 10) / 10;
            return;
        }

        if (state.population && Object.prototype.hasOwnProperty.call(state.population, nodeId)) {
            state.population[nodeId] = Math.round(rawValue);
        }
    });

    if (state.economy && state.simulation.nodes.gdp) {
        const currentGdp = state.economy.gdp;
        if (Number.isFinite(previousGdpNorm)) {
            const previousGdp = denormalizeWithRange(previousGdpNorm, nodeConfigs.gdp.min, nodeConfigs.gdp.max);
            const monthlyGrowth = previousGdp > 0 ? ((currentGdp - previousGdp) / previousGdp) : 0;
            state.economy.gdpGrowth = clamp(monthlyGrowth * 12, -0.1, 0.1);
        }
    }
}

function stepRelationshipSimulation(state) {
    ensureSimulationState(state);
    if (!state?.simulation?.nodes) return null;

    const previousGdpNorm = state.simulation.nodes.gdp?.current;
    const snapshot = {};
    Object.keys(state.simulation.nodes).forEach((nodeId) => {
        snapshot[nodeId] = { ...state.simulation.nodes[nodeId] };
    });

    const nextNodes = computeNextSimulationNodes(state, snapshot);
    state.simulation.nodes = nextNodes;
    syncStateFromSimulation(state, previousGdpNorm);
    return nextNodes;
}

function projectOneStepRawMetrics(state) {
    ensureSimulationState(state);
    const snapshot = {};
    Object.keys(state.simulation.nodes).forEach((nodeId) => {
        snapshot[nodeId] = { ...state.simulation.nodes[nodeId] };
    });
    const projected = computeNextSimulationNodes(state, snapshot);
    const raw = {};

    Object.entries(nodeConfigs).forEach(([nodeId, cfg]) => {
        raw[nodeId] = denormalizeWithRange(projected[nodeId].current, cfg.min, cfg.max);
    });

    const previousGdp = denormalizeWithRange(snapshot.gdp.current, nodeConfigs.gdp.min, nodeConfigs.gdp.max);
    const projectedGdp = raw.gdp;
    const monthlyGrowth = previousGdp > 0 ? ((projectedGdp - previousGdp) / previousGdp) : 0;
    raw.gdpGrowth = clamp(monthlyGrowth * 12, -0.1, 0.1);
    return raw;
}

function getCurrentGraphLinks(state) {
    const baseLinks = getGraphLinksFromRules();
    if (!state) return baseLinks;

    return baseLinks.map((link) => {
        const sourceNorm = getNormalizedValueByNodeId(state, link.source);
        const effectiveImpact = (Number.isFinite(sourceNorm) ? sourceNorm : 0) * link.weight;
        const effectiveMagnitude = Math.abs(effectiveImpact);

        return {
            ...link,
            baseWeight: link.weight,
            sourceNorm: Number.isFinite(sourceNorm) ? sourceNorm : 0,
            effectiveImpact,
            weight: effectiveImpact,
            magnitude: effectiveMagnitude,
            polarity: effectiveImpact > 0 ? 'positive' : (effectiveImpact < 0 ? 'negative' : 'neutral')
        };
    });
}

function getPolicyPercent(state, policyId) {
    const rawValue = getStateValueByNodeId(state, policyId);
    return clamp(typeof rawValue === 'number' ? rawValue : 0, 0, 100);
}

// Calculate annualized budget arithmetic and realize only monthly debt accumulation.
function calculateBudget(state) {
    const model = state?.budgetModel || {};
    const revenues = model.revenues || {};
    const costs = model.costs || {};
    const referenceGdp = Number(model.referenceGdp) > 0 ? Number(model.referenceGdp) : Math.max(1, state.economy.gdp || 1);
    const currentGdp = Math.max(1, state.economy.gdp || referenceGdp);
    const gdpFactor = currentGdp / referenceGdp;

    let annualIncome = 0;
    Object.entries(revenues).forEach(([policyId, entry]) => {
        const pct = getPolicyPercent(state, policyId) / 100;
        const baseRevenue = Number(entry?.baseRevenue) || 0;
        const scale = entry?.gdpScaled === false ? 1 : gdpFactor;
        annualIncome += pct * baseRevenue * scale;
    });

    let annualExpenditure = 0;
    Object.entries(costs).forEach(([policyId, entry]) => {
        const pct = getPolicyPercent(state, policyId) / 100;
        const baseCost = Number(entry?.baseCost) || 0;
        const scale = entry?.gdpScaled === false ? 1 : gdpFactor;
        annualExpenditure += pct * baseCost * scale;
    });

    const annualDeficit = annualExpenditure - annualIncome;
    const monthlyDeficit = annualDeficit / 12;
    const nextDebt = Math.max(0, state.economy.debt + monthlyDeficit);

    return {
        income: Math.round(annualIncome),
        expenditure: Math.round(annualExpenditure),
        deficit: Math.round(annualDeficit),
        debt: Math.round(nextDebt)
    };
}

function calculatePopulationMetrics(state) {
    const projected = projectOneStepRawMetrics(state);
    return {
        happiness: Math.round(projected.happiness),
        health: Math.round(projected.health),
        education: Math.round(projected.education),
        safety: Math.round(projected.safety),
        youthIndependence: Math.round(projected.youthIndependence),
        rentBurden: Math.round(projected.rentBurden)
    };
}

function calculateEconomicIndicators(state) {
    const projected = projectOneStepRawMetrics(state);
    return {
        gdp: Math.round(projected.gdp),
        debt: Math.round(state.economy.debt),
        gdpGrowth: projected.gdpGrowth,
        unemployment: Math.round(projected.unemployment * 10) / 10,
        inflation: Math.round(projected.inflation * 10) / 10
    };
}

function calculatePoliticalMetrics(state) {
    const happiness = state.population.happiness;
    const safety = state.population.safety;
    const health = state.population.health;
    const education = state.population.education;
    const rentBurden = state.population.rentBurden;
    const unemployment = state.economy.unemployment;
    const inflation = state.economy.inflation;
    const deficitImpact = Math.abs(state.budget.deficit) / 2000;

    let approval = state.politics.approval;
    approval += (happiness - 60) * 0.08;
    approval += (state.population.youthIndependence - 40) * 0.04;
    approval -= (rentBurden - 45) * 0.06;
    approval -= (unemployment - 6.5) * 1.1;
    approval -= Math.abs(inflation - 2) * 1.2;
    approval -= deficitImpact;
    approval = clamp(approval, 0, 100);

    let stability = state.politics.stability;
    stability += (safety - 75) * 0.08;
    stability += (health - 65) * 0.05;
    stability += (education - 62) * 0.04;
    stability -= (rentBurden - 45) * 0.05;
    stability -= Math.abs(unemployment - 6.5) * 0.6;
    stability = clamp(stability, 0, 100);

    return {
        approval: Math.round(approval),
        stability: Math.round(stability)
    };
}
