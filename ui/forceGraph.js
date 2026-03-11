// D3 force graph renderer for policy and metric nodes.
// This file contains ONLY visualization/simulation lifecycle logic.

let forceGraphContext = {
    container: null,
    svg: null,
    viewport: null,
    linkLayer: null,
    nodeLayer: null,
    linkSelection: null,
    nodeSelection: null,
    simulation: null,
    zoomBehavior: null,
    currentState: null,
    width: 0,
    height: 0,
    physicsSettings: null,
    lastTopologySignature: ''
};

const defaultPhysicsSettings = {
    chargeStrength: -300,
    gravityStrength: 0.020,
    collisionStrength: 0.85,
    collisionPadding: 12,
    linkDistanceFar: 230,
    linkDistanceNear: 130,
    linkStrengthMin: 0.04,
    linkStrengthMax: 0.30,
    edgeRepulsionStrength: 0.15,
    edgeRepulsionPadding: 9
};

// Absolute visual scale for relationship intensity.
// Using a fixed domain avoids "strongest link always looks identical" artifacts.
const LINK_VISUAL_MAGNITUDE_MAX = 4.0;
const ACCOUNTING_EDGE_LAYOUT_MAGNITUDE = 0.08;
const EDGE_COLOR_BEHAVIORAL_POSITIVE = '#4ade80';
const EDGE_COLOR_BEHAVIORAL_NEGATIVE = '#f87171';
const EDGE_COLOR_ACCOUNTING_POSITIVE = '#60a5fa';
const EDGE_COLOR_ACCOUNTING_NEGATIVE = '#f59e0b';
const FORCE_GRAPH_MIN_ZOOM = 0.12;
const FORCE_GRAPH_MAX_ZOOM = 3.5;

const NODE_ICON_BY_ID = {
    incomeTax: '\u{1F4B0}',
    corporateTax: '\u{1F3E2}',
    vat: '\u{1F9FE}',
    public_expenditure_on_health: '\u{1F3E5}',
    public_expenditure_on_education: '\u{1F393}',
    welfareSpending: '\u{1F91D}',
    transportSpending: '\u{1F686}',
    digitalInfrastructure: '\u{1F4BB}',
    policeSpending: '\u{1F46E}',
    justiceSpending: '\u2696\uFE0F',
    greenEnergy: '\u{1F331}',
    carbonTax: '\u{1F3ED}',
    'housingPolicy.maisHabitacao': '\u{1F3E0}',
    'housingPolicy.goldenVisa': '\u{1F4DC}',
    'housingPolicy.alTaxes': '\u{1F4BC}',
    'housingPolicy.rentControl': '\u{1F3D8}\uFE0F',
    nominal_minimum_wage: '\u{1F4B5}',
    'laborPolicy.fourDayWeek': '\u{1F4C6}',
    'laborPolicy.youthJobs': '\u{1F9D1}\u200D\u{1F4BC}',
    'taxPolicy.nhrRegime': '\u{1F3D8}\uFE0F',
    'taxPolicy.wealthTax': '\u{1F48E}',
    tsu_total_rate: '\u{1F9FE}',
    isp_fuel_tax: '\u26FD',
    imi_average_rate: '\u{1F3E0}',
    imt_effective_rate: '\u{1F3E1}',
    stamp_duty_index: '\u{1F4DC}',
    vehicle_tax_index: '\u{1F697}',
    sin_tax_index: '\u{1F6AD}',
    soe_dividend_rate: '\u{1F3DB}\uFE0F',
    military_expenditure: '\u{1F6E1}\uFE0F',
    gdp: '\u{1F4C8}',
    health: '\u2764\uFE0F',
    happiness: '\u{1F60A}',
    education: '\u{1F393}',
    safety: '\u{1F6E1}\uFE0F',
    unemployment_rate: '\u{1F465}',
    inflation_consumer_prices: '\u{1F4CA}',
    consumption: '\u{1F6D2}',
    investment: '\u{1F3D7}\uFE0F',
    gdp_investment_gfcf_total_eur_m: '\u{1F3D7}\uFE0F',
    public_investment_p51g_eur_m: '\u{1F3D7}\uFE0F',
    private_investment_eur_m: '\u{1F3D7}\uFE0F',
    netExports: '\u{1F6A2}',
    government_expenditure: '\u{1F3DB}\uFE0F',
    gdp_gov_consumption_G_eur_m: '\u{1F3DB}\uFE0F',
    gdp_gov_exp_d4_interest_total_eur_m: '\u{1F4B8}',
    household_transfer_income_d62_eur_m: '\u{1F4B8}',
    household_consumption_from_transfers_eur_m: '\u{1F6D2}',
    household_savings_from_transfers_eur_m: '\u{1F4B0}',
    mpc_rate: '\u{1F4CA}',
    rentBurden: '\u{1F3D8}\uFE0F',
    youthIndependence: '\u{1F3E1}',
    average_annual_real_wages: '\u{1F4B6}',
    central_bank_policy_rate: '\u{1F3E6}',
    co2_emissions_per_capita: '\u{1F30D}',
    air_pollution_pm25: '\u{1F32B}\uFE0F',
    fixed_broadband_subscriptions: '\u{1F4F6}',
    debt_to_gdp: '\u{1F9EE}',
    'budget.income': '\u{1F4B8}',
    'budget.expenditure': '\u{1F4B3}',
    'budget.deficit': '\u26A0\uFE0F',
    'budget.debt': '\u{1F4C9}',
    'population.total': '\u{1F465}'
};

