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
        vatInflationMultiplier: 0.35 // VAT changes feed into prices
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
        carbonTaxInflationMultiplier: 0.25 // Carbon tax can raise near-term prices
    },

    // Housing policy multipliers
    housing: {
        maisHabitacaoGrowthMultiplier: 0.25, // Housing supply supports growth
        goldenVisaGrowthMultiplier: 0.2, // Foreign capital supports growth
        goldenVisaHappinessMultiplier: -0.3, // Can worsen affordability pressure
        alTaxesHappinessMultiplier: 0.22, // Helps residents through rental regulation
        rentControlHappinessMultiplier: 0.28 // Improves affordability
    },

    // Labor policy multipliers
    labor: {
        minimumWageHappinessMultiplier: 0.35, // Improves purchasing power
        minimumWageUnemploymentMultiplier: 0.2, // Can increase labor costs
        fourDayWeekHappinessMultiplier: 0.3, // Work-life balance gain
        fourDayWeekUnemploymentMultiplier: -0.12, // Work sharing can lower unemployment
        youthJobsUnemploymentMultiplier: -0.5 // Youth jobs reduce unemployment
    },

    // Tax-policy multipliers
    taxPolicy: {
        irsBracketsDebtMultiplier: -0.35, // More progressive bands can improve fiscal balance
        nhrRegimeGrowthMultiplier: 0.22, // Attracts talent/capital
        nhrRegimeDebtMultiplier: 0.18, // Tax expenditure cost
        wealthTaxDebtMultiplier: -0.3, // Raises revenue
        wealthTaxGrowthMultiplier: -0.16 // Small drag on investment
    }
};

// Relationship metadata used by the D3 force graph.
// We derive weights from the multiplier table so simulation math remains the source of truth.
const relationshipRuleBlueprints = [
    { source: 'incomeTax', target: 'gdp', channel: 'economy', driver: 'incomeTaxMultiplier' },
    { source: 'corporateTax', target: 'gdp', channel: 'economy', driver: 'corporateTaxMultiplier' },
    { source: 'vat', target: 'inflation', channel: 'economy', driver: 'vatInflationMultiplier' },
    { source: 'unemployment', target: 'happiness', channel: 'economy', driver: 'unemploymentMultiplier' },
    { source: 'inflation', target: 'happiness', channel: 'economy', driver: 'inflationMultiplier' },
    { source: 'healthcareSpending', target: 'health', channel: 'social', driver: 'healthcareMultiplier' },
    { source: 'educationSpending', target: 'education', channel: 'social', driver: 'educationMultiplier' },
    { source: 'welfareSpending', target: 'happiness', channel: 'social', driver: 'welfareMultiplier' },
    { source: 'transportSpending', target: 'gdp', channel: 'infrastructure', driver: 'transportMultiplier' },
    { source: 'digitalInfrastructure', target: 'gdp', channel: 'infrastructure', driver: 'digitalMultiplier' },
    { source: 'policeSpending', target: 'safety', channel: 'lawOrder', driver: 'policeMultiplier' },
    { source: 'justiceSpending', target: 'safety', channel: 'lawOrder', driver: 'justiceMultiplier' },
    { source: 'greenEnergy', target: 'health', channel: 'environment', driver: 'greenEnergyMultiplier' },
    { source: 'carbonTax', target: 'gdp', channel: 'environment', driver: 'carbonTaxMultiplier' },
    { source: 'carbonTax', target: 'inflation', channel: 'environment', driver: 'carbonTaxInflationMultiplier' },

    { source: 'housingPolicy.maisHabitacao', target: 'gdp', channel: 'housing', driver: 'maisHabitacaoGrowthMultiplier' },
    { source: 'housingPolicy.goldenVisa', target: 'gdp', channel: 'housing', driver: 'goldenVisaGrowthMultiplier' },
    { source: 'housingPolicy.goldenVisa', target: 'happiness', channel: 'housing', driver: 'goldenVisaHappinessMultiplier' },
    { source: 'housingPolicy.alTaxes', target: 'happiness', channel: 'housing', driver: 'alTaxesHappinessMultiplier' },
    { source: 'housingPolicy.rentControl', target: 'happiness', channel: 'housing', driver: 'rentControlHappinessMultiplier' },

    { source: 'laborPolicy.minimumWage', target: 'happiness', channel: 'labor', driver: 'minimumWageHappinessMultiplier' },
    { source: 'laborPolicy.minimumWage', target: 'unemployment', channel: 'labor', driver: 'minimumWageUnemploymentMultiplier' },
    { source: 'laborPolicy.fourDayWeek', target: 'happiness', channel: 'labor', driver: 'fourDayWeekHappinessMultiplier' },
    { source: 'laborPolicy.fourDayWeek', target: 'unemployment', channel: 'labor', driver: 'fourDayWeekUnemploymentMultiplier' },
    { source: 'laborPolicy.youthJobs', target: 'unemployment', channel: 'labor', driver: 'youthJobsUnemploymentMultiplier' },

    { source: 'taxPolicy.irsBrackets', target: 'debt', channel: 'taxPolicy', driver: 'irsBracketsDebtMultiplier' },
    { source: 'taxPolicy.nhrRegime', target: 'gdp', channel: 'taxPolicy', driver: 'nhrRegimeGrowthMultiplier' },
    { source: 'taxPolicy.nhrRegime', target: 'debt', channel: 'taxPolicy', driver: 'nhrRegimeDebtMultiplier' },
    { source: 'taxPolicy.wealthTax', target: 'debt', channel: 'taxPolicy', driver: 'wealthTaxDebtMultiplier' },
    { source: 'taxPolicy.wealthTax', target: 'gdp', channel: 'taxPolicy', driver: 'wealthTaxGrowthMultiplier' }
];

