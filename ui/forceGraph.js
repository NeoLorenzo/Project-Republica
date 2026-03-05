// D3 force graph renderer for policy and outcome nodes.
// This file contains ONLY visualization/simulation lifecycle logic.

let forceGraphContext = {
    container: null,
    svg: null,
    linkLayer: null,
    nodeLayer: null,
    linkSelection: null,
    nodeSelection: null,
    simulation: null,
    currentState: null,
    width: 0,
    height: 0,
    boundaryPadding: 8,
    physicsSettings: null,
    lastTopologySignature: ''
};

const defaultPhysicsSettings = {
    chargeStrength: -210,
    gravityStrength: 0.045,
    collisionStrength: 0.85,
    collisionPadding: 12,
    linkDistanceFar: 230,
    linkDistanceNear: 130,
    linkStrengthMin: 0.04,
    linkStrengthMax: 0.28
};

// Absolute visual scale for relationship intensity.
// Using a fixed domain avoids "strongest link always looks identical" artifacts.
const LINK_VISUAL_MAGNITUDE_MAX = 4.0;

function getOutcomeGraphNodes(state) {
    return [
        { id: 'gdp', name: 'GDP', icon: '📈', value: `€${(state.economy.gdp / 1000).toFixed(1)}B`, color: 'var(--economy)', nodeType: 'outcome' },
        { id: 'health', name: 'Health', icon: '❤️', value: `${state.population.health}%`, color: 'var(--health)', nodeType: 'outcome' },
        { id: 'happiness', name: 'Happiness', icon: '😊', value: `${state.population.happiness}%`, color: 'var(--welfare)', nodeType: 'outcome' },
        { id: 'debt', name: 'Debt', icon: '💳', value: `€${(state.economy.debt / 1000).toFixed(1)}B`, color: 'var(--negative)', nodeType: 'outcome' },
        { id: 'education', name: 'Education', icon: '🎓', value: `${state.population.education}%`, color: 'var(--education)', nodeType: 'outcome' },
        { id: 'safety', name: 'Safety', icon: '🛡️', value: `${state.population.safety}%`, color: 'var(--law-order)', nodeType: 'outcome' },
        { id: 'unemployment', name: 'Unemployment', icon: '👥', value: `${state.economy.unemployment.toFixed(1)}%`, color: 'var(--warning)', nodeType: 'outcome' },
        { id: 'inflation', name: 'Inflation', icon: '📊', value: `${state.economy.inflation.toFixed(1)}%`, color: 'var(--neutral)', nodeType: 'outcome' }
    ];
}

function getPolicyGraphNodes() {
    return [
        { id: 'incomeTax', name: 'Income Tax', icon: '💰', color: 'var(--economy)', nodeType: 'policy' },
        { id: 'corporateTax', name: 'Corporate Tax', icon: '🏢', color: 'var(--economy)', nodeType: 'policy' },
        { id: 'vat', name: 'VAT', icon: '🛒', color: 'var(--economy)', nodeType: 'policy' },
        { id: 'healthcareSpending', name: 'Healthcare', icon: '🏥', color: 'var(--welfare)', nodeType: 'policy' },
        { id: 'educationSpending', name: 'Education', icon: '🎓', color: 'var(--welfare)', nodeType: 'policy' },
        { id: 'welfareSpending', name: 'Welfare', icon: '🤝', color: 'var(--welfare)', nodeType: 'policy' },
        { id: 'transportSpending', name: 'Transport', icon: '🚗', color: 'var(--transport)', nodeType: 'policy' },
        { id: 'digitalInfrastructure', name: 'Digital', icon: '💻', color: 'var(--transport)', nodeType: 'policy' },
        { id: 'policeSpending', name: 'Police', icon: '👮', color: 'var(--law-order)', nodeType: 'policy' },
        { id: 'justiceSpending', name: 'Justice', icon: '⚖️', color: 'var(--law-order)', nodeType: 'policy' },
        { id: 'greenEnergy', name: 'Green Energy', icon: '🌱', color: 'var(--health)', nodeType: 'policy' },
        { id: 'carbonTax', name: 'Carbon Tax', icon: '🏭', color: 'var(--health)', nodeType: 'policy' },
        { id: 'housingPolicy.maisHabitacao', name: 'Mais Habitacao', icon: '🏠', color: 'var(--warning)', nodeType: 'policy' },
        { id: 'housingPolicy.goldenVisa', name: 'Golden Visa', icon: '📋', color: 'var(--warning)', nodeType: 'policy' },
        { id: 'housingPolicy.alTaxes', name: 'AL Taxes', icon: '💼', color: 'var(--warning)', nodeType: 'policy' },
        { id: 'housingPolicy.rentControl', name: 'Rent Control', icon: '🏘️', color: 'var(--warning)', nodeType: 'policy' },
        { id: 'laborPolicy.minimumWage', name: 'Minimum Wage', icon: '💵', color: 'var(--neutral)', nodeType: 'policy' },
        { id: 'laborPolicy.fourDayWeek', name: '4-Day Week', icon: '📅', color: 'var(--neutral)', nodeType: 'policy' },
        { id: 'laborPolicy.youthJobs', name: 'Youth Jobs', icon: '🧑‍💼', color: 'var(--neutral)', nodeType: 'policy' },
        { id: 'taxPolicy.irsBrackets', name: 'IRS Brackets', icon: '📝', color: 'var(--economy)', nodeType: 'policy' },
        { id: 'taxPolicy.nhrRegime', name: 'NHR Regime', icon: '🏘️', color: 'var(--economy)', nodeType: 'policy' },
        { id: 'taxPolicy.wealthTax', name: 'Wealth Tax', icon: '💎', color: 'var(--economy)', nodeType: 'policy' }
    ];
}

