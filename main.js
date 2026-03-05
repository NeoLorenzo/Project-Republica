// Main application entry point
document.addEventListener('DOMContentLoaded', function() {
    console.log('Project Republica: Portugal - Loading...');
    
    // Initialize the game
    initializeGame();
});

function initializeGame() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game state
    if (typeof initializeGameState === 'function') {
        initializeGameState();
    }
    
    console.log('Game initialized successfully');
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
    
    // Modal buttons
    const applyBtn = document.getElementById('apply-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyPolicyChange);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePolicyModal);
    }
    
    // Policy slider
    const policySlider = document.getElementById('policy-slider');
    if (policySlider) {
        policySlider.addEventListener('input', updateSliderValue);
    }
}

function startGame() {
    const startScreen = document.getElementById('start-screen');
    const mainGame = document.getElementById('main-game');
    
    if (startScreen && mainGame) {
        startScreen.style.display = 'none';
        mainGame.style.display = 'flex';
        
        // Initialize the game UI
        if (typeof renderGameUI === 'function') {
            renderGameUI();
        }
        
        console.log('Game started');
    }
}

function nextTurn() {
    console.log('Advancing to next turn...');
    
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
        valueDisplay.textContent = slider.value + '%';
        
        // Show real-time preview of changes
        const policyId = slider.dataset.policyId;
        if (policyId && typeof previewPolicyChange === 'function') {
            previewPolicyChange(policyId, parseInt(slider.value));
        }
    }
}

function applyPolicyChange() {
    const slider = document.getElementById('policy-slider');
    const modalTitle = document.getElementById('modal-title');
    
    if (slider && modalTitle) {
        const policyId = slider.dataset.policyId || modalTitle.dataset.policyId;
        const value = parseInt(slider.value);
        
        console.log(`Applying policy change: ${policyId} = ${value}%`);
        
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
