// UI rendering functions
// This file contains ONLY the visual rendering logic.

function renderGameUI() {
    const state = getGameState();
    if (!state) {
        console.error('Game state not available for rendering');
        return;
    }

    updateTopBar(state);
    renderPolicyNodes(state);
    updateTurnCounter(state);

    const chartsModal = document.getElementById('charts-modal');
    if (chartsModal && chartsModal.style.display === 'flex') {
        renderBudgetChartsModal(state);
    }
}

function getNodeNumber(state, nodeId, fallback = 0) {
    if (typeof getStateValueByNodeId === 'function') {
        const value = getStateValueByNodeId(state, nodeId);
        if (Number.isFinite(value)) return value;
    }
    return Number.isFinite(fallback) ? fallback : 0;
}

function formatNodeValueByUnit(value, unit) {
    if (typeof formatMetricValueByUnit === 'function') {
        return formatMetricValueByUnit(value, unit);
    }
    if (!Number.isFinite(value)) return 'n/a';
    return String(value);
}

function getPolicySliderStep(unit) {
    switch (unit) {
        case 'percent_1':
        case 'decimal_1':
            return '0.1';
        case 'decimal_2':
            return '0.01';
        case 'rate_percent_2':
            return '0.0001';
        case 'eur_int':
            return '10';
        case 'int':
            return '1000';
        default:
            return '1';
    }
}

function updateTopBar(state) {
    const income = document.getElementById('income');
    const expenditure = document.getElementById('expenditure');
    const deficit = document.getElementById('deficit');
    const debt = document.getElementById('debt');

    const incomeValue = getNodeNumber(state, 'budget.income', state?.budget?.income);
    const expenditureValue = getNodeNumber(state, 'budget.expenditure', state?.budget?.expenditure);
    const deficitValue = getNodeNumber(state, 'budget.deficit', state?.budget?.deficit);
    const debtValue = getNodeNumber(state, 'budget.debt', state?.budget?.debt);

    const roundedIncome = Math.round(incomeValue);
    const roundedExpenditure = Math.round(expenditureValue);
    const roundedDeficit = Math.round(deficitValue);
    const roundedDebt = Math.round(debtValue);

    if (income) income.textContent = `Income: \u20AC${roundedIncome.toLocaleString()}M`;
    if (expenditure) expenditure.textContent = `Expenditure: \u20AC${roundedExpenditure.toLocaleString()}M`;
    if (deficit) {
        const deficitText = deficitValue >= 0
            ? `Deficit: \u20AC${roundedDeficit.toLocaleString()}M`
            : `Surplus: \u20AC${Math.abs(roundedDeficit).toLocaleString()}M`;
        deficit.textContent = deficitText;
        deficit.style.color = deficitValue >= 0 ? 'var(--negative)' : 'var(--positive)';
    }
    if (debt) debt.textContent = `Debt: \u20AC${roundedDebt.toLocaleString()}M`;

}

function updateTurnCounter(state) {
    const turnCounter = document.getElementById('turn-counter');
    if (turnCounter) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[state.game.month - 1] || 'January';
        turnCounter.textContent = `Turn ${state.game.turn} - ${monthName} ${state.game.year}`;
    }

}

function renderPolicyNodes(state) {
    const canvas = document.getElementById('radial-canvas');
    if (!canvas) return;
    if (typeof isRelationshipDataReady === 'function' && !isRelationshipDataReady()) {
        return;
    }

    hideTooltip();
    if (typeof renderForceGraph === 'function') {
        renderForceGraph(state);
    }
}

