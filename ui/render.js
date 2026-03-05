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
        case 'unemployment':
            details = 'Labor market pressure';
            break;
        case 'inflation':
            details = 'Target: 2.0%';
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

function openPolicyModal(policy, state) {
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
        'taxPolicy.irsBrackets': 'IRS bracket progression policy intensity.',
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
