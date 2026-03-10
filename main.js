// Main application entry point
document.addEventListener('DOMContentLoaded', function() {
    console.log('Project Republica: Portugal - Loading...');
    
    // Initialize the game
    initializeGame();
});

async function initializeGame() {
    // Set up event listeners
    setupEventListeners();
    await initializeRelationshipsAndStartGate();
    
    console.log('Game initialized successfully');
}

function setStartButtonState(mode) {
    const startBtn = document.getElementById('start-game-btn');
    if (!startBtn) return;

    if (mode === 'loading') {
        startBtn.disabled = true;
        startBtn.textContent = 'Loading registries...';
        return;
    }

    if (mode === 'ready') {
        startBtn.disabled = false;
        startBtn.textContent = 'Start Game';
        startBtn.dataset.mode = 'start';
        return;
    }

    if (mode === 'error') {
        startBtn.disabled = false;
        startBtn.textContent = 'Load failed - Retry';
        startBtn.dataset.mode = 'retry';
    }
}

async function initializeRelationshipsAndStartGate() {
    if (
        typeof loadPoliciesCsv !== 'function'
        || typeof loadMetricsCsv !== 'function'
        || typeof loadCalibrationTargetsCsv !== 'function'
        || typeof loadRelationshipsCsv !== 'function'
        || typeof initializeGameState !== 'function'
    ) {
        setStartButtonState('error');
        return;
    }

    setStartButtonState('loading');
    try {
        await loadPoliciesCsv();
        await loadMetricsCsv();
        await loadCalibrationTargetsCsv();
        initializeGameState();
        await loadRelationshipsCsv();
        setStartButtonState('ready');
    } catch (error) {
        console.error('Failed to load startup CSV registries:', error);
        setStartButtonState('error');
    }
}

function setupEventListeners() {
    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    // Next turn button
    const nextTurnBtn = document.getElementById('next-turn-btn');
    if (nextTurnBtn) {
        nextTurnBtn.addEventListener('click', nextTurn);
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleGraphPhysicsPanel);
    }

    const chartsBtn = document.getElementById('charts-btn');
    if (chartsBtn) {
        chartsBtn.addEventListener('click', openChartsModal);
    }
    
    // Modal buttons
    const applyBtn = document.getElementById('apply-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyPolicyChange);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePolicyModal);
    }

    const chartsCloseBtn = document.getElementById('charts-close-btn');
    if (chartsCloseBtn) {
        chartsCloseBtn.addEventListener('click', closeChartsModal);
    }

    const chartsModal = document.getElementById('charts-modal');
    if (chartsModal) {
        chartsModal.addEventListener('click', (event) => {
            if (event.target === chartsModal) {
                closeChartsModal();
            }
        });
    }
    
    // Policy slider
    const policySlider = document.getElementById('policy-slider');
    if (policySlider) {
        policySlider.addEventListener('input', updateSliderValue);
    }
}

function startGame() {
    if (typeof isNodeRegistryDataReady === 'function' && !isNodeRegistryDataReady()) {
        if (typeof nodeRegistryLoadState !== 'undefined' && nodeRegistryLoadState.error) {
            initializeRelationshipsAndStartGate();
        }
        return;
    }

    if (typeof isRelationshipDataReady === 'function' && !isRelationshipDataReady()) {
        if (typeof relationshipLoadState !== 'undefined' && relationshipLoadState.error) {
            initializeRelationshipsAndStartGate();
        }
        return;
    }

    const startScreen = document.getElementById('start-screen');
    const mainGame = document.getElementById('main-game');
    
    if (startScreen && mainGame) {
        startScreen.style.display = 'none';
        mainGame.style.display = 'flex';
        
        // Initialize the game UI
        if (typeof renderGameUI === 'function') {
            renderGameUI();
        }

        ensureGraphPhysicsPanel();
        
        console.log('Game started');
    }
}

function nextTurn() {
    console.log('Advancing to next turn...');
    if (typeof isRelationshipDataReady === 'function' && !isRelationshipDataReady()) {
        console.error('Relationship data not loaded; turn is blocked.');
        return;
    }
    
    // Process the next turn in the engine
    if (typeof processNextTurn === 'function') {
        processNextTurn();
    }
    
    // Update the UI
    if (typeof renderGameUI === 'function') {
        renderGameUI();
    }
}

