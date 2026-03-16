// Input handling and user interactions
// This file contains ONLY the input handling logic
// NO MATH HERE - PURE VISUALS

// Handle policy slider changes
function handlePolicySliderChange(event) {
    const slider = event.target;
    const valueDisplay = document.getElementById('slider-value');
    const numericValue = Number(slider.value);
    const valueUnit = slider.dataset.valueUnit || 'percent';

    if (valueDisplay) {
        valueDisplay.textContent = (typeof formatNodeValueByUnit === 'function')
            ? formatNodeValueByUnit(numericValue, valueUnit)
            : String(slider.value);
    }

    // Update the policy value in real-time (optional preview)
    const policyId = slider.dataset.policyId;
    if (policyId) {
        previewPolicyChange(policyId, numericValue);
    }
}

// Preview policy changes without applying them
function previewPolicyChange(policyId, value) {
    const state = getGameState();
    if (!state) return;

    // Store original value for both flat and nested policy ids.
    const originalValue = getPolicyValue(policyId);
    if (originalValue === null || originalValue === undefined) return;

    // Temporarily update for preview
    updatePolicyValue(policyId, value);

    // Calculate preview effects
    const previewBudget = calculateBudget(state);
    calculatePopulationMetrics(state);

    // Update preview display
    updatePreviewDisplay(previewBudget);

    // Restore original value
    updatePolicyValue(policyId, originalValue);
}

// Update preview display in modal
function updatePreviewDisplay(budget) {
    const previewIncome = document.getElementById('preview-income');
    const previewExpenditure = document.getElementById('preview-expenditure');
    const previewDeficit = document.getElementById('preview-deficit');

    const roundedIncome = Math.round(budget.income);
    const roundedExpenditure = Math.round(budget.expenditure);
    const roundedDeficit = Math.round(budget.deficit);

    if (previewIncome) previewIncome.textContent = `\u20AC${roundedIncome.toLocaleString()}M`;
    if (previewExpenditure) previewExpenditure.textContent = `\u20AC${roundedExpenditure.toLocaleString()}M`;
    if (previewDeficit) {
        const deficitText = budget.deficit >= 0
            ? `\u20AC${roundedDeficit.toLocaleString()}M`
            : `\u20AC${Math.abs(roundedDeficit).toLocaleString()}M`;
        previewDeficit.textContent = deficitText;
        previewDeficit.style.color = budget.deficit >= 0 ? 'var(--negative)' : 'var(--positive)';
    }
}

// Handle keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        const chartsModal = document.getElementById('charts-modal');
        if (chartsModal && chartsModal.style.display === 'flex') {
            if (event.key === 'Escape') {
                closeChartsModal();
            }
            return;
        }

        // Prevent shortcuts when policy modal is open
        const modal = document.getElementById('policy-modal');
        if (modal && modal.style.display === 'flex') {
            if (event.key === 'Escape') {
                closePolicyModal();
            } else if (event.key === 'Enter') {
                applyPolicyChange();
            }
            return;
        }

        // Game shortcuts
        switch(event.key) {
            case 'n':
            case 'N':
                // Next turn
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    nextTurn();
                }
                break;
            case 'Escape':
                // Return to start screen
                if (event.shiftKey) {
                    returnToStartScreen();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                // Quick policy access (if implemented)
                break;
        }
    });
}

// Handle window resize
function setupResizeHandler() {
    window.addEventListener('resize', function() {
        // Re-render policy nodes on resize
        const state = getGameState();
        if (state && document.getElementById('main-game').style.display !== 'none') {
            renderPolicyNodes(state);
        }
    });
}

// Handle context menu (disable for better UX)
function setupContextMenuHandler() {
    document.addEventListener('contextmenu', function(event) {
        // Allow right-click on specific elements if needed
        if (event.target.closest('.policy-node')) {
            // Could show context menu for policy nodes
            event.preventDefault();
        } else {
            // Disable default context menu
            event.preventDefault();
        }
    });
}

function bindModalFocusTrap(modal) {
    if (!modal) return;
    modal.addEventListener('keydown', function(event) {
        if (event.key !== 'Tab') return;
        const focusableElements = modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements.length) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
}

// Handle focus management for accessibility
function setupFocusManagement() {
    bindModalFocusTrap(document.getElementById('policy-modal'));
    bindModalFocusTrap(document.getElementById('charts-modal'));
}

// Return to start screen
function returnToStartScreen() {
    const startScreen = document.getElementById('start-screen');
    const mainGame = document.getElementById('main-game');

    if (startScreen && mainGame) {
        mainGame.style.display = 'none';
        startScreen.style.display = 'flex';

        if (typeof hideTooltip === 'function') {
            hideTooltip();
        }
        if (typeof destroyForceGraph === 'function') {
            destroyForceGraph();
        }

        // Reset game state
        if (typeof initializeGameState === 'function') {
            initializeGameState();
        }
    }
}

// Initialize all input handlers
function initializeInputHandlers() {
    setupKeyboardShortcuts();
    setupResizeHandler();
    setupContextMenuHandler();
    setupFocusManagement();
    // Add policy slider event listener
    const policySlider = document.getElementById('policy-slider');
    if (policySlider) {
        policySlider.addEventListener('input', handlePolicySliderChange);
    }

    console.log('Input handlers initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInputHandlers);
} else {
    initializeInputHandlers();
}