function formatMetricValueByUnit(value, unit) {
    if (!Number.isFinite(value)) return 'n/a';
    switch (unit) {
        case 'eur_b':
            return `\u20AC${(value / 1000).toFixed(1)}B`;
        case 'eur_int':
            return `\u20AC${Math.round(value).toLocaleString()}`;
        case 'int':
            return `${Math.round(value).toLocaleString()}`;
        case 'percent':
            return `${Math.round(value)}%`;
        case 'percent_1':
            return `${value.toFixed(1)}%`;
        case 'decimal_2':
            return value.toFixed(2);
        case 'decimal_1':
            return value.toFixed(1);
        default:
            return value.toFixed(1);
    }
}

function getRegistryGraphRows() {
    if (typeof getGraphNodeRegistryRows !== 'function') return [];
    return getGraphNodeRegistryRows();
}

function getNodeStateNumericValue(state, nodeId) {
    if (typeof getStateValueByNodeId === 'function') {
        return getStateValueByNodeId(state, nodeId);
    }
    return null;
}

function resolveNodeIcon(row) {
    if (!row) return '\u{1F4CA}';
    if (NODE_ICON_BY_ID[row.nodeId]) return NODE_ICON_BY_ID[row.nodeId];
    const rawIcon = String(row.icon || '').trim();
    if (rawIcon && !/^\?+$/.test(rawIcon)) return rawIcon;
    return row.nodeType === 'policy' ? '\u2699\uFE0F' : '\u{1F4CA}';
}

function buildGraphNodes(state) {
    return getRegistryGraphRows()
        .map((row) => {
            const rawValue = getNodeStateNumericValue(state, row.nodeId);
            if (!Number.isFinite(rawValue)) return null;
            const formattedValue = formatMetricValueByUnit(rawValue, row.valueUnit);
            return {
                id: row.nodeId,
                name: row.shortLabel || row.displayName || row.nodeId,
                icon: resolveNodeIcon(row),
                value: formattedValue,
                color: row.colorToken || 'var(--neutral)',
                nodeType: row.nodeType,
                description: row.description || ''
            };
        })
        .filter(Boolean);
}

function getNodeRadius(node) {
    return node.visualRadius || (node.nodeType === 'metric' ? 36 : 42);
}

function getEdgeSign(link) {
    const contribution = Number(link?.evaluatedContribution);
    if (Number.isFinite(contribution) && contribution !== 0) {
        return contribution > 0 ? 'positive' : 'negative';
    }
    const sign = String(link?.sign || link?.polarity || '').toLowerCase();
    return sign === 'negative' ? 'negative' : (sign === 'positive' ? 'positive' : 'neutral');
}

function isAccountingEdge(link) {
    return String(link?.edgeMode || '').toLowerCase() === 'accounting_trace';
}

function getLinkLayoutMagnitude(link) {
    if (isAccountingEdge(link)) return ACCOUNTING_EDGE_LAYOUT_MAGNITUDE;
    return Math.max(0.05, Number(link?.magnitude) || 0);
}

function getEdgeStrokeColor(link) {
    const sign = getEdgeSign(link);
    if (sign === 'neutral') return '#94a3b8';
    if (isAccountingEdge(link)) {
        return sign === 'positive' ? EDGE_COLOR_ACCOUNTING_POSITIVE : EDGE_COLOR_ACCOUNTING_NEGATIVE;
    }
    return sign === 'positive' ? EDGE_COLOR_BEHAVIORAL_POSITIVE : EDGE_COLOR_BEHAVIORAL_NEGATIVE;
}

