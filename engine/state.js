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
        debt_to_gdp: 98.9,
        tax_revenue: 35.2,
        renewable_energy_consumption: 34.8,
        foreign_direct_investment_net: 3.2,
        arable_land: 11.0,
        forest_area: 36.0,
        central_bank_policy_rate: 4.5,
        trade_union_density_rate: 15.3,
        average_annual_real_wages: 19000.0,
        youth_unemployment_rate: 21.2,
        air_pollution_pm25: 8.5,
        exports_goods_total_eur_m: 77340.133,
        imports_goods_total_eur_m: 105148.400,
        net_goods_trade_eur_m: -27808.267,
        exports_goods_hs01_eur_m: 163.854,
        exports_goods_hs02_eur_m: 61.365,
        exports_goods_hs03_eur_m: 329.095,
        exports_goods_hs04_eur_m: 388.554,
        exports_goods_hs05_eur_m: 73.540,
        exports_goods_hs06_eur_m: 135.282,
        exports_goods_hs07_eur_m: 372.987,
        exports_goods_hs08_eur_m: 388.339,
        exports_goods_hs09_eur_m: 110.906,
        exports_goods_hs10_eur_m: 163.772,
        exports_goods_hs11_eur_m: 93.522,
        exports_goods_hs12_eur_m: 279.148,
        exports_goods_hs13_eur_m: 98.370,
        exports_goods_hs14_eur_m: 1.435,
        exports_goods_hs15_eur_m: 1262.658,
        exports_goods_hs16_eur_m: 330.542,
        exports_goods_hs17_eur_m: 277.180,
        exports_goods_hs18_eur_m: 91.674,
        exports_goods_hs19_eur_m: 536.977,
        exports_goods_hs20_eur_m: 723.507,
        exports_goods_hs21_eur_m: 259.838,
        exports_goods_hs22_eur_m: 1258.622,
        exports_goods_hs23_eur_m: 275.338,
        exports_goods_hs24_eur_m: 641.032,
        exports_goods_hs25_eur_m: 501.939,
        exports_goods_hs26_eur_m: 300.985,
        exports_goods_hs27_eur_m: 5098.051,
        exports_goods_hs28_eur_m: 300.439,
        exports_goods_hs29_eur_m: 1088.426,
        exports_goods_hs30_eur_m: 2658.167,
        exports_goods_hs31_eur_m: 191.146,
        exports_goods_hs32_eur_m: 184.334,
        exports_goods_hs33_eur_m: 383.570,
        exports_goods_hs34_eur_m: 214.157,
        exports_goods_hs35_eur_m: 72.979,
        exports_goods_hs36_eur_m: 22.821,
        exports_goods_hs37_eur_m: 16.983,
        exports_goods_hs38_eur_m: 1002.307,
        exports_goods_hs39_eur_m: 3617.442,
        exports_goods_hs40_eur_m: 1205.365,
        exports_goods_hs41_eur_m: 150.257,
        exports_goods_hs42_eur_m: 279.934,
        exports_goods_hs43_eur_m: 0.351,
        exports_goods_hs44_eur_m: 1241.165,
        exports_goods_hs45_eur_m: 1230.199,
        exports_goods_hs46_eur_m: 18.059,
        exports_goods_hs47_eur_m: 985.227,
        exports_goods_hs48_eur_m: 2272.763,
        exports_goods_hs49_eur_m: 140.557,
        exports_goods_hs50_eur_m: 0.281,
        exports_goods_hs51_eur_m: 52.292,
        exports_goods_hs52_eur_m: 456.894,
        exports_goods_hs53_eur_m: 43.355,
        exports_goods_hs54_eur_m: 180.591,
        exports_goods_hs55_eur_m: 216.773,
        exports_goods_hs56_eur_m: 344.335,
        exports_goods_hs57_eur_m: 125.969,
        exports_goods_hs58_eur_m: 64.484,
        exports_goods_hs59_eur_m: 169.827,
        exports_goods_hs60_eur_m: 385.023,
        exports_goods_hs61_eur_m: 2307.382,
        exports_goods_hs62_eur_m: 1068.450,
        exports_goods_hs63_eur_m: 966.581,
        exports_goods_hs64_eur_m: 1839.078,
        exports_goods_hs65_eur_m: 46.765,
        exports_goods_hs66_eur_m: 3.064,
        exports_goods_hs67_eur_m: 2.610,
        exports_goods_hs68_eur_m: 436.882,
        exports_goods_hs69_eur_m: 1002.206,
        exports_goods_hs70_eur_m: 1156.821,
        exports_goods_hs71_eur_m: 314.641,
        exports_goods_hs72_eur_m: 882.967,
        exports_goods_hs73_eur_m: 2423.038,
        exports_goods_hs74_eur_m: 586.676,
        exports_goods_hs75_eur_m: 3.923,
        exports_goods_hs76_eur_m: 1037.628,
        exports_goods_hs78_eur_m: 54.426,
        exports_goods_hs79_eur_m: 59.927,
        exports_goods_hs80_eur_m: 22.880,
        exports_goods_hs81_eur_m: 10.284,
        exports_goods_hs82_eur_m: 308.423,
        exports_goods_hs83_eur_m: 382.102,
        exports_goods_hs84_eur_m: 5305.964,
        exports_goods_hs85_eur_m: 6596.222,
        exports_goods_hs86_eur_m: 32.909,
        exports_goods_hs87_eur_m: 9778.309,
        exports_goods_hs88_eur_m: 640.989,
        exports_goods_hs89_eur_m: 195.680,
        exports_goods_hs90_eur_m: 907.085,
        exports_goods_hs91_eur_m: 46.116,
        exports_goods_hs92_eur_m: 3.821,
        exports_goods_hs93_eur_m: 80.362,
        exports_goods_hs94_eur_m: 2419.936,
        exports_goods_hs95_eur_m: 218.559,
        exports_goods_hs96_eur_m: 133.912,
        exports_goods_hs97_eur_m: 34.690,
        exports_goods_other_eur_m: 2493.841,
        imports_goods_hs01_eur_m: 561.634,
        imports_goods_hs02_eur_m: 1686.178,
        imports_goods_hs03_eur_m: 2133.858,
        imports_goods_hs04_eur_m: 864.350,
        imports_goods_hs05_eur_m: 69.214,
        imports_goods_hs06_eur_m: 167.332,
        imports_goods_hs07_eur_m: 777.093,
        imports_goods_hs08_eur_m: 799.898,
        imports_goods_hs09_eur_m: 269.503,
        imports_goods_hs10_eur_m: 1323.028,
        imports_goods_hs11_eur_m: 129.884,
        imports_goods_hs12_eur_m: 988.585,
        imports_goods_hs13_eur_m: 49.313,
        imports_goods_hs14_eur_m: 8.576,
        imports_goods_hs15_eur_m: 858.713,
        imports_goods_hs16_eur_m: 391.881,
        imports_goods_hs17_eur_m: 521.921,
        imports_goods_hs18_eur_m: 312.953,
        imports_goods_hs19_eur_m: 833.119,
        imports_goods_hs20_eur_m: 484.307,
        imports_goods_hs21_eur_m: 618.582,
        imports_goods_hs22_eur_m: 642.056,
        imports_goods_hs23_eur_m: 943.564,
        imports_goods_hs24_eur_m: 613.726,
        imports_goods_hs25_eur_m: 191.148,
        imports_goods_hs26_eur_m: 194.540,
        imports_goods_hs27_eur_m: 12291.943,
        imports_goods_hs28_eur_m: 675.868,
        imports_goods_hs29_eur_m: 2819.121,
        imports_goods_hs30_eur_m: 3512.104,
        imports_goods_hs31_eur_m: 416.209,
        imports_goods_hs32_eur_m: 549.666,
        imports_goods_hs33_eur_m: 895.990,
        imports_goods_hs34_eur_m: 510.902,
        imports_goods_hs35_eur_m: 280.830,
        imports_goods_hs36_eur_m: 19.673,
        imports_goods_hs37_eur_m: 48.832,
        imports_goods_hs38_eur_m: 1405.109,
        imports_goods_hs39_eur_m: 4707.665,
        imports_goods_hs40_eur_m: 1105.424,
        imports_goods_hs41_eur_m: 422.326,
        imports_goods_hs42_eur_m: 466.990,
        imports_goods_hs43_eur_m: 3.642,
        imports_goods_hs44_eur_m: 684.949,
        imports_goods_hs45_eur_m: 365.672,
        imports_goods_hs46_eur_m: 18.059,
        imports_goods_hs47_eur_m: 340.243,
        imports_goods_hs48_eur_m: 1797.306,
        imports_goods_hs49_eur_m: 223.659,
        imports_goods_hs50_eur_m: 5.318,
        imports_goods_hs51_eur_m: 45.416,
        imports_goods_hs52_eur_m: 876.009,
        imports_goods_hs53_eur_m: 37.537,
        imports_goods_hs54_eur_m: 418.641,
        imports_goods_hs55_eur_m: 307.897,
        imports_goods_hs56_eur_m: 218.524,
        imports_goods_hs57_eur_m: 102.941,
        imports_goods_hs58_eur_m: 124.232,
        imports_goods_hs59_eur_m: 221.469,
        imports_goods_hs60_eur_m: 426.190,
        imports_goods_hs61_eur_m: 2128.829,
        imports_goods_hs62_eur_m: 1778.944,
        imports_goods_hs63_eur_m: 608.304,
        imports_goods_hs64_eur_m: 1165.184,
        imports_goods_hs65_eur_m: 92.120,
        imports_goods_hs66_eur_m: 21.880,
        imports_goods_hs67_eur_m: 26.573,
        imports_goods_hs68_eur_m: 263.171,
        imports_goods_hs69_eur_m: 324.545,
        imports_goods_hs70_eur_m: 633.367,
        imports_goods_hs71_eur_m: 314.275,
        imports_goods_hs72_eur_m: 3496.972,
        imports_goods_hs73_eur_m: 1960.250,
        imports_goods_hs74_eur_m: 753.942,
        imports_goods_hs75_eur_m: 19.006,
        imports_goods_hs76_eur_m: 1392.687,
        imports_goods_hs78_eur_m: 60.462,
        imports_goods_hs79_eur_m: 110.595,
        imports_goods_hs80_eur_m: 9.198,
        imports_goods_hs81_eur_m: 46.762,
        imports_goods_hs82_eur_m: 297.080,
        imports_goods_hs83_eur_m: 431.182,
        imports_goods_hs84_eur_m: 8807.694,
        imports_goods_hs85_eur_m: 10267.504,
        imports_goods_hs86_eur_m: 224.097,
        imports_goods_hs87_eur_m: 12492.227,
        imports_goods_hs88_eur_m: 861.501,
        imports_goods_hs89_eur_m: 493.927,
        imports_goods_hs90_eur_m: 2199.727,
        imports_goods_hs91_eur_m: 139.424,
        imports_goods_hs92_eur_m: 25.424,
        imports_goods_hs93_eur_m: 52.192,
        imports_goods_hs94_eur_m: 1481.547,
        imports_goods_hs95_eur_m: 469.441,
        imports_goods_hs96_eur_m: 365.675,
        imports_goods_hs97_eur_m: 35.314,
        imports_goods_other_eur_m: -1483.934,
        net_services_trade_eur_m: 30978.268,

        // Aggregate-demand components (million EUR) for deterministic GDP identity.
        consumption: 170000,
        investment: 62000,
        netExports: 3170,
        government_demand: 46000,
        real_household_disposable_income: 62 // household disposable income capacity (0-100)
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
        total: 10639726, // 10.64 million (INE 2023 resident estimate, baseline Jan 2024)
        happiness: 58, // Lower due to economic pressures
        health: 65, // Strained by SNS issues
        education: 62, // Affected by teacher strikes
        safety: 78, // Still relatively good
        youthIndependence: 35, // Low due to housing crisis
        rentBurden: 45, // High rent burden on households

        // Calibration metrics (population/social)
        infant_mortality_rate: 2.5,
        life_expectancy_at_birth: 81.17,
        intentional_homicide_rate: 0.72,
        adult_literacy_rate: 96.1,
        total_fertility_rate: 1.44,
        poverty_headcount_ratio: 0.4,
        maternal_mortality_ratio: 8.0,
        population_density: 115.367,
        individuals_using_internet: 85.0,
        access_to_electricity: 100.0,
        mean_years_of_schooling: 9.6,
        urban_population: 67.0,
        median_age: 47.0,
        net_migration_rate: 14.7,
        suicide_mortality_rate: 9.0,
        physicians_per_1000_people: 5.5,
        mobile_cellular_subscriptions: 130.0,
        incarceration_rate: 120.0,
        road_traffic_mortality_rate: 5.5,
        home_ownership_rate: 70.0,
        tertiary_education_attainment: 35.0,
        adult_obesity_rate: 20.8,
        fixed_broadband_subscriptions: 42.0,

        // Deterministic population stock-flow detail (annualized baseline)
        fertility_to_birth_rate_factor: 5.625,
        crude_birth_rate_per_1000: 8.1,
        crude_death_rate_per_1000: 11.12,
        immigration_rate_per_1000: 17.8,
        emigration_rate_per_1000: 3.16,
        births_annual: 85699,
        deaths_annual: 118295,
        migration_in_annual: 189367,
        migration_out_annual: 33666,
        natural_change_annual: -32596,
        net_migration_annual: 155701,
        population_change_annual: 123105,
        land_area_km2: 92225,
        population_density_implied: 115.367,
        average_household_size: 2.49,
        households_total: 4149096,
        housing_stock_total: 5974697,
        vacant_dwellings: 1104398,
        secondary_dwellings: 723214,
        other_dwellings_residual: 4042,
        occupied_dwellings: 4143043,
        vacancy_rate_percent: 18.484,
        owner_occupied_share: 70.0,
        owner_occupied_dwellings: 2898950,
        rented_dwellings: 1244093,

        // Deterministic mortality tree
        stroke_mortality_rate_per_100k: 86.25,
        ischemic_heart_disease_mortality_rate_per_100k: 60.28,
        acute_myocardial_infarction_mortality_rate_per_100k: 34.44,
        respiratory_mortality_rate_per_100k: 123.22,
        lung_cancer_mortality_rate_per_100k: 42.2,
        colorectal_cancer_mortality_rate_per_100k: 34.2,
        covid_mortality_rate_per_100k: 23.83,
        other_mortality_rate_per_100k: 692.18,
        deaths_stroke_annual: 9177,
        deaths_ischemic_heart_disease_annual: 6414,
        deaths_acute_myocardial_infarction_annual: 3664,
        deaths_cardiovascular_annual: 19255,
        deaths_respiratory_annual: 13110,
        deaths_lung_cancer_annual: 4490,
        deaths_colorectal_cancer_annual: 3639,
        deaths_covid_annual: 2535,
        deaths_traffic_annual: 585,
        deaths_suicide_annual: 958,
        deaths_homicide_annual: 77,
        deaths_other_annual: 73646
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
        public_expenditure_on_health: 6.5, // % of GDP
        public_expenditure_on_education: 5.0, // % of GDP
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
        military_expenditure: 1.3, // % of GDP

        // Portugal-specific policies (new for Phase 7)
        housingPolicy: {
            maisHabitacao: 35, // "More Housing" program intensity
            goldenVisa: 25, // Golden visa restrictions
            alTaxes: 40, // Local accommodation taxes
            rentControl: 30 // Rent control measures
        },
        nominal_minimum_wage: 820, // Monthly legal minimum wage (EUR)
        laborPolicy: {
            fourDayWeek: 20, // 4-day workweek trials
            youthJobs: 38 // Youth employment programs
        },
        taxPolicy: {
            nhrRegime: 40, // Non-habitual resident regime
            wealthTax: 25 // Wealth tax considerations
        },

        // Additional tax and non-tax fiscal levers
        tsu_total_rate: 34.75, // Combined payroll social contribution rate (%)
        isp_fuel_tax: 50, // Fuel excise proxy (cents/liter)
        imi_average_rate: 0.35, // Municipal property tax average rate (%)
        imt_effective_rate: 5, // Property transfer tax effective rate (%)
        stamp_duty_index: 1, // Stamp duty multiplier index
        vehicle_tax_index: 1, // Vehicle tax multiplier index
        sin_tax_index: 1, // Excise tax multiplier index
        soe_dividend_rate: 50 // SOE profits transferred to budget (%)
    },

    // Tier 1 behavioral node base anchors (normalized 0..1).
    simulationConfig: {
        baseValues: {
            unemployment_rate: 0.26,
            inflation_consumer_prices: 0.23,
            happiness: 0.58,
            health: 0.65,
            education: 0.62,
            safety: 0.78,
            youthIndependence: 0.35,
            rentBurden: 0.45,
            consumption: 0.3889,
            investment: 0.42,
            netExports: 0.4083,
            real_household_disposable_income: 0.62
        }
    }
};