function getMultiplierByDriver(driver) {
    for (const category of Object.keys(multipliers)) {
        if (Object.prototype.hasOwnProperty.call(multipliers[category], driver)) {
            return multipliers[category][driver];
        }
    }
    return 0;
}

function buildRelationshipRules() {
    return relationshipRuleBlueprints
    .filter((rule) => rule && rule.source && rule.target && rule.source !== rule.target)
    .map((rule) => ({
        source: rule.source,
        target: rule.target,
        channel: rule.channel,
        driver: rule.driver,
        weight: getMultiplierByDriver(rule.driver),
        direct: true
    }));
}

const relationshipRules = buildRelationshipRules();

function getRelationshipRules() {
    return relationshipRules.map((rule) => ({ ...rule }));
}

function getGraphLinksFromRules() {
    return getRelationshipRules()
    .filter((rule) => rule.direct)
    .map((rule) => ({
        source: rule.source,
        target: rule.target,
        weight: rule.weight,
        channel: rule.channel,
        driver: rule.driver,
        direct: rule.direct,
        polarity: rule.weight >= 0 ? 'positive' : 'negative',
        magnitude: Math.abs(rule.weight)
    }));
}

const dynamicStrengthConfig = {
    incomeTax: { baseline: 23, scale: 30, mode: 'up' },
    corporateTax: { baseline: 19, scale: 28, mode: 'up' },
    vat: { baseline: 23, scale: 30, mode: 'up' },
    healthcareSpending: { baseline: 55, scale: 35 },
    educationSpending: { baseline: 50, scale: 35 },
    welfareSpending: { baseline: 48, scale: 35 },
    transportSpending: { baseline: 42, scale: 35 },
    digitalInfrastructure: { baseline: 52, scale: 35 },
    policeSpending: { baseline: 63, scale: 35 },
    justiceSpending: { baseline: 51, scale: 35 },
    greenEnergy: { baseline: 38, scale: 35 },
    carbonTax: { baseline: 18, scale: 30, mode: 'up' },
    'housingPolicy.maisHabitacao': { baseline: 35, scale: 30 },
    'housingPolicy.goldenVisa': { baseline: 25, scale: 30 },
    'housingPolicy.alTaxes': { baseline: 40, scale: 30 },
    'housingPolicy.rentControl': { baseline: 30, scale: 30 },
    'laborPolicy.minimumWage': { baseline: 45, scale: 30 },
    'laborPolicy.fourDayWeek': { baseline: 20, scale: 28 },
    'laborPolicy.youthJobs': { baseline: 38, scale: 30 },
    'taxPolicy.irsBrackets': { baseline: 35, scale: 30, mode: 'up' },
    'taxPolicy.nhrRegime': { baseline: 40, scale: 30, mode: 'both' },
    'taxPolicy.wealthTax': { baseline: 25, scale: 30, mode: 'up' },
    unemployment: { baseline: 6.5, scale: 4 },
    inflation: { baseline: 2.3, scale: 2.5 }
};

