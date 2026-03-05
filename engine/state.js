// Portugal initial game state - January 2024
// This file contains ONLY the initial variables and data structures
// NO UI CODE HERE - PURE MATH ONLY

const portugalState = {
    // Economic indicators - Portugal Jan 2024 reality
    economy: {
        gdp: 267000, // million euros (€267 billion - actual 2023 GDP)
        gdpGrowth: 0.023, // 2.3% annual growth (2023 actual)
        unemployment: 6.5, // percentage (actual rate)
        inflation: 2.3, // percentage (actual rate)
        debt: 264000, // million euros (99% of GDP - actual debt ratio)
        deficit: 12000, // million euros (projected 2024 deficit)
    },
    
    // Budget
    budget: {
        income: 95000, // million euros (projected 2024 revenue)
        expenditure: 107000, // million euros (projected 2024 spending)
        deficit: 12000, // million euros
        debt: 264000, // million euros
    },
    
    // Population metrics - Portugal specific
    population: {
        total: 10300000, // 10.3 million
        happiness: 58, // Lower due to economic pressures
        health: 65, // Strained by SNS issues
        education: 62, // Affected by teacher strikes
        safety: 78, // Still relatively good
        youthIndependence: 35, // Low due to housing crisis
        rentBurden: 45, // High rent burden on households
    },
    
    // Political metrics
    politics: {
        approval: 42, // Challenging political environment
        stability: 68, // Moderate stability
        corruption: 38, // Ongoing corruption concerns
        actionPoints: 3, // available per turn
    },
    
    // Game state - Starting January 2024
    game: {
        turn: 1,
        month: 1, // January
        year: 2024,
    },
    
    // Current events modifiers - Portugal Jan 2024 specific
    currentEvents: {
        housingCrisis: {
            severity: 0.8, // High severity (0-1 scale)
            rentPrices: 0.9, // Very high rent pressure
            youthIndependence: 0.7, // Low youth independence
            alRegulation: 0.6, // Local accommodation pressure
        },
        snsStrain: {
            severity: 0.7, // High strain on health system
            waitTimes: 0.8, // Long wait times
            doctorStrikes: 0.6, // Ongoing strikes
            fundingGap: 0.5, // Budget shortfalls
        },
        educationStrikes: {
            severity: 0.6, // Moderate to high
            teacherStrikes: 0.7, // Active strikes
            qualityImpact: 0.5, // Quality degradation
            studentImpact: 0.6, // Student learning affected
        }
    },
    
    // Policies (player-controlled levers)
    policies: {
        // Economic policies
        incomeTax: 23, // Slightly lower to stimulate economy
        corporateTax: 19, // Competitive rate
        vat: 23, // Standard VAT rate
        
        // Social policies
        healthcareSpending: 55, // Strained but trying to maintain
        educationSpending: 50, // Under pressure from strikes
        welfareSpending: 48, // Increased due to housing crisis
        
        // Infrastructure
        transportSpending: 42, // Moderate investment
        digitalInfrastructure: 52, // Focus on digital transition
        
        // Law & Order
        policeSpending: 63, // Maintained levels
        justiceSpending: 51, // Adequate funding
        
        // Environmental
        greenEnergy: 38, // Gradual transition
        carbonTax: 18, // Moderate carbon pricing
        
        // Portugal-specific policies (new for Phase 7)
        housingPolicy: {
            maisHabitacao: 35, // "More Housing" program intensity
            goldenVisa: 25, // Golden visa restrictions
            alTaxes: 40, // Local accommodation taxes
            rentControl: 30, // Rent control measures
        },
        laborPolicy: {
            minimumWage: 45, // Minimum wage adjustments
            fourDayWeek: 20, // 4-day workweek trials
            youthJobs: 38, // Youth employment programs
        },
        taxPolicy: {
            irsBrackets: 35, // IRS tax bracket adjustments
            nhrRegime: 40, // Non-habitual resident regime
            wealthTax: 25, // Wealth tax considerations
        }
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
    if (window.gameState) {
        // Handle nested policy names (e.g., "housingPolicy.maisHabitacao")
        if (policyName.includes('.')) {
            const [category, policy] = policyName.split('.');
            if (window.gameState.policies[category] && window.gameState.policies[category][policy] !== undefined) {
                window.gameState.policies[category][policy] = value;
                console.log(`Policy ${policyName} updated to ${value}`);
                return true;
            }
        } else if (window.gameState.policies[policyName] !== undefined) {
            window.gameState.policies[policyName] = value;
            console.log(`Policy ${policyName} updated to ${value}`);
            return true;
        }
    }
    return false;
}

// Function to get a specific policy value
function getPolicyValue(policyName) {
    if (window.gameState) {
        // Handle nested policy names (e.g., "housingPolicy.maisHabitacao")
        if (policyName.includes('.')) {
            const [category, policy] = policyName.split('.');
            if (window.gameState.policies[category] && window.gameState.policies[category][policy] !== undefined) {
                return window.gameState.policies[category][policy];
            }
        } else if (window.gameState.policies[policyName] !== undefined) {
            return window.gameState.policies[policyName];
        }
    }
    return null;
}
