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

function updateTopBar(state) {
    const income = document.getElementById('income');
    const expenditure = document.getElementById('expenditure');
    const deficit = document.getElementById('deficit');
    const debt = document.getElementById('debt');

    if (income) income.textContent = `Income: \u20AC${state.budget.income.toLocaleString()}M`;
    if (expenditure) expenditure.textContent = `Expenditure: \u20AC${state.budget.expenditure.toLocaleString()}M`;
    if (deficit) {
        const deficitText = state.budget.deficit >= 0
            ? `Deficit: \u20AC${state.budget.deficit.toLocaleString()}M`
            : `Surplus: \u20AC${Math.abs(state.budget.deficit).toLocaleString()}M`;
        deficit.textContent = deficitText;
        deficit.style.color = state.budget.deficit >= 0 ? 'var(--negative)' : 'var(--positive)';
    }
    if (debt) debt.textContent = `Debt: \u20AC${state.budget.debt.toLocaleString()}M`;

    const approval = document.getElementById('approval');
    const stability = document.getElementById('stability');
    if (approval) approval.textContent = `Approval: ${state.politics.approval}%`;
    if (stability) stability.textContent = `Stability: ${state.politics.stability}%`;
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

    const actionPoints = document.getElementById('action-points');
    if (actionPoints) {
        actionPoints.textContent = state.politics.actionPoints;
        actionPoints.style.color = state.politics.actionPoints > 0 ? 'var(--text-primary)' : 'var(--negative)';
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

function showOutcomeTooltip(event, node, state) {
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.id = 'outcome-tooltip';
    tooltip.className = 'tooltip outcome-tooltip';

    let details = '';
    switch (node.id) {
        case 'gdp':
            details = `Growth: ${(state.economy.gdpGrowth * 100).toFixed(1)}% annually`;
            break;
        case 'health':
            details = `SNS Strain: ${(state.currentEvents.snsStrain.severity * 100).toFixed(0)}%`;
            break;
        case 'happiness':
            details = `Youth Independence: ${state.population.youthIndependence}%`;
            break;
        case 'debt':
            details = `Debt-to-GDP: ${((state.economy.debt / state.economy.gdp) * 100).toFixed(1)}%`;
            break;
        case 'education':
            details = `Teacher Strikes: ${(state.currentEvents.educationStrikes.severity * 100).toFixed(0)}%`;
            break;
        case 'safety':
            details = `Police Funding: ${getPolicyValue('policeSpending')}%`;
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
        case 'govSpending':
            details = 'Perceived public-project stimulus';
            break;
        case 'netExports':
            details = 'Trade balance competitiveness channel';
            break;
        case 'rentBurden':
            details = 'Household rent pressure index';
            break;
        case 'youthIndependence':
            details = 'Young adults able to live independently';
            break;
    }

    tooltip.innerHTML = `
        <strong>${node.name}</strong><br>
        Current: ${node.value}<br>
        <small>${details}</small>
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
    const tooltip = document.createElement('div');
    tooltip.id = 'policy-tooltip';
    tooltip.className = 'tooltip policy-tooltip';
    tooltip.innerHTML = `
        <strong>${policy.name}</strong><br>
        Current: ${currentValue ?? 'N/A'}%<br>
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
    const activeTooltip = document.getElementById('outcome-tooltip') || document.getElementById('policy-tooltip');
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
                \u20AC${d.data.value.toLocaleString()}M<br>
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
        .text(`\u20AC${total.toLocaleString()}M`);

    slices.forEach((slice) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const sliceIndex = legendItems.length;
        item.innerHTML = `
            <span class="legend-color" style="background:${getBudgetChartPaletteColor(slice.policyId)}"></span>
            <span class="legend-label">${slice.label}</span>
            <span class="legend-value">\u20AC${slice.value.toLocaleString()}M</span>
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
    modalTitle.textContent = policy.name;
    modalTitle.dataset.policyId = policy.id;
    modalDescription.textContent = getPolicyDescription(policy.id);
    slider.value = policyValue ?? 0;
    slider.dataset.policyId = policy.id;
    sliderValue.textContent = `${policyValue ?? 0}%`;
    modal.style.display = 'flex';
}

function getPolicyDescription(policyId) {
    const descriptions = {
        incomeTax: 'Adjust the income tax rate. Higher rates increase revenue but may reduce growth.',
        corporateTax: 'Set the corporate tax rate. Influences investment and expansion.',
        vat: 'Value-added tax on goods and services. Affects revenue and cost of living.',
        healthcareSpending: 'Public healthcare funding. Affects health outcomes and social stability.',
        educationSpending: 'Educational investment. Impacts long-term productivity.',
        welfareSpending: 'Social welfare support. Affects happiness and resilience.',
        transportSpending: 'Transport infrastructure spending. Improves economic throughput.',
        digitalInfrastructure: 'Digital infrastructure investment. Supports productivity.',
        policeSpending: 'Law enforcement funding. Affects safety and order.',
        justiceSpending: 'Judicial system investment. Supports social stability.',
        greenEnergy: 'Renewable energy investment. Improves long-term sustainability.',
        carbonTax: 'Carbon taxation policy with environmental and economic tradeoffs.',
        'housingPolicy.maisHabitacao': 'More Housing program intensity to increase supply.',
        'housingPolicy.goldenVisa': 'Golden visa policy intensity impacting foreign demand.',
        'housingPolicy.alTaxes': 'Local accommodation tax intensity for short-term rentals.',
        'housingPolicy.rentControl': 'Rent control intensity to cap rent escalation and protect affordability.',
        'laborPolicy.minimumWage': 'Minimum wage policy intensity.',
        'laborPolicy.fourDayWeek': '4-day workweek trial intensity.',
        'laborPolicy.youthJobs': 'Youth employment program intensity.',
        'taxPolicy.nhrRegime': 'NHR regime policy intensity.',
        'taxPolicy.wealthTax': 'Wealth taxation policy intensity.'
    };

    return descriptions[policyId] || 'Policy description not available.';
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


