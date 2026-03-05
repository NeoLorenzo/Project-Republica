// Portugal initial game state
// This file contains ONLY the initial variables and data structures
// NO UI CODE HERE - PURE MATH ONLY

const portugalState = {
    // Economic indicators
    economy: {
        gdp: 250000, // million euros
        gdpGrowth: 0.02, // 2% growth rate
        unemployment: 6.8, // percentage
        inflation: 2.1, // percentage
        debt: 350000, // million euros
        deficit: 8000, // million euros
    },
    
    // Budget
    budget: {
        income: 95000, // million euros
        expenditure: 103000, // million euros
        deficit: 8000, // million euros
        debt: 350000, // million euros
    },
    
    // Population metrics
    population: {
        total: 10300000, // 10.3 million
        happiness: 65, // 0-100 scale
        health: 72, // 0-100 scale
        education: 68, // 0-100 scale
        safety: 78, // 0-100 scale
    },
    
    // Political metrics
    politics: {
        approval: 45, // 0-100 scale
        stability: 70, // 0-100 scale
        corruption: 35, // 0-100 scale (lower is better)
        actionPoints: 3, // available per turn
    },
    
    // Game state
    game: {
        turn: 1,
        quarter: 1,
        year: 2024,
    },
    
    // Policies (player-controlled levers)
    policies: {
        // Economic policies
        incomeTax: 25, // percentage
        corporateTax: 21, // percentage
        vat: 23, // percentage
        
        // Social policies
        healthcareSpending: 60, // 0-100 scale
        educationSpending: 55, // 0-100 scale
        welfareSpending: 45, // 0-100 scale
        
        // Infrastructure
        transportSpending: 40, // 0-100 scale
        digitalInfrastructure: 50, // 0-100 scale
        
        // Law & Order
        policeSpending: 65, // 0-100 scale
        justiceSpending: 50, // 0-100 scale
        
        // Environmental
        greenEnergy: 35, // 0-100 scale
        carbonTax: 20, // percentage
    }
};

// Function to initialize the game state
function initializeGameState() {
    // Deep copy the initial state to avoid mutation
    window.gameState = JSON.parse(JSON.stringify(portugalState));
    console.log('Game state initialized for Portugal');
    return window.gameState;
}

// Function to get current game state
function getGameState() {
    return window.gameState;
}

// Function to update a specific policy value
function updatePolicyValue(policyName, value) {
    if (window.gameState && window.gameState.policies[policyName] !== undefined) {
        window.gameState.policies[policyName] = value;
        console.log(`Policy ${policyName} updated to ${value}`);
        return true;
    }
    return false;
}

// Function to get a specific policy value
function getPolicyValue(policyName) {
    if (window.gameState && window.gameState.policies[policyName] !== undefined) {
        return window.gameState.policies[policyName];
    }
    return null;
}