function getEdgeMarkerId(link) {
    const sign = getEdgeSign(link);
    if (sign === 'neutral') return null;
    if (isAccountingEdge(link)) {
        return sign === 'positive'
            ? 'url(#force-arrow-accounting-positive)'
            : 'url(#force-arrow-accounting-negative)';
    }
    return sign === 'positive'
        ? 'url(#force-arrow-behavioral-positive)'
        : 'url(#force-arrow-behavioral-negative)';
}

function initializeForceGraph(containerEl) {
    if (!containerEl || typeof d3 === 'undefined') return;
    if (forceGraphContext.container === containerEl && forceGraphContext.svg) return;

    destroyForceGraph();

    forceGraphContext.container = containerEl;
    forceGraphContext.svg = d3
        .select(containerEl)
        .append('svg')
        .attr('class', 'force-graph')
        .attr('width', containerEl.clientWidth)
        .attr('height', containerEl.clientHeight);
    forceGraphContext.viewport = forceGraphContext.svg.append('g').attr('class', 'force-viewport');

    const zoomFilter = (event) => {
        if (event.type === 'wheel') return true;
        if (event.button) return false;
        const target = event.target;
        const isNodeEvent = !!(target && typeof target.closest === 'function' && target.closest('.force-node'));
        return !isNodeEvent;
    };

    forceGraphContext.zoomBehavior = d3
        .zoom()
        .filter(zoomFilter)
        .scaleExtent([FORCE_GRAPH_MIN_ZOOM, FORCE_GRAPH_MAX_ZOOM])
        .on('start', () => {
            forceGraphContext.svg.classed('is-panning', true);
            if (typeof hideTooltip === 'function') hideTooltip();
        })
        .on('zoom', (event) => {
            if (forceGraphContext.viewport) {
                forceGraphContext.viewport.attr('transform', event.transform);
            }
        })
        .on('end', () => {
            forceGraphContext.svg.classed('is-panning', false);
        });

    forceGraphContext.svg.call(forceGraphContext.zoomBehavior).on('dblclick.zoom', null);

    const defs = forceGraphContext.svg.append('defs');
    defs
        .append('marker')
        .attr('id', 'force-arrow-behavioral-positive')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', EDGE_COLOR_BEHAVIORAL_POSITIVE);

    defs
        .append('marker')
        .attr('id', 'force-arrow-behavioral-negative')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', EDGE_COLOR_BEHAVIORAL_NEGATIVE);

    defs
        .append('marker')
        .attr('id', 'force-arrow-accounting-positive')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', EDGE_COLOR_ACCOUNTING_POSITIVE);

    defs
        .append('marker')
        .attr('id', 'force-arrow-accounting-negative')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', EDGE_COLOR_ACCOUNTING_NEGATIVE);

    forceGraphContext.linkLayer = forceGraphContext.viewport.append('g').attr('class', 'force-links');
    forceGraphContext.nodeLayer = forceGraphContext.viewport.append('g').attr('class', 'force-nodes');

    forceGraphContext.simulation = d3.forceSimulation([]);
    forceGraphContext.physicsSettings = { ...defaultPhysicsSettings };
}

function getEndpointId(endpoint) {
    return typeof endpoint === 'object' ? endpoint.id : endpoint;
}

function buildPairKey(sourceId, targetId) {
    return sourceId < targetId ? `${sourceId}|${targetId}` : `${targetId}|${sourceId}`;
}

function assignLinkCurvature(links) {
    const pairs = new Map();

    links.forEach((link) => {
        const sourceId = getEndpointId(link.source);
        const targetId = getEndpointId(link.target);
        const pairKey = buildPairKey(sourceId, targetId);
        if (!pairs.has(pairKey)) pairs.set(pairKey, []);
        pairs.get(pairKey).push(link);
    });

    pairs.forEach((group) => {
        if (group.length === 1) {
            group[0].curveOffset = 0;
            return;
        }

        if (group.length === 2) {
            const first = group[0];
            const second = group[1];
            const firstSource = getEndpointId(first.source);
            const firstTarget = getEndpointId(first.target);
            const secondSource = getEndpointId(second.source);
            const secondTarget = getEndpointId(second.target);

            if (firstSource === secondTarget && firstTarget === secondSource) {
                first.curveOffset = 18;
                second.curveOffset = -18;
                return;
            }
        }

        const step = 14;
        const midpoint = (group.length - 1) / 2;
        group.forEach((link, index) => {
            link.curveOffset = (index - midpoint) * step;
        });
    });
}