// Function to initialize the game state
function initializeGameState() {
    // Deep copy the initial state to avoid mutation
    window.gameState = JSON.parse(JSON.stringify(portugalState));
    seedNodeInitialValuesFromRegistry(window.gameState);
    if (typeof recomputeDerivedEconomyMetrics === 'function') {
        recomputeDerivedEconomyMetrics(window.gameState);
    }
    if (typeof recomputeDerivedPopulationMetrics === 'function') {
        recomputeDerivedPopulationMetrics(window.gameState, { applyStockUpdate: false });
    }
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

function getValueAtPath(source, path) {
    if (!source || !path) return undefined;
    const segments = String(path).split('.');
    let current = source;
    for (const segment of segments) {
        if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, segment)) {
            return undefined;
        }
        current = current[segment];
    }
    return current;
}

function setValueAtPath(source, path, value) {
    if (!source || !path) return false;
    const segments = String(path).split('.');
    let current = source;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, segment)) {
            return false;
        }
        current = current[segment];
    }
    const lastSegment = segments[segments.length - 1];
    if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, lastSegment)) {
        return false;
    }
    current[lastSegment] = value;
    return true;
}

function seedNodeInitialValuesFromRegistry(state) {
    if (!state) {
        throw new Error('Cannot seed node initial values: state is unavailable.');
    }
    if (typeof getNodeRegistryRows !== 'function') {
        throw new Error('Cannot seed node initial values: node registry API is unavailable.');
    }
    const rows = getNodeRegistryRows();
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Cannot seed node initial values: node registry is empty.');
    }

    rows.forEach((row) => {
        const nodeId = row?.nodeId;
        const storagePath = row?.storagePath;
        const initialValue = Number(row?.initialValue);
        if (!nodeId || !storagePath || !Number.isFinite(initialValue)) {
            throw new Error(`Invalid registry seed row for node "${nodeId || 'unknown'}".`);
        }
        const current = getValueAtPath(state, storagePath);
        if (typeof current !== 'number' || !Number.isFinite(current)) {
            throw new Error(`Cannot seed node "${nodeId}": storage_path "${storagePath}" is not numeric in base state.`);
        }
        const applied = setValueAtPath(state, storagePath, initialValue);
        if (!applied) {
            throw new Error(`Cannot seed node "${nodeId}": failed to apply initial value at "${storagePath}".`);
        }

        // Keep simulation anchors aligned with seeded registry values.
        if (row.simulationEnabled === true) {
            const hasRange = Number.isFinite(row.min) && Number.isFinite(row.max) && row.max > row.min;
            if (hasRange && state.simulationConfig && state.simulationConfig.baseValues) {
                const normalized = (initialValue - row.min) / (row.max - row.min);
                state.simulationConfig.baseValues[nodeId] = Math.max(0, Math.min(1, normalized));
            }
        }
    });
}