function getStateValueByNodeId(state, nodeId) {
    if (!state || !nodeId) return null;

    if (nodeId.includes('.')) {
        const parts = nodeId.split('.');
        let current = state.policies;
        for (const part of parts) {
            if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, part)) {
                current = null;
                break;
            }
            current = current[part];
        }
        return typeof current === 'number' ? current : null;
    }

    if (state.policies && typeof state.policies[nodeId] === 'number') {
        return state.policies[nodeId];
    }

    const outcomeResolvers = {
        gdp: () => state.economy?.gdp,
        health: () => state.population?.health,
        happiness: () => state.population?.happiness,
        debt: () => state.economy?.debt,
        education: () => state.population?.education,
        safety: () => state.population?.safety,
        unemployment: () => state.economy?.unemployment,
        inflation: () => state.economy?.inflation
    };

    const resolver = outcomeResolvers[nodeId];
    const value = resolver ? resolver() : null;
    return typeof value === 'number' ? value : null;
}

function getCurrentGraphLinks(state) {
    return getGraphLinksFromRules().map((link) => {
        const config = dynamicStrengthConfig[link.source];
        if (!config) return { ...link };

        const currentValue = getStateValueByNodeId(state, link.source);
        if (currentValue === null || currentValue === undefined) return { ...link };

        const normalizedDelta = (currentValue - config.baseline) / Math.max(1, config.scale);
        let strengthMultiplier = 1;

        if (config.mode === 'up') {
            strengthMultiplier = normalizedDelta >= 0
                ? 1 + normalizedDelta
                : 1 + (normalizedDelta * 0.8);
        } else if (config.mode === 'down') {
            strengthMultiplier = normalizedDelta <= 0
                ? 1 + Math.abs(normalizedDelta)
                : 1 - (normalizedDelta * 0.8);
        } else {
            strengthMultiplier = 1 + Math.abs(normalizedDelta);
        }

        strengthMultiplier = Math.max(0.2, Math.min(4.5, strengthMultiplier));
        const dynamicWeight = link.weight * strengthMultiplier;

        return {
            ...link,
            weight: dynamicWeight,
            magnitude: Math.abs(dynamicWeight)
        };
    });
}

