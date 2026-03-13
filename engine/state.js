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
        govt_revenue_total_eur_m: 100435.49,
        // 2023 Portuguese national tax list nodes (EU Taxation Trends source)
        tax_pt_d2_t_eur_m: 39135.14,
        tax_pt_d21_t_eur_m: 35332.45,
        tax_pt_d211_t_eur_m: 24086.25,
        tax_pt_d211_c01_eur_m: 24086.25,
        tax_pt_d212_t_eur_m: 1477.04,
        tax_pt_d2121_t_eur_m: 304.36,
        tax_pt_d2121_c01_eur_m: 304.36,
        tax_pt_d2122_t_eur_m: 1172.68,
        tax_pt_d2122c_t_eur_m: 1172.68,
        tax_pt_d2122c_c01_eur_m: 1065.88,
        tax_pt_d2122c_c02_eur_m: 0.7,
        tax_pt_d2122c_c03_eur_m: 73.36,
        tax_pt_d2122c_c04_eur_m: 11.17,
        tax_pt_d2122c_c06_eur_m: 21.58,
        tax_pt_d214_t_eur_m: 9769.17,
        tax_pt_d214a_t_eur_m: 4081.19,
        tax_pt_d214a_c01_eur_m: 586.49,
        tax_pt_d214a_c02_eur_m: 0.17,
        tax_pt_d214a_c03_eur_m: 105.82,
        tax_pt_d214a_c04_eur_m: 103.74,
        tax_pt_d214a_c05_eur_m: 0.56,
        tax_pt_d214a_c06_eur_m: 39.71,
        tax_pt_d214a_c07_eur_m: 2.24,
        tax_pt_d214a_c08_eur_m: 3239.15,
        tax_pt_d214a_c09_eur_m: 3.31,
        tax_pt_d214b_t_eur_m: 1888.43,
        tax_pt_d214b_c02_eur_m: 636.64,
        tax_pt_d214b_c03_eur_m: 502.71,
        tax_pt_d214b_c04_eur_m: 197.99,
        tax_pt_d214b_c05_eur_m: 18.3,
        tax_pt_d214b_c06_eur_m: 10.93,
        tax_pt_d214b_c07_eur_m: 2.93,
        tax_pt_d214b_c08_eur_m: 506.08,
        tax_pt_d214b_c10_eur_m: 12.85,
        tax_pt_d214c_t_eur_m: 1676.39,
        tax_pt_d214c_c01_eur_m: 1676.39,
        tax_pt_d214d_t_eur_m: 476.85,
        tax_pt_d214d_c01_eur_m: 476.85,
        tax_pt_d214f_t_eur_m: 387.78,
        tax_pt_d214f_c01_eur_m: 387.78,
        tax_pt_d214g_t_eur_m: 351.83,
        tax_pt_d214g_c01_eur_m: 205.97,
        tax_pt_d214g_c02_eur_m: 4.81,
        tax_pt_d214g_c03_eur_m: 28.85,
        tax_pt_d214g_c04_eur_m: 111.77,
        tax_pt_d214g_c05_eur_m: 0.43,
        tax_pt_d214h_t_eur_m: 133.87,
        tax_pt_d214h_c01_eur_m: 16.37,
        tax_pt_d214h_c02_eur_m: 95.9,
        tax_pt_d214h_c03_eur_m: 21.6,
        tax_pt_d214i_t_eur_m: 31.37,
        tax_pt_d214i_c02_eur_m: 31.37,
        tax_pt_d214j_t_eur_m: 687.2,
        tax_pt_d214j_c01_eur_m: 687.2,
        tax_pt_d214l_t_eur_m: 54.25,
        tax_pt_d214l_c02_eur_m: 10.8,
        tax_pt_d214l_c03_eur_m: 4.23,
        tax_pt_d214l_c04_eur_m: 0.49,
        tax_pt_d214l_c05_eur_m: 0,
        tax_pt_d214l_c08_eur_m: 38.72,
        tax_pt_d29_t_eur_m: 3802.68,
        tax_pt_d29a_t_eur_m: 1662.79,
        tax_pt_d29a_c01_eur_m: 1629.56,
        tax_pt_d29a_c02_eur_m: 5.72,
        tax_pt_d29a_c04_eur_m: 0.54,
        tax_pt_d29a_c05_eur_m: 15.83,
        tax_pt_d29a_c06_eur_m: 10.66,
        tax_pt_d29a_c07_eur_m: 0.48,
        tax_pt_d29b_t_eur_m: 670.05,
        tax_pt_d29b_c04_eur_m: 557.24,
        tax_pt_d29b_c05_eur_m: 0.08,
        tax_pt_d29b_c06_eur_m: 112.73,
        tax_pt_d29e_t_eur_m: 161.96,
        tax_pt_d29e_c01_eur_m: 0.62,
        tax_pt_d29e_c02_eur_m: 0.41,
        tax_pt_d29e_c03_eur_m: 1.1,
        tax_pt_d29e_c04_eur_m: 18.59,
        tax_pt_d29e_c05_eur_m: 73.96,
        tax_pt_d29e_c06_eur_m: 39.77,
        tax_pt_d29e_c07_eur_m: 2.53,
        tax_pt_d29e_c08_eur_m: 0.02,
        tax_pt_d29e_c09_eur_m: 0.19,
        tax_pt_d29e_c10_eur_m: 6.78,
        tax_pt_d29e_c11_eur_m: 9.69,
        tax_pt_d29e_c12_eur_m: 0.63,
        tax_pt_d29e_c13_eur_m: 7.66,
        tax_pt_d29f_t_eur_m: 680.32,
        tax_pt_d29f_c01_eur_m: 4.51,
        tax_pt_d29f_c02_eur_m: 2.6,
        tax_pt_d29f_c03_eur_m: 673.21,
        tax_pt_d29h_t_eur_m: 627.57,
        tax_pt_d29h_c01_eur_m: 4.54,
        tax_pt_d29h_c02_eur_m: 0.16,
        tax_pt_d29h_c03_eur_m: 9.38,
        tax_pt_d29h_c05_eur_m: 36.44,
        tax_pt_d29h_c06_eur_m: 13.13,
        tax_pt_d29h_c07_eur_m: 1.23,
        tax_pt_d29h_c08_eur_m: 6.24,
        tax_pt_d29h_c09_eur_m: 2.63,
        tax_pt_d29h_c10_eur_m: 68.47,
        tax_pt_d29h_c11_eur_m: 20.59,
        tax_pt_d29h_c12_eur_m: 1.64,
        tax_pt_d29h_c13_eur_m: 28.32,
        tax_pt_d29h_c15_eur_m: 4.85,
        tax_pt_d29h_c16_eur_m: 9.73,
        tax_pt_d29h_c17_eur_m: 2.67,
        tax_pt_d29h_c18_eur_m: 253.96,
        tax_pt_d29h_c19_eur_m: 161.16,
        tax_pt_d29h_c20_eur_m: 1.28,
        tax_pt_d29h_c21_eur_m: 0.18,
        tax_pt_d29h_c22_eur_m: 0.99,
        tax_pt_d5_t_eur_m: 28461.74,
        tax_pt_d51_t_eur_m: 27705.36,
        tax_pt_d51m_t_eur_m: 18502.48,
        tax_pt_d51a_t_eur_m: 18502.48,
        tax_pt_d51a_c01_eur_m: 18502.48,
        tax_pt_d51o_t_eur_m: 9202.88,
        tax_pt_d51b_t_eur_m: 9202.88,
        tax_pt_d51b_c01_eur_m: 8782.34,
        tax_pt_d51b_c02_eur_m: 420.55,
        tax_pt_d59_t_eur_m: 756.39,
        tax_pt_d59b_t_eur_m: 126.4,
        tax_pt_d59b_c01_eur_m: 70.36,
        tax_pt_d59b_c02_eur_m: 56.03,
        tax_pt_d59d_t_eur_m: 293.03,
        tax_pt_d59d_c01_eur_m: 6.15,
        tax_pt_d59d_c02_eur_m: 13.55,
        tax_pt_d59d_c04_eur_m: 273.32,
        tax_pt_d59d_c05_eur_m: 0.01,
        tax_pt_d59f_t_eur_m: 336.96,
        tax_pt_d59f_c01_eur_m: 191.22,
        tax_pt_d59f_c02_eur_m: 135.88,
        tax_pt_d59f_c03_eur_m: 0.2,
        tax_pt_d59f_c04_eur_m: 9.16,
        tax_pt_d59f_c05_eur_m: 0.51,
        tax_pt_d91_t_eur_m: 0.13,
        tax_pt_d91a_t_eur_m: 0.13,
        tax_pt_d91a_c01_eur_m: 0.13,
        tax_pt_d61_t_eur_m: 32838.48,
        tax_pt_d611_t_eur_m: 17184.4,
        tax_pt_d611c_t_eur_m: 17184.4,
        tax_pt_d6111_t_eur_m: 17184.4,
        tax_pt_d6111_c01_eur_m: 17184.4,
        tax_pt_d612_t_eur_m: 5092.55,
        tax_pt_d612_c01_eur_m: 5092.55,
        tax_pt_d6121_t_eur_m: 3676.59,
        tax_pt_d6121_c01_eur_m: 3676.59,
        tax_pt_d6122_t_eur_m: 1415.96,
        tax_pt_d6122_c01_eur_m: 1415.96,
        tax_pt_d613_t_eur_m: 10561.53,
        tax_pt_d613_c01_eur_m: 10561.53,
        tax_pt_d6131_t_eur_m: 9712.28,
        tax_pt_d6131_c01_eur_m: 9712.28,
        tax_pt_d6132_t_eur_m: 849.24,
        tax_pt_d6132_c01_eur_m: 849.24,
        tax_pt_d613c_t_eur_m: 10541.35,
        tax_pt_d613ce_t_eur_m: 9931.53,
        tax_pt_d613cs_t_eur_m: 609.82,
        tax_pt_d613v_t_eur_m: 20.18,
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
        exports_services_total_eur_m: 53407.000,
        imports_services_total_eur_m: 24064.000,
        exports_services_ebops_sa_eur_m: 497.000,
        exports_services_ebops_sb_eur_m: 883.000,
        exports_services_ebops_sc_eur_m: 10309.000,
        exports_services_ebops_sd_eur_m: 25470.000,
        exports_services_ebops_se_eur_m: 1272.000,
        exports_services_ebops_sf_eur_m: 199.000,
        exports_services_ebops_sg_eur_m: 614.000,
        exports_services_ebops_sh_eur_m: 175.000,
        exports_services_ebops_si_eur_m: 4599.000,
        exports_services_ebops_sj_eur_m: 8581.000,
        exports_services_ebops_sk_eur_m: 624.000,
        exports_services_ebops_sl_eur_m: 185.000,
        exports_services_ebops_sn_eur_m: 0.000,
        exports_services_other_eur_m: -1.000,
        imports_services_ebops_sa_eur_m: 42.000,
        imports_services_ebops_sb_eur_m: 593.000,
        imports_services_ebops_sc_eur_m: 5600.000,
        imports_services_ebops_sd_eur_m: 6382.000,
        imports_services_ebops_se_eur_m: 373.000,
        imports_services_ebops_sf_eur_m: 783.000,
        imports_services_ebops_sg_eur_m: 606.000,
        imports_services_ebops_sh_eur_m: 938.000,
        imports_services_ebops_si_eur_m: 1863.000,
        imports_services_ebops_sj_eur_m: 6195.000,
        imports_services_ebops_sk_eur_m: 618.000,
        imports_services_ebops_sl_eur_m: 71.000,
        imports_services_ebops_sn_eur_m: 0.000,
        imports_services_other_eur_m: 0.000,
        net_services_trade_eur_m: 29344.000,
        gdp_consumption_food_and_non_alcoholic_beverages_eur_m: 31374.084,
        gdp_consumption_food_and_non_CP011_food_eur_m: 29640.579,
        gdp_consumption_food_and_non_CP012_non_alcoholic_beverages_eur_m: 1733.505,
        gdp_consumption_alcoholic_beverages_tobacco_narcotics_eur_m: 5642.110,
        gdp_consumption_alcoholic_bev_CP021_alcoholic_beverages_eur_m: 2370.292,
        gdp_consumption_alcoholic_bev_CP022_tobacco_eur_m: 3239.525,
        gdp_consumption_alcoholic_bev_CP023_narcotics_eur_m: 32.293,
        gdp_consumption_clothing_and_footwear_eur_m: 9425.782,
        gdp_consumption_clothing_and__CP031_clothing_eur_m: 7485.492,
        gdp_consumption_clothing_and__CP032_footwear_eur_m: 1940.290,
        gdp_consumption_housing_water_electricity_gas_eur_m: 31345.176,
        gdp_consumption_housing_water_CP041_actual_rentals_for_housi_eur_m: 5048.971,
        gdp_consumption_housing_water_CP042_imputed_rentals_for_hous_eur_m: 16366.529,
        gdp_consumption_housing_water_CP043_maintenance_and_repair_o_eur_m: 875.023,
        gdp_consumption_housing_water_CP044_water_supply_and_miscell_eur_m: 3258.118,
        gdp_consumption_housing_water_CP045_electricity_gas_and_othe_eur_m: 5796.536,
        gdp_consumption_furnishings_household_equipment_eur_m: 9153.155,
        gdp_consumption_furnishings_h_CP051_furniture_and_furnishing_eur_m: 2401.761,
        gdp_consumption_furnishings_h_CP052_household_textiles_eur_m: 565.372,
        gdp_consumption_furnishings_h_CP053_household_appliances_eur_m: 1567.892,
        gdp_consumption_furnishings_h_CP054_glassware_tableware_and__eur_m: 570.688,
        gdp_consumption_furnishings_h_CP055_tools_and_equipment_for__eur_m: 624.598,
        gdp_consumption_furnishings_h_CP056_goods_and_services_for_r_eur_m: 3422.842,
        gdp_consumption_health_eur_m: 10206.523,
        gdp_consumption_health_CP061_medical_products_applian_eur_m: 3692.658,
        gdp_consumption_health_CP062_outpatient_services_eur_m: 5377.291,
        gdp_consumption_health_CP063_hospital_services_eur_m: 1136.574,
        gdp_consumption_transport_eur_m: 21897.592,
        gdp_consumption_transport_CP071_purchase_of_vehicles_eur_m: 8576.241,
        gdp_consumption_transport_CP072_operation_of_personal_tr_eur_m: 11417.810,
        gdp_consumption_transport_CP073_transport_services_eur_m: 1903.541,
        gdp_consumption_communication_eur_m: 4162.010,
        gdp_consumption_communication_CP081_postal_services_eur_m: 106.091,
        gdp_consumption_communication_CP082_telephone_and_telefax_eq_eur_m: 573.075,
        gdp_consumption_communication_CP083_telephone_and_telefax_se_eur_m: 3482.844,
        gdp_consumption_recreation_and_culture_eur_m: 9081.705,
        gdp_consumption_recreation_an_CP091_audio_visual_photographi_eur_m: 1820.730,
        gdp_consumption_recreation_an_CP092_other_major_durables_for_eur_m: 140.710,
        gdp_consumption_recreation_an_CP093_other_recreational_items_eur_m: 2476.502,
        gdp_consumption_recreation_an_CP094_recreational_and_cultura_eur_m: 3345.986,
        gdp_consumption_recreation_an_CP095_newspapers_books_and_sta_eur_m: 898.889,
        gdp_consumption_recreation_an_CP096_package_holidays_eur_m: 398.887,
        gdp_consumption_education_eur_m: 2709.594,
        gdp_consumption_education_CP101_pre_primary_and_primary__eur_m: 819.539,
        gdp_consumption_education_CP102_secondary_education_eur_m: 488.241,
        gdp_consumption_education_CP103_post_secondary_non_terti_eur_m: 40.854,
        gdp_consumption_education_CP104_tertiary_education_eur_m: 608.204,
        gdp_consumption_education_CP105_education_not_definable__eur_m: 752.756,
        gdp_consumption_restaurants_and_hotels_eur_m: 27263.700,
        gdp_consumption_restaurants_a_CP111_catering_services_eur_m: 22591.956,
        gdp_consumption_restaurants_a_CP112_accommodation_services_eur_m: 4671.745,
        gdp_consumption_miscellaneous_goods_and_services_eur_m: 18772.478,
        gdp_consumption_miscellaneous_CP121_personal_care_eur_m: 5594.120,
        gdp_consumption_miscellaneous_CP122_prostitution_eur_m: 815.269,
        gdp_consumption_miscellaneous_CP123_personal_effects_nec_eur_m: 1680.556,
        gdp_consumption_miscellaneous_CP124_social_protection_eur_m: 2661.939,
        gdp_consumption_miscellaneous_CP125_insurance_eur_m: 3428.274,
        gdp_consumption_miscellaneous_CP126_financial_services_nec_eur_m: 3208.665,
        gdp_consumption_miscellaneous_CP127_other_services_nec_eur_m: 1383.655,
        gdp_consumption_other_eur_m: -0.109,
        gdp_investment_gfcf_dwellings_eur_m: 11178.700,
        gdp_investment_gfcf_other_structures_eur_m: 18941.500,
        gdp_investment_gfcf_transport_equip_eur_m: 4202.200,
        gdp_investment_gfcf_ict_equip_eur_m: 2148.900,
        gdp_investment_gfcf_other_machinery_weapons_eur_m: 9573.200,
        gdp_investment_gfcf_cultivated_biological_eur_m: 464.200,
        gdp_investment_gfcf_ip_products_eur_m: 8875.600,
        gdp_investment_gfcf_other_eur_m: 0.000,
        gdp_gov_exp_general_public_services_eur_m: 15416.000,
        gdp_gov_exp_general_public_services_GF0101_executive_and_legislative_orga_eur_m: 7859.300,
        gdp_gov_exp_general_public_services_GF0102_foreign_economic_aid_eur_m: 3.100,
        gdp_gov_exp_general_public_services_GF0103_general_services_eur_m: 522.900,
        gdp_gov_exp_general_public_services_GF0104_basic_research_eur_m: 861.600,
        gdp_gov_exp_general_public_services_GF0105_randd_general_public_services_eur_m: 37.500,
        gdp_gov_exp_general_public_services_GF0106_general_public_services_nec_eur_m: 130.500,
        gdp_gov_exp_general_public_services_GF0107_public_debt_transactions_eur_m: 6001.100,
        gdp_gov_exp_general_public_services_GF0108_transfers_of_a_general_charact_eur_m: 0.000,
        gdp_gov_exp_general_public_services_other_eur_m: 0.000,
        gdp_gov_exp_defence_eur_m: 2065.000,
        gdp_gov_exp_defence_GF0201_military_defence_eur_m: 1833.300,
        gdp_gov_exp_defence_GF0202_civil_defence_eur_m: 0.000,
        gdp_gov_exp_defence_GF0203_foreign_military_aid_eur_m: 74.200,
        gdp_gov_exp_defence_GF0204_randd_defence_eur_m: 1.000,
        gdp_gov_exp_defence_GF0205_defence_nec_eur_m: 156.500,
        gdp_gov_exp_public_order_safety_eur_m: 4279.800,
        gdp_gov_exp_public_order_safety_GF0301_police_services_eur_m: 2790.200,
        gdp_gov_exp_public_order_safety_GF0302_fire_protection_services_eur_m: 345.500,
        gdp_gov_exp_public_order_safety_GF0303_law_courts_eur_m: 648.700,
        gdp_gov_exp_public_order_safety_GF0304_prisons_eur_m: 301.600,
        gdp_gov_exp_public_order_safety_GF0305_randd_public_order_and_safety_eur_m: 0.000,
        gdp_gov_exp_public_order_safety_GF0306_public_order_and_safety_nec_eur_m: 193.800,
        gdp_gov_exp_economic_affairs_eur_m: 11657.900,
        gdp_gov_exp_economic_affairs_GF0401_general_economic_commercial_and_eur_m: 893.900,
        gdp_gov_exp_economic_affairs_GF0402_agriculture_forestry_fishing_and_eur_m: 1413.500,
        gdp_gov_exp_economic_affairs_GF0403_fuel_and_energy_eur_m: 1613.900,
        gdp_gov_exp_economic_affairs_GF0404_mining_manufacturing_and_constru_eur_m: 420.200,
        gdp_gov_exp_economic_affairs_GF0405_transport_eur_m: 5399.700,
        gdp_gov_exp_economic_affairs_GF0406_communication_eur_m: 8.300,
        gdp_gov_exp_economic_affairs_GF0407_other_industries_eur_m: 821.200,
        gdp_gov_exp_economic_affairs_GF0408_randd_economic_affairs_eur_m: 871.100,
        gdp_gov_exp_economic_affairs_GF0409_economic_affairs_nec_eur_m: 216.100,
        gdp_gov_exp_environmental_protection_eur_m: 2021.000,
        gdp_gov_exp_environmental_protection_GF0501_waste_management_eur_m: 1205.800,
        gdp_gov_exp_environmental_protection_GF0502_waste_water_management_eur_m: 371.800,
        gdp_gov_exp_environmental_protection_GF0503_pollution_abatement_eur_m: 22.200,
        gdp_gov_exp_environmental_protection_GF0504_protection_of_biodiversity_and_eur_m: 247.100,
        gdp_gov_exp_environmental_protection_GF0505_randd_environmental_protection_eur_m: 43.400,
        gdp_gov_exp_environmental_protection_GF0506_environmental_protection_nec_eur_m: 130.700,
        gdp_gov_exp_housing_community_eur_m: 1436.800,
        gdp_gov_exp_housing_community_GF0601_housing_development_eur_m: 119.300,
        gdp_gov_exp_housing_community_GF0602_community_development_eur_m: 253.900,
        gdp_gov_exp_housing_community_GF0603_water_supply_eur_m: 643.000,
        gdp_gov_exp_housing_community_GF0604_street_lighting_eur_m: 216.500,
        gdp_gov_exp_housing_community_GF0605_randd_housing_and_community_ame_eur_m: 5.000,
        gdp_gov_exp_housing_community_GF0606_housing_and_community_amenitie_eur_m: 199.100,
        gdp_gov_exp_health_eur_m: 17993.000,
        gdp_gov_exp_health_GF0701_medical_products_appliances_an_eur_m: 1478.800,
        gdp_gov_exp_health_GF0702_outpatient_services_eur_m: 4667.000,
        gdp_gov_exp_health_GF0703_hospital_services_eur_m: 10472.500,
        gdp_gov_exp_health_GF0704_public_health_services_eur_m: 213.200,
        gdp_gov_exp_health_GF0705_randd_health_eur_m: 580.200,
        gdp_gov_exp_health_GF0706_health_nec_eur_m: 581.300,
        gdp_gov_exp_recreation_culture_eur_m: 2473.800,
        gdp_gov_exp_recreation_culture_GF0801_recreational_and_sporting_serv_eur_m: 649.300,
        gdp_gov_exp_recreation_culture_GF0802_cultural_services_eur_m: 1065.700,
        gdp_gov_exp_recreation_culture_GF0803_broadcasting_and_publishing_se_eur_m: 301.900,
        gdp_gov_exp_recreation_culture_GF0804_religious_and_other_community__eur_m: 10.000,
        gdp_gov_exp_recreation_culture_GF0805_randd_recreation_culture_and_r_eur_m: 14.600,
        gdp_gov_exp_recreation_culture_GF0806_recreation_culture_and_religio_eur_m: 432.400,
        gdp_gov_exp_recreation_culture_other_eur_m: -0.100,
        gdp_gov_exp_education_eur_m: 11635.300,
        gdp_gov_exp_education_GF0901_pre_primary_and_primary_educat_eur_m: 4402.800,
        gdp_gov_exp_education_GF0902_secondary_education_eur_m: 4369.500,
        gdp_gov_exp_education_GF0903_post_secondary_non_tertiary_ed_eur_m: 50.000,
        gdp_gov_exp_education_GF0904_tertiary_education_eur_m: 1741.400,
        gdp_gov_exp_education_GF0905_education_not_definable_by_lev_eur_m: 400.200,
        gdp_gov_exp_education_GF0906_subsidiary_services_to_educati_eur_m: 354.200,
        gdp_gov_exp_education_GF0907_randd_education_eur_m: 69.500,
        gdp_gov_exp_education_GF0908_education_nec_eur_m: 247.700,
        gdp_gov_exp_social_protection_eur_m: 44383.000,
        gdp_gov_exp_social_protection_GF1001_sickness_and_disability_eur_m: 3567.300,
        gdp_gov_exp_social_protection_GF1002_old_age_eur_m: 28484.700,
        gdp_gov_exp_social_protection_GF1003_survivors_eur_m: 4221.700,
        gdp_gov_exp_social_protection_GF1004_family_and_children_eur_m: 4691.700,
        gdp_gov_exp_social_protection_GF1005_unemployment_eur_m: 1416.500,
        gdp_gov_exp_social_protection_GF1006_housing_eur_m: 576.200,
        gdp_gov_exp_social_protection_GF1007_social_exclusion_nec_eur_m: 651.000,
        gdp_gov_exp_social_protection_GF1008_randd_social_protection_eur_m: 1.800,
        gdp_gov_exp_social_protection_GF1009_social_protection_nec_eur_m: 772.200,
        gdp_gov_exp_social_protection_other_eur_m: -0.100,
        gdp_gov_exp_other_eur_m: 13810.900,

        // Aggregate-demand components (million EUR) for deterministic GDP identity.
        consumption: 181033.700,
        investment: 55384.300,
        gdp_investment_gfcf_total_eur_m: 55384.300,
        public_investment_p51g_eur_m: 6952.500,
        private_investment_eur_m: 48431.800,
        netExports: 3170,
        gdp_gov_consumption_G_eur_m: 44853.100,
        household_transfer_income_d62_eur_m: 42218.300,
        household_consumption_from_transfers_eur_m: 27441.895,
        household_savings_from_transfers_eur_m: 14776.405,
        gdp_gov_exp_d4_interest_total_eur_m: 5526.800,
        government_expenditure: 113361.700,
        gdp_gov_exp_total_p3_eur_m: 44853.2,
        gdp_gov_exp_general_public_services_p3_eur_m: 5301.4,
        gdp_gov_exp_general_public_services_GF0101_executive_and_legislative_orga_p3_eur_m: 4176.5,
        gdp_gov_exp_general_public_services_GF0102_foreign_economic_aid_p3_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0103_general_services_p3_eur_m: 308.8,
        gdp_gov_exp_general_public_services_GF0104_basic_research_p3_eur_m: 228.1,
        gdp_gov_exp_general_public_services_GF0105_randd_general_public_services_p3_eur_m: 14,
        gdp_gov_exp_general_public_services_GF0106_general_public_services_nec_p3_eur_m: 99,
        gdp_gov_exp_general_public_services_GF0107_public_debt_transactions_p3_eur_m: 475,
        gdp_gov_exp_general_public_services_GF0108_transfers_of_a_general_charact_p3_eur_m: 0,
        gdp_gov_exp_defence_p3_eur_m: 1861.7,
        gdp_gov_exp_defence_GF0201_military_defence_p3_eur_m: 1671.7,
        gdp_gov_exp_defence_GF0202_civil_defence_p3_eur_m: 0,
        gdp_gov_exp_defence_GF0203_foreign_military_aid_p3_eur_m: 71.9,
        gdp_gov_exp_defence_GF0204_randd_defence_p3_eur_m: 13.9,
        gdp_gov_exp_defence_GF0205_defence_nec_p3_eur_m: 104.2,
        gdp_gov_exp_public_order_safety_p3_eur_m: 3376.7,
        gdp_gov_exp_public_order_safety_GF0301_police_services_p3_eur_m: 2235.5,
        gdp_gov_exp_public_order_safety_GF0302_fire_protection_services_p3_eur_m: 125.4,
        gdp_gov_exp_public_order_safety_GF0303_law_courts_p3_eur_m: 597,
        gdp_gov_exp_public_order_safety_GF0304_prisons_p3_eur_m: 320.8,
        gdp_gov_exp_public_order_safety_GF0305_randd_public_order_and_safety_p3_eur_m: 15.5,
        gdp_gov_exp_public_order_safety_GF0306_public_order_and_safety_nec_p3_eur_m: 82.5,
        gdp_gov_exp_economic_affairs_p3_eur_m: 4994.6,
        gdp_gov_exp_economic_affairs_GF0401_general_economic_commercial_an_p3_eur_m: 588,
        gdp_gov_exp_economic_affairs_GF0402_agriculture_forestry_fishing_a_p3_eur_m: 375,
        gdp_gov_exp_economic_affairs_GF0403_fuel_and_energy_p3_eur_m: 63.2,
        gdp_gov_exp_economic_affairs_GF0404_mining_manufacturing_and_const_p3_eur_m: 287.5,
        gdp_gov_exp_economic_affairs_GF0405_transport_p3_eur_m: 3126.9,
        gdp_gov_exp_economic_affairs_GF0406_communication_p3_eur_m: 56.2,
        gdp_gov_exp_economic_affairs_GF0407_other_industries_p3_eur_m: 315.6,
        gdp_gov_exp_economic_affairs_GF0408_randd_economic_affairs_p3_eur_m: 182.1,
        gdp_gov_exp_economic_affairs_GF0409_economic_affairs_nec_p3_eur_m: 0,
        gdp_gov_exp_economic_affairs_other_p3_eur_m: 0.1,
        gdp_gov_exp_environmental_protection_p3_eur_m: 508.6,
        gdp_gov_exp_environmental_protection_GF0501_waste_management_p3_eur_m: 139.7,
        gdp_gov_exp_environmental_protection_GF0502_waste_water_management_p3_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0503_pollution_abatement_p3_eur_m: 0.5,
        gdp_gov_exp_environmental_protection_GF0504_protection_of_biodiversity_and_p3_eur_m: 209.4,
        gdp_gov_exp_environmental_protection_GF0505_randd_environmental_protection_p3_eur_m: 75.6,
        gdp_gov_exp_environmental_protection_GF0506_environmental_protection_nec_p3_eur_m: 83.5,
        gdp_gov_exp_environmental_protection_other_p3_eur_m: -0.1,
        gdp_gov_exp_housing_community_p3_eur_m: 675.6,
        gdp_gov_exp_housing_community_GF0601_housing_development_p3_eur_m: 207.7,
        gdp_gov_exp_housing_community_GF0602_community_development_p3_eur_m: 301.9,
        gdp_gov_exp_housing_community_GF0603_water_supply_p3_eur_m: 1.8,
        gdp_gov_exp_housing_community_GF0604_street_lighting_p3_eur_m: 20.8,
        gdp_gov_exp_housing_community_GF0605_randd_housing_and_community_am_p3_eur_m: 4.2,
        gdp_gov_exp_housing_community_GF0606_housing_and_community_amenitie_p3_eur_m: 139.2,
        gdp_gov_exp_health_p3_eur_m: 15229.6,
        gdp_gov_exp_health_GF0701_medical_products_appliances_an_p3_eur_m: 1210.3,
        gdp_gov_exp_health_GF0702_outpatient_services_p3_eur_m: 3718,
        gdp_gov_exp_health_GF0703_hospital_services_p3_eur_m: 9583.4,
        gdp_gov_exp_health_GF0704_public_health_services_p3_eur_m: 150,
        gdp_gov_exp_health_GF0705_randd_health_p3_eur_m: 212.6,
        gdp_gov_exp_health_GF0706_health_nec_p3_eur_m: 355.3,
        gdp_gov_exp_recreation_culture_p3_eur_m: 1308,
        gdp_gov_exp_recreation_culture_GF0801_recreational_and_sporting_serv_p3_eur_m: 419.9,
        gdp_gov_exp_recreation_culture_GF0802_cultural_services_p3_eur_m: 472.2,
        gdp_gov_exp_recreation_culture_GF0803_broadcasting_and_publishing_se_p3_eur_m: 187.4,
        gdp_gov_exp_recreation_culture_GF0804_religious_and_other_community_p3_eur_m: 5.9,
        gdp_gov_exp_recreation_culture_GF0805_randd_recreation_culture_and_r_p3_eur_m: 80.9,
        gdp_gov_exp_recreation_culture_GF0806_recreation_culture_and_religio_p3_eur_m: 141.6,
        gdp_gov_exp_recreation_culture_other_p3_eur_m: 0.1,
        gdp_gov_exp_education_p3_eur_m: 10170.3,
        gdp_gov_exp_education_GF0901_pre_primary_and_primary_educat_p3_eur_m: 4428.4,
        gdp_gov_exp_education_GF0902_secondary_education_p3_eur_m: 4343.6,
        gdp_gov_exp_education_GF0903_post_secondary_non_tertiary_ed_p3_eur_m: 21,
        gdp_gov_exp_education_GF0904_tertiary_education_p3_eur_m: 863.2,
        gdp_gov_exp_education_GF0905_education_not_definable_by_lev_p3_eur_m: 90.6,
        gdp_gov_exp_education_GF0906_subsidiary_services_to_educati_p3_eur_m: 94.5,
        gdp_gov_exp_education_GF0907_randd_education_p3_eur_m: 21.9,
        gdp_gov_exp_education_GF0908_education_nec_p3_eur_m: 306.9,
        gdp_gov_exp_education_other_p3_eur_m: 0.2,
        gdp_gov_exp_social_protection_p3_eur_m: 1426.6,
        gdp_gov_exp_social_protection_GF1001_sickness_and_disability_p3_eur_m: 18.7,
        gdp_gov_exp_social_protection_GF1002_old_age_p3_eur_m: 84.6,
        gdp_gov_exp_social_protection_GF1003_survivors_p3_eur_m: 10.5,
        gdp_gov_exp_social_protection_GF1004_family_and_children_p3_eur_m: 623.8,
        gdp_gov_exp_social_protection_GF1005_unemployment_p3_eur_m: 31.8,
        gdp_gov_exp_social_protection_GF1006_housing_p3_eur_m: 34,
        gdp_gov_exp_social_protection_GF1007_social_exclusion_nec_p3_eur_m: 38.2,
        gdp_gov_exp_social_protection_GF1008_randd_social_protection_p3_eur_m: 0.9,
        gdp_gov_exp_social_protection_GF1009_social_protection_nec_p3_eur_m: 584.2,
        gdp_gov_exp_social_protection_other_p3_eur_m: -0.1,
        gdp_gov_exp_other_p3_eur_m: 0.1,
        gdp_gov_exp_total_p51g_eur_m: 6952.7,
        gdp_gov_exp_general_public_services_p51g_eur_m: 842.6,
        gdp_gov_exp_general_public_services_GF0101_executive_and_legislative_orga_p51g_eur_m: 409.9,
        gdp_gov_exp_general_public_services_GF0102_foreign_economic_aid_p51g_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0103_general_services_p51g_eur_m: 45.5,
        gdp_gov_exp_general_public_services_GF0104_basic_research_p51g_eur_m: 347,
        gdp_gov_exp_general_public_services_GF0105_randd_general_public_services_p51g_eur_m: 20.4,
        gdp_gov_exp_general_public_services_GF0106_general_public_services_nec_p51g_eur_m: 19.9,
        gdp_gov_exp_general_public_services_GF0107_public_debt_transactions_p51g_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0108_transfers_of_a_general_charact_p51g_eur_m: 0,
        gdp_gov_exp_general_public_services_other_p51g_eur_m: -0.1,
        gdp_gov_exp_defence_p51g_eur_m: 394.5,
        gdp_gov_exp_defence_GF0201_military_defence_p51g_eur_m: 374.9,
        gdp_gov_exp_defence_GF0202_civil_defence_p51g_eur_m: 0,
        gdp_gov_exp_defence_GF0203_foreign_military_aid_p51g_eur_m: 2.5,
        gdp_gov_exp_defence_GF0204_randd_defence_p51g_eur_m: 8.8,
        gdp_gov_exp_defence_GF0205_defence_nec_p51g_eur_m: 8.4,
        gdp_gov_exp_defence_other_p51g_eur_m: -0.1,
        gdp_gov_exp_public_order_safety_p51g_eur_m: 251.3,
        gdp_gov_exp_public_order_safety_GF0301_police_services_p51g_eur_m: 188.6,
        gdp_gov_exp_public_order_safety_GF0302_fire_protection_services_p51g_eur_m: 9.9,
        gdp_gov_exp_public_order_safety_GF0303_law_courts_p51g_eur_m: 4.2,
        gdp_gov_exp_public_order_safety_GF0304_prisons_p51g_eur_m: 4.3,
        gdp_gov_exp_public_order_safety_GF0305_randd_public_order_and_safety_p51g_eur_m: 1.5,
        gdp_gov_exp_public_order_safety_GF0306_public_order_and_safety_nec_p51g_eur_m: 42.7,
        gdp_gov_exp_public_order_safety_other_p51g_eur_m: 0.1,
        gdp_gov_exp_economic_affairs_p51g_eur_m: 2338.7,
        gdp_gov_exp_economic_affairs_GF0401_general_economic_commercial_an_p51g_eur_m: 14.4,
        gdp_gov_exp_economic_affairs_GF0402_agriculture_forestry_fishing_a_p51g_eur_m: 35.7,
        gdp_gov_exp_economic_affairs_GF0403_fuel_and_energy_p51g_eur_m: 9.5,
        gdp_gov_exp_economic_affairs_GF0404_mining_manufacturing_and_const_p51g_eur_m: 62.6,
        gdp_gov_exp_economic_affairs_GF0405_transport_p51g_eur_m: 1906.4,
        gdp_gov_exp_economic_affairs_GF0406_communication_p51g_eur_m: 4.5,
        gdp_gov_exp_economic_affairs_GF0407_other_industries_p51g_eur_m: 63.8,
        gdp_gov_exp_economic_affairs_GF0408_randd_economic_affairs_p51g_eur_m: 241.8,
        gdp_gov_exp_economic_affairs_GF0409_economic_affairs_nec_p51g_eur_m: 0,
        gdp_gov_exp_environmental_protection_p51g_eur_m: 356.2,
        gdp_gov_exp_environmental_protection_GF0501_waste_management_p51g_eur_m: 28.2,
        gdp_gov_exp_environmental_protection_GF0502_waste_water_management_p51g_eur_m: 81.2,
        gdp_gov_exp_environmental_protection_GF0503_pollution_abatement_p51g_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0504_protection_of_biodiversity_and_p51g_eur_m: 96.2,
        gdp_gov_exp_environmental_protection_GF0505_randd_environmental_protection_p51g_eur_m: 122.4,
        gdp_gov_exp_environmental_protection_GF0506_environmental_protection_nec_p51g_eur_m: 28.2,
        gdp_gov_exp_housing_community_p51g_eur_m: 418.6,
        gdp_gov_exp_housing_community_GF0601_housing_development_p51g_eur_m: 181.3,
        gdp_gov_exp_housing_community_GF0602_community_development_p51g_eur_m: 88.5,
        gdp_gov_exp_housing_community_GF0603_water_supply_p51g_eur_m: 110.3,
        gdp_gov_exp_housing_community_GF0604_street_lighting_p51g_eur_m: 28.6,
        gdp_gov_exp_housing_community_GF0605_randd_housing_and_community_am_p51g_eur_m: 7.2,
        gdp_gov_exp_housing_community_GF0606_housing_and_community_amenitie_p51g_eur_m: 2.8,
        gdp_gov_exp_housing_community_other_p51g_eur_m: -0.1,
        gdp_gov_exp_health_p51g_eur_m: 718.9,
        gdp_gov_exp_health_GF0701_medical_products_appliances_an_p51g_eur_m: 0,
        gdp_gov_exp_health_GF0702_outpatient_services_p51g_eur_m: 56.6,
        gdp_gov_exp_health_GF0703_hospital_services_p51g_eur_m: 331.2,
        gdp_gov_exp_health_GF0704_public_health_services_p51g_eur_m: 1.6,
        gdp_gov_exp_health_GF0705_randd_health_p51g_eur_m: 294,
        gdp_gov_exp_health_GF0706_health_nec_p51g_eur_m: 35.7,
        gdp_gov_exp_health_other_p51g_eur_m: -0.2,
        gdp_gov_exp_recreation_culture_p51g_eur_m: 714.1,
        gdp_gov_exp_recreation_culture_GF0801_recreational_and_sporting_serv_p51g_eur_m: 452.3,
        gdp_gov_exp_recreation_culture_GF0802_cultural_services_p51g_eur_m: 98,
        gdp_gov_exp_recreation_culture_GF0803_broadcasting_and_publishing_se_p51g_eur_m: 5.4,
        gdp_gov_exp_recreation_culture_GF0804_religious_and_other_community_p51g_eur_m: 1.2,
        gdp_gov_exp_recreation_culture_GF0805_randd_recreation_culture_and_r_p51g_eur_m: 139.9,
        gdp_gov_exp_recreation_culture_GF0806_recreation_culture_and_religio_p51g_eur_m: 17.3,
        gdp_gov_exp_education_p51g_eur_m: 685.2,
        gdp_gov_exp_education_GF0901_pre_primary_and_primary_educat_p51g_eur_m: 231.5,
        gdp_gov_exp_education_GF0902_secondary_education_p51g_eur_m: 169.9,
        gdp_gov_exp_education_GF0903_post_secondary_non_tertiary_ed_p51g_eur_m: 2,
        gdp_gov_exp_education_GF0904_tertiary_education_p51g_eur_m: 177.8,
        gdp_gov_exp_education_GF0905_education_not_definable_by_lev_p51g_eur_m: 21.2,
        gdp_gov_exp_education_GF0906_subsidiary_services_to_educati_p51g_eur_m: 13,
        gdp_gov_exp_education_GF0907_randd_education_p51g_eur_m: 37.9,
        gdp_gov_exp_education_GF0908_education_nec_p51g_eur_m: 32.1,
        gdp_gov_exp_education_other_p51g_eur_m: -0.2,
        gdp_gov_exp_social_protection_p51g_eur_m: 232.4,
        gdp_gov_exp_social_protection_GF1001_sickness_and_disability_p51g_eur_m: 1.2,
        gdp_gov_exp_social_protection_GF1002_old_age_p51g_eur_m: 7.3,
        gdp_gov_exp_social_protection_GF1003_survivors_p51g_eur_m: 0,
        gdp_gov_exp_social_protection_GF1004_family_and_children_p51g_eur_m: 116.2,
        gdp_gov_exp_social_protection_GF1005_unemployment_p51g_eur_m: 0,
        gdp_gov_exp_social_protection_GF1006_housing_p51g_eur_m: 0.9,
        gdp_gov_exp_social_protection_GF1007_social_exclusion_nec_p51g_eur_m: 0.8,
        gdp_gov_exp_social_protection_GF1008_randd_social_protection_p51g_eur_m: 0.9,
        gdp_gov_exp_social_protection_GF1009_social_protection_nec_p51g_eur_m: 105,
        gdp_gov_exp_social_protection_other_p51g_eur_m: 0.1,
        gdp_gov_exp_other_p51g_eur_m: 0.2,
        gdp_gov_exp_total_d62_eur_m: 42218.3,
        gdp_gov_exp_general_public_services_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0101_executive_and_legislative_orga_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0102_foreign_economic_aid_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0103_general_services_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0104_basic_research_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0105_randd_general_public_services_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0106_general_public_services_nec_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0107_public_debt_transactions_d62_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0108_transfers_of_a_general_charact_d62_eur_m: 0,
        gdp_gov_exp_defence_d62_eur_m: 0,
        gdp_gov_exp_defence_GF0201_military_defence_d62_eur_m: 0,
        gdp_gov_exp_defence_GF0202_civil_defence_d62_eur_m: 0,
        gdp_gov_exp_defence_GF0203_foreign_military_aid_d62_eur_m: 0,
        gdp_gov_exp_defence_GF0204_randd_defence_d62_eur_m: 0,
        gdp_gov_exp_defence_GF0205_defence_nec_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0301_police_services_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0302_fire_protection_services_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0303_law_courts_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0304_prisons_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0305_randd_public_order_and_safety_d62_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0306_public_order_and_safety_nec_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0401_general_economic_commercial_an_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0402_agriculture_forestry_fishing_a_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0403_fuel_and_energy_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0404_mining_manufacturing_and_const_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0405_transport_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0406_communication_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0407_other_industries_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0408_randd_economic_affairs_d62_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0409_economic_affairs_nec_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0501_waste_management_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0502_waste_water_management_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0503_pollution_abatement_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0504_protection_of_biodiversity_and_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0505_randd_environmental_protection_d62_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0506_environmental_protection_nec_d62_eur_m: 0,
        gdp_gov_exp_housing_community_d62_eur_m: 0,
        gdp_gov_exp_housing_community_GF0601_housing_development_d62_eur_m: 0,
        gdp_gov_exp_housing_community_GF0602_community_development_d62_eur_m: 0,
        gdp_gov_exp_housing_community_GF0603_water_supply_d62_eur_m: 0,
        gdp_gov_exp_housing_community_GF0604_street_lighting_d62_eur_m: 0,
        gdp_gov_exp_housing_community_GF0605_randd_housing_and_community_am_d62_eur_m: 0,
        gdp_gov_exp_housing_community_GF0606_housing_and_community_amenitie_d62_eur_m: 0,
        gdp_gov_exp_health_d62_eur_m: 1520.6,
        gdp_gov_exp_health_GF0701_medical_products_appliances_an_d62_eur_m: 267.5,
        gdp_gov_exp_health_GF0702_outpatient_services_d62_eur_m: 883.9,
        gdp_gov_exp_health_GF0703_hospital_services_d62_eur_m: 368.4,
        gdp_gov_exp_health_GF0704_public_health_services_d62_eur_m: 0.8,
        gdp_gov_exp_health_GF0705_randd_health_d62_eur_m: 0,
        gdp_gov_exp_health_GF0706_health_nec_d62_eur_m: 0,
        gdp_gov_exp_recreation_culture_d62_eur_m: 0.6,
        gdp_gov_exp_recreation_culture_GF0801_recreational_and_sporting_serv_d62_eur_m: 0.1,
        gdp_gov_exp_recreation_culture_GF0802_cultural_services_d62_eur_m: 0.5,
        gdp_gov_exp_recreation_culture_GF0803_broadcasting_and_publishing_se_d62_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0804_religious_and_other_community_d62_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0805_randd_recreation_culture_and_r_d62_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0806_recreation_culture_and_religio_d62_eur_m: 0,
        gdp_gov_exp_education_d62_eur_m: 491.5,
        gdp_gov_exp_education_GF0901_pre_primary_and_primary_educat_d62_eur_m: 0,
        gdp_gov_exp_education_GF0902_secondary_education_d62_eur_m: 0,
        gdp_gov_exp_education_GF0903_post_secondary_non_tertiary_ed_d62_eur_m: 0.1,
        gdp_gov_exp_education_GF0904_tertiary_education_d62_eur_m: 193.4,
        gdp_gov_exp_education_GF0905_education_not_definable_by_lev_d62_eur_m: 102.5,
        gdp_gov_exp_education_GF0906_subsidiary_services_to_educati_d62_eur_m: 195.5,
        gdp_gov_exp_education_GF0907_randd_education_d62_eur_m: 0,
        gdp_gov_exp_education_GF0908_education_nec_d62_eur_m: 0,
        gdp_gov_exp_social_protection_d62_eur_m: 40205.6,
        gdp_gov_exp_social_protection_GF1001_sickness_and_disability_d62_eur_m: 3287.5,
        gdp_gov_exp_social_protection_GF1002_old_age_d62_eur_m: 27731.7,
        gdp_gov_exp_social_protection_GF1003_survivors_d62_eur_m: 4212.2,
        gdp_gov_exp_social_protection_GF1004_family_and_children_d62_eur_m: 2732.8,
        gdp_gov_exp_social_protection_GF1005_unemployment_d62_eur_m: 1389.2,
        gdp_gov_exp_social_protection_GF1006_housing_d62_eur_m: 515.6,
        gdp_gov_exp_social_protection_GF1007_social_exclusion_nec_d62_eur_m: 336.7,
        gdp_gov_exp_social_protection_GF1008_randd_social_protection_d62_eur_m: 0,
        gdp_gov_exp_social_protection_GF1009_social_protection_nec_d62_eur_m: 0,
        gdp_gov_exp_social_protection_other_d62_eur_m: -0.1,
        gdp_gov_exp_total_d4_eur_m: 5526.9,
        gdp_gov_exp_general_public_services_d4_eur_m: 5526.3,
        gdp_gov_exp_general_public_services_GF0101_executive_and_legislative_orga_d4_eur_m: 0.3,
        gdp_gov_exp_general_public_services_GF0102_foreign_economic_aid_d4_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0103_general_services_d4_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0104_basic_research_d4_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0105_randd_general_public_services_d4_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0106_general_public_services_nec_d4_eur_m: 0,
        gdp_gov_exp_general_public_services_GF0107_public_debt_transactions_d4_eur_m: 5526.1,
        gdp_gov_exp_general_public_services_GF0108_transfers_of_a_general_charact_d4_eur_m: 0,
        gdp_gov_exp_general_public_services_other_d4_eur_m: -0.1,
        gdp_gov_exp_defence_d4_eur_m: 0,
        gdp_gov_exp_defence_GF0201_military_defence_d4_eur_m: 0,
        gdp_gov_exp_defence_GF0202_civil_defence_d4_eur_m: 0,
        gdp_gov_exp_defence_GF0203_foreign_military_aid_d4_eur_m: 0,
        gdp_gov_exp_defence_GF0204_randd_defence_d4_eur_m: 0,
        gdp_gov_exp_defence_GF0205_defence_nec_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0301_police_services_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0302_fire_protection_services_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0303_law_courts_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0304_prisons_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0305_randd_public_order_and_safety_d4_eur_m: 0,
        gdp_gov_exp_public_order_safety_GF0306_public_order_and_safety_nec_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0401_general_economic_commercial_an_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0402_agriculture_forestry_fishing_a_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0403_fuel_and_energy_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0404_mining_manufacturing_and_const_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0405_transport_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0406_communication_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0407_other_industries_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0408_randd_economic_affairs_d4_eur_m: 0,
        gdp_gov_exp_economic_affairs_GF0409_economic_affairs_nec_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0501_waste_management_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0502_waste_water_management_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0503_pollution_abatement_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0504_protection_of_biodiversity_and_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0505_randd_environmental_protection_d4_eur_m: 0,
        gdp_gov_exp_environmental_protection_GF0506_environmental_protection_nec_d4_eur_m: 0,
        gdp_gov_exp_housing_community_d4_eur_m: 0.4,
        gdp_gov_exp_housing_community_GF0601_housing_development_d4_eur_m: 0,
        gdp_gov_exp_housing_community_GF0602_community_development_d4_eur_m: 0.2,
        gdp_gov_exp_housing_community_GF0603_water_supply_d4_eur_m: 0,
        gdp_gov_exp_housing_community_GF0604_street_lighting_d4_eur_m: 0,
        gdp_gov_exp_housing_community_GF0605_randd_housing_and_community_am_d4_eur_m: 0,
        gdp_gov_exp_housing_community_GF0606_housing_and_community_amenitie_d4_eur_m: 0.2,
        gdp_gov_exp_health_d4_eur_m: 0,
        gdp_gov_exp_health_GF0701_medical_products_appliances_an_d4_eur_m: 0,
        gdp_gov_exp_health_GF0702_outpatient_services_d4_eur_m: 0,
        gdp_gov_exp_health_GF0703_hospital_services_d4_eur_m: 0,
        gdp_gov_exp_health_GF0704_public_health_services_d4_eur_m: 0,
        gdp_gov_exp_health_GF0705_randd_health_d4_eur_m: 0,
        gdp_gov_exp_health_GF0706_health_nec_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0801_recreational_and_sporting_serv_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0802_cultural_services_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0803_broadcasting_and_publishing_se_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0804_religious_and_other_community_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0805_randd_recreation_culture_and_r_d4_eur_m: 0,
        gdp_gov_exp_recreation_culture_GF0806_recreation_culture_and_religio_d4_eur_m: 0,
        gdp_gov_exp_education_d4_eur_m: 0.1,
        gdp_gov_exp_education_GF0901_pre_primary_and_primary_educat_d4_eur_m: 0,
        gdp_gov_exp_education_GF0902_secondary_education_d4_eur_m: 0,
        gdp_gov_exp_education_GF0903_post_secondary_non_tertiary_ed_d4_eur_m: 0.1,
        gdp_gov_exp_education_GF0904_tertiary_education_d4_eur_m: 0,
        gdp_gov_exp_education_GF0905_education_not_definable_by_lev_d4_eur_m: 0,
        gdp_gov_exp_education_GF0906_subsidiary_services_to_educati_d4_eur_m: 0,
        gdp_gov_exp_education_GF0907_randd_education_d4_eur_m: 0,
        gdp_gov_exp_education_GF0908_education_nec_d4_eur_m: 0,
        gdp_gov_exp_social_protection_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1001_sickness_and_disability_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1002_old_age_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1003_survivors_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1004_family_and_children_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1005_unemployment_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1006_housing_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1007_social_exclusion_nec_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1008_randd_social_protection_d4_eur_m: 0,
        gdp_gov_exp_social_protection_GF1009_social_protection_nec_d4_eur_m: 0,
        gdp_gov_exp_other_d4_eur_m: 0.1,
        gdp_gov_exp_total_te_eur_m: 113361.7,
        gdp_gov_exp_general_public_services_te_eur_m: 15416,
        gdp_gov_exp_general_public_services_GF0101_executive_and_legislative_orga_te_eur_m: 7859.3,
        gdp_gov_exp_general_public_services_GF0102_foreign_economic_aid_te_eur_m: 3.1,
        gdp_gov_exp_general_public_services_GF0103_general_services_te_eur_m: 522.9,
        gdp_gov_exp_general_public_services_GF0104_basic_research_te_eur_m: 861.6,
        gdp_gov_exp_general_public_services_GF0105_randd_general_public_services_te_eur_m: 37.5,
        gdp_gov_exp_general_public_services_GF0106_general_public_services_nec_te_eur_m: 130.5,
        gdp_gov_exp_general_public_services_GF0107_public_debt_transactions_te_eur_m: 6001.1,
        gdp_gov_exp_general_public_services_GF0108_transfers_of_a_general_charact_te_eur_m: 0,
        gdp_gov_exp_defence_te_eur_m: 2065,
        gdp_gov_exp_defence_GF0201_military_defence_te_eur_m: 1833.3,
        gdp_gov_exp_defence_GF0202_civil_defence_te_eur_m: 0,
        gdp_gov_exp_defence_GF0203_foreign_military_aid_te_eur_m: 74.2,
        gdp_gov_exp_defence_GF0204_randd_defence_te_eur_m: 23,
        gdp_gov_exp_defence_GF0205_defence_nec_te_eur_m: 134.5,
        gdp_gov_exp_public_order_safety_te_eur_m: 4279.8,
        gdp_gov_exp_public_order_safety_GF0301_police_services_te_eur_m: 2546.6,
        gdp_gov_exp_public_order_safety_GF0302_fire_protection_services_te_eur_m: 394,
        gdp_gov_exp_public_order_safety_GF0303_law_courts_te_eur_m: 772.4,
        gdp_gov_exp_public_order_safety_GF0304_prisons_te_eur_m: 326.8,
        gdp_gov_exp_public_order_safety_GF0305_randd_public_order_and_safety_te_eur_m: 15.1,
        gdp_gov_exp_public_order_safety_GF0306_public_order_and_safety_nec_te_eur_m: 224.9,
        gdp_gov_exp_economic_affairs_te_eur_m: 11657.9,
        gdp_gov_exp_economic_affairs_GF0401_general_economic_commercial_an_te_eur_m: 3316.8,
        gdp_gov_exp_economic_affairs_GF0402_agriculture_forestry_fishing_a_te_eur_m: 873,
        gdp_gov_exp_economic_affairs_GF0403_fuel_and_energy_te_eur_m: 521.1,
        gdp_gov_exp_economic_affairs_GF0404_mining_manufacturing_and_const_te_eur_m: 881.5,
        gdp_gov_exp_economic_affairs_GF0405_transport_te_eur_m: 5037.3,
        gdp_gov_exp_economic_affairs_GF0406_communication_te_eur_m: 81.2,
        gdp_gov_exp_economic_affairs_GF0407_other_industries_te_eur_m: 423.2,
        gdp_gov_exp_economic_affairs_GF0408_randd_economic_affairs_te_eur_m: 523.8,
        gdp_gov_exp_economic_affairs_GF0409_economic_affairs_nec_te_eur_m: 0,
        gdp_gov_exp_environmental_protection_te_eur_m: 2021,
        gdp_gov_exp_environmental_protection_GF0501_waste_management_te_eur_m: 598.5,
        gdp_gov_exp_environmental_protection_GF0502_waste_water_management_te_eur_m: 309.2,
        gdp_gov_exp_environmental_protection_GF0503_pollution_abatement_te_eur_m: 515.3,
        gdp_gov_exp_environmental_protection_GF0504_protection_of_biodiversity_and_te_eur_m: 236,
        gdp_gov_exp_environmental_protection_GF0505_randd_environmental_protection_te_eur_m: 230.7,
        gdp_gov_exp_environmental_protection_GF0506_environmental_protection_nec_te_eur_m: 131.3,
        gdp_gov_exp_housing_community_te_eur_m: 1436.8,
        gdp_gov_exp_housing_community_GF0601_housing_development_te_eur_m: 490.4,
        gdp_gov_exp_housing_community_GF0602_community_development_te_eur_m: 466.5,
        gdp_gov_exp_housing_community_GF0603_water_supply_te_eur_m: 400.4,
        gdp_gov_exp_housing_community_GF0604_street_lighting_te_eur_m: 29.5,
        gdp_gov_exp_housing_community_GF0605_randd_housing_and_community_am_te_eur_m: 13.2,
        gdp_gov_exp_housing_community_GF0606_housing_and_community_amenitie_te_eur_m: 36.8,
        gdp_gov_exp_health_te_eur_m: 17993,
        gdp_gov_exp_health_GF0701_medical_products_appliances_an_te_eur_m: 1478.8,
        gdp_gov_exp_health_GF0702_outpatient_services_te_eur_m: 4667,
        gdp_gov_exp_health_GF0703_hospital_services_te_eur_m: 10472.5,
        gdp_gov_exp_health_GF0704_public_health_services_te_eur_m: 213.2,
        gdp_gov_exp_health_GF0705_randd_health_te_eur_m: 580.2,
        gdp_gov_exp_health_GF0706_health_nec_te_eur_m: 581.3,
        gdp_gov_exp_recreation_culture_te_eur_m: 2473.8,
        gdp_gov_exp_recreation_culture_GF0801_recreational_and_sporting_serv_te_eur_m: 890.2,
        gdp_gov_exp_recreation_culture_GF0802_cultural_services_te_eur_m: 836.6,
        gdp_gov_exp_recreation_culture_GF0803_broadcasting_and_publishing_se_te_eur_m: 258.3,
        gdp_gov_exp_recreation_culture_GF0804_religious_and_other_community_te_eur_m: 69.6,
        gdp_gov_exp_recreation_culture_GF0805_randd_recreation_culture_and_r_te_eur_m: 257.9,
        gdp_gov_exp_recreation_culture_GF0806_recreation_culture_and_religio_te_eur_m: 161.3,
        gdp_gov_exp_recreation_culture_other_te_eur_m: -0.1,
        gdp_gov_exp_education_te_eur_m: 11635.3,
        gdp_gov_exp_education_GF0901_pre_primary_and_primary_educat_te_eur_m: 4402.8,
        gdp_gov_exp_education_GF0902_secondary_education_te_eur_m: 4369.5,
        gdp_gov_exp_education_GF0903_post_secondary_non_tertiary_ed_te_eur_m: 50,
        gdp_gov_exp_education_GF0904_tertiary_education_te_eur_m: 1741.4,
        gdp_gov_exp_education_GF0905_education_not_definable_by_lev_te_eur_m: 400.2,
        gdp_gov_exp_education_GF0906_subsidiary_services_to_educati_te_eur_m: 354.2,
        gdp_gov_exp_education_GF0907_randd_education_te_eur_m: 69.5,
        gdp_gov_exp_education_GF0908_education_nec_te_eur_m: 247.7,
        gdp_gov_exp_social_protection_te_eur_m: 44383,
        gdp_gov_exp_social_protection_GF1001_sickness_and_disability_te_eur_m: 3567.3,
        gdp_gov_exp_social_protection_GF1002_old_age_te_eur_m: 28484.7,
        gdp_gov_exp_social_protection_GF1003_survivors_te_eur_m: 4221.7,
        gdp_gov_exp_social_protection_GF1004_family_and_children_te_eur_m: 4691.7,
        gdp_gov_exp_social_protection_GF1005_unemployment_te_eur_m: 1416.5,
        gdp_gov_exp_social_protection_GF1006_housing_te_eur_m: 576.2,
        gdp_gov_exp_social_protection_GF1007_social_exclusion_nec_te_eur_m: 651,
        gdp_gov_exp_social_protection_GF1008_randd_social_protection_te_eur_m: 1.8,
        gdp_gov_exp_social_protection_GF1009_social_protection_nec_te_eur_m: 772.2,
        gdp_gov_exp_social_protection_other_te_eur_m: -0.1,
        gdp_gov_exp_other_te_eur_m: 0.1,
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
        mpc_rate: 0.65, // Marginal propensity to consume from D62 transfers

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
            consumption: 181033.700,
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
    if (typeof calculateBudget === 'function') {
        window.gameState.budget = calculateBudget(window.gameState, { applyMonthlyDebtFlow: false });
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



