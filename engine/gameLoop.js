// Game loop and turn processing
// This file contains ONLY the game loop logic
// NO UI CODE HERE - PURE MATH ONLY

// Process one turn (one month)
function processNextTurn() {
    const state = getGameState();
    if (!state) {
        console.error('Game state not initialized');
        return;
    }
    if (typeof isRelationshipDataReady === 'function' && !isRelationshipDataReady()) {
        console.error('Relationship data not loaded; cannot process turn.');
        return state;
    }
    
    console.log(`Processing turn ${state.game.turn} - ${getMonthName(state.game.month)} ${state.game.year}`);
    
    // Run bounded relationship simulation first (base-anchored target + inertia drift).
    if (typeof stepRelationshipSimulation === 'function') {
        stepRelationshipSimulation(state);
    }

    // Recalculate budget and derived economy metrics from updated state.
    const newBudget = calculateBudget(state);
    state.budget = newBudget;
    if (typeof recomputeDerivedEconomyMetrics === 'function') {
        recomputeDerivedEconomyMetrics(state);
    }
    
    // Advance turn
    advanceTurn(state);
    
    console.log('Turn processed successfully');
    console.log('New state:', state);
    
    return state;
}

// Advance the turn counter (monthly)
function advanceTurn(state) {
    state.game.turn++;
    state.game.month++;
    
    if (state.game.month > 12) {
        state.game.month = 1;
        state.game.year++;
    }
}

// Get month name for display
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'January';
}

// Get performance indicators
function getPerformanceIndicators(state) {
    return {
        economy: {
            gdpGrowth: (state.economy.gdpGrowth * 100).toFixed(1) + '%',
            unemployment_rate: state.economy.unemployment_rate.toFixed(1) + '%',
            inflation_consumer_prices: state.economy.inflation_consumer_prices.toFixed(1) + '%',
            debtRatio: ((state.budget.debt / state.economy.gdp) * 100).toFixed(1) + '%'
        },
        population: {
            happiness: state.population.happiness + '%',
            health: state.population.health + '%',
            education: state.population.education + '%',
            safety: state.population.safety + '%'
        },
        budget: {
            deficit: '€' + state.budget.deficit.toLocaleString() + 'M',
            debt: '€' + state.budget.debt.toLocaleString() + 'M'
        }
    };
}