// Calculate budget based on policies
function calculateBudget(state) {
    const policies = state.policies;
    const economy = state.economy;
    const housing = policies.housingPolicy || {};
    const labor = policies.laborPolicy || {};
    const taxPolicy = policies.taxPolicy || {};

    const incomeTaxEffective = policies.incomeTax + ((taxPolicy.irsBrackets || 35) - 35) * 0.15 - ((taxPolicy.nhrRegime || 40) - 40) * 0.1;
    const corporateTaxEffective = policies.corporateTax + ((taxPolicy.wealthTax || 25) - 25) * 0.03;
    const vatEffective = policies.vat + ((housing.alTaxes || 40) - 40) * 0.02;
    
    // Calculate income
    const incomeTaxRevenue = economy.gdp * (Math.max(0, incomeTaxEffective) / 100) * 0.15;
    const corporateTaxRevenue = economy.gdp * (Math.max(0, corporateTaxEffective) / 100) * 0.08;
    const vatRevenue = economy.gdp * (Math.max(0, vatEffective) / 100) * 0.12;
    const wealthTaxRevenue = economy.gdp * ((taxPolicy.wealthTax || 25) / 100) * 0.015;
    const alTaxRevenue = economy.gdp * ((housing.alTaxes || 40) / 100) * 0.01;
    const goldenVisaRevenue = economy.gdp * ((housing.goldenVisa || 25) / 100) * 0.006;
    const totalIncome = incomeTaxRevenue + corporateTaxRevenue + vatRevenue + wealthTaxRevenue + alTaxRevenue + goldenVisaRevenue;
    
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
    const housingProgramCost = baseExpenditure * ((housing.maisHabitacao || 35) / 100) * 0.07;
    const rentControlCost = baseExpenditure * ((housing.rentControl || 30) / 100) * 0.03;
    const youthJobsCost = baseExpenditure * ((labor.youthJobs || 38) / 100) * 0.04;
    const minimumWageSupportCost = baseExpenditure * ((labor.minimumWage || 45) / 100) * 0.03;
    const fourDayTransitionCost = baseExpenditure * ((labor.fourDayWeek || 20) / 100) * 0.02;
    
    const totalExpenditure = healthcareCost + educationCost + welfareCost + 
                            transportCost + policeCost + justiceCost + 
                            digitalCost + greenCost + housingProgramCost +
                            rentControlCost + youthJobsCost + minimumWageSupportCost +
                            fourDayTransitionCost;
    
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
    const events = state.currentEvents;
    const housing = policies.housingPolicy || {};
    const labor = policies.laborPolicy || {};
    const taxPolicy = policies.taxPolicy || {};
    
    // Calculate happiness
    let happiness = population.happiness;
    happiness += (policies.welfareSpending - 50) * 0.2;
    happiness += (policies.healthcareSpending - 50) * 0.1;
    happiness -= (policies.incomeTax - 25) * 0.3;
    happiness += ((labor.minimumWage || 45) - 45) * 0.15;
    happiness += ((labor.fourDayWeek || 20) - 20) * 0.12;
    happiness += ((housing.rentControl || 30) - 30) * 0.12;
    happiness += ((housing.alTaxes || 40) - 40) * 0.06;
    happiness -= ((housing.goldenVisa || 25) - 25) * 0.08;
    happiness += ((taxPolicy.irsBrackets || 35) - 35) * 0.05;
    happiness -= ((taxPolicy.nhrRegime || 40) - 40) * 0.04;
    happiness -= Math.abs(budget.deficit) / 1000; // Deficit impact
    
    // Housing crisis impact on happiness
    happiness -= events.housingCrisis.rentPrices * 15; // High rent reduces happiness
    happiness -= events.housingCrisis.youthIndependence * 10; // Low youth independence
    happiness += (housing.rentControl || 30) * 0.1; // Rent control helps
    
    happiness = Math.max(0, Math.min(100, happiness));
    
    // Calculate health
    let health = population.health;
    health += (policies.healthcareSpending - 50) * 0.3;
    health += (policies.greenEnergy - 50) * 0.1;
    health += ((labor.fourDayWeek || 20) - 20) * 0.05; // Work-life balance effect
    health -= Math.abs(state.economy.inflation - 2) * 2; // Inflation impact
    
    // SNS strain impact
    health -= events.snsStrain.waitTimes * 20; // Long wait times hurt health
    health -= events.snsStrain.doctorStrikes * 15; // Strikes reduce access
    health += (policies.healthcareSpending - 55) * 0.4; // Extra spending helps SNS
    
    health = Math.max(0, Math.min(100, health));
    
    // Calculate education
    let education = population.education;
    education += (policies.educationSpending - 50) * 0.4;
    education += (policies.digitalInfrastructure - 50) * 0.2;
    education += ((labor.youthJobs || 38) - 38) * 0.08;
    
    // Education strike impact
    education -= events.educationStrikes.teacherStrikes * 25; // Major impact from strikes
    education -= events.educationStrikes.qualityImpact * 15; // Quality degradation
    education += (policies.educationSpending - 50) * 0.5; // Extra funding helps
    
    education = Math.max(0, Math.min(100, education));
    
    // Calculate safety
    let safety = population.safety;
    safety += (policies.policeSpending - 50) * 0.3;
    safety += (policies.justiceSpending - 50) * 0.2;
    safety += ((taxPolicy.wealthTax || 25) - 25) * 0.05; // Lower inequality pressure
    safety -= (state.economy.unemployment - 5) * 1.5; // Unemployment impact
    
    safety = Math.max(0, Math.min(100, safety));
    
    // Calculate Portugal-specific metrics
    let youthIndependence = population.youthIndependence;
    youthIndependence -= events.housingCrisis.rentPrices * 30; // High rent prevents independence
    youthIndependence += (housing.maisHabitacao || 35) * 0.3; // Housing programs help
    youthIndependence += (labor.youthJobs || 38) * 0.2; // Youth jobs help
    youthIndependence += (labor.minimumWage || 45) * 0.1; // Affordability through wages
    youthIndependence = Math.max(0, Math.min(100, youthIndependence));
    
    let rentBurden = population.rentBurden;
    rentBurden += events.housingCrisis.rentPrices * 25; // High rent increases burden
    rentBurden += (housing.goldenVisa || 25) * 0.2; // Visa demand can push rents up
    rentBurden -= (housing.rentControl || 30) * 0.4; // Rent control reduces burden
    rentBurden -= (housing.alTaxes || 40) * 0.2; // AL taxes help
    rentBurden -= (housing.maisHabitacao || 35) * 0.25; // More supply lowers burden
    rentBurden = Math.max(0, Math.min(100, rentBurden));
    
    return {
        happiness: Math.round(happiness),
        health: Math.round(health),
        education: Math.round(education),
        safety: Math.round(safety),
        youthIndependence: Math.round(youthIndependence),
        rentBurden: Math.round(rentBurden)
    };
}