function showMetricTooltip(event, node, state) {
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.id = 'metric-tooltip';
    tooltip.className = 'tooltip metric-tooltip';

    let details = '';
    switch (node.id) {
        case 'gdp':
            details = `Growth: ${(state.economy.gdpGrowth * 100).toFixed(1)}% annually`;
            break;
        case 'budget.debt':
            details = `Debt-to-GDP: ${getNodeNumber(state, 'debt_to_gdp', state?.economy?.debt_to_gdp).toFixed(1)}%`;
            break;
        case 'debt_to_gdp':
            details = 'Derived from debt and GDP';
            break;
        case 'unemployment_rate':
            details = 'Labor market pressure';
            break;
        case 'inflation_consumer_prices':
            details = 'Target: 2.0%';
            break;
        case 'consumption':
            details = 'Household spending demand channel';
            break;
        case 'investment':
            details = 'Business and capital formation climate';
            break;
        case 'gdp_investment_gfcf_total_eur_m':
            details = 'Total-economy GFCF anchor used for private/public investment split';
            break;
        case 'public_investment_p51g_eur_m':
            details = 'Government gross fixed capital formation (P51G)';
            break;
        case 'private_investment_eur_m':
            details = 'Private investment identity: GFCF total minus public P51G';
            break;
        case 'netExports':
            details = 'Trade balance competitiveness channel';
            break;
        case 'government_expenditure':
            details = 'Total government expenditure (COFOG-based deterministic aggregate)';
            break;
        case 'gdp_gov_consumption_G_eur_m':
            details = 'Government final consumption component (G) used in GDP identity';
            break;
        case 'gdp_gov_exp_d4_interest_total_eur_m':
            details = 'Government debt-interest outflow channel (D4) from split-flow weights';
            break;
        case 'household_transfer_income_d62_eur_m':
            details = 'Household transfer inflow channel (D62) from split-flow weights';
            break;
        case 'household_consumption_from_transfers_eur_m':
            details = 'Transfer-driven household consumption = D62 * MPC';
            break;
        case 'household_savings_from_transfers_eur_m':
            details = 'Transfer-driven household savings = D62 * (1 - MPC)';
            break;
    }

    const registryRow = typeof getNodeRegistryRowById === 'function'
        ? getNodeRegistryRowById(node.id)
        : null;
    const detailText = details || registryRow?.description || 'Simulation metric';

    tooltip.innerHTML = `
        <strong>${node.name}</strong><br>
        Current: ${node.value}<br>
        <small>${detailText}</small>
    `;

    tooltip.style.position = 'absolute';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY - 30}px`;
    tooltip.style.background = 'var(--bg-secondary)';
    tooltip.style.border = `1px solid ${node.color}`;
    tooltip.style.borderRadius = '6px';
    tooltip.style.padding = '0.5rem';
    tooltip.style.fontSize = '0.8rem';
    tooltip.style.zIndex = '3000';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.boxShadow = `0 0 10px ${node.color}40`;

    document.body.appendChild(tooltip);
}

function showPolicyTooltip(event, policy) {
    hideTooltip();

    const currentValue = getPolicyValue(policy.id);
    const registryRow = typeof getNodeRegistryRowById === 'function'
        ? getNodeRegistryRowById(policy.id)
        : null;
    const formattedValue = formatNodeValueByUnit(currentValue, registryRow?.valueUnit || 'percent');
    const tooltip = document.createElement('div');
    tooltip.id = 'policy-tooltip';
    tooltip.className = 'tooltip policy-tooltip';
    tooltip.innerHTML = `
        <strong>${policy.name}</strong><br>
        Current: ${formattedValue}<br>
        <small>Click to adjust</small>
    `;

    tooltip.style.position = 'absolute';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY - 30}px`;
    tooltip.style.background = 'var(--bg-secondary)';
    tooltip.style.border = `1px solid ${policy.color || 'var(--economy)'}`;
    tooltip.style.borderRadius = '6px';
    tooltip.style.padding = '0.5rem';
    tooltip.style.fontSize = '0.8rem';
    tooltip.style.zIndex = '3000';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.boxShadow = `0 0 10px ${policy.color || 'var(--economy)'}40`;

    document.body.appendChild(tooltip);
}

function updateTooltipPosition(event) {
    const activeTooltip = document.getElementById('metric-tooltip') || document.getElementById('policy-tooltip');
    if (!activeTooltip) return;
    activeTooltip.style.left = `${event.pageX + 10}px`;
    activeTooltip.style.top = `${event.pageY - 30}px`;
}

function hideTooltip() {
    document.querySelectorAll('.tooltip').forEach((tooltip) => tooltip.remove());
}

function getBudgetChartPaletteColor(policyId) {
    const palette = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
        '#8b5cf6', '#f97316', '#22c55e', '#eab308', '#ec4899',
        '#14b8a6', '#84cc16', '#f43f5e', '#0ea5e9', '#6366f1'
    ];
    const seed = String(policyId || '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
}