function getLinkSizingWeight(link) {
    if (isAccountingEdge(link)) return 1;
    const rawMagnitude = Number(link?.magnitude);
    if (!Number.isFinite(rawMagnitude)) return 0.25;
    return Math.max(0.12, Math.min(2.8, rawMagnitude));
}

function normalizeNodeMapByIds(map, nodeIds) {
    const values = nodeIds.map((id) => map.get(id) || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const span = maxValue - minValue;
    const normalized = new Map();

    if (span <= 0.000001) {
        nodeIds.forEach((id) => normalized.set(id, 0));
        return normalized;
    }

    nodeIds.forEach((id) => {
        normalized.set(id, ((map.get(id) || 0) - minValue) / span);
    });
    return normalized;
}

// Node size is directional:
// 1) direct inbound structure,
// 2) graph depth (downstream nodes become larger),
// 3) propagated upstream flow into downstream aggregates.
function computeNodeSizingScores(nodes, links) {
    const nodeIds = nodes.map((node) => node.id);
    const inboundCountMap = new Map(nodeIds.map((id) => [id, 0]));
    const inboundWeightSumMap = new Map(nodeIds.map((id) => [id, 0]));
    const outboundWeightSumMap = new Map(nodeIds.map((id) => [id, 0]));
    const inboundAdjacency = new Map(nodeIds.map((id) => [id, []]));
    const outboundAdjacency = new Map(nodeIds.map((id) => [id, []]));

    links.forEach((link) => {
        const sourceId = getEndpointId(link.source);
        const targetId = getEndpointId(link.target);
        if (!inboundCountMap.has(sourceId) || !inboundCountMap.has(targetId)) return;

        const sizingWeight = getLinkSizingWeight(link);
        inboundCountMap.set(targetId, (inboundCountMap.get(targetId) || 0) + 1);
        inboundWeightSumMap.set(targetId, (inboundWeightSumMap.get(targetId) || 0) + sizingWeight);
        outboundWeightSumMap.set(sourceId, (outboundWeightSumMap.get(sourceId) || 0) + sizingWeight);
        inboundAdjacency.get(targetId).push({ id: sourceId, weight: sizingWeight });
        outboundAdjacency.get(sourceId).push({ id: targetId, weight: sizingWeight });
    });

    const inboundCounts = nodeIds.map((id) => inboundCountMap.get(id) || 0);
    const maxInboundCount = Math.max(1, ...inboundCounts);
    const inboundWeightNormalized = normalizeNodeMapByIds(inboundWeightSumMap, nodeIds);
    const baseScore = new Map(nodeIds.map((id) => {
        const normalizedInboundCount = (inboundCountMap.get(id) || 0) / maxInboundCount;
        const normalizedInboundWeight = inboundWeightNormalized.get(id) || 0;
        return [id, 0.35 + (normalizedInboundCount * 0.60) + (normalizedInboundWeight * 0.75)];
    }));

    // Approximate weighted DAG depth by relaxing depth = 1 + weighted average(parent depth).
    let depthScore = new Map(nodeIds.map((id) => [id, 0]));
    for (let i = 0; i < 10; i++) {
        const nextDepth = new Map();
        nodeIds.forEach((id) => {
            const parents = inboundAdjacency.get(id) || [];
            if (!parents.length) {
                nextDepth.set(id, 0);
                return;
            }
            let weightedSum = 0;
            let totalWeight = 0;
            parents.forEach((parent) => {
                weightedSum += ((depthScore.get(parent.id) || 0) + 1) * parent.weight;
                totalWeight += parent.weight;
            });
            nextDepth.set(id, totalWeight > 0 ? (weightedSum / totalWeight) : 0);
        });
        depthScore = nextDepth;
    }
    const depthNormalized = normalizeNodeMapByIds(depthScore, nodeIds);

    // Push score mass from sources to targets so downstream aggregators absorb upstream influence.
    let propagatedScore = new Map(baseScore);
    const baseRetention = 0.58;
    const transferRate = 0.42;
    for (let i = 0; i < 14; i++) {
        const nextScore = new Map(nodeIds.map((id) => [id, (baseScore.get(id) || 0) * baseRetention]));
        nodeIds.forEach((sourceId) => {
            const outgoing = outboundAdjacency.get(sourceId) || [];
            if (!outgoing.length) return;
            const outboundWeight = Math.max(0.0001, outboundWeightSumMap.get(sourceId) || 0);
            const sourceScore = propagatedScore.get(sourceId) || 0;
            outgoing.forEach((edge) => {
                const share = edge.weight / outboundWeight;
                const delivered = sourceScore * transferRate * share;
                nextScore.set(edge.id, (nextScore.get(edge.id) || 0) + delivered);
            });
        });
        propagatedScore = nextScore;
    }
    const propagatedNormalized = normalizeNodeMapByIds(propagatedScore, nodeIds);

    const scores = new Map();
    nodeIds.forEach((id) => {
        const direct = inboundWeightNormalized.get(id) || 0;
        const depth = depthNormalized.get(id) || 0;
        const downstreamFlow = propagatedNormalized.get(id) || 0;
        const score = 0.42 + (direct * 0.35) + (depth * 0.75) + (downstreamFlow * 0.95);
        scores.set(id, score);
    });

    return { degreeMap: inboundCountMap, scoreMap: scores };
}

function getLinkPath(link) {
    const sourceRadius = getNodeRadius(link.source);
    const targetRadius = getNodeRadius(link.target);

    const rawDx = link.target.x - link.source.x;
    const rawDy = link.target.y - link.source.y;
    const rawLength = Math.hypot(rawDx, rawDy) || 1;
    const ux = rawDx / rawLength;
    const uy = rawDy / rawLength;

    const sx = link.source.x + ux * sourceRadius;
    const sy = link.source.y + uy * sourceRadius;
    const tx = link.target.x - ux * targetRadius;
    const ty = link.target.y - uy * targetRadius;
    const offset = link.curveOffset || 0;

    if (offset === 0) {
        return `M ${sx},${sy} L ${tx},${ty}`;
    }

    const dx = tx - sx;
    const dy = ty - sy;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const cx = (sx + tx) / 2 + nx * offset;
    const cy = (sy + ty) / 2 + ny * offset;

    return `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`;
}

function createEdgeRepulsionForce(links, settings) {
    let nodes = [];

    const minVisibleMagnitude = 0.001;
    const strength = Math.max(0, Number(settings?.edgeRepulsionStrength) || 0);
    const padding = Math.max(0, Number(settings?.edgeRepulsionPadding) || 0);

    function force(alpha) {
        if (strength <= 0 || !nodes.length || !links.length) return;
        const alphaStrength = alpha * strength;
        if (alphaStrength <= 0.000001) return;

        for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
            const link = links[linkIndex];
            const rawMagnitude = Number(link?.magnitude);
            const magnitude = Number.isFinite(rawMagnitude) ? rawMagnitude : 0;
            if (magnitude < minVisibleMagnitude) continue;

            const source = link.source;
            const target = link.target;
            if (!source || !target) continue;

            const sx = source.x;
            const sy = source.y;
            const tx = target.x;
            const ty = target.y;
            if (![sx, sy, tx, ty].every(Number.isFinite)) continue;

            const segX = tx - sx;
            const segY = ty - sy;
            const segLengthSq = (segX * segX) + (segY * segY);
            if (segLengthSq < 0.000001) continue;

            const edgeThickness = 0.9 + (Math.sqrt(Math.min(LINK_VISUAL_MAGNITUDE_MAX, Math.max(0, magnitude))) * 3.45);

            for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
                const node = nodes[nodeIndex];
                if (!node || node === source || node === target) continue;
                if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) continue;

                const clearance = getNodeRadius(node) + padding + (edgeThickness * 0.5);
                const minX = Math.min(sx, tx) - clearance;
                const maxX = Math.max(sx, tx) + clearance;
                const minY = Math.min(sy, ty) - clearance;
                const maxY = Math.max(sy, ty) + clearance;
                if (node.x < minX || node.x > maxX || node.y < minY || node.y > maxY) continue;

                const projectionRaw = ((node.x - sx) * segX + (node.y - sy) * segY) / segLengthSq;
                const projection = Math.max(0, Math.min(1, projectionRaw));
                const closestX = sx + (projection * segX);
                const closestY = sy + (projection * segY);
                const offX = node.x - closestX;
                const offY = node.y - closestY;
                const distance = Math.hypot(offX, offY);
                if (distance >= clearance) continue;

                const overlap = clearance - distance;
                let normalX = 0;
                let normalY = 0;
                if (distance > 0.00001) {
                    normalX = offX / distance;
                    normalY = offY / distance;
                } else {
                    const segLength = Math.sqrt(segLengthSq) || 1;
                    normalX = -segY / segLength;
                    normalY = segX / segLength;
                }

                const impulse = overlap * alphaStrength;
                node.vx += normalX * impulse;
                node.vy += normalY * impulse;
            }
        }
    }

    force.initialize = function(initialNodes) {
        nodes = initialNodes || [];
    };

    return force;
}

