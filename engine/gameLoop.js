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
    
    // Check for game over conditions
    const gameStatus = getGameStatus(state);
    if (gameStatus.isGameOver) {
        const score = calculateScore(state);
        renderGameOver(gameStatus, score);
    }
    
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

// Check for game over conditions
function checkGameOverConditions(state) {
    const conditions = [];
    
    // Economic collapse
    if (state.economy.debt > state.economy.gdp * 2) {
        conditions.push('Economic collapse: Debt exceeds 200% of GDP');
    }
    
    // Political instability
    if (state.politics.stability < 20) {
        conditions.push('Political instability: Stability below 20%');
    }
    
    // Population revolt
    if (state.population.happiness < 20) {
        conditions.push('Population revolt: Happiness below 20%');
    }
    
    // Hyperinflation
    if (state.economy.inflation > 15) {
        conditions.push('Hyperinflation: Inflation above 15%');
    }
    
    // Mass unemployment
    if (state.economy.unemployment > 20) {
        conditions.push('Mass unemployment: Unemployment above 20%');
    }
    
    // Victory conditions
    if (state.politics.approval > 80 && state.economy.gdpGrowth > 0.03 && 
        state.population.happiness > 75 && state.game.turn > 20) {
        conditions.push('Victory: High approval, strong growth, happy population');
    }
    
    return conditions;
}

// Get game status message
function getGameStatus(state) {
    const conditions = checkGameOverConditions(state);
    
    if (conditions.length > 0) {
        return {
            isGameOver: true,
            message: conditions[0],
            isVictory: conditions[0].includes('Victory')
        };
    }
    
    return {
        isGameOver: false,
        message: 'Game continues',
        isVictory: false
    };
}

// Calculate score
function calculateScore(state) {
    let score = 0;
    
    // Economic factors
    score += state.economy.gdpGrowth * 1000;
    score -= Math.abs(state.economy.inflation - 2) * 100;
    score -= state.economy.unemployment * 50;
    score -= Math.abs(state.budget.deficit) / 100;
    
    // Population factors
    score += state.population.happiness * 10;
    score += state.population.health * 8;
    score += state.population.education * 6;
    score += state.population.safety * 7;
    
    // Political factors
    score += state.politics.approval * 5;
    score += state.politics.stability * 4;
    score -= state.politics.corruption * 3;
    
    // Debt penalty
    const debtRatio = state.economy.debt / state.economy.gdp;
    if (debtRatio > 1) {
        score -= (debtRatio - 1) * 500;
    }
    
    return Math.round(score);
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
