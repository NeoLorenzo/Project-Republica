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
    unemployment_rate: { min: 0, max: 25, k: 1.7, modifierRange: 0.22 },
    inflation_consumer_prices: { min: -1, max: 12, k: 1.7, modifierRange: 0.22 },
    consumption: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    investment: { min: 0, max: 100, k: 1.55, modifierRange: 0.28 },
    govSpending: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    netExports: { min: 0, max: 100, k: 1.5, modifierRange: 0.26 },
    happiness: { min: 0, max: 100, k: 1.6, modifierRange: 0.35 },
    health: { min: 0, max: 100, k: 1.6, modifierRange: 0.32 },
    education: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    safety: { min: 0, max: 100, k: 1.5, modifierRange: 0.28 },
    youthIndependence: { min: 0, max: 100, k: 1.6, modifierRange: 0.30 },
    rentBurden: { min: 0, max: 100, k: 1.6, modifierRange: 0.35 },

    gini_coefficient: { min: 20, max: 40, k: 1.4, modifierRange: 0.10 },
    infant_mortality_rate: { min: 1.5, max: 6, k: 1.4, modifierRange: 0.10 },
    life_expectancy_at_birth: { min: 75, max: 85, k: 1.4, modifierRange: 0.10 },
    intentional_homicide_rate: { min: 0.2, max: 2, k: 1.4, modifierRange: 0.10 },
    adult_literacy_rate: { min: 90, max: 100, k: 1.4, modifierRange: 0.10 },
    co2_emissions_per_capita: { min: 2, max: 7, k: 1.55, modifierRange: 0.16 },
    labor_force_participation_rate: { min: 50, max: 65, k: 1.55, modifierRange: 0.16 },
    central_government_debt: { min: 60, max: 140, k: 1.55, modifierRange: 0.16 },
    tax_revenue: { min: 30, max: 45, k: 1.55, modifierRange: 0.16 },
    total_fertility_rate: { min: 1, max: 2.1, k: 1.4, modifierRange: 0.10 },
    renewable_energy_consumption: { min: 20, max: 60, k: 1.55, modifierRange: 0.16 },
    poverty_headcount_ratio: { min: 0, max: 5, k: 1.4, modifierRange: 0.10 },
    foreign_direct_investment_net: { min: -2, max: 10, k: 1.55, modifierRange: 0.16 },
    maternal_mortality_ratio: { min: 2, max: 20, k: 1.4, modifierRange: 0.10 },
    population_density: { min: 110, max: 125, k: 1.4, modifierRange: 0.10 },
    individuals_using_internet: { min: 60, max: 100, k: 1.55, modifierRange: 0.16 },
    access_to_electricity: { min: 95, max: 100, k: 1.4, modifierRange: 0.10 },
    military_expenditure: { min: 0.5, max: 3, k: 1.55, modifierRange: 0.16 },
    mean_years_of_schooling: { min: 7, max: 14, k: 1.4, modifierRange: 0.10 },
    women_in_parliament: { min: 20, max: 50, k: 1.4, modifierRange: 0.10 },
    urban_population: { min: 50, max: 80, k: 1.4, modifierRange: 0.10 },
    median_age: { min: 35, max: 55, k: 1.4, modifierRange: 0.10 },
    net_migration_rate: { min: -5, max: 20, k: 1.55, modifierRange: 0.16 },
    suicide_mortality_rate: { min: 5, max: 15, k: 1.4, modifierRange: 0.10 },
    physicians_per_1000_people: { min: 3, max: 8, k: 1.4, modifierRange: 0.10 },
    mobile_cellular_subscriptions: { min: 100, max: 150, k: 1.55, modifierRange: 0.16 },
    arable_land: { min: 8, max: 15, k: 1.4, modifierRange: 0.10 },
    forest_area: { min: 30, max: 45, k: 1.4, modifierRange: 0.10 },
    central_bank_policy_rate: { min: 0, max: 8, k: 1.7, modifierRange: 0.22 },
    nominal_minimum_wage: { min: 500, max: 1500, k: 1.55, modifierRange: 0.16 },
    trade_union_density_rate: { min: 5, max: 30, k: 1.4, modifierRange: 0.10 },
    average_annual_real_wages: { min: 12000, max: 30000, k: 1.55, modifierRange: 0.16 },
    incarceration_rate: { min: 80, max: 160, k: 1.55, modifierRange: 0.16 },
    road_traffic_mortality_rate: { min: 2, max: 15, k: 1.4, modifierRange: 0.10 },
    home_ownership_rate: { min: 50, max: 85, k: 1.4, modifierRange: 0.10 },
    tertiary_education_attainment: { min: 20, max: 55, k: 1.55, modifierRange: 0.16 },
    adult_obesity_rate: { min: 10, max: 35, k: 1.4, modifierRange: 0.10 },
    youth_unemployment_rate: { min: 10, max: 45, k: 1.7, modifierRange: 0.22 },
    public_expenditure_on_health: { min: 4, max: 10, k: 1.55, modifierRange: 0.16 },
    public_expenditure_on_education: { min: 3, max: 8, k: 1.55, modifierRange: 0.16 },
    air_pollution_pm25: { min: 4, max: 15, k: 1.55, modifierRange: 0.16 },
    fixed_broadband_subscriptions: { min: 20, max: 60, k: 1.55, modifierRange: 0.16 }
};