function applySimulationForces(nodes, links, width, height, maxMagnitude) {
    if (!forceGraphContext.simulation) return;

    const settings = forceGraphContext.physicsSettings || defaultPhysicsSettings;
    const nodeCount = Math.max(1, nodes.length);
    // As the graph grows, reduce spacing/repulsion and increase centering pull
    // so first layout stays readable without hard screen boundaries.
    const densityFactor = Math.max(1, Math.min(2.6, Math.sqrt(nodeCount / 80)));
    const effectiveChargeStrength = settings.chargeStrength / densityFactor;
    const effectiveGravityStrength = settings.gravityStrength * densityFactor;
    const effectiveCollisionPadding = Math.max(4, settings.collisionPadding / (densityFactor * 0.9));
    const effectiveLinkDistanceFar = Math.max(80, settings.linkDistanceFar / densityFactor);
    const effectiveLinkDistanceNear = Math.max(46, settings.linkDistanceNear / densityFactor);

    const distanceScale = d3
        .scaleLinear()
        .domain([0, Math.max(0.01, maxMagnitude)])
        .range([effectiveLinkDistanceFar, effectiveLinkDistanceNear]);
    const strengthScale = d3
        .scaleLinear()
        .domain([0, Math.max(0.01, maxMagnitude)])
        .range([settings.linkStrengthMin, settings.linkStrengthMax]);

    forceGraphContext.simulation
        .nodes(nodes)
        .force('charge', d3.forceManyBody().strength(effectiveChargeStrength))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('gravityX', d3.forceX(width / 2).strength(effectiveGravityStrength))
        .force('gravityY', d3.forceY(height / 2).strength(effectiveGravityStrength))
        .force(
            'collide',
            d3.forceCollide()
                .radius((d) => getNodeRadius(d) + effectiveCollisionPadding)
                .strength(settings.collisionStrength)
        )
        .force(
            'link',
            d3.forceLink(links)
                .id((d) => d.id)
                .distance((d) => distanceScale(getLinkLayoutMagnitude(d)))
                .strength((d) => strengthScale(getLinkLayoutMagnitude(d)))
        )
        .force('edgeRepel', createEdgeRepulsionForce(links, settings))
        .on('tick', onTick);
}