function buildGraphNodes(state) {
    const policyNodes = getPolicyGraphNodes().map((node) => ({
        ...node,
        value: `${getPolicyValue(node.id) ?? 0}%`
    }));
    return [...getOutcomeGraphNodes(state), ...policyNodes];
}

function getNodeRadius(node) {
    return node.visualRadius || (node.nodeType === 'outcome' ? 36 : 42);
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

    const defs = forceGraphContext.svg.append('defs');
    defs
        .append('marker')
        .attr('id', 'force-arrow-positive')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', '#4ade80');

    defs
        .append('marker')
        .attr('id', 'force-arrow-negative')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', '#f87171');

    forceGraphContext.linkLayer = forceGraphContext.svg.append('g').attr('class', 'force-links');
    forceGraphContext.nodeLayer = forceGraphContext.svg.append('g').attr('class', 'force-nodes');

    forceGraphContext.simulation = d3.forceSimulation([]);
    forceGraphContext.physicsSettings = { ...defaultPhysicsSettings };
}

function clampNodePosition(node) {
    const radius = getNodeRadius(node);
    const minX = radius + forceGraphContext.boundaryPadding;
    const maxX = Math.max(minX, forceGraphContext.width - radius - forceGraphContext.boundaryPadding);
    const minY = radius + forceGraphContext.boundaryPadding;
    const maxY = Math.max(minY, forceGraphContext.height - radius - forceGraphContext.boundaryPadding);

    node.x = Math.max(minX, Math.min(maxX, node.x));
    node.y = Math.max(minY, Math.min(maxY, node.y));

    if (node.fx !== null && node.fx !== undefined) {
        node.fx = Math.max(minX, Math.min(maxX, node.fx));
    }
    if (node.fy !== null && node.fy !== undefined) {
        node.fy = Math.max(minY, Math.min(maxY, node.fy));
    }
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

function applySimulationForces(nodes, links, width, height, maxMagnitude) {
    if (!forceGraphContext.simulation) return;

    const settings = forceGraphContext.physicsSettings || defaultPhysicsSettings;
    const distanceScale = d3
        .scaleLinear()
        .domain([0, Math.max(0.01, maxMagnitude)])
        .range([settings.linkDistanceFar, settings.linkDistanceNear]);
    const strengthScale = d3
        .scaleLinear()
        .domain([0, Math.max(0.01, maxMagnitude)])
        .range([settings.linkStrengthMin, settings.linkStrengthMax]);

    forceGraphContext.simulation
        .nodes(nodes)
        .force('charge', d3.forceManyBody().strength(settings.chargeStrength))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('gravityX', d3.forceX(width / 2).strength(settings.gravityStrength))
        .force('gravityY', d3.forceY(height / 2).strength(settings.gravityStrength))
        .force(
            'collide',
            d3.forceCollide()
                .radius((d) => getNodeRadius(d) + settings.collisionPadding)
                .strength(settings.collisionStrength)
        )
        .force(
            'link',
            d3.forceLink(links)
                .id((d) => d.id)
                .distance((d) => distanceScale(d.magnitude))
                .strength((d) => strengthScale(d.magnitude))
        )
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

    const maxMagnitude = Math.max(0.01, ...links.map((link) => link.magnitude));
    applySimulationForces(nodes, links, forceGraphContext.width, forceGraphContext.height, maxMagnitude);
    forceGraphContext.simulation.alpha(0.65).restart();
}

function onTick() {
    if (!forceGraphContext.linkSelection || !forceGraphContext.nodeSelection) return;

    const simulationNodes = forceGraphContext.simulation ? forceGraphContext.simulation.nodes() : [];
    simulationNodes.forEach(clampNodePosition);

    forceGraphContext.linkSelection.attr('d', (d) => getLinkPath(d));

    forceGraphContext.nodeSelection.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

function renderForceGraph(state) {
    const container = document.getElementById('radial-canvas');
    if (!container || typeof d3 === 'undefined') return;

    initializeForceGraph(container);
    forceGraphContext.currentState = state;

    const width = container.clientWidth;
    const height = container.clientHeight;
    forceGraphContext.width = width;
    forceGraphContext.height = height;
    forceGraphContext.svg.attr('width', width).attr('height', height);

    const previousNodes = new Map((forceGraphContext.simulation.nodes() || []).map((node) => [node.id, node]));
    const rawNodes = buildGraphNodes(state);
    const nodes = rawNodes.map((node) => {
        const previous = previousNodes.get(node.id);
        return previous ? { ...previous, ...node } : { ...node, x: width / 2, y: height / 2 };
    });

    const nodeIds = new Set(nodes.map((node) => node.id));
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

    const degreeMap = new Map(nodes.map((node) => [node.id, 0]));
    links.forEach((link) => {
        degreeMap.set(link.source, (degreeMap.get(link.source) || 0) + 1);
        degreeMap.set(link.target, (degreeMap.get(link.target) || 0) + 1);
    });
    const degreeValues = [...degreeMap.values()];
    const minDegree = Math.min(...degreeValues);
    const maxDegree = Math.max(...degreeValues);
    const radiusScale = d3.scaleLinear()
        .domain([minDegree, maxDegree > minDegree ? maxDegree : minDegree + 1])
        .range([26, 56]);
    nodes.forEach((node) => {
        node.connectionCount = degreeMap.get(node.id) || 0;
        node.visualRadius = radiusScale(node.connectionCount);
    });

    const maxMagnitude = Math.max(0.01, ...links.map((link) => link.magnitude));
    const thicknessScale = d3.scaleSqrt().domain([0, LINK_VISUAL_MAGNITUDE_MAX]).range([0.9, 7.2]).clamp(true);

    forceGraphContext.linkSelection = forceGraphContext.linkLayer
        .selectAll('path.force-link')
        .data(links, (d) => `${getEndpointId(d.source)}->${getEndpointId(d.target)}:${d.driver}`)
        .join('path')
        .attr('class', 'force-link')
        .attr('fill', 'none')
        .attr('stroke', (d) => (d.weight >= 0 ? '#4ade80' : '#f87171'))
        .attr('stroke-width', (d) => thicknessScale(d.magnitude))
        .attr('marker-end', (d) => (d.weight >= 0 ? 'url(#force-arrow-positive)' : 'url(#force-arrow-negative)'))
        .attr('stroke-opacity', (d) => 0.35 + Math.min(0.55, d.magnitude / LINK_VISUAL_MAGNITUDE_MAX));

    const dragBehavior = d3
        .drag()
        .on('start', (event, d) => {
            d._dragMoved = false;
            d._dragStartX = event.x;
            d._dragStartY = event.y;
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
            clampNodePosition(d);
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
                .attr('class', (d) => `force-node ${d.nodeType === 'policy' ? 'policy-force-node' : 'outcome-force-node'}`)
                .style('cursor', 'pointer');

            group.append('circle').attr('class', 'force-node-circle');
            group.append('text').attr('class', 'force-node-icon');
            group.append('text').attr('class', 'force-node-label');
            group.append('text').attr('class', 'force-node-value');

            return group;
        });

    forceGraphContext.nodeSelection
        .call(dragBehavior)
        .on('pointerenter', function(event, d) {
            if (typeof hideTooltip === 'function') hideTooltip();
            if (d.nodeType === 'outcome' && typeof showOutcomeTooltip === 'function') {
                showOutcomeTooltip(event, d, forceGraphContext.currentState);
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

    forceGraphContext.nodeSelection.select('circle.force-node-circle')
        .attr('r', (d) => getNodeRadius(d))
        .attr('fill', '#2d2d2d')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', (d) => (d.nodeType === 'outcome' ? 2 : 3));

    forceGraphContext.nodeSelection.select('text.force-node-icon')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', -14)
        .attr('font-size', (d) => (d.nodeType === 'outcome' ? '16px' : '19px'))
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

    applySimulationForces(nodes, links, width, height, maxMagnitude);
    if (isTopologyChanged || previousNodes.size === 0) {
        forceGraphContext.simulation.alpha(0.55).restart();
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
        linkLayer: null,
        nodeLayer: null,
        linkSelection: null,
        nodeSelection: null,
        simulation: null,
        currentState: null,
        width: 0,
        height: 0,
        boundaryPadding: 8,
        physicsSettings: null,
        lastTopologySignature: ''
    };
}
