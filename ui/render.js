// UI rendering functions
// This file contains ONLY the visual rendering logic
// NO MATH HERE - PURE VISUALS

// Render the main game UI
function renderGameUI() {
    const state = getGameState();
    if (!state) {
        console.error('Game state not available for rendering');
        return;
    }
    
    // Update top bar
    updateTopBar(state);
    
    // Render policy nodes
    renderPolicyNodes(state);
    
    // Update turn counter
    updateTurnCounter(state);
    
    console.log('Game UI rendered');
}

// Update the top bar with current budget information
function updateTopBar(state) {
    const income = document.getElementById('income');
    const expenditure = document.getElementById('expenditure');
    const deficit = document.getElementById('deficit');
    const debt = document.getElementById('debt');
    
    if (income) income.textContent = `Income: €${state.budget.income.toLocaleString()}M`;
    if (expenditure) expenditure.textContent = `Expenditure: €${state.budget.expenditure.toLocaleString()}M`;
    if (deficit) {
        const deficitText = state.budget.deficit >= 0 ? `Deficit: €${state.budget.deficit.toLocaleString()}M` : `Surplus: €${Math.abs(state.budget.deficit).toLocaleString()}M`;
        deficit.textContent = deficitText;
        deficit.style.color = state.budget.deficit >= 0 ? 'var(--negative)' : 'var(--positive)';
    }
    if (debt) debt.textContent = `Debt: €${state.budget.debt.toLocaleString()}M`;
}

// Update the turn counter
function updateTurnCounter(state) {
    const turnCounter = document.getElementById('turn-counter');
    if (turnCounter) {
        turnCounter.textContent = `Turn ${state.game.turn} - Q${state.game.quarter} ${state.game.year}`;
    }
    
    const actionPoints = document.getElementById('action-points');
    if (actionPoints) {
        actionPoints.textContent = state.politics.actionPoints;
        actionPoints.style.color = state.politics.actionPoints > 0 ? 'var(--text-primary)' : 'var(--negative)';
    }
}

// Render policy nodes in the radial canvas
function renderPolicyNodes(state) {
    const canvas = document.getElementById('radial-canvas');
    if (!canvas) return;
    
    // Clear existing nodes
    canvas.innerHTML = '';
    
    // Define policy categories and their positions
    const categories = [
        {
            name: 'Economy',
            color: 'var(--economy)',
            policies: [
                { id: 'incomeTax', name: 'Income Tax', icon: '💰', angle: 0 },
                { id: 'corporateTax', name: 'Corporate Tax', icon: '🏢', angle: 30 },
                { id: 'vat', name: 'VAT', icon: '🛒', angle: 60 }
            ]
        },
        {
            name: 'Social',
            color: 'var(--welfare)',
            policies: [
                { id: 'healthcareSpending', name: 'Healthcare', icon: '🏥', angle: 120 },
                { id: 'educationSpending', name: 'Education', icon: '🎓', angle: 150 },
                { id: 'welfareSpending', name: 'Welfare', icon: '🤝', angle: 180 }
            ]
        },
        {
            name: 'Infrastructure',
            color: 'var(--transport)',
            policies: [
                { id: 'transportSpending', name: 'Transport', icon: '🚗', angle: 210 },
                { id: 'digitalInfrastructure', name: 'Digital', icon: '💻', angle: 240 }
            ]
        },
        {
            name: 'Law & Order',
            color: 'var(--law-order)',
            policies: [
                { id: 'policeSpending', name: 'Police', icon: '👮', angle: 270 },
                { id: 'justiceSpending', name: 'Justice', icon: '⚖️', angle: 300 }
            ]
        },
        {
            name: 'Environment',
            color: 'var(--health)',
            policies: [
                { id: 'greenEnergy', name: 'Green Energy', icon: '🌱', angle: 330 }
            ]
        }
    ];
    
    // Create radial dividers
    createRadialDividers(canvas, categories.length);
    
    // Render policy nodes
    categories.forEach(category => {
        category.policies.forEach(policy => {
            createPolicyNode(canvas, policy, category.color, state);
        });
    });
}

