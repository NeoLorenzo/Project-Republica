// Portugal initial game state - January 2024
// This file contains ONLY the initial variables and data structures
// NO UI CODE HERE - PURE MATH ONLY

const portugalState = {
    // Economic indicators - Portugal Jan 2024 reality
    economy: {
        gdp: 267000, // million euros (EUR 267 billion - actual 2023 GDP)
        gdpGrowth: 0.023, // 2.3% annual growth (2023 actual)
        unemployment_rate: 6.5, // percentage (actual rate)
        inflation_consumer_prices: 2.3, // percentage (actual rate)

        // Calibration metrics (economic)
        gini_coefficient: 30.9,
        co2_emissions_per_capita: 3.9,
        labor_force_participation_rate: 58.6,
        central_government_debt: 94.9,
        tax_revenue: 35.2,
        renewable_energy_consumption: 34.8,
        foreign_direct_investment_net: 3.2,
        military_expenditure: 1.3,
        arable_land: 11.0,
        forest_area: 36.0,
        central_bank_policy_rate: 4.5,
        nominal_minimum_wage: 820.0,
        trade_union_density_rate: 15.3,
        average_annual_real_wages: 19000.0,
        youth_unemployment_rate: 21.2,
        public_expenditure_on_health: 6.5,
        public_expenditure_on_education: 5.0,
        air_pollution_pm25: 8.5,

        // Existing aggregate-demand channels
        consumption: 65, // aggregate demand component (0-100)
        investment: 50, // aggregate demand component (0-100)
        govSpending: 55, // behavioral stimulus perception (0-100)
        netExports: 45, // aggregate demand component (0-100)

        // Existing stock/flow fiscal values (EUR million)
        debt: 264000, // million euros (99% of GDP - actual debt ratio)
        deficit: 12000 // million euros (projected 2024 deficit)
    },

    // Budget
    budget: {
        income: 95000, // million euros (projected 2024 revenue)
        expenditure: 107000, // million euros (projected 2024 spending)
        deficit: 12000, // million euros
        debt: 264000 // million euros
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

        // Calibration metrics (population/social)
        infant_mortality_rate: 3.0,
        life_expectancy_at_birth: 81.5,
        intentional_homicide_rate: 0.72,
        adult_literacy_rate: 96.1,
        total_fertility_rate: 1.4,
        poverty_headcount_ratio: 0.4,
        maternal_mortality_ratio: 8.0,
        population_density: 116.6,
        individuals_using_internet: 85.0,
        access_to_electricity: 100.0,
        mean_years_of_schooling: 9.6,
        urban_population: 67.0,
        median_age: 47.0,
        net_migration_rate: 13.4,
        suicide_mortality_rate: 9.0,
        physicians_per_1000_people: 5.5,
        mobile_cellular_subscriptions: 130.0,
        incarceration_rate: 120.0,
        road_traffic_mortality_rate: 5.5,
        home_ownership_rate: 70.0,
        tertiary_education_attainment: 35.0,
        adult_obesity_rate: 20.8,
        fixed_broadband_subscriptions: 42.0
    },

    // Political metrics
    politics: {
        approval: 42, // Challenging political environment
        stability: 68, // Moderate stability
        corruption: 38, // Ongoing corruption concerns
        women_in_parliament: 36.0,
        actionPoints: 3 // available per turn
    },

    // Game state - Starting January 2024
    game: {
        turn: 1,
        month: 1, // January
        year: 2024
    },

    // Current events modifiers - Portugal Jan 2024 specific
    currentEvents: {
        housingCrisis: {
            severity: 0.8, // High severity (0-1 scale)
            rentPrices: 0.9, // Very high rent pressure
            youthIndependence: 0.7, // Low youth independence
            alRegulation: 0.6 // Local accommodation pressure
        },
        snsStrain: {
            severity: 0.7, // High strain on health system
            waitTimes: 0.8, // Long wait times
            doctorStrikes: 0.6, // Ongoing strikes
            fundingGap: 0.5 // Budget shortfalls
        },
        educationStrikes: {
            severity: 0.6, // Moderate to high
            teacherStrikes: 0.7, // Active strikes
            qualityImpact: 0.5, // Quality degradation
            studentImpact: 0.6 // Student learning affected
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
            rentControl: 30 // Rent control measures
        },
        laborPolicy: {
            minimumWage: 45, // Minimum wage adjustments
            fourDayWeek: 20, // 4-day workweek trials
            youthJobs: 38 // Youth employment programs
        },
        taxPolicy: {
            nhrRegime: 40, // Non-habitual resident regime
            wealthTax: 25 // Wealth tax considerations
        }
    },

    // Accounting model coefficients (annual, million EUR).
    budgetModel: {
        referenceGdp: 267000,
        revenues: {
            incomeTax: { baseRevenue: 180000, gdpScaled: true },
            corporateTax: { baseRevenue: 90000, gdpScaled: true },
            vat: { baseRevenue: 110000, gdpScaled: true },
            carbonTax: { baseRevenue: 12000, gdpScaled: true },
            'housingPolicy.alTaxes': { baseRevenue: 9000, gdpScaled: true },
            'housingPolicy.goldenVisa': { baseRevenue: 5000, gdpScaled: true },
            'taxPolicy.nhrRegime': { baseRevenue: 3000, gdpScaled: true },
            'taxPolicy.wealthTax': { baseRevenue: 1000, gdpScaled: true }
        },
        costs: {
            healthcareSpending: { baseCost: 50000, gdpScaled: true },
            educationSpending: { baseCost: 35000, gdpScaled: true },
            welfareSpending: { baseCost: 24000, gdpScaled: true },
            transportSpending: { baseCost: 15000, gdpScaled: true },
            digitalInfrastructure: { baseCost: 12000, gdpScaled: true },
            policeSpending: { baseCost: 14000, gdpScaled: true },
            justiceSpending: { baseCost: 9000, gdpScaled: true },
            greenEnergy: { baseCost: 8000, gdpScaled: true },
            incomeTax: { baseCost: 0, gdpScaled: true },
            corporateTax: { baseCost: 0, gdpScaled: true },
            vat: { baseCost: 0, gdpScaled: true },
            carbonTax: { baseCost: 0, gdpScaled: true },
            'housingPolicy.maisHabitacao': { baseCost: 15000, gdpScaled: true },
            'housingPolicy.goldenVisa': { baseCost: 3000, gdpScaled: true },
            'housingPolicy.alTaxes': { baseCost: 1000, gdpScaled: true },
            'housingPolicy.rentControl': { baseCost: 7000, gdpScaled: true },
            'laborPolicy.minimumWage': { baseCost: 12000, gdpScaled: true },
            'laborPolicy.fourDayWeek': { baseCost: 10000, gdpScaled: true },
            'laborPolicy.youthJobs': { baseCost: 11000, gdpScaled: true },
            'taxPolicy.nhrRegime': { baseCost: 1500, gdpScaled: true },
            'taxPolicy.wealthTax': { baseCost: 800, gdpScaled: true }
        }
    },

    // Tier 1 behavioral node base anchors (normalized 0..1).
    simulationConfig: {
        baseValues: {
            gdp: 0.3625,
            unemployment_rate: 0.26,
            inflation_consumer_prices: 0.23,
            happiness: 0.58,
            health: 0.65,
            education: 0.62,
            safety: 0.78,
            youthIndependence: 0.35,
            rentBurden: 0.45,
            consumption: 0.65,
            investment: 0.50,
            govSpending: 0.55,
            netExports: 0.45
        }
    }
};

// Function to initialize the game state
function initializeGameState() {
    // Deep copy the initial state to avoid mutation
    window.gameState = JSON.parse(JSON.stringify(portugalState));
    if (typeof initializeSimulationNodes === 'function') {
        initializeSimulationNodes(window.gameState);
    }
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