function updateSliderValue() {
    const slider = document.getElementById('policy-slider');
    const valueDisplay = document.getElementById('slider-value');
    
    if (slider && valueDisplay) {
        const numericValue = Number(slider.value);
        const valueUnit = slider.dataset.valueUnit || 'percent';
        valueDisplay.textContent = (typeof formatNodeValueByUnit === 'function')
            ? formatNodeValueByUnit(numericValue, valueUnit)
            : String(slider.value);
        
        // Show real-time preview of changes
        const policyId = slider.dataset.policyId;
        if (policyId && typeof previewPolicyChange === 'function') {
            previewPolicyChange(policyId, numericValue);
        }
    }
}

function applyPolicyChange() {
    const slider = document.getElementById('policy-slider');
    const modalTitle = document.getElementById('modal-title');
    
    if (slider && modalTitle) {
        const policyId = slider.dataset.policyId || modalTitle.dataset.policyId;
        const value = Number(slider.value);
        const valueUnit = slider.dataset.valueUnit || 'percent';
        
        console.log(`Applying policy change: ${policyId} = ${value} (${valueUnit})`);
        
        // Update the game state
        if (typeof updatePolicyValue === 'function') {
            updatePolicyValue(policyId, value);
        }
        
        // Close modal and update UI
        closePolicyModal();
        
        if (typeof renderGameUI === 'function') {
            renderGameUI();
        }
    }
}