function renderBudgetPieChart(containerId, legendId, breakdown) {
    const container = document.getElementById(containerId);
    const legend = document.getElementById(legendId);
    if (!container || !legend) return;

    const total = breakdown?.total || 0;
    const slices = breakdown?.slices || [];

    container.innerHTML = '';
    legend.innerHTML = '';

    if (!slices.length) {
        container.innerHTML = '<p class="chart-empty">No data available</p>';
        legend.innerHTML = '<p class="chart-empty">No data available</p>';
        return;
    }

    const availableWidth = container.clientWidth || 260;
    const availableHeight = container.clientHeight || 260;
    const width = Math.max(200, Math.min(300, availableWidth, availableHeight));
    const height = width;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.54;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('filter', 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35))');

    const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value).sort(null);
    const arcData = pie(slices);

    g.append('circle')
        .attr('r', innerRadius)
        .attr('fill', 'rgba(255, 255, 255, 0.04)')
        .attr('stroke', 'rgba(255, 255, 255, 0.14)')
        .attr('stroke-width', 1.2);

    const paths = g.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', d3.arc().innerRadius(innerRadius).outerRadius(innerRadius))
        .attr('fill', (d) => getBudgetChartPaletteColor(d.data.policyId))
        .attr('stroke', 'var(--bg-secondary)')
        .attr('stroke-width', 1.5)
        .style('transition', 'transform 120ms ease, filter 140ms ease')
        .style('transform-origin', 'center');

    const pathNodes = paths.nodes();
    const legendItems = [];
    function setLinkedHoverState(activeIndex) {
        pathNodes.forEach((node, idx) => {
            const selected = idx === activeIndex;
            d3.select(node)
                .style('transform', selected ? 'scale(1.03)' : 'scale(1)')
                .style('filter', selected ? 'brightness(1.12)' : 'none');
            if (legendItems[idx]) {
                legendItems[idx].classList.toggle('is-active', selected);
            }
        });
    }

    paths
        .on('mousemove', function(event, d) {
            setLinkedHoverState(d.index);
            hideTooltip();
            const tooltip = document.createElement('div');
            tooltip.id = 'budget-chart-tooltip';
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `
                <strong>${d.data.label}</strong><br>
                \u20AC${Math.round(d.data.value).toLocaleString()}M<br>
                ${d.data.percent.toFixed(1)}%
            `;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY - 30}px`;
            tooltip.style.border = `1px solid ${getBudgetChartPaletteColor(d.data.policyId)}`;
            document.body.appendChild(tooltip);
        })
        .on('mouseleave', function() {
            setLinkedHoverState(-1);
            hideTooltip();
        });

    paths.transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .attrTween('d', function(d) {
            const interpolateOuter = d3.interpolate(innerRadius, radius);
            return function(t) {
                return d3.arc().innerRadius(innerRadius).outerRadius(interpolateOuter(t))(d);
            };
        });

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', '11px')
        .text('TOTAL');

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.15em')
        .attr('fill', 'var(--text-primary)')
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .text(`\u20AC${Math.round(total).toLocaleString()}M`);

    slices.forEach((slice) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const sliceIndex = legendItems.length;
        item.innerHTML = `
            <span class="legend-color" style="background:${getBudgetChartPaletteColor(slice.policyId)}"></span>
            <span class="legend-label">${slice.label}</span>
            <span class="legend-value">\u20AC${Math.round(slice.value).toLocaleString()}M</span>
            <span class="legend-percent">${slice.percent.toFixed(1)}%</span>
        `;
        item.addEventListener('mouseenter', () => setLinkedHoverState(sliceIndex));
        item.addEventListener('mouseleave', () => setLinkedHoverState(-1));
        legendItems.push(item);
        legend.appendChild(item);
    });
}

function renderBudgetChartsModal(state) {
    if (!state || typeof calculateBudgetBreakdown !== 'function' || typeof d3 === 'undefined') return;
    const breakdown = calculateBudgetBreakdown(state);
    renderBudgetPieChart('income-pie-chart', 'income-chart-legend', breakdown.income);
    renderBudgetPieChart('expenditure-pie-chart', 'expenditure-chart-legend', breakdown.expenditure);
}
function openPolicyModal(policy, state) {
    if (typeof closeChartsModal === 'function') {
        closeChartsModal();
    }

    const modal = document.getElementById('policy-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const slider = document.getElementById('policy-slider');
    const sliderValue = document.getElementById('slider-value');

    if (!modal || !modalTitle || !modalDescription || !slider || !sliderValue) return;

    const policyValue = getPolicyValue(policy.id);
    const registryRow = typeof getNodeRegistryRowById === 'function'
        ? getNodeRegistryRowById(policy.id)
        : null;
    const unit = registryRow?.valueUnit || 'percent';
    const minValue = Number.isFinite(registryRow?.min) ? registryRow.min : 0;
    const maxValue = Number.isFinite(registryRow?.max) ? registryRow.max : 100;
    const resolvedValue = Number.isFinite(policyValue)
        ? policyValue
        : (Number.isFinite(registryRow?.initialValue) ? Number(registryRow.initialValue) : minValue);
    modalTitle.textContent = policy.name;
    modalTitle.dataset.policyId = policy.id;
    modalDescription.textContent = registryRow?.description || 'Policy description not available.';
    slider.min = String(minValue);
    slider.max = String(maxValue);
    slider.step = getPolicySliderStep(unit);
    slider.value = String(resolvedValue);
    slider.dataset.valueUnit = unit;
    slider.dataset.policyId = policy.id;
    sliderValue.textContent = formatNodeValueByUnit(resolvedValue, unit);
    modal.style.display = 'flex';
}

function renderGameOver(gameStatus, score) {
    const canvas = document.getElementById('radial-canvas');
    if (!canvas) return;

    if (typeof destroyForceGraph === 'function') {
        destroyForceGraph();
    }

    canvas.innerHTML = `
        <div class="game-over-screen">
            <h2>${gameStatus.isVictory ? 'Victory!' : 'Game Over'}</h2>
            <p>${gameStatus.message}</p>
            <p>Final Score: ${score}</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
}

const gameOverCSS = `
.game-over-screen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 2rem;
}

.game-over-screen h2 {
    color: var(--negative);
    margin-bottom: 1rem;
}

.game-over-screen.victory h2 {
    color: var(--positive);
}

.game-over-screen button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--economy);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
`;

if (!document.querySelector('#game-over-css')) {
    const style = document.createElement('style');
    style.id = 'game-over-css';
    style.textContent = gameOverCSS;
    document.head.appendChild(style);
}

window.addEventListener('blur', hideTooltip);
window.addEventListener('scroll', hideTooltip, true);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) hideTooltip();
});