// Create radial dividers
function createRadialDividers(canvas, numCategories) {
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    for (let i = 0; i < numCategories; i++) {
        const angle = (i * 360 / numCategories) * Math.PI / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const divider = document.createElement('div');
        divider.className = 'radial-divider';
        divider.style.position = 'absolute';
        divider.style.left = centerX + 'px';
        divider.style.top = centerY + 'px';
        divider.style.width = radius + 'px';
        divider.style.height = '2px';
        divider.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)';
        divider.style.transform = `rotate(${i * 360 / numCategories}deg)`;
        divider.style.transformOrigin = '0 0';
        
        canvas.appendChild(divider);
    }
}

// Create a single policy node
function createPolicyNode(canvas, policy, color, state) {
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.6;
    
    const angle = policy.angle * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle) - 40; // 40 is half of node width
    const y = centerY + radius * Math.sin(angle) - 40; // 40 is half of node height
    
    const node = document.createElement('div');
    node.className = 'policy-node';
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.borderColor = color;
    node.dataset.policyId = policy.id;
    node.dataset.policyName = policy.name;
    
    // Add icon and label
    node.innerHTML = `
        <div class="icon">${policy.icon}</div>
        <div class="label">${policy.name}</div>
    `;
    
    // Add click event
    node.addEventListener('click', () => openPolicyModal(policy, state));
    
    canvas.appendChild(node);
}

// Open policy modal
function openPolicyModal(policy, state) {
    const modal = document.getElementById('policy-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const slider = document.getElementById('policy-slider');
    const sliderValue = document.getElementById('slider-value');
    
    if (modal && modalTitle && modalDescription && slider && sliderValue) {
        modalTitle.textContent = policy.name;
        modalTitle.dataset.policyId = policy.id; // Store the policy ID
        modalDescription.textContent = getPolicyDescription(policy.id);
        slider.value = state.policies[policy.id];
        slider.dataset.policyId = policy.id; // Store the policy ID
        sliderValue.textContent = state.policies[policy.id] + '%';
        
        modal.style.display = 'flex';
    }
}

// Get policy description
function getPolicyDescription(policyId) {
    const descriptions = {
        incomeTax: 'Adjust the income tax rate for Portuguese citizens. Higher rates increase revenue but may reduce economic activity.',
        corporateTax: 'Set the corporate tax rate for businesses. Affects business investment and economic growth.',
        vat: 'Value Added Tax on goods and services. Impacts cost of living and government revenue.',
        healthcareSpending: 'Public healthcare funding. Affects population health and happiness.',
        educationSpending: 'Educational system funding. Impacts long-term economic prospects and social mobility.',
        welfareSpending: 'Social welfare programs. Provides safety net and affects public happiness.',
        transportSpending: 'Transportation infrastructure investment. Affects economic efficiency and quality of life.',
        digitalInfrastructure: 'Digital connectivity and technology investment. Boosts productivity and competitiveness.',
        policeSpending: 'Law enforcement funding. Affects public safety and crime rates.',
        justiceSpending: 'Judicial system funding. Impacts rule of law and social stability.',
        greenEnergy: 'Renewable energy investment. Environmental impact and long-term sustainability.',
        carbonTax: 'Carbon emissions tax. Environmental policy with economic implications.'
    };
    
    return descriptions[policyId] || 'Policy description not available.';
}

// Render game over screen
function renderGameOver(gameStatus, score) {
    const canvas = document.getElementById('radial-canvas');
    if (!canvas) return;
    
    canvas.innerHTML = `
        <div class="game-over-screen">
            <h2>${gameStatus.isVictory ? 'Victory!' : 'Game Over'}</h2>
            <p>${gameStatus.message}</p>
            <p>Final Score: ${score}</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
}

// Add CSS for game over screen
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

// Inject the CSS if not already present
if (!document.querySelector('#game-over-css')) {
    const style = document.createElement('style');
    style.id = 'game-over-css';
    style.textContent = gameOverCSS;
    document.head.appendChild(style);
}