// Calculate economic indicators
function calculateEconomicIndicators(state) {
    const policies = state.policies;
    const economy = state.economy;
    const budget = calculateBudget(state);
    const housing = policies.housingPolicy || {};
    const labor = policies.laborPolicy || {};
    const taxPolicy = policies.taxPolicy || {};
    
    // Calculate GDP growth
    let gdpGrowth = economy.gdpGrowth;
    gdpGrowth -= (policies.incomeTax - 25) * 0.0018;
    gdpGrowth -= (policies.corporateTax - 21) * 0.0012;
    gdpGrowth -= (policies.vat - 23) * 0.0007;
    gdpGrowth += (policies.transportSpending - 50) * 0.0006;
    gdpGrowth += (policies.digitalInfrastructure - 50) * 0.0005;
    gdpGrowth += (policies.greenEnergy - 38) * 0.00025;
    gdpGrowth -= (policies.carbonTax - 20) * 0.00045;
    gdpGrowth += ((housing.maisHabitacao || 35) - 35) * 0.00035;
    gdpGrowth += ((housing.goldenVisa || 25) - 25) * 0.00025;
    gdpGrowth -= ((housing.alTaxes || 40) - 40) * 0.0002;
    gdpGrowth -= ((taxPolicy.irsBrackets || 35) - 35) * 0.0004;
    gdpGrowth += ((taxPolicy.nhrRegime || 40) - 40) * 0.0005;
    gdpGrowth -= ((taxPolicy.wealthTax || 25) - 25) * 0.0003;
    gdpGrowth += ((labor.youthJobs || 38) - 38) * 0.0002;
    gdpGrowth += (50 - Math.abs((labor.fourDayWeek || 20) - 35)) * 0.00008;
    
    // Calculate unemployment
    let unemployment = economy.unemployment;
    unemployment += (policies.incomeTax - 25) * 0.04;
    unemployment += (policies.corporateTax - 21) * 0.05;
    unemployment += ((labor.minimumWage || 45) - 45) * 0.03;
    unemployment -= ((labor.youthJobs || 38) - 38) * 0.06;
    unemployment -= ((labor.fourDayWeek || 20) - 20) * 0.015;
    unemployment -= (policies.transportSpending - 50) * 0.02;
    unemployment -= (policies.digitalInfrastructure - 50) * 0.015;
    unemployment -= (gdpGrowth - 0.02) * 2.4; // Growth impact
    
    // Calculate inflation
    let inflation = economy.inflation;
    inflation += (budget.deficit / economy.gdp) * 10;
    inflation += (policies.vat - 23) * 0.045;
    inflation += (policies.carbonTax - 20) * 0.022;
    inflation += ((labor.minimumWage || 45) - 45) * 0.02;
    inflation += ((housing.goldenVisa || 25) - 25) * 0.018;
    inflation -= (policies.greenEnergy - 38) * 0.01;
    inflation -= ((housing.maisHabitacao || 35) - 35) * 0.015;
    inflation -= ((housing.rentControl || 30) - 30) * 0.012;
    
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
    const policies = state.policies;
    const taxPolicy = policies.taxPolicy || {};
    
    // Calculate approval
    let approval = state.politics.approval;
    approval += (population.happiness - 65) * 0.3;
    approval += (population.youthIndependence - 40) * 0.1;
    approval -= (population.rentBurden - 45) * 0.12;
    approval -= (economy.unemployment - 6.8) * 2;
    approval -= Math.abs(economy.inflation - 2) * 3;
    approval -= Math.abs(state.budget.deficit) / 2000;
    approval += ((taxPolicy.wealthTax || 25) - 25) * 0.05;
    approval = Math.max(0, Math.min(100, approval));
    
    // Calculate stability
    let stability = state.politics.stability;
    stability += (population.safety - 78) * 0.2;
    stability += (population.health - 72) * 0.1;
    stability += (population.education - 62) * 0.08;
    stability -= (population.rentBurden - 45) * 0.1;
    stability -= Math.abs(economy.unemployment - 6.8) * 1.5;
    stability = Math.max(0, Math.min(100, stability));
    
    return {
        approval: Math.round(approval),
        stability: Math.round(stability)
    };
}