const INTEGER_ECONOMY_NODES = new Set(['gdp', 'debt', 'nominal_minimum_wage', 'average_annual_real_wages']);
const LEGACY_POPULATION_INTEGER_NODES = new Set(['happiness', 'health', 'education', 'safety', 'youthIndependence', 'rentBurden']);

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
    const normalizedHeader = header.map((value) => String(value || '').trim().toLowerCase());
    const legacyHeader = ['source', 'target', 'weight', 'inertia'];
    const extendedRequired = [
        'source',
        'target',
        'sign',
        'weight',
        'inertia',
        'target_class',
        'causal_mechanism',
        'evidence_source',
        'evidence_strength',
        'bidirectional_pair_id',
        'status',
        'review_notes'
    ];

    const isLegacyFormat = normalizedHeader.length === legacyHeader.length
        && legacyHeader.every((column, index) => normalizedHeader[index] === column);

    const headerIndexByName = new Map();
    normalizedHeader.forEach((column, index) => {
        headerIndexByName.set(column, index);
    });
    const isExtendedFormat = extendedRequired.every((column) => headerIndexByName.has(column));

    if (!isLegacyFormat && !isExtendedFormat) {
        throw new Error(
            'Invalid CSV header. Expected legacy Source,Target,Weight,Inertia ' +
            'or extended source,target,sign,weight,inertia,target_class,causal_mechanism,' +
            'evidence_source,evidence_strength,bidirectional_pair_id,status,review_notes'
        );
    }

    const knownNodes = getKnownNodeIds();
    const seenPairs = new Set();
    const parsedEdges = [];
    const allowedStatus = new Set(['approved', 'in_review', 'rejected']);
    let approvedCount = 0;

    function getCell(row, columnName) {
        const columnIndex = headerIndexByName.get(columnName);
        if (typeof columnIndex !== 'number') return '';
        return String(row[columnIndex] || '').trim();
    }

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
            continue;
        }
        const row = parseCsvLine(lines[i]);
        if (row.length !== header.length) {
            throw new Error(`Invalid CSV row ${i + 1}: expected ${header.length} columns.`);
        }

        let source;
        let target;
        let weightRaw;
        let inertiaRaw;
        let status = 'approved';

        if (isLegacyFormat) {
            [source, target, weightRaw, inertiaRaw] = row;
            source = String(source || '').trim();
            target = String(target || '').trim();
            weightRaw = String(weightRaw || '').trim();
            inertiaRaw = String(inertiaRaw || '').trim();
        } else {
            source = getCell(row, 'source');
            target = getCell(row, 'target');
            weightRaw = getCell(row, 'weight');
            inertiaRaw = getCell(row, 'inertia');
            const sign = getCell(row, 'sign').toLowerCase();
            const targetClass = getCell(row, 'target_class').toLowerCase();
            const evidenceStrength = getCell(row, 'evidence_strength').toLowerCase();
            status = getCell(row, 'status').toLowerCase();
            const causalMechanism = getCell(row, 'causal_mechanism');
            const evidenceSource = getCell(row, 'evidence_source');

            if (!source) throw new Error(`Missing source on row ${i + 1}.`);
            if (!target) throw new Error(`Missing target on row ${i + 1}.`);
            if (!['positive', 'negative'].includes(sign)) {
                throw new Error(`Invalid sign "${sign}" on row ${i + 1}.`);
            }
            if (!['fast', 'medium', 'slow'].includes(targetClass)) {
                throw new Error(`Invalid target_class "${targetClass}" on row ${i + 1}.`);
            }
            if (!causalMechanism) throw new Error(`Missing causal_mechanism on row ${i + 1}.`);
            if (!evidenceSource) throw new Error(`Missing evidence_source on row ${i + 1}.`);
            if (!['high', 'medium', 'low'].includes(evidenceStrength)) {
                throw new Error(`Invalid evidence_strength "${evidenceStrength}" on row ${i + 1}.`);
            }
            if (!allowedStatus.has(status)) {
                throw new Error(`Invalid status "${status}" on row ${i + 1}.`);
            }
        }

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
        if (status !== 'approved') {
            continue;
        }
        approvedCount++;
        parsedEdges.push({
            source,
            target,
            weight,
            inertia,
            driver: `csv:${source}->${target}`
        });
    }

    if (isExtendedFormat && approvedCount === 0) {
        throw new Error('No approved edges available in relationships.csv. Set at least one row status to approved.');
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
            state.economy[nodeId] = INTEGER_ECONOMY_NODES.has(nodeId)
                ? Math.round(rawValue)
                : Math.round(rawValue * 10) / 10;
            return;
        }

        if (state.population && Object.prototype.hasOwnProperty.call(state.population, nodeId)) {
            state.population[nodeId] = LEGACY_POPULATION_INTEGER_NODES.has(nodeId)
                ? Math.round(rawValue)
                : Math.round(rawValue * 10) / 10;
            return;
        }

        if (state.politics && Object.prototype.hasOwnProperty.call(state.politics, nodeId)) {
            state.politics[nodeId] = Math.round(rawValue * 10) / 10;
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

function getBudgetScaleFactor(state) {
    const model = state?.budgetModel || {};
    const fallbackGdp = Math.max(1, state?.economy?.gdp || 1);
    const referenceGdp = Number(model.referenceGdp) > 0 ? Number(model.referenceGdp) : fallbackGdp;
    const currentGdp = Math.max(1, state?.economy?.gdp || referenceGdp);
    return currentGdp / referenceGdp;
}

function computeBudgetEntries(state, entries, valueKey) {
    const scaleFactor = getBudgetScaleFactor(state);
    return Object.entries(entries || {}).map(([policyId, entry]) => {
        const pct = getPolicyPercent(state, policyId) / 100;
        const baseValue = Number(entry?.[valueKey]) || 0;
        const scale = entry?.gdpScaled === false ? 1 : scaleFactor;
        const value = pct * baseValue * scale;
        return {
            policyId,
            value
        };
    });
}

function toTitleWord(word) {
    const upperAcronyms = {
        al: 'AL',
        nhr: 'NHR',
        vat: 'VAT',
        gdp: 'GDP',
        sns: 'SNS'
    };
    const normalized = String(word || '').toLowerCase();
    if (upperAcronyms[normalized]) return upperAcronyms[normalized];
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function humanizePolicySegment(segment) {
    const split = String(segment || '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    return split.map((word) => toTitleWord(word)).join(' ');
}

function formatBudgetPolicyLabel(policyId) {
    if (!policyId) return 'Unknown';
    if (!policyId.includes('.')) {
        return humanizePolicySegment(policyId);
    }
    const [category, name] = policyId.split('.');
    return `${humanizePolicySegment(category)}: ${humanizePolicySegment(name)}`;
}

function buildBudgetBreakdown(entries, total) {
    const roundedTotal = Math.round(total);
    const filtered = entries
        .filter((item) => item.value > 0)
        .map((item) => ({
            policyId: item.policyId,
            label: formatBudgetPolicyLabel(item.policyId),
            value: Math.round(item.value)
        }))
        .sort((a, b) => b.value - a.value)
        .map((item) => ({
            ...item,
            percent: roundedTotal > 0 ? (item.value / roundedTotal) * 100 : 0
        }));
    return {
        total: roundedTotal,
        slices: filtered
    };
}

// Calculate annualized budget arithmetic and realize only monthly debt accumulation.
function calculateBudget(state) {
    const model = state?.budgetModel || {};
    const revenues = model.revenues || {};
    const costs = model.costs || {};
    const annualIncomeEntries = computeBudgetEntries(state, revenues, 'baseRevenue');
    const annualExpenditureEntries = computeBudgetEntries(state, costs, 'baseCost');
    const annualIncome = annualIncomeEntries.reduce((sum, item) => sum + item.value, 0);
    const annualExpenditure = annualExpenditureEntries.reduce((sum, item) => sum + item.value, 0);

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

function calculateBudgetBreakdown(state) {
    const model = state?.budgetModel || {};
    const revenueEntries = computeBudgetEntries(state, model.revenues || {}, 'baseRevenue');
    const costEntries = computeBudgetEntries(state, model.costs || {}, 'baseCost');
    const annualIncome = revenueEntries.reduce((sum, item) => sum + item.value, 0);
    const annualExpenditure = costEntries.reduce((sum, item) => sum + item.value, 0);

    return {
        income: buildBudgetBreakdown(revenueEntries, annualIncome),
        expenditure: buildBudgetBreakdown(costEntries, annualExpenditure)
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
        unemployment_rate: Math.round(projected.unemployment_rate * 10) / 10,
        inflation_consumer_prices: Math.round(projected.inflation_consumer_prices * 10) / 10
    };
}

function calculatePoliticalMetrics(state) {
    const happiness = state.population.happiness;
    const safety = state.population.safety;
    const health = state.population.health;
    const education = state.population.education;
    const rentBurden = state.population.rentBurden;
    const unemployment_rate = state.economy.unemployment_rate;
    const inflation_consumer_prices = state.economy.inflation_consumer_prices;
    const deficitImpact = Math.abs(state.budget.deficit) / 2000;

    let approval = state.politics.approval;
    approval += (happiness - 60) * 0.08;
    approval += (state.population.youthIndependence - 40) * 0.04;
    approval -= (rentBurden - 45) * 0.06;
    approval -= (unemployment_rate - 6.5) * 1.1;
    approval -= Math.abs(inflation_consumer_prices - 2) * 1.2;
    approval -= deficitImpact;
    approval = clamp(approval, 0, 100);

    let stability = state.politics.stability;
    stability += (safety - 75) * 0.08;
    stability += (health - 65) * 0.05;
    stability += (education - 62) * 0.04;
    stability -= (rentBurden - 45) * 0.05;
    stability -= Math.abs(unemployment_rate - 6.5) * 0.6;
    stability = clamp(stability, 0, 100);

    return {
        approval: Math.round(approval),
        stability: Math.round(stability)
    };
}