function getPolicyRegistryRow(policyName) {
    if (typeof getNodeRegistryRowById !== 'function') return null;
    const row = getNodeRegistryRowById(policyName);
    if (!row) return null;
    if (row.nodeType !== 'policy') return null;
    if (!row.mutableByPlayer) return null;
    return row;
}

// Function to update a specific policy value
function updatePolicyValue(policyName, value) {
    if (!window.gameState) return false;
    if (typeof getNodeRegistryRowById === 'function') {
        const row = getNodeRegistryRowById(policyName);
        if (!row) {
            console.error(`Policy update rejected: unknown node "${policyName}".`);
            return false;
        }
        if (row.nodeType !== 'policy' || !row.mutableByPlayer) {
            console.error(`Policy update rejected: "${policyName}" is not a mutable policy node.`);
            return false;
        }
    }
    const node = getPolicyRegistryRow(policyName);
    if (!node) return false;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return false;
    const min = Number.isFinite(node.min) ? node.min : 0;
    const max = Number.isFinite(node.max) ? node.max : 100;
    const clamped = Math.max(min, Math.min(max, numericValue));
    const updated = setValueAtPath(window.gameState, node.storagePath, clamped);
    if (updated) {
        console.log(`Policy ${policyName} updated to ${clamped}`);
        return true;
    }
    return false;
}

// Function to get a specific policy value
function getPolicyValue(policyName) {
    if (!window.gameState) return null;
    const node = getPolicyRegistryRow(policyName);
    if (!node) return null;
    const current = getValueAtPath(window.gameState, node.storagePath);
    return (typeof current === 'number' && Number.isFinite(current)) ? current : null;
}
