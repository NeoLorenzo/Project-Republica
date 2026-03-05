// Mathematical relationships between game variables
// This file contains ONLY the rules and equations
// NO UI CODE HERE - PURE MATH ONLY

// Multipliers and relationships
const multipliers = {
    // Economic multipliers
    economy: {
        incomeTaxMultiplier: -0.8, // Higher tax reduces GDP growth
        corporateTaxMultiplier: -0.6, // Corporate tax affects investment
        unemploymentMultiplier: -0.5, // Unemployment affects happiness
        inflationMultiplier: -0.3, // Inflation affects purchasing power
    },
    
    // Social multipliers
    social: {
        healthcareMultiplier: 0.7, // Healthcare spending affects health
        educationMultiplier: 0.6, // Education spending affects education
        welfareMultiplier: 0.5, // Welfare affects happiness
    },
    
    // Infrastructure multipliers
    infrastructure: {
        transportMultiplier: 0.4, // Transport affects economy
        digitalMultiplier: 0.3, // Digital affects productivity
    },
    
    // Law & Order multipliers
    lawOrder: {
        policeMultiplier: 0.6, // Police spending affects safety
        justiceMultiplier: 0.4, // Justice affects stability
    },
    
    // Environmental multipliers
    environment: {
        greenEnergyMultiplier: 0.3, // Green energy affects health
        carbonTaxMultiplier: -0.2, // Carbon tax affects economy
    }
};

// Calculate budget based on policies
function calculateBudget(state) {
    const policies = state.policies;
    const economy = state.economy;
    
    // Calculate income
    const incomeTaxRevenue = economy.gdp * (policies.incomeTax / 100) * 0.15;
    const corporateTaxRevenue = economy.gdp * (policies.corporateTax / 100) * 0.08;
    const vatRevenue = economy.gdp * (policies.vat / 100) * 0.12;
    const totalIncome = incomeTaxRevenue + corporateTaxRevenue + vatRevenue;
    
    // Calculate expenditure
    const baseExpenditure = economy.gdp * 0.4; // 40% of GDP baseline
    const healthcareCost = baseExpenditure * (policies.healthcareSpending / 100) * 0.25;
    const educationCost = baseExpenditure * (policies.educationSpending / 100) * 0.20;
    const welfareCost = baseExpenditure * (policies.welfareSpending / 100) * 0.15;
    const transportCost = baseExpenditure * (policies.transportSpending / 100) * 0.10;
    const policeCost = baseExpenditure * (policies.policeSpending / 100) * 0.08;
    const justiceCost = baseExpenditure * (policies.justiceSpending / 100) * 0.05;
    const digitalCost = baseExpenditure * (policies.digitalInfrastructure / 100) * 0.04;
    const greenCost = baseExpenditure * (policies.greenEnergy / 100) * 0.03;
    
    const totalExpenditure = healthcareCost + educationCost + welfareCost + 
                            transportCost + policeCost + justiceCost + 
                            digitalCost + greenCost;
    
    // Calculate deficit and debt
    const deficit = totalExpenditure - totalIncome;
    const debt = economy.debt + deficit;
    
    return {
        income: Math.round(totalIncome),
        expenditure: Math.round(totalExpenditure),
        deficit: Math.round(deficit),
        debt: Math.round(debt)
    };
}

// Calculate population metrics based on policies
function calculatePopulationMetrics(state) {
    const policies = state.policies;
    const population = state.population;
    const budget = calculateBudget(state);
    
    // Calculate happiness
    let happiness = population.happiness;
    happiness += (policies.welfareSpending - 50) * 0.2;
    happiness += (policies.healthcareSpending - 50) * 0.1;
    happiness -= (policies.incomeTax - 25) * 0.3;
    happiness -= Math.abs(budget.deficit) / 1000; // Deficit impact
    happiness = Math.max(0, Math.min(100, happiness));
    
    // Calculate health
    let health = population.health;
    health += (policies.healthcareSpending - 50) * 0.3;
    health += (policies.greenEnergy - 50) * 0.1;
    health -= Math.abs(state.economy.inflation - 2) * 2; // Inflation impact
    health = Math.max(0, Math.min(100, health));
    
    // Calculate education
    let education = population.education;
    education += (policies.educationSpending - 50) * 0.4;
    education += (policies.digitalInfrastructure - 50) * 0.2;
    education = Math.max(0, Math.min(100, education));
    
    // Calculate safety
    let safety = population.safety;
    safety += (policies.policeSpending - 50) * 0.3;
    safety += (policies.justiceSpending - 50) * 0.2;
    safety -= (state.economy.unemployment - 5) * 1.5; // Unemployment impact
    safety = Math.max(0, Math.min(100, safety));
    
    return {
        happiness: Math.round(happiness),
        health: Math.round(health),
        education: Math.round(education),
        safety: Math.round(safety)
    };
}

// Calculate economic indicators
function calculateEconomicIndicators(state) {
    const policies = state.policies;
    const economy = state.economy;
    const budget = calculateBudget(state); // Add this line
    
    // Calculate GDP growth
    let gdpGrowth = economy.gdpGrowth;
    gdpGrowth -= (policies.incomeTax - 25) * 0.002; // Reduced penalty
    gdpGrowth -= (policies.corporateTax - 21) * 0.001; // Reduced penalty
    gdpGrowth += (policies.transportSpending - 50) * 0.0005; // Reduced bonus
    gdpGrowth += (policies.digitalInfrastructure - 50) * 0.0003; // Reduced bonus
    gdpGrowth -= (policies.carbonTax - 20) * 0.0005; // Reduced penalty
    
    // Calculate unemployment
    let unemployment = economy.unemployment;
    unemployment += (policies.incomeTax - 25) * 0.05;
    unemployment -= (policies.transportSpending - 50) * 0.02;
    unemployment += (gdpGrowth - 0.02) * 2; // Growth impact
    
    // Calculate inflation
    let inflation = economy.inflation;
    inflation += (budget.deficit / economy.gdp) * 10; // Deficit impact
    inflation += (policies.carbonTax - 20) * 0.02;
    
    return {
        gdpGrowth: Math.max(-0.1, Math.min(0.1, gdpGrowth)),
        unemployment: Math.max(0, Math.min(25, unemployment)),
        inflation: Math.max(0, Math.min(10, inflation))
    };
}

// Calculate political metrics
function calculatePoliticalMetrics(state) {
    const population = calculatePopulationMetrics(state);
    const economy = calculateEconomicIndicators(state);
    
    // Calculate approval
    let approval = state.politics.approval;
    approval += (population.happiness - 65) * 0.3;
    approval -= (economy.unemployment - 6.8) * 2;
    approval -= Math.abs(economy.inflation - 2) * 3;
    approval -= Math.abs(state.budget.deficit) / 2000;
    approval = Math.max(0, Math.min(100, approval));
    
    // Calculate stability
    let stability = state.politics.stability;
    stability += (population.safety - 78) * 0.2;
    stability += (population.health - 72) * 0.1;
    stability -= Math.abs(economy.unemployment - 6.8) * 1.5;
    stability = Math.max(0, Math.min(100, stability));
    
    return {
        approval: Math.round(approval),
        stability: Math.round(stability)
    };
}
