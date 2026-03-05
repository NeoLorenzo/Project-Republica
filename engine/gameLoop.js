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
    
    console.log(`Processing turn ${state.game.turn} - ${getMonthName(state.game.month)} ${state.game.year}`);
    
    // Calculate new values based on current policies
    const newBudget = calculateBudget(state);
    const newPopulationMetrics = calculatePopulationMetrics(state);
    const newEconomicIndicators = calculateEconomicIndicators(state);
    const newPoliticalMetrics = calculatePoliticalMetrics(state);
    
    // Update the game state
    state.budget = newBudget;
    state.population = { ...state.population, ...newPopulationMetrics };
    state.economy = { ...state.economy, ...newEconomicIndicators };
    state.politics = { ...state.politics, ...newPoliticalMetrics };
    
    // Update GDP based on growth (monthly growth rate)
    const monthlyGrowthRate = state.economy.gdpGrowth / 12; // Convert annual to monthly
    state.economy.gdp = Math.round(state.economy.gdp * (1 + monthlyGrowthRate));
    
    // Update debt
    state.economy.debt = newBudget.debt;
    state.economy.deficit = newBudget.deficit;
    
    // Advance turn
    advanceTurn(state);
    
    // Reset action points
    state.politics.actionPoints = 3;
    
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
            unemployment: state.economy.unemployment.toFixed(1) + '%',
            inflation: state.economy.inflation.toFixed(1) + '%',
            debtRatio: ((state.economy.debt / state.economy.gdp) * 100).toFixed(1) + '%'
        },
        population: {
            happiness: state.population.happiness + '%',
            health: state.population.health + '%',
            education: state.population.education + '%',
            safety: state.population.safety + '%'
        },
        politics: {
            approval: state.politics.approval + '%',
            stability: state.politics.stability + '%',
            corruption: state.politics.corruption + '%'
        },
        budget: {
            deficit: '€' + state.budget.deficit.toLocaleString() + 'M',
            debt: '€' + state.budget.debt.toLocaleString() + 'M'
        }
    };
}