function closePolicyModal() {
    const modal = document.getElementById('policy-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openChartsModal() {
    closePolicyModal();
    const chartsModal = document.getElementById('charts-modal');
    if (!chartsModal) return;

    chartsModal.style.display = 'flex';
    if (typeof renderBudgetChartsModal === 'function' && typeof getGameState === 'function') {
        renderBudgetChartsModal(getGameState());
    }
}

function closeChartsModal() {
    const chartsModal = document.getElementById('charts-modal');
    if (chartsModal) {
        chartsModal.style.display = 'none';
    }
}

function ensureGraphPhysicsPanel() {
    if (document.getElementById('graph-physics-panel')) return;

    const mainGame = document.getElementById('main-game');
    if (!mainGame) return;

    const panel = document.createElement('div');
    panel.id = 'graph-physics-panel';
    panel.className = 'physics-panel';
    panel.style.display = 'none';

    panel.innerHTML = `
        <div class="physics-panel-header">
            <strong>Graph Physics</strong>
        </div>
        <label>Repulsion <span id="phys-charge-val"></span></label>
        <input id="phys-charge" type="range" min="-420" max="-80" step="10">
        <label>Gravity <span id="phys-gravity-val"></span></label>
        <input id="phys-gravity" type="range" min="0.005" max="0.12" step="0.005">
        <label>Link Pull <span id="phys-link-val"></span></label>
        <input id="phys-link" type="range" min="0.05" max="0.5" step="0.01">
        <label>Link Distance <span id="phys-dist-val"></span></label>
        <input id="phys-dist" type="range" min="120" max="320" step="5">
        <label>Edge Repel <span id="phys-edge-repel-val"></span></label>
        <input id="phys-edge-repel" type="range" min="0" max="0.8" step="0.01">
        <label>Edge Padding <span id="phys-edge-pad-val"></span></label>
        <input id="phys-edge-pad" type="range" min="0" max="28" step="1">
        <button id="phys-reset-btn" type="button">Reset Defaults</button>
    `;

    mainGame.appendChild(panel);
    bindGraphPhysicsPanel();
    syncGraphPhysicsPanelValues();
}

function bindGraphPhysicsPanel() {
    const charge = document.getElementById('phys-charge');
    const gravity = document.getElementById('phys-gravity');
    const link = document.getElementById('phys-link');
    const distance = document.getElementById('phys-dist');
    const edgeRepel = document.getElementById('phys-edge-repel');
    const edgePad = document.getElementById('phys-edge-pad');
    const resetBtn = document.getElementById('phys-reset-btn');

    if (charge) {
        charge.addEventListener('input', () => {
            setGraphPhysicsSettings({ chargeStrength: parseFloat(charge.value) });
            syncGraphPhysicsPanelValues();
        });
    }
    if (gravity) {
        gravity.addEventListener('input', () => {
            setGraphPhysicsSettings({ gravityStrength: parseFloat(gravity.value) });
            syncGraphPhysicsPanelValues();
        });
    }
    if (link) {
        link.addEventListener('input', () => {
            const value = parseFloat(link.value);
            setGraphPhysicsSettings({ linkStrengthMin: value * 0.35, linkStrengthMax: value });
            syncGraphPhysicsPanelValues();
        });
    }
    if (distance) {
        distance.addEventListener('input', () => {
            const far = parseFloat(distance.value);
            setGraphPhysicsSettings({ linkDistanceFar: far, linkDistanceNear: Math.max(70, far * 0.58) });
            syncGraphPhysicsPanelValues();
        });
    }
    if (edgeRepel) {
        edgeRepel.addEventListener('input', () => {
            setGraphPhysicsSettings({ edgeRepulsionStrength: parseFloat(edgeRepel.value) });
            syncGraphPhysicsPanelValues();
        });
    }
    if (edgePad) {
        edgePad.addEventListener('input', () => {
            setGraphPhysicsSettings({ edgeRepulsionPadding: parseFloat(edgePad.value) });
            syncGraphPhysicsPanelValues();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            setGraphPhysicsSettings({
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
            });
            syncGraphPhysicsPanelValues();
        });
    }
}

function syncGraphPhysicsPanelValues() {
    if (typeof getGraphPhysicsSettings !== 'function') return;
    const settings = getGraphPhysicsSettings();

    const charge = document.getElementById('phys-charge');
    const gravity = document.getElementById('phys-gravity');
    const link = document.getElementById('phys-link');
    const distance = document.getElementById('phys-dist');
    const edgeRepel = document.getElementById('phys-edge-repel');
    const edgePad = document.getElementById('phys-edge-pad');

    if (charge) charge.value = settings.chargeStrength;
    if (gravity) gravity.value = settings.gravityStrength;
    if (link) link.value = settings.linkStrengthMax;
    if (distance) distance.value = settings.linkDistanceFar;
    if (edgeRepel) edgeRepel.value = Number.isFinite(settings.edgeRepulsionStrength) ? settings.edgeRepulsionStrength : 0.15;
    if (edgePad) edgePad.value = Number.isFinite(settings.edgeRepulsionPadding) ? settings.edgeRepulsionPadding : 9;

    const chargeVal = document.getElementById('phys-charge-val');
    const gravityVal = document.getElementById('phys-gravity-val');
    const linkVal = document.getElementById('phys-link-val');
    const distVal = document.getElementById('phys-dist-val');
    const edgeRepelVal = document.getElementById('phys-edge-repel-val');
    const edgePadVal = document.getElementById('phys-edge-pad-val');

    if (chargeVal) chargeVal.textContent = `${settings.chargeStrength.toFixed(0)}`;
    if (gravityVal) gravityVal.textContent = `${settings.gravityStrength.toFixed(3)}`;
    if (linkVal) linkVal.textContent = `${settings.linkStrengthMax.toFixed(2)}`;
    if (distVal) distVal.textContent = `${settings.linkDistanceFar.toFixed(0)}px`;
    if (edgeRepelVal) edgeRepelVal.textContent = `${(Number.isFinite(settings.edgeRepulsionStrength) ? settings.edgeRepulsionStrength : 0.15).toFixed(2)}`;
    if (edgePadVal) edgePadVal.textContent = `${(Number.isFinite(settings.edgeRepulsionPadding) ? settings.edgeRepulsionPadding : 9).toFixed(0)}px`;
}

function toggleGraphPhysicsPanel() {
    ensureGraphPhysicsPanel();
    const panel = document.getElementById('graph-physics-panel');
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    if (panel.style.display !== 'none') {
        syncGraphPhysicsPanelValues();
    }
}