function getGraphPhysicsSettings() {
    return { ...(forceGraphContext.physicsSettings || defaultPhysicsSettings) };
}

function setGraphPhysicsSettings(nextSettings) {
    const current = forceGraphContext.physicsSettings || { ...defaultPhysicsSettings };
    forceGraphContext.physicsSettings = { ...current, ...nextSettings };
    if (!forceGraphContext.simulation || !forceGraphContext.currentState) return;

    const nodes = forceGraphContext.simulation.nodes() || [];
    const nodeIds = new Set(nodes.map((node) => node.id));
    const links = (typeof getCurrentGraphLinks === 'function'
        ? getCurrentGraphLinks(forceGraphContext.currentState)
        : getGraphLinksFromRules()
    ).filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));

    const maxMagnitude = Math.max(0.01, ...links.map((link) => getLinkLayoutMagnitude(link)));
    applySimulationForces(nodes, links, forceGraphContext.width, forceGraphContext.height, maxMagnitude);
    forceGraphContext.simulation.alpha(0.65).restart();
}

function onTick() {
    if (!forceGraphContext.linkSelection || !forceGraphContext.nodeSelection) return;

    forceGraphContext.linkSelection.attr('d', (d) => getLinkPath(d));

    forceGraphContext.nodeSelection.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

function renderForceGraph(state) {
    const container = document.getElementById('radial-canvas');
    if (!container || typeof d3 === 'undefined') return;
    if (typeof isRelationshipDataReady === 'function' && !isRelationshipDataReady()) return;

    const rawNodes = buildGraphNodes(state);
    const nodeIds = new Set(rawNodes.map((node) => node.id));
    const preLinks = (typeof getCurrentGraphLinks === 'function' ? getCurrentGraphLinks(state) : getGraphLinksFromRules()).filter((link) =>
        nodeIds.has(link.source) && nodeIds.has(link.target)
    );
    if (!preLinks.length) return;

    initializeForceGraph(container);
    forceGraphContext.currentState = state;

    const width = container.clientWidth;
    const height = container.clientHeight;
    forceGraphContext.width = width;
    forceGraphContext.height = height;
    forceGraphContext.svg.attr('width', width).attr('height', height);

    const previousNodes = new Map((forceGraphContext.simulation.nodes() || []).map((node) => [node.id, node]));
    const nodes = rawNodes.map((node) => {
        const previous = previousNodes.get(node.id);
        return previous ? { ...previous, ...node } : { ...node, x: width / 2, y: height / 2 };
    });

    const links = (typeof getCurrentGraphLinks === 'function' ? getCurrentGraphLinks(state) : getGraphLinksFromRules()).filter((link) =>
        nodeIds.has(link.source) && nodeIds.has(link.target)
    );
    assignLinkCurvature(links);

    const nodeSignature = [...nodeIds].sort().join('|');
    const linkSignature = links
        .map((link) => `${link.source}->${link.target}:${link.driver}`)
        .sort()
        .join('|');
    const topologySignature = `${nodeSignature}::${linkSignature}`;
    const isTopologyChanged = topologySignature !== forceGraphContext.lastTopologySignature;
    forceGraphContext.lastTopologySignature = topologySignature;

    const { degreeMap, scoreMap } = computeNodeSizingScores(nodes, links);
    const sizingValues = [...scoreMap.values()];
    const minScore = Math.min(...sizingValues);
    const maxScore = Math.max(...sizingValues);
    const radiusScale = d3.scaleLinear()
        .domain([minScore, maxScore > minScore ? maxScore : minScore + 0.0001])
        .range([26, 56]);
    nodes.forEach((node) => {
        node.connectionCount = degreeMap.get(node.id) || 0;
        node.influenceScore = scoreMap.get(node.id) || 0;
        node.visualRadius = radiusScale(node.influenceScore);
    });

    const maxMagnitude = Math.max(0.01, ...links.map((link) => getLinkLayoutMagnitude(link)));
    const thicknessScale = d3.scaleSqrt().domain([0, LINK_VISUAL_MAGNITUDE_MAX]).range([0.9, 7.8]).clamp(true);

    forceGraphContext.linkSelection = forceGraphContext.linkLayer
        .selectAll('path.force-link')
        .data(links, (d) => `${getEndpointId(d.source)}->${getEndpointId(d.target)}:${d.driver}`)
        .join('path')
        .attr('class', 'force-link')
        .attr('fill', 'none')
        .attr('data-edge-mode', (d) => d.edgeMode || 'behavioral_contribution')
        .attr('data-equation', (d) => d.equation || '')
        .attr('stroke', (d) => getEdgeStrokeColor(d))
        .attr('stroke-width', (d) => thicknessScale(d.magnitude))
        .attr('marker-end', (d) => getEdgeMarkerId(d))
        .attr('stroke-opacity', (d) => Math.min(0.95, Math.max(0.14, 0.30 + (d.magnitude / LINK_VISUAL_MAGNITUDE_MAX))));

    forceGraphContext.linkSelection
        .selectAll('title')
        .data((d) => [d])
        .join('title')
        .text((d) => {
            const mode = d.edgeMode || 'behavioral_contribution';
            const equation = d.equation || '(none)';
            const contribution = Number.isFinite(d.evaluatedContribution) ? d.evaluatedContribution.toFixed(4) : 'n/a';
            return `${d.source} -> ${d.target}\nmode: ${mode}\nequation: ${equation}\ncontribution: ${contribution}`;
        });

    const dragBehavior = d3
        .drag()
        .on('start', (event, d) => {
            d._dragMoved = false;
            d._dragStartX = event.x;
            d._dragStartY = event.y;
            if (event.sourceEvent && typeof event.sourceEvent.stopPropagation === 'function') {
                event.sourceEvent.stopPropagation();
            }
            if (!event.active) forceGraphContext.simulation.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
            if (typeof hideTooltip === 'function') hideTooltip();
        })
        .on('drag', (event, d) => {
            const movedDistance = Math.hypot(event.x - d._dragStartX, event.y - d._dragStartY);
            if (movedDistance > 4) d._dragMoved = true;
            d.fx = event.x;
            d.fy = event.y;
        })
        .on('end', (event, d) => {
            if (!event.active) forceGraphContext.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });

    forceGraphContext.nodeSelection = forceGraphContext.nodeLayer
        .selectAll('g.force-node')
        .data(nodes, (d) => d.id)
        .join((enter) => {
            const group = enter
                .append('g')
                .attr('class', (d) => `force-node ${d.nodeType === 'policy' ? 'policy-force-node' : 'metric-force-node'}`)
                .style('cursor', 'pointer');

            group.append('circle').attr('class', 'force-node-ring');
            group.append('circle').attr('class', 'force-node-circle');
            group.append('text').attr('class', 'force-node-icon');
            group.append('text').attr('class', 'force-node-label');
            group.append('text').attr('class', 'force-node-value');
            group.append('circle').attr('class', 'force-node-type-badge-bg');
            group.append('text').attr('class', 'force-node-type-badge-label');

            return group;
        });

    forceGraphContext.nodeSelection
        .call(dragBehavior)
        .on('pointerenter', function(event, d) {
            if (typeof hideTooltip === 'function') hideTooltip();
            if (d.nodeType === 'metric' && typeof showMetricTooltip === 'function') {
                showMetricTooltip(event, d, forceGraphContext.currentState);
            } else if (d.nodeType === 'policy' && typeof showPolicyTooltip === 'function') {
                showPolicyTooltip(event, d, forceGraphContext.currentState);
            }
        })
        .on('pointermove', function(event) {
            if (typeof updateTooltipPosition === 'function') {
                updateTooltipPosition(event);
            }
        })
        .on('pointerleave', function() {
            if (typeof hideTooltip === 'function') hideTooltip();
        })
        .on('click', function(event, d) {
            if (d._dragMoved) {
                d._dragMoved = false;
                return;
            }
            if (d.nodeType === 'policy' && typeof openPolicyModal === 'function') {
                if (typeof hideTooltip === 'function') hideTooltip();
                openPolicyModal(d, forceGraphContext.currentState);
            }
        });

    forceGraphContext.nodeSelection.select('circle.force-node-ring')
        .attr('r', (d) => getNodeRadius(d) + (d.nodeType === 'policy' ? 6 : 3))
        .attr('fill', 'none')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', (d) => (d.nodeType === 'policy' ? 2.6 : 1.6))
        .attr('stroke-opacity', (d) => (d.nodeType === 'policy' ? 0.9 : 0.48))
        .attr('stroke-dasharray', (d) => (d.nodeType === 'policy' ? '6 4' : null));

    forceGraphContext.nodeSelection.select('circle.force-node-circle')
        .attr('r', (d) => getNodeRadius(d))
        .attr('fill', (d) => (d.nodeType === 'policy' ? '#352820' : '#1f2937'))
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', (d) => (d.nodeType === 'metric' ? 2 : 3.6));

    forceGraphContext.nodeSelection.select('text.force-node-icon')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', -14)
        .attr('font-size', (d) => (d.nodeType === 'metric' ? '16px' : '19px'))
        .text((d) => d.icon);

    forceGraphContext.nodeSelection.select('text.force-node-label')
        .attr('text-anchor', 'middle')
        .attr('y', 6)
        .attr('font-size', '10px')
        .attr('fill', '#ffffff')
        .attr('font-weight', '600')
        .text((d) => d.name);

    forceGraphContext.nodeSelection.select('text.force-node-value')
        .attr('text-anchor', 'middle')
        .attr('y', 20)
        .attr('font-size', '9px')
        .attr('fill', '#cccccc')
        .text((d) => d.value);

    forceGraphContext.nodeSelection.select('circle.force-node-type-badge-bg')
        .attr('r', 9)
        .attr('cx', (d) => getNodeRadius(d) - 9)
        .attr('cy', (d) => -getNodeRadius(d) + 9)
        .attr('fill', (d) => (d.nodeType === 'policy' ? '#f59e0b' : '#60a5fa'))
        .attr('stroke', '#0b0f17')
        .attr('stroke-width', 1.4);

    forceGraphContext.nodeSelection.select('text.force-node-type-badge-label')
        .attr('x', (d) => getNodeRadius(d) - 9)
        .attr('y', (d) => -getNodeRadius(d) + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', '800')
        .attr('fill', '#0b0f17')
        .text((d) => (d.nodeType === 'policy' ? 'P' : 'M'));

    applySimulationForces(nodes, links, width, height, maxMagnitude);
    if (isTopologyChanged || previousNodes.size === 0) {
        forceGraphContext.simulation.alphaTarget(0.05);
        forceGraphContext.simulation.alpha(0.92).restart();
    } else {
        // In-place update: small energy injection to avoid explode/contract on every turn.
        forceGraphContext.simulation.alphaTarget(0.03);
        forceGraphContext.simulation.alpha(0.10).restart();
    }
}

function destroyForceGraph() {
    if (forceGraphContext.simulation) {
        forceGraphContext.simulation.stop();
    }
    if (forceGraphContext.container) {
        forceGraphContext.container.innerHTML = '';
    }
    forceGraphContext = {
        container: null,
        svg: null,
        viewport: null,
        linkLayer: null,
        nodeLayer: null,
        linkSelection: null,
        nodeSelection: null,
        simulation: null,
        zoomBehavior: null,
        currentState: null,
        width: 0,
        height: 0,
        physicsSettings: null,
        lastTopologySignature: ''
    };
}
