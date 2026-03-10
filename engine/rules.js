// Mathematical relationships between game variables
// CSV-driven simulation math with bounded logistic targeting and inertia.
// NO UI CODE HERE - PURE MATH ONLY

const relationshipLoadState = {
    loaded: false,
    loading: false,
    error: null
};

const nodeRegistryLoadState = {
    loaded: false,
    loading: false,
    error: null,
    policiesLoaded: false,
    metricsLoaded: false
};

let relationshipEdges = [];
let edgesByTarget = new Map();
let relationshipNodeIds = new Set();
let nodeConfigs = {};
let nodeRegistryRows = [];
let nodeRegistryById = new Map();
let knownNodeIds = new Set();
let policyNodeIds = [];
let policyNodeIdSet = new Set();
let metricNodeDefaults = {};
let graphNodeRegistryRows = [];
let policyFiscalRows = [];
let pendingPolicyRows = [];
let pendingMetricRows = [];
let pendingCalibrationRows = [];
let governmentDemandCalibrationFactor = 1;
const ACCOUNTING_TARGET_BLOCKLIST = new Set([
    'income',
    'expenditure',
    'deficit',
    'debt'
]);

const EDGE_MODE_BEHAVIORAL = 'behavioral_contribution';
const EDGE_MODE_ACCOUNTING = 'accounting_trace';
const EDGE_MODE_ALLOWED = new Set([EDGE_MODE_BEHAVIORAL, EDGE_MODE_ACCOUNTING]);
const TRADE_HS_NODE_PATTERN = /^(exports|imports)_goods_hs(\d{2})_eur_m$/;
const TRADE_SERVICE_EBOPS_NODE_PATTERN = /^(exports|imports)_services_ebops_([a-z]{2})_eur_m$/;

function getTradeComponentNodeIds(flowPrefix, otherNodeId) {
    const hsNodes = [...knownNodeIds]
        .filter((nodeId) => nodeId.startsWith(flowPrefix) && TRADE_HS_NODE_PATTERN.test(nodeId))
        .sort((a, b) => {
            const aMatch = a.match(/hs(\d{2})_eur_m$/);
            const bMatch = b.match(/hs(\d{2})_eur_m$/);
            const aCode = aMatch ? Number(aMatch[1]) : 0;
            const bCode = bMatch ? Number(bMatch[1]) : 0;
            return aCode - bCode;
        });

    if (otherNodeId && knownNodeIds.has(otherNodeId)) {
        hsNodes.push(otherNodeId);
    }

    return hsNodes;
}

function getServiceComponentNodeIds(flowPrefix, otherNodeId) {
    const serviceNodes = [...knownNodeIds]
        .filter((nodeId) => nodeId.startsWith(flowPrefix) && TRADE_SERVICE_EBOPS_NODE_PATTERN.test(nodeId))
        .sort((a, b) => {
            const aMatch = a.match(/ebops_([a-z]{2})_eur_m$/);
            const bMatch = b.match(/ebops_([a-z]{2})_eur_m$/);
            const aCode = aMatch ? aMatch[1] : '';
            const bCode = bMatch ? bMatch[1] : '';
            return aCode.localeCompare(bCode);
        });

    if (otherNodeId && knownNodeIds.has(otherNodeId)) {
        serviceNodes.push(otherNodeId);
    }

    return serviceNodes;
}


function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeWithRange(value, min, max) {
    if (!Number.isFinite(value) || max <= min) return 0;
    return clamp01((value - min) / (max - min));
}

function denormalizeWithRange(value, min, max) {
    return min + (clamp01(value) * (max - min));
}

function logistic(x, k = 1.6) {
    return 1 / (1 + Math.exp(-k * x));
}

function parseCsvLine(line) {
    const safeLine = (typeof line === 'string' && line.charCodeAt(0) === 0xFEFF)
        ? line.slice(1)
        : line;
    const out = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < safeLine.length; i++) {
        const ch = safeLine[i];
        if (ch === '"') {
            if (inQuotes && safeLine[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (ch === ',' && !inQuotes) {
            out.push(current.trim());
            current = '';
            continue;
        }
        current += ch;
    }
    out.push(current.trim());
    return out;
}

function parseOptionalFiniteNumber(rawValue, fieldName, rowNumber, sourceFile) {
    const raw = String(rawValue ?? '').trim();
    if (raw === '') return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) {
        throw new Error(`Invalid ${fieldName} "${raw}" on ${sourceFile} row ${rowNumber}.`);
    }
    return value;
}

function parseRequiredFiniteNumber(rawValue, fieldName, rowNumber, sourceFile) {
    const value = parseOptionalFiniteNumber(rawValue, fieldName, rowNumber, sourceFile);
    if (!Number.isFinite(value)) {
        throw new Error(`Missing ${fieldName} on ${sourceFile} row ${rowNumber}.`);
    }
    return value;
}

function parsePositiveInteger(rawValue, fieldName, rowNumber, sourceFile) {
    const raw = String(rawValue ?? '').trim();
    const value = Number(raw);
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`Invalid ${fieldName} "${raw}" on ${sourceFile} row ${rowNumber}.`);
    }
    return value;
}

function parseYesNo(rawValue, fieldName, rowNumber, sourceFile) {
    const raw = String(rawValue ?? '').trim().toLowerCase();
    if (!['yes', 'no'].includes(raw)) {
        throw new Error(`Invalid ${fieldName} "${raw}" on ${sourceFile} row ${rowNumber}.`);
    }
    return raw === 'yes';
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

function getNodeRegistryValidationState() {
    if (typeof portugalState !== 'undefined' && portugalState) {
        return portugalState;
    }
    if (typeof getGameState === 'function') {
        return getGameState();
    }
    return null;
}

function parseRegistryCsvLines(csvText, sourceFile) {
    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));

    if (lines.length < 2) {
        throw new Error(`${sourceFile} must contain a header and at least one row.`);
    }
    return lines;
}

function getHeaderIndexByName(header) {
    const out = new Map();
    header.forEach((column, index) => {
        out.set(String(column || '').trim().toLowerCase(), index);
    });
    return out;
}

function getCsvCell(row, headerIndexByName, columnName) {
    const columnIndex = headerIndexByName.get(columnName);
    if (typeof columnIndex !== 'number') return '';
    return String(row[columnIndex] || '').trim();
}

function parsePoliciesCsv(csvText) {
    const sourceFile = 'policies.csv';
    const lines = parseRegistryCsvLines(csvText, sourceFile);
    const header = parseCsvLine(lines[0]);
    const headerIndexByName = getHeaderIndexByName(header);
    const requiredColumns = [
        'policy_id',
        'storage_path',
        'initial_value',
        'min',
        'max',
        'display_name',
        'short_label',
        'description',
        'icon',
        'color_token',
        'value_unit',
        'graph_enabled',
        'ui_order',
        'base_cost',
        'cost_slope',
        'base_revenue',
        'revenue_slope',
        'gdp_scaled',
        'gdp_demand_share',
        'revenue_channel'
    ];
    const missingColumns = requiredColumns.filter((column) => !headerIndexByName.has(column));
    if (missingColumns.length) {
        throw new Error(`${sourceFile} missing required columns: ${missingColumns.join(', ')}`);
    }

    const seenPolicyIds = new Set();
    const seenUiOrders = new Set();
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const rowNumber = i + 1;
        if (row.length !== header.length) {
            throw new Error(`Invalid ${sourceFile} row ${rowNumber}: expected ${header.length} columns.`);
        }

        const policyId = getCsvCell(row, headerIndexByName, 'policy_id');
        const storagePath = getCsvCell(row, headerIndexByName, 'storage_path');
        const displayName = getCsvCell(row, headerIndexByName, 'display_name');
        const shortLabel = getCsvCell(row, headerIndexByName, 'short_label');
        const description = getCsvCell(row, headerIndexByName, 'description');
        const icon = getCsvCell(row, headerIndexByName, 'icon');
        const colorToken = getCsvCell(row, headerIndexByName, 'color_token');
        const valueUnit = getCsvCell(row, headerIndexByName, 'value_unit');
        const uiOrder = parsePositiveInteger(getCsvCell(row, headerIndexByName, 'ui_order'), 'ui_order', rowNumber, sourceFile);
        const initialValue = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'initial_value'), 'initial_value', rowNumber, sourceFile);
        const min = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'min'), 'min', rowNumber, sourceFile);
        const max = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'max'), 'max', rowNumber, sourceFile);
        const graphEnabled = parseYesNo(getCsvCell(row, headerIndexByName, 'graph_enabled'), 'graph_enabled', rowNumber, sourceFile);
        const gdpScaled = parseYesNo(getCsvCell(row, headerIndexByName, 'gdp_scaled'), 'gdp_scaled', rowNumber, sourceFile);
        const gdpDemandShare = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'gdp_demand_share'), 'gdp_demand_share', rowNumber, sourceFile);
        const revenueChannel = getCsvCell(row, headerIndexByName, 'revenue_channel').toLowerCase();
        const baseCost = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'base_cost'), 'base_cost', rowNumber, sourceFile);
        const costSlope = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'cost_slope'), 'cost_slope', rowNumber, sourceFile);
        const baseRevenue = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'base_revenue'), 'base_revenue', rowNumber, sourceFile);
        const revenueSlope = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'revenue_slope'), 'revenue_slope', rowNumber, sourceFile);

        if (!policyId) throw new Error(`Missing policy_id on ${sourceFile} row ${rowNumber}.`);
        if (seenPolicyIds.has(policyId)) throw new Error(`Duplicate policy_id "${policyId}" on ${sourceFile} row ${rowNumber}.`);
        if (!storagePath) throw new Error(`Missing storage_path on ${sourceFile} row ${rowNumber}.`);
        if (!displayName) throw new Error(`Missing display_name on ${sourceFile} row ${rowNumber}.`);
        if (!shortLabel) throw new Error(`Missing short_label on ${sourceFile} row ${rowNumber}.`);
        if (!description) throw new Error(`Missing description on ${sourceFile} row ${rowNumber}.`);
        if (!icon) throw new Error(`Missing icon on ${sourceFile} row ${rowNumber}.`);
        if (!colorToken) throw new Error(`Missing color_token on ${sourceFile} row ${rowNumber}.`);
        if (!valueUnit) throw new Error(`Missing value_unit on ${sourceFile} row ${rowNumber}.`);
        if (!['tax', 'non_tax', 'none'].includes(revenueChannel)) {
            throw new Error(`Invalid revenue_channel "${revenueChannel}" on ${sourceFile} row ${rowNumber}.`);
        }
        if (max < min) throw new Error(`Invalid bounds on ${sourceFile} row ${rowNumber}: max must be >= min.`);
        if (initialValue < min || initialValue > max) {
            throw new Error(`Initial value for "${policyId}" must be within [min,max] on ${sourceFile} row ${rowNumber}.`);
        }
        if (gdpDemandShare < 0 || gdpDemandShare > 1) {
            throw new Error(`Invalid gdp_demand_share "${gdpDemandShare}" on ${sourceFile} row ${rowNumber}: expected value in [0,1].`);
        }
        const hasRevenue = baseRevenue !== 0 || revenueSlope !== 0;
        if (revenueChannel === 'tax' && !hasRevenue) {
            throw new Error(`Policy "${policyId}" has revenue_channel=tax but zero revenue coefficients on ${sourceFile} row ${rowNumber}.`);
        }
        if (revenueChannel === 'none' && hasRevenue) {
            throw new Error(`Policy "${policyId}" has revenue_channel=none but non-zero revenue coefficients on ${sourceFile} row ${rowNumber}.`);
        }
        if (seenUiOrders.has(uiOrder)) {
            throw new Error(`Duplicate ui_order "${uiOrder}" in ${sourceFile} row ${rowNumber}.`);
        }

        seenPolicyIds.add(policyId);
        seenUiOrders.add(uiOrder);
        parsedRows.push({
            nodeId: policyId,
            nodeType: 'policy',
            mutableByPlayer: true,
            storagePath,
            initialValue,
            min,
            max,
            k: null,
            modifierRange: null,
            displayName,
            shortLabel,
            description,
            icon,
            colorToken,
            valueUnit,
            graphEnabled,
            simulationEnabled: false,
            uiOrder,
            baseCost,
            costSlope,
            baseRevenue,
            revenueSlope,
            gdpScaled,
            gdpDemandShare,
            revenueChannel
        });
    }

    return parsedRows;
}

function parseMetricsCsv(csvText) {
    const sourceFile = 'metrics.csv';
    const lines = parseRegistryCsvLines(csvText, sourceFile);
    const header = parseCsvLine(lines[0]);
    const headerIndexByName = getHeaderIndexByName(header);
    const requiredColumns = [
        'metric_id',
        'storage_path',
        'initial_value',
        'min',
        'max',
        'k',
        'modifier_range',
        'display_name',
        'short_label',
        'description',
        'icon',
        'color_token',
        'value_unit',
        'graph_enabled',
        'simulation_enabled',
        'ui_order'
    ];
    const forbiddenColumns = ['base_cost', 'cost_slope', 'base_revenue', 'revenue_slope', 'gdp_scaled', 'gdp_demand_share'];
    const missingColumns = requiredColumns.filter((column) => !headerIndexByName.has(column));
    if (missingColumns.length) {
        throw new Error(`${sourceFile} missing required columns: ${missingColumns.join(', ')}`);
    }
    const forbiddenPresent = forbiddenColumns.filter((column) => headerIndexByName.has(column));
    if (forbiddenPresent.length) {
        throw new Error(`${sourceFile} contains policy-only columns: ${forbiddenPresent.join(', ')}`);
    }

    const seenMetricIds = new Set();
    const seenUiOrders = new Set();
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const rowNumber = i + 1;
        if (row.length !== header.length) {
            throw new Error(`Invalid ${sourceFile} row ${rowNumber}: expected ${header.length} columns.`);
        }

        const metricId = getCsvCell(row, headerIndexByName, 'metric_id');
        const storagePath = getCsvCell(row, headerIndexByName, 'storage_path');
        const displayName = getCsvCell(row, headerIndexByName, 'display_name');
        const shortLabel = getCsvCell(row, headerIndexByName, 'short_label');
        const description = getCsvCell(row, headerIndexByName, 'description');
        const icon = getCsvCell(row, headerIndexByName, 'icon');
        const colorToken = getCsvCell(row, headerIndexByName, 'color_token');
        const valueUnit = getCsvCell(row, headerIndexByName, 'value_unit');
        const uiOrder = parsePositiveInteger(getCsvCell(row, headerIndexByName, 'ui_order'), 'ui_order', rowNumber, sourceFile);
        const initialValue = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'initial_value'), 'initial_value', rowNumber, sourceFile);
        const min = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'min'), 'min', rowNumber, sourceFile);
        const max = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'max'), 'max', rowNumber, sourceFile);
        const k = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'k'), 'k', rowNumber, sourceFile);
        const modifierRange = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'modifier_range'), 'modifier_range', rowNumber, sourceFile);
        const graphEnabled = parseYesNo(getCsvCell(row, headerIndexByName, 'graph_enabled'), 'graph_enabled', rowNumber, sourceFile);
        const simulationEnabled = parseYesNo(getCsvCell(row, headerIndexByName, 'simulation_enabled'), 'simulation_enabled', rowNumber, sourceFile);

        if (!metricId) throw new Error(`Missing metric_id on ${sourceFile} row ${rowNumber}.`);
        if (seenMetricIds.has(metricId)) throw new Error(`Duplicate metric_id "${metricId}" on ${sourceFile} row ${rowNumber}.`);
        if (!storagePath) throw new Error(`Missing storage_path on ${sourceFile} row ${rowNumber}.`);
        if (!displayName) throw new Error(`Missing display_name on ${sourceFile} row ${rowNumber}.`);
        if (!shortLabel) throw new Error(`Missing short_label on ${sourceFile} row ${rowNumber}.`);
        if (!description) throw new Error(`Missing description on ${sourceFile} row ${rowNumber}.`);
        if (!icon) throw new Error(`Missing icon on ${sourceFile} row ${rowNumber}.`);
        if (!colorToken) throw new Error(`Missing color_token on ${sourceFile} row ${rowNumber}.`);
        if (!valueUnit) throw new Error(`Missing value_unit on ${sourceFile} row ${rowNumber}.`);
        if (max < min) throw new Error(`Invalid bounds on ${sourceFile} row ${rowNumber}: max must be >= min.`);
        if (initialValue < min || initialValue > max) {
            throw new Error(`Initial value for "${metricId}" must be within [min,max] on ${sourceFile} row ${rowNumber}.`);
        }
        if (seenUiOrders.has(uiOrder)) {
            throw new Error(`Duplicate ui_order "${uiOrder}" in ${sourceFile} row ${rowNumber}.`);
        }

        seenMetricIds.add(metricId);
        seenUiOrders.add(uiOrder);
        parsedRows.push({
            nodeId: metricId,
            nodeType: 'metric',
            mutableByPlayer: false,
            storagePath,
            initialValue,
            min,
            max,
            k,
            modifierRange,
            displayName,
            shortLabel,
            description,
            icon,
            colorToken,
            valueUnit,
            graphEnabled,
            simulationEnabled,
            uiOrder,
            baseCost: 0,
            costSlope: 0,
            baseRevenue: 0,
            revenueSlope: 0,
            gdpScaled: true,
            gdpDemandShare: 0
        });
    }

    return parsedRows;
}

function parseCalibrationTargetsCsv(csvText) {
    const sourceFile = 'calibration_targets_template.csv';
    const lines = parseRegistryCsvLines(csvText, sourceFile);
    const header = parseCsvLine(lines[0]);
    const headerIndexByName = getHeaderIndexByName(header);
    const requiredColumns = [
        'metric_id',
        'node_id',
        'storage_path',
        'exists_in_current_sim',
        'locked_value',
        'weight',
        'tolerance',
        'min_bound',
        'max_bound'
    ];
    const missingColumns = requiredColumns.filter((column) => !headerIndexByName.has(column));
    if (missingColumns.length) {
        throw new Error(`${sourceFile} missing required columns: ${missingColumns.join(', ')}`);
    }

    const seenNodeIds = new Set();
    const parsedRows = [];
    for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const rowNumber = i + 1;
        if (row.length !== header.length) {
            throw new Error(`Invalid ${sourceFile} row ${rowNumber}: expected ${header.length} columns.`);
        }

        const metricId = getCsvCell(row, headerIndexByName, 'metric_id');
        const nodeId = getCsvCell(row, headerIndexByName, 'node_id');
        const storagePath = getCsvCell(row, headerIndexByName, 'storage_path');
        const existsInCurrentSim = parseYesNo(getCsvCell(row, headerIndexByName, 'exists_in_current_sim'), 'exists_in_current_sim', rowNumber, sourceFile);
        const lockedValue = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'locked_value'), 'locked_value', rowNumber, sourceFile);
        const weight = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'weight'), 'weight', rowNumber, sourceFile);
        const tolerance = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'tolerance'), 'tolerance', rowNumber, sourceFile);
        const minBound = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'min_bound'), 'min_bound', rowNumber, sourceFile);
        const maxBound = parseRequiredFiniteNumber(getCsvCell(row, headerIndexByName, 'max_bound'), 'max_bound', rowNumber, sourceFile);

        if (!metricId) {
            throw new Error(`Missing metric_id on ${sourceFile} row ${rowNumber}.`);
        }
        if (!nodeId) {
            throw new Error(`Missing node_id on ${sourceFile} row ${rowNumber}.`);
        }
        if (!storagePath) {
            throw new Error(`Missing storage_path on ${sourceFile} row ${rowNumber}.`);
        }
        if (seenNodeIds.has(nodeId)) {
            throw new Error(`Duplicate node_id "${nodeId}" on ${sourceFile} row ${rowNumber}.`);
        }
        if (maxBound < minBound) {
            throw new Error(`Invalid bounds on ${sourceFile} row ${rowNumber}: max_bound must be >= min_bound.`);
        }
        if (lockedValue < minBound || lockedValue > maxBound) {
            throw new Error(`Invalid locked_value on ${sourceFile} row ${rowNumber}: expected value within [min_bound,max_bound].`);
        }
        if (weight < 0) {
            throw new Error(`Invalid weight "${weight}" on ${sourceFile} row ${rowNumber}: expected weight >= 0.`);
        }
        if (tolerance <= 0) {
            throw new Error(`Invalid tolerance "${tolerance}" on ${sourceFile} row ${rowNumber}: expected tolerance > 0.`);
        }

        seenNodeIds.add(nodeId);
        parsedRows.push({
            metricId,
            nodeId,
            storagePath,
            existsInCurrentSim,
            lockedValue,
            minBound,
            maxBound
        });
    }

    return parsedRows;
}

function applyCalibrationLockedValues(parsedRows, calibrationRows) {
    if (!Array.isArray(calibrationRows) || calibrationRows.length === 0) {
        return parsedRows;
    }

    const calibrationByNodeId = new Map(
        calibrationRows
            .filter((row) => row.existsInCurrentSim)
            .map((row) => [row.nodeId, row])
    );
    if (calibrationByNodeId.size === 0) {
        return parsedRows;
    }

    const rowByNodeId = new Map(parsedRows.map((row) => [row.nodeId, row]));
    calibrationByNodeId.forEach((calibrationRow, nodeId) => {
        const runtimeRow = rowByNodeId.get(nodeId);
        if (!runtimeRow) {
            throw new Error(`Calibration row references unknown node_id "${nodeId}".`);
        }
        if (runtimeRow.storagePath !== calibrationRow.storagePath) {
            throw new Error(`Calibration storage_path mismatch for node "${nodeId}": expected "${runtimeRow.storagePath}" but found "${calibrationRow.storagePath}".`);
        }
        if (calibrationRow.lockedValue < runtimeRow.min || calibrationRow.lockedValue > runtimeRow.max) {
            throw new Error(`Calibration locked_value for node "${nodeId}" is outside registry bounds [${runtimeRow.min},${runtimeRow.max}].`);
        }
    });

    return parsedRows.map((row) => {
        const calibrationRow = calibrationByNodeId.get(row.nodeId);
        if (!calibrationRow) return row;
        return {
            ...row,
            initialValue: calibrationRow.lockedValue
        };
    });
}

function recomputeGovernmentDemandCalibrationFactor() {
    const governmentDemandNode = nodeRegistryById.get('government_demand');
    if (!governmentDemandNode || !Number.isFinite(governmentDemandNode.initialValue)) {
        governmentDemandCalibrationFactor = 1;
        return;
    }

    const baselineDemand = policyFiscalRows.reduce((sum, row) => {
        if (!Number.isFinite(row.gdpDemandShare) || row.gdpDemandShare === 0) return sum;
        const hasRange = Number.isFinite(row.min) && Number.isFinite(row.max) && row.max > row.min;
        const intensity = hasRange
            ? clamp01((row.initialValue - row.min) / (row.max - row.min))
            : 0;
        const baselineCost = row.baseCost + (row.costSlope * intensity);
        return sum + (baselineCost * row.gdpDemandShare);
    }, 0);

    if (!Number.isFinite(baselineDemand) || baselineDemand <= 0) {
        governmentDemandCalibrationFactor = 1;
        return;
    }
    const scale = governmentDemandNode.initialValue / baselineDemand;
    governmentDemandCalibrationFactor = Number.isFinite(scale) && scale > 0 ? scale : 1;
}

function assertNodeRegistryParity(parsedRows) {
    const baseState = getNodeRegistryValidationState();
    if (!baseState) {
        throw new Error('Unable to validate node registry storage paths: base state not available.');
    }

    const policies = parsedRows.filter((row) => row.nodeType === 'policy');
    const metrics = parsedRows.filter((row) => row.nodeType === 'metric');
    if (!policies.length) throw new Error('policy registry must define at least one policy node.');
    if (!metrics.length) throw new Error('metric registry must define at least one metric node.');

    parsedRows.forEach((row) => {
        const value = getValueAtPath(baseState, row.storagePath);
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new Error(`Registry storage_path "${row.storagePath}" for node "${row.nodeId}" does not resolve to a numeric base-state value.`);
        }
    });
}

function rebuildNodeRegistryIndexes(parsedRows) {
    const seenNodeIds = new Set();
    parsedRows.forEach((row) => {
        if (seenNodeIds.has(row.nodeId)) {
            throw new Error(`Duplicate node id "${row.nodeId}" across policies.csv and metrics.csv.`);
        }
        seenNodeIds.add(row.nodeId);
    });

    const sortedRows = [...parsedRows].sort((a, b) => {
        if (a.nodeType !== b.nodeType) {
            return a.nodeType === 'metric' ? -1 : 1;
        }
        return a.uiOrder - b.uiOrder;
    });

    nodeRegistryRows = sortedRows;
    nodeRegistryById = new Map(sortedRows.map((row) => [row.nodeId, row]));
    knownNodeIds = new Set(sortedRows.map((row) => row.nodeId));
    policyNodeIds = sortedRows.filter((row) => row.nodeType === 'policy').map((row) => row.nodeId);
    policyNodeIdSet = new Set(policyNodeIds);
    graphNodeRegistryRows = sortedRows.filter((row) => row.graphEnabled);
    policyFiscalRows = sortedRows
        .filter((row) => row.nodeType === 'policy')
        .map((row) => ({
            policyId: row.nodeId,
            initialValue: row.initialValue,
            min: row.min,
            max: row.max,
            baseCost: row.baseCost,
            costSlope: row.costSlope,
            baseRevenue: row.baseRevenue,
            revenueSlope: row.revenueSlope,
            gdpScaled: row.gdpScaled,
            gdpDemandShare: Number.isFinite(row.gdpDemandShare) ? row.gdpDemandShare : 0,
            revenueChannel: row.revenueChannel
        }));

    metricNodeDefaults = {};
    sortedRows
        .filter((row) => row.nodeType === 'metric' && row.simulationEnabled)
        .forEach((row) => {
            metricNodeDefaults[row.nodeId] = {
                min: row.min,
                max: row.max,
                k: row.k,
                modifierRange: row.modifierRange
            };
        });

    if (Object.keys(metricNodeDefaults).length === 0) {
        throw new Error('metrics.csv must define at least one simulation_enabled metric node.');
    }
    recomputeGovernmentDemandCalibrationFactor();
}

function resetNodeRegistryData() {
    nodeRegistryRows = [];
    nodeRegistryById = new Map();
    knownNodeIds = new Set();
    policyNodeIds = [];
    policyNodeIdSet = new Set();
    metricNodeDefaults = {};
    graphNodeRegistryRows = [];
    policyFiscalRows = [];
    pendingPolicyRows = [];
    pendingMetricRows = [];
    pendingCalibrationRows = [];
    governmentDemandCalibrationFactor = 1;
}

function ensureNodeRegistryReady() {
    if (!isNodeRegistryDataReady()) {
        throw new Error('Node registry is not loaded. Load engine/policies.csv and engine/metrics.csv before using node-dependent runtime APIs.');
    }
}

function finalizeNodeRegistryLoad() {
    if (!nodeRegistryLoadState.policiesLoaded || !nodeRegistryLoadState.metricsLoaded) {
        nodeRegistryLoadState.loaded = false;
        return [];
    }
    const parsedRows = [...pendingPolicyRows, ...pendingMetricRows];
    const calibratedRows = applyCalibrationLockedValues(parsedRows, pendingCalibrationRows);
    assertNodeRegistryParity(calibratedRows);
    rebuildNodeRegistryIndexes(calibratedRows);
    nodeRegistryLoadState.loaded = true;
    nodeRegistryLoadState.error = null;
    return nodeRegistryRows;
}

async function loadPoliciesCsv(url = 'engine/policies.csv') {
    nodeRegistryLoadState.loading = true;
    nodeRegistryLoadState.loaded = false;
    nodeRegistryLoadState.error = null;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        const text = await response.text();
        pendingPolicyRows = parsePoliciesCsv(text);
        nodeRegistryLoadState.policiesLoaded = true;
        const rows = finalizeNodeRegistryLoad();
        nodeRegistryLoadState.loading = false;
        return rows;
    } catch (error) {
        resetNodeRegistryData();
        nodeRegistryLoadState.policiesLoaded = false;
        nodeRegistryLoadState.metricsLoaded = false;
        nodeRegistryLoadState.loading = false;
        nodeRegistryLoadState.loaded = false;
        nodeRegistryLoadState.error = error?.message || 'Unknown error while loading policies CSV.';
        throw error;
    }
}

async function loadMetricsCsv(url = 'engine/metrics.csv') {
    nodeRegistryLoadState.loading = true;
    nodeRegistryLoadState.loaded = false;
    nodeRegistryLoadState.error = null;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        const text = await response.text();
        pendingMetricRows = parseMetricsCsv(text);
        nodeRegistryLoadState.metricsLoaded = true;
        const rows = finalizeNodeRegistryLoad();
        nodeRegistryLoadState.loading = false;
        return rows;
    } catch (error) {
        resetNodeRegistryData();
        nodeRegistryLoadState.policiesLoaded = false;
        nodeRegistryLoadState.metricsLoaded = false;
        nodeRegistryLoadState.loading = false;
        nodeRegistryLoadState.loaded = false;
        nodeRegistryLoadState.error = error?.message || 'Unknown error while loading metrics CSV.';
        throw error;
    }
}

async function loadCalibrationTargetsCsv(url = 'engine/calibration_targets_template.csv') {
    nodeRegistryLoadState.loading = true;
    nodeRegistryLoadState.loaded = false;
    nodeRegistryLoadState.error = null;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        const text = await response.text();
        pendingCalibrationRows = parseCalibrationTargetsCsv(text);
        const rows = finalizeNodeRegistryLoad();
        nodeRegistryLoadState.loading = false;
        return rows;
    } catch (error) {
        resetNodeRegistryData();
        nodeRegistryLoadState.policiesLoaded = false;
        nodeRegistryLoadState.metricsLoaded = false;
        nodeRegistryLoadState.loading = false;
        nodeRegistryLoadState.loaded = false;
        nodeRegistryLoadState.error = error?.message || 'Unknown error while loading calibration targets CSV.';
        throw error;
    }
}

function isNodeRegistryDataReady() {
    return nodeRegistryLoadState.loaded === true
        && nodeRegistryLoadState.policiesLoaded === true
        && nodeRegistryLoadState.metricsLoaded === true
        && nodeRegistryRows.length > 0;
}

function getNodeRegistryRows() {
    return nodeRegistryRows.map((row) => ({ ...row }));
}

function getNodeRegistryRowById(nodeId) {
    const row = nodeRegistryById.get(nodeId);
    return row ? { ...row } : null;
}

function getKnownNodeIds() {
    ensureNodeRegistryReady();
    return new Set(knownNodeIds);
}

function getPolicyNodeIds() {
    ensureNodeRegistryReady();
    return [...policyNodeIds];
}

function getMetricNodeDefaults() {
    ensureNodeRegistryReady();
    return Object.fromEntries(
        Object.entries(metricNodeDefaults).map(([nodeId, defaults]) => [nodeId, { ...defaults }])
    );
}

function getGraphNodeRegistryRows() {
    ensureNodeRegistryReady();
    return graphNodeRegistryRows.map((row) => ({ ...row }));
}

function getPolicyFiscalRows() {
    ensureNodeRegistryReady();
    return policyFiscalRows.map((row) => ({ ...row }));
}

function toFiniteNumberOrNull(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
}

function getNodeBounds(nodeId) {
    const node = nodeRegistryById.get(nodeId);
    const min = toFiniteNumberOrNull(node?.min);
    const max = toFiniteNumberOrNull(node?.max);
    if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
        return { min, max };
    }
    return { min: 0, max: 1 };
}

function interpolateValue(min, max, t) {
    return min + ((max - min) * t);
}

function buildEquationSampleContexts(sourceNodeId, targetNodeId) {
    const sourceBounds = getNodeBounds(sourceNodeId);
    const targetBounds = getNodeBounds(targetNodeId);
    const sampleX = [0, 0.25, 0.5, 0.75, 1];
    return sampleX.map((x) => ({
        x,
        x_raw: interpolateValue(sourceBounds.min, sourceBounds.max, x),
        x_min: sourceBounds.min,
        x_max: sourceBounds.max,
        target_min: targetBounds.min,
        target_max: targetBounds.max
    }));
}

function validateEquationSignBySamples(compiledEquation, sign, sampleContexts, edgeLabel) {
    let hasPositive = false;
    let hasNegative = false;
    sampleContexts.forEach((context) => {
        const value = evaluateCompiledEdgeEquation(compiledEquation, context, edgeLabel);
        if (value > 1e-9) hasPositive = true;
        if (value < -1e-9) hasNegative = true;
    });
    if (sign === 'positive' && hasNegative) {
        throw new Error(`Sign/equation mismatch for "${edgeLabel}": sign=positive but sampled equation output is negative.`);
    }
    if (sign === 'negative' && hasPositive) {
        throw new Error(`Sign/equation mismatch for "${edgeLabel}": sign=negative but sampled equation output is positive.`);
    }
    if (sign === 'mixed') {
        return;
    }
}

function computeEquationMagnitudeHint(compiledEquation, sourceNodeId, targetNodeId, edgeLabel) {
    const sourceBounds = getNodeBounds(sourceNodeId);
    const targetBounds = getNodeBounds(targetNodeId);
    const context = {
        x: 0.5,
        x_raw: interpolateValue(sourceBounds.min, sourceBounds.max, 0.5),
        x_min: sourceBounds.min,
        x_max: sourceBounds.max,
        target_min: targetBounds.min,
        target_max: targetBounds.max
    };
    const value = evaluateCompiledEdgeEquation(compiledEquation, context, edgeLabel);
    const magnitude = Math.abs(value);
    if (!Number.isFinite(magnitude)) {
        throw new Error(`Equation magnitude hint is non-finite for "${edgeLabel}".`);
    }
    return Math.max(0.05, magnitude);
}

function getRequiredBudgetAccountingEdgeKeys() {
    const keys = new Set();
    getPolicyFiscalRows().forEach((row) => {
        const hasCost = row.baseCost !== 0 || row.costSlope !== 0;
        const hasRevenue = row.baseRevenue !== 0 || row.revenueSlope !== 0;
        if (hasCost) keys.add(`${row.policyId}->budget.expenditure`);
        if (row.revenueChannel === 'tax') keys.add(`${row.policyId}->tax_revenue`);
        if (row.revenueChannel === 'non_tax' && hasRevenue) keys.add(`${row.policyId}->budget.income`);
    });
    keys.add('tax_revenue->budget.income');
    keys.add('budget.income->budget.deficit');
    keys.add('budget.expenditure->budget.deficit');
    keys.add('budget.deficit->budget.debt');
    keys.add('budget.debt->debt_to_gdp');
    keys.add('gdp->debt_to_gdp');
    keys.add('consumption->gdp');
    keys.add('investment->gdp');
    keys.add('government_demand->gdp');
    keys.add('netExports->gdp');
    return keys;
}

function parseCsv(csvText) {
    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) {
        throw new Error('relationships.csv must contain a header and at least one row.');
    }

    const header = parseCsvLine(lines[0]);
    const normalizedHeader = header.map((value) => String(value || '').trim().toLowerCase());
    const requiredHeader = [
        'source',
        'target',
        'sign',
        'equation',
        'edge_mode',
        'inertia',
        'target_class',
        'causal_mechanism',
        'evidence_source',
        'evidence_strength',
        'bidirectional_pair_id',
        'status',
        'review_notes'
    ];
    const headerIndexByName = new Map();
    normalizedHeader.forEach((column, index) => {
        headerIndexByName.set(column, index);
    });
    const missingColumns = requiredHeader.filter((column) => !headerIndexByName.has(column));
    if (missingColumns.length) {
        throw new Error(`Invalid CSV header. Missing required columns: ${missingColumns.join(', ')}`);
    }
    if (headerIndexByName.has('weight')) {
        throw new Error('Invalid CSV header: legacy "weight" column is no longer supported in active relationships.csv.');
    }

    const knownNodes = getKnownNodeIds();
    const seenPairs = new Set();
    const parsedEdges = [];
    const allowedStatus = new Set(['approved']);
    const accountingEdgeKeys = getRequiredBudgetAccountingEdgeKeys();

    function getCell(row, columnName) {
        const columnIndex = headerIndexByName.get(columnName);
        if (typeof columnIndex !== 'number') return '';
        return String(row[columnIndex] || '').trim();
    }

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
            continue;
        }
        const row = parseCsvLine(lines[i]);
        if (row.length !== header.length) {
            throw new Error(`Invalid CSV row ${i + 1}: expected ${header.length} columns.`);
        }

        const source = getCell(row, 'source');
        const target = getCell(row, 'target');
        const equationRaw = getCell(row, 'equation');
        const edgeModeRaw = getCell(row, 'edge_mode').toLowerCase();
        const inertiaRaw = getCell(row, 'inertia');
        const sign = getCell(row, 'sign').toLowerCase();
        const targetClass = getCell(row, 'target_class').toLowerCase();
        const evidenceStrength = getCell(row, 'evidence_strength').toLowerCase();
        const status = getCell(row, 'status').toLowerCase();
        const causalMechanism = getCell(row, 'causal_mechanism');
        const evidenceSource = getCell(row, 'evidence_source');
        const inertia = Number(inertiaRaw);
        const pairKey = `${source}->${target}`;
        const edgeLabel = `${source}->${target}`;
        let compiledEquation = null;

        if (!source) throw new Error(`Missing source on row ${i + 1}.`);
        if (!target) throw new Error(`Missing target on row ${i + 1}.`);
        if (!['positive', 'negative', 'mixed'].includes(sign)) {
            throw new Error(`Invalid sign "${sign}" on row ${i + 1}.`);
        }
        if (!equationRaw) {
            throw new Error(`Missing equation on row ${i + 1} (${edgeLabel}).`);
        }
        if (!EDGE_MODE_ALLOWED.has(edgeModeRaw)) {
            throw new Error(`Invalid edge_mode "${edgeModeRaw}" on row ${i + 1}.`);
        }
        if (sign === 'mixed' && edgeModeRaw !== EDGE_MODE_ACCOUNTING) {
            throw new Error(`Invalid sign "${sign}" on row ${i + 1}: mixed sign is only allowed for edge_mode=${EDGE_MODE_ACCOUNTING}.`);
        }
        if (!['fast', 'medium', 'slow'].includes(targetClass)) {
            throw new Error(`Invalid target_class "${targetClass}" on row ${i + 1}.`);
        }
        if (!causalMechanism) throw new Error(`Missing causal_mechanism on row ${i + 1}.`);
        if (!evidenceSource) throw new Error(`Missing evidence_source on row ${i + 1}.`);
        if (!['high', 'medium', 'low'].includes(evidenceStrength)) {
            throw new Error(`Invalid evidence_strength "${evidenceStrength}" on row ${i + 1}.`);
        }
        if (!allowedStatus.has(status)) {
            throw new Error(`Invalid status "${status}" on row ${i + 1}. Active registry must be approved-only.`);
        }
        if (!knownNodes.has(source)) throw new Error(`Unknown Source "${source}" on row ${i + 1}.`);
        if (!knownNodes.has(target)) throw new Error(`Unknown Target "${target}" on row ${i + 1}.`);
        if (ACCOUNTING_TARGET_BLOCKLIST.has(target)) {
            throw new Error(`Invalid Target "${target}" on row ${i + 1}. Accounting targets are forbidden in CSV.`);
        }
        if (source === target) throw new Error(`Self-link "${source}" on row ${i + 1} is not allowed.`);
        if (!Number.isInteger(inertia) || inertia < 1) throw new Error(`Invalid Inertia "${inertiaRaw}" on row ${i + 1}.`);
        if (seenPairs.has(pairKey)) throw new Error(`Duplicate edge "${pairKey}" on row ${i + 1}.`);

        if (typeof compileEdgeEquation !== 'function' || typeof evaluateCompiledEdgeEquation !== 'function') {
            throw new Error(`Equation engine is unavailable while parsing "${edgeLabel}" on row ${i + 1}.`);
        }
        try {
            compiledEquation = compileEdgeEquation(equationRaw);
        } catch (error) {
            throw new Error(`Invalid equation for "${edgeLabel}" on row ${i + 1}: ${error.message}`);
        }
        const sampleContexts = buildEquationSampleContexts(source, target);
        try {
            validateEquationSignBySamples(compiledEquation, sign, sampleContexts, edgeLabel);
        } catch (error) {
            throw new Error(`Equation validation failed for "${edgeLabel}" on row ${i + 1}: ${error.message}`);
        }

        seenPairs.add(pairKey);
        if (accountingEdgeKeys.has(pairKey) && edgeModeRaw !== EDGE_MODE_ACCOUNTING) {
            throw new Error(`Required accounting edge "${pairKey}" must use edge_mode=${EDGE_MODE_ACCOUNTING}.`);
        }
        if (policyNodeIdSet.has(target)) {
            throw new Error(`Invalid Target "${target}" on row ${i + 1}: policy nodes are exogenous and cannot have inbound edges.`);
        }
        const equationMagnitudeHint = computeEquationMagnitudeHint(compiledEquation, source, target, edgeLabel);
        parsedEdges.push({
            source,
            target,
            sign,
            equation: equationRaw,
            compiledEquation,
            edgeMode: edgeModeRaw,
            inertia,
            inertiaWeight: equationMagnitudeHint,
            driver: `csv:${source}->${target}`
        });
    }

    if (parsedEdges.length === 0) {
        throw new Error('No approved edges available in relationships.csv. Add at least one approved row.');
    }

    return parsedEdges;
}

function getEdgeKey(source, target) {
    return `${source}->${target}`;
}

function hasRequiredBudgetSign(edge, expectedSign) {
    if (!edge) return false;
    const sign = String(edge.sign || '').toLowerCase();
    if (expectedSign === 'mixed') return sign === 'mixed';
    return sign === expectedSign;
}

function validateRequiredBudgetEdges(edges) {
    const edgeByKey = new Map(edges.map((edge) => [getEdgeKey(edge.source, edge.target), edge]));
    const requiredEdges = [];

    getPolicyFiscalRows().forEach((row) => {
        const hasRevenue = row.baseRevenue !== 0 || row.revenueSlope !== 0;
        if (row.baseCost !== 0 || row.costSlope !== 0) {
            requiredEdges.push({
                source: row.policyId,
                target: 'budget.expenditure',
                expectedSign: 'positive'
            });
        }
        if (row.revenueChannel === 'tax') {
            requiredEdges.push({
                source: row.policyId,
                target: 'tax_revenue',
                expectedSign: 'positive'
            });
        }
        if (row.revenueChannel === 'non_tax' && hasRevenue) {
            requiredEdges.push({
                source: row.policyId,
                target: 'budget.income',
                expectedSign: 'positive'
            });
        }
    });

    requiredEdges.push(
        { source: 'tax_revenue', target: 'budget.income', expectedSign: 'positive' },
        { source: 'budget.income', target: 'budget.deficit', expectedSign: 'negative' },
        { source: 'budget.expenditure', target: 'budget.deficit', expectedSign: 'positive' },
        { source: 'budget.deficit', target: 'budget.debt', expectedSign: 'positive' },
        { source: 'budget.debt', target: 'debt_to_gdp', expectedSign: 'positive' },
        { source: 'gdp', target: 'debt_to_gdp', expectedSign: 'negative' },
        { source: 'consumption', target: 'gdp', expectedSign: 'positive' },
        { source: 'investment', target: 'gdp', expectedSign: 'positive' },
        { source: 'government_demand', target: 'gdp', expectedSign: 'positive' },
        { source: 'netExports', target: 'gdp', expectedSign: 'mixed' }
    );

    requiredEdges.forEach((requiredEdge) => {
        const edgeKey = getEdgeKey(requiredEdge.source, requiredEdge.target);
        const edge = edgeByKey.get(edgeKey);
        if (!edge) {
            throw new Error(`Missing required budget edge "${edgeKey}".`);
        }
        if (!hasRequiredBudgetSign(edge, requiredEdge.expectedSign)) {
            throw new Error(`Invalid sign for "${edgeKey}": expected ${requiredEdge.expectedSign}.`);
        }
    });
}

function rebuildEdgeIndexes(edges) {
    edgesByTarget = new Map();
    relationshipNodeIds = new Set();

    edges.forEach((edge) => {
        relationshipNodeIds.add(edge.source);
        relationshipNodeIds.add(edge.target);
        if (!edgesByTarget.has(edge.target)) edgesByTarget.set(edge.target, []);
        edgesByTarget.get(edge.target).push(edge);
    });
}

async function loadRelationshipsCsv(url = 'engine/relationships.csv') {
    ensureNodeRegistryReady();
    relationshipLoadState.loading = true;
    relationshipLoadState.loaded = false;
    relationshipLoadState.error = null;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        const text = await response.text();
        const parsed = parseCsv(text);
        validateRequiredBudgetEdges(parsed);
        relationshipEdges = parsed;
        rebuildEdgeIndexes(relationshipEdges);

        relationshipLoadState.loading = false;
        relationshipLoadState.loaded = true;
        relationshipLoadState.error = null;
        return relationshipEdges;
    } catch (error) {
        relationshipEdges = [];
        rebuildEdgeIndexes(relationshipEdges);
        relationshipLoadState.loading = false;
        relationshipLoadState.loaded = false;
        relationshipLoadState.error = error?.message || 'Unknown error while loading relationships CSV.';
        throw error;
    }
}

function isRelationshipDataReady() {
    return relationshipLoadState.loaded === true && relationshipEdges.length > 0;
}

function getRelationshipRules() {
    return relationshipEdges.map((edge) => ({ ...edge }));
}

function getGraphLinksFromRules() {
    if (!isRelationshipDataReady()) return [];
    return relationshipEdges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        equation: edge.equation || '',
        edgeMode: edge.edgeMode || EDGE_MODE_BEHAVIORAL,
        sign: edge.sign || 'positive',
        inertia: edge.inertia,
        driver: edge.driver,
        direct: true,
        polarity: edge.sign || 'positive',
        magnitude: Number.isFinite(edge.inertiaWeight) ? edge.inertiaWeight : 0.05
    }));
}

function getInboundEdges(targetId) {
    return edgesByTarget.get(targetId) || [];
}

function getStateValueByNodeId(state, nodeId) {
    if (!state || !nodeId) return null;
    const node = nodeRegistryById.get(nodeId);
    if (!node) return null;
    const value = getValueAtPath(state, node.storagePath);
    return (typeof value === 'number' && Number.isFinite(value)) ? value : null;
}

function buildNodeConfigsFromState(state) {
    ensureNodeRegistryReady();
    const nextConfigs = {};
    const anchoredBaseValues = state?.simulationConfig?.baseValues || {};
    Object.entries(metricNodeDefaults).forEach(([nodeId, defaults]) => {
        const anchored = anchoredBaseValues[nodeId];
        const raw = getStateValueByNodeId(state, nodeId);
        const baseValue = Number.isFinite(anchored)
            ? clamp01(anchored)
            : normalizeWithRange(raw, defaults.min, defaults.max);
        nextConfigs[nodeId] = {
            ...defaults,
            baseValue: clamp01(baseValue)
        };
    });
    nodeConfigs = nextConfigs;
    return nodeConfigs;
}

function initializeSimulationNodes(state) {
    if (!state) return;
    const configs = buildNodeConfigsFromState(state);
    const simNodes = {};
    Object.keys(configs).forEach((nodeId) => {
        simNodes[nodeId] = {
            current: configs[nodeId].baseValue,
            target: configs[nodeId].baseValue
        };
    });

    state.simulation = {
        nodes: simNodes
    };
}

function ensureSimulationState(state) {
    if (!state) return;
    if (!state.simulation || !state.simulation.nodes) {
        initializeSimulationNodes(state);
        return;
    }

    if (Object.keys(nodeConfigs).length === 0) {
        buildNodeConfigsFromState(state);
    }

    Object.keys(nodeConfigs).forEach((nodeId) => {
        if (!state.simulation.nodes[nodeId]) {
            const cfg = nodeConfigs[nodeId];
            state.simulation.nodes[nodeId] = {
                current: cfg.baseValue,
                target: cfg.baseValue
            };
        }
    });
}

function getNormalizedValueByNodeId(state, nodeId, nodeSnapshot) {
    const sourceValue = getStateValueByNodeId(state, nodeId);
    const nodeRow = nodeRegistryById.get(nodeId);

    if (policyNodeIdSet.has(nodeId)) {
        if (!nodeRow || !Number.isFinite(sourceValue)) return 0;
        return normalizeWithRange(sourceValue, nodeRow.min, nodeRow.max);
    }

    if (nodeSnapshot && nodeSnapshot[nodeId]) {
        return clamp01(nodeSnapshot[nodeId].current);
    }

    if (state.simulation && state.simulation.nodes && state.simulation.nodes[nodeId]) {
        return clamp01(state.simulation.nodes[nodeId].current);
    }

    const cfg = nodeConfigs[nodeId];
    if (cfg && Number.isFinite(sourceValue)) {
        return normalizeWithRange(sourceValue, cfg.min, cfg.max);
    }

    if (nodeRow && nodeRow.nodeType === 'metric' && Number.isFinite(sourceValue)) {
        return normalizeWithRange(sourceValue, nodeRow.min, nodeRow.max);
    }

    return 0;
}

function buildEdgeEvaluationContext(state, edge, nodeSnapshot) {
    const sourceBounds = getNodeBounds(edge.source);
    const targetBounds = getNodeBounds(edge.target);
    const sourceNorm = getNormalizedValueByNodeId(state, edge.source, nodeSnapshot);
    const sourceRaw = getStateValueByNodeId(state, edge.source);
    const safeRaw = Number.isFinite(sourceRaw)
        ? sourceRaw
        : interpolateValue(sourceBounds.min, sourceBounds.max, sourceNorm);
    return {
        x: sourceNorm,
        x_raw: safeRaw,
        x_min: sourceBounds.min,
        x_max: sourceBounds.max,
        target_min: targetBounds.min,
        target_max: targetBounds.max
    };
}

function evaluateEdgeContribution(edge, context, options = {}) {
    if (!edge) return 0;
    const forSimulation = options.forSimulation === true;
    if (forSimulation && edge.edgeMode !== EDGE_MODE_BEHAVIORAL) {
        return 0;
    }
    if (!edge.compiledEquation) return 0;
    const equationLabel = edge.driver || `${edge.source}->${edge.target}`;
    const value = evaluateCompiledEdgeEquation(edge.compiledEquation, context, equationLabel);
    if (!Number.isFinite(value)) return 0;
    return value;
}

function computeRawImpactSum(state, targetId, nodeSnapshot) {
    const inboundEdges = getInboundEdges(targetId);
    if (!inboundEdges.length) return 0;
    return inboundEdges.reduce((sum, edge) => {
        const context = buildEdgeEvaluationContext(state, edge, nodeSnapshot);
        const contribution = evaluateEdgeContribution(edge, context, { forSimulation: true });
        return sum + contribution;
    }, 0);
}

function computeTargetValueFromRaw(rawImpact, config) {
    const modifier = logistic(rawImpact, config.k) - 0.5;
    const scaledModifier = modifier * 2 * config.modifierRange;
    return clamp01(config.baseValue + scaledModifier);
}

function computeEffectiveInertia(inboundEdges) {
    if (!inboundEdges || inboundEdges.length === 0) return 3;
    let weightedSum = 0;
    let magnitudeSum = 0;
    inboundEdges.forEach((edge) => {
        if (edge.edgeMode !== EDGE_MODE_BEHAVIORAL) return;
        const magnitude = Number.isFinite(edge.inertiaWeight)
            ? edge.inertiaWeight
            : 0.05;
        weightedSum += edge.inertia * magnitude;
        magnitudeSum += magnitude;
    });
    if (magnitudeSum <= 0) return 3;
    return Math.max(1, weightedSum / magnitudeSum);
}

function applyInertiaStep(current, target, inertia) {
    const safeInertia = Math.max(1, inertia || 1);
    return clamp01(current + ((target - current) / safeInertia));
}

function computeNextSimulationNodes(state, nodeSnapshot) {
    const nextNodes = {};
    Object.keys(nodeConfigs).forEach((nodeId) => {
        const current = getNormalizedValueByNodeId(state, nodeId, nodeSnapshot);
        const inboundEdges = getInboundEdges(nodeId);
        const rawImpact = computeRawImpactSum(state, nodeId, nodeSnapshot);
        const target = computeTargetValueFromRaw(rawImpact, nodeConfigs[nodeId]);
        const inertia = computeEffectiveInertia(inboundEdges);
        const nextCurrent = applyInertiaStep(current, target, inertia);
        nextNodes[nodeId] = { current: nextCurrent, target };
    });
    return nextNodes;
}

function syncStateFromSimulation(state) {
    if (!state?.simulation?.nodes) return;

    Object.entries(nodeConfigs).forEach(([nodeId, cfg]) => {
        const normValue = state.simulation.nodes[nodeId]?.current ?? cfg.baseValue;
        const rawValue = denormalizeWithRange(normValue, cfg.min, cfg.max);
        const row = nodeRegistryById.get(nodeId);
        if (row) {
            setValueAtPath(state, row.storagePath, rawValue);
        }
    });
}

function stepRelationshipSimulation(state) {
    ensureSimulationState(state);
    if (!state?.simulation?.nodes) return null;

    const snapshot = {};
    Object.keys(state.simulation.nodes).forEach((nodeId) => {
        snapshot[nodeId] = { ...state.simulation.nodes[nodeId] };
    });

    const nextNodes = computeNextSimulationNodes(state, snapshot);
    state.simulation.nodes = nextNodes;
    syncStateFromSimulation(state);
    return nextNodes;
}

function projectOneStepRawMetrics(state) {
    ensureSimulationState(state);
    const snapshot = {};
    Object.keys(state.simulation.nodes).forEach((nodeId) => {
        snapshot[nodeId] = { ...state.simulation.nodes[nodeId] };
    });
    const projected = computeNextSimulationNodes(state, snapshot);
    const raw = {};

    Object.entries(nodeConfigs).forEach(([nodeId, cfg]) => {
        raw[nodeId] = denormalizeWithRange(projected[nodeId].current, cfg.min, cfg.max);
    });
    const projectedConsumption = Number.isFinite(raw.consumption)
        ? raw.consumption
        : (Number(getStateValueByNodeId(state, 'consumption')) || 0);
    const gfcfComponentNodeIds = [
        'gdp_investment_gfcf_dwellings_eur_m',
        'gdp_investment_gfcf_other_structures_eur_m',
        'gdp_investment_gfcf_transport_equip_eur_m',
        'gdp_investment_gfcf_ict_equip_eur_m',
        'gdp_investment_gfcf_other_machinery_weapons_eur_m',
        'gdp_investment_gfcf_cultivated_biological_eur_m',
        'gdp_investment_gfcf_ip_products_eur_m',
        'gdp_investment_gfcf_other_eur_m'
    ].filter((nodeId) => knownNodeIds.has(nodeId));
    const projectedInvestmentFromGfcf = gfcfComponentNodeIds.length > 0
        ? gfcfComponentNodeIds.reduce((sum, nodeId) => {
            const value = Number(getStateValueByNodeId(state, nodeId));
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0)
        : null;
    const projectedInvestment = Number.isFinite(projectedInvestmentFromGfcf)
        ? projectedInvestmentFromGfcf
        : (Number.isFinite(raw.investment)
            ? raw.investment
            : (Number(getStateValueByNodeId(state, 'investment')) || 0));
    const projectedNetExports = Number.isFinite(raw.netExports)
        ? raw.netExports
        : (Number(getStateValueByNodeId(state, 'netExports')) || 0);
    const projectedGovernmentDemandFromCofog = computeGovernmentDemandFromCofog(state);
    const projectedGovernmentDemand = Number.isFinite(projectedGovernmentDemandFromCofog)
        ? projectedGovernmentDemandFromCofog
        : calculateGovernmentDemand(state, computeBudgetEntries(state));
    const projectedGdp = projectedConsumption + projectedInvestment + projectedGovernmentDemand + projectedNetExports;
    const previousGdp = Number(getStateValueByNodeId(state, 'gdp')) || 0;

    raw.consumption = projectedConsumption;
    raw.investment = projectedInvestment;
    raw.netExports = projectedNetExports;
    raw.government_demand = projectedGovernmentDemand;
    raw.gdp = projectedGdp;
    raw.gdpGrowth = computeAnnualizedGrowth(previousGdp, projectedGdp);
    return raw;
}

function getCurrentGraphLinks(state) {
    const baseLinks = getGraphLinksFromRules();
    if (!state) return baseLinks;
    const edgeByDriver = new Map(relationshipEdges.map((edge) => [edge.driver, edge]));

    return baseLinks.map((link) => {
        const runtimeEdge = edgeByDriver.get(link.driver);
        const edge = runtimeEdge || link;
        const context = buildEdgeEvaluationContext(state, edge);
        const edgeMode = link.edgeMode || edge.edgeMode || EDGE_MODE_BEHAVIORAL;
        const evaluatedImpact = evaluateEdgeContribution(edge, context, { forSimulation: false });
        let effectiveImpact = evaluatedImpact;
        let effectiveMagnitude = Math.abs(evaluatedImpact);

        if (edgeMode === EDGE_MODE_ACCOUNTING) {
            // Accounting links are deterministic trace edges; cap their visual magnitude so
            // large raw values (e.g., population stock) do not overwhelm graph layout.
            const hintMagnitude = Number.isFinite(edge.inertiaWeight) ? edge.inertiaWeight : 0.05;
            const cappedMagnitude = clamp(hintMagnitude, 0.06, 0.35);
            const declaredSign = String(link.sign || edge.sign || 'neutral').toLowerCase();
            let signSeed = 0;
            if (declaredSign === 'positive') signSeed = 1;
            if (declaredSign === 'negative') signSeed = -1;
            if (declaredSign === 'mixed') {
                signSeed = evaluatedImpact > 0 ? 1 : (evaluatedImpact < 0 ? -1 : 0);
            }
            effectiveImpact = signSeed === 0 ? 0 : (cappedMagnitude * signSeed);
            effectiveMagnitude = cappedMagnitude;
        }

        return {
            ...link,
            sourceNorm: Number.isFinite(context.x) ? context.x : 0,
            effectiveImpact,
            evaluatedContribution: effectiveImpact,
            magnitude: effectiveMagnitude,
            edgeMode,
            equation: link.equation || edge.equation || '',
            sign: link.sign || edge.sign || 'positive',
            polarity: effectiveImpact > 0
                ? 'positive'
                : (effectiveImpact < 0 ? 'negative' : (link.sign || edge.sign || 'neutral'))
        };
    });
}

function getPolicyIntensity(state, policyRow) {
    const rawValue = getStateValueByNodeId(state, policyRow.policyId);
    if (!Number.isFinite(rawValue)) return 0;
    if (!Number.isFinite(policyRow.min) || !Number.isFinite(policyRow.max) || policyRow.max <= policyRow.min) return 0;
    return clamp01((rawValue - policyRow.min) / (policyRow.max - policyRow.min));
}

function getBudgetScaleFactor(state) {
    const currentGdp = Math.max(1, Number(state?.economy?.gdp) || 1);
    const gdpNodeRow = nodeRegistryById.get('gdp');
    const referenceGdp = Number(gdpNodeRow?.initialValue) > 0
        ? Number(gdpNodeRow.initialValue)
        : currentGdp;
    return currentGdp / referenceGdp;
}

function computeBudgetEntries(state) {
    const scaleFactor = getBudgetScaleFactor(state);
    return policyFiscalRows.map((row) => {
        const intensity = getPolicyIntensity(state, row);
        const scale = row.gdpScaled ? scaleFactor : 1;
        const costValue = (row.baseCost + (row.costSlope * intensity)) * scale;
        const revenueValue = (row.baseRevenue + (row.revenueSlope * intensity)) * scale;
        return {
            policyId: row.policyId,
            costValue: Number.isFinite(costValue) ? costValue : 0,
            revenueValue: Number.isFinite(revenueValue) ? revenueValue : 0,
            revenueChannel: row.revenueChannel || 'none'
        };
    });
}

function calculateGovernmentDemand(state, entries) {
    const effectiveEntries = Array.isArray(entries) ? entries : computeBudgetEntries(state);
    const demandShareByPolicy = new Map(
        policyFiscalRows.map((row) => [row.policyId, Number.isFinite(row.gdpDemandShare) ? row.gdpDemandShare : 0])
    );
    const demandValue = effectiveEntries.reduce((sum, entry) => {
        const share = demandShareByPolicy.get(entry.policyId) || 0;
        return sum + (entry.costValue * share);
    }, 0);
    const calibratedValue = demandValue * governmentDemandCalibrationFactor;
    return Number.isFinite(calibratedValue) ? calibratedValue : 0;
}

function sumFiniteNodeValues(state, nodeIds) {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) return 0;
    return nodeIds.reduce((sum, nodeId) => {
        const value = Number(getStateValueByNodeId(state, nodeId));
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
}

function getGovExpDivisionNodeIds() {
    return [...knownNodeIds]
        .filter((nodeId) => /^gdp_gov_exp_[a-z_]+_eur_m$/.test(nodeId))
        .filter((nodeId) => nodeId !== 'gdp_gov_exp_other_eur_m')
        .filter((nodeId) => !/_GF\d{4}_/.test(nodeId))
        .sort((a, b) => a.localeCompare(b));
}

function getGovExpSubNodeIdsForDivision(divisionNodeId) {
    if (!divisionNodeId || !divisionNodeId.endsWith('_eur_m')) return [];
    const prefix = divisionNodeId.replace(/_eur_m$/, '_');
    return [...knownNodeIds]
        .filter((nodeId) => nodeId.startsWith(prefix))
        .filter((nodeId) => nodeId.endsWith('_eur_m'))
        .filter((nodeId) => nodeId !== divisionNodeId)
        .sort((a, b) => a.localeCompare(b));
}

function computeGovernmentDemandFromCofog(state) {
    const divisionNodeIds = getGovExpDivisionNodeIds();
    if (divisionNodeIds.length === 0) return null;

    divisionNodeIds.forEach((divisionNodeId) => {
        const subNodeIds = getGovExpSubNodeIdsForDivision(divisionNodeId);
        if (subNodeIds.length === 0) return;
        const subtotal = sumFiniteNodeValues(state, subNodeIds);
        if (!Number.isFinite(subtotal)) return;
        const row = nodeRegistryById.get(divisionNodeId);
        if (row) {
            setValueAtPath(state, row.storagePath, subtotal);
        }
    });

    const topNodeIds = [...divisionNodeIds];
    if (knownNodeIds.has('gdp_gov_exp_other_eur_m')) {
        topNodeIds.push('gdp_gov_exp_other_eur_m');
    }
    const total = sumFiniteNodeValues(state, topNodeIds);
    return Number.isFinite(total) ? total : null;
}

function computeAnnualizedGrowth(previousValue, nextValue) {
    if (!Number.isFinite(previousValue) || previousValue <= 0) return 0;
    if (!Number.isFinite(nextValue)) return 0;
    const monthlyGrowth = (nextValue - previousValue) / previousValue;
    return clamp(monthlyGrowth * 12, -0.1, 0.1);
}

function toTitleWord(word) {
    const upperAcronyms = {
        al: 'AL',
        nhr: 'NHR',
        vat: 'VAT',
        gdp: 'GDP',
        sns: 'SNS'
    };
    const normalized = String(word || '').toLowerCase();
    if (upperAcronyms[normalized]) return upperAcronyms[normalized];
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function humanizePolicySegment(segment) {
    const split = String(segment || '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    return split.map((word) => toTitleWord(word)).join(' ');
}

function formatBudgetPolicyLabel(policyId) {
    if (!policyId) return 'Unknown';
    if (!policyId.includes('.')) {
        return humanizePolicySegment(policyId);
    }
    const [category, name] = policyId.split('.');
    return `${humanizePolicySegment(category)}: ${humanizePolicySegment(name)}`;
}

function buildBudgetBreakdown(entries, total) {
    const filtered = entries
        .filter((item) => item.value > 0)
        .map((item) => ({
            policyId: item.policyId,
            label: formatBudgetPolicyLabel(item.policyId),
            value: item.value
        }))
        .sort((a, b) => b.value - a.value)
        .map((item) => ({
            ...item,
            percent: total > 0 ? (item.value / total) * 100 : 0
        }));
    return {
        total,
        slices: filtered
    };
}

// Calculate annualized budget arithmetic and realize only monthly debt accumulation.
function calculateBudget(state) {
    ensureNodeRegistryReady();
    const entries = computeBudgetEntries(state);
    const annualTaxIncome = entries
        .filter((item) => item.revenueChannel === 'tax')
        .reduce((sum, item) => sum + item.revenueValue, 0);
    const annualNonTaxIncome = entries
        .filter((item) => item.revenueChannel === 'non_tax')
        .reduce((sum, item) => sum + item.revenueValue, 0);
    const annualIncome = annualTaxIncome + annualNonTaxIncome;
    const annualExpenditure = entries.reduce((sum, item) => sum + item.costValue, 0);

    const annualDeficit = annualExpenditure - annualIncome;
    const monthlyDeficit = annualDeficit / 12;
    const currentDebt = Math.max(0, Number(state?.budget?.debt) || 0);
    const nextDebt = Math.max(0, currentDebt + monthlyDeficit);

    return {
        income: annualIncome,
        expenditure: annualExpenditure,
        deficit: annualDeficit,
        debt: nextDebt
    };
}

function recomputeDerivedEconomyMetrics(state) {
    if (!state?.economy) return;

    const exportGoodsComponentNodeIds = getTradeComponentNodeIds('exports_goods_hs', 'exports_goods_other_eur_m');
    const importGoodsComponentNodeIds = getTradeComponentNodeIds('imports_goods_hs', 'imports_goods_other_eur_m');
    const exportServiceComponentNodeIds = getServiceComponentNodeIds('exports_services_ebops_', 'exports_services_other_eur_m');
    const importServiceComponentNodeIds = getServiceComponentNodeIds('imports_services_ebops_', 'imports_services_other_eur_m');

    const exportsGoodsTotalByComponents = exportGoodsComponentNodeIds.reduce((sum, nodeId) => {
        const value = Number(getStateValueByNodeId(state, nodeId));
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    const importsGoodsTotalByComponents = importGoodsComponentNodeIds.reduce((sum, nodeId) => {
        const value = Number(getStateValueByNodeId(state, nodeId));
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    if (Number.isFinite(exportsGoodsTotalByComponents) && exportsGoodsTotalByComponents > 0) {
        state.economy.exports_goods_total_eur_m = exportsGoodsTotalByComponents;
    }
    if (Number.isFinite(importsGoodsTotalByComponents) && importsGoodsTotalByComponents > 0) {
        state.economy.imports_goods_total_eur_m = importsGoodsTotalByComponents;
    }

    const exportsServicesTotalByComponents = exportServiceComponentNodeIds.reduce((sum, nodeId) => {
        const value = Number(getStateValueByNodeId(state, nodeId));
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    const importsServicesTotalByComponents = importServiceComponentNodeIds.reduce((sum, nodeId) => {
        const value = Number(getStateValueByNodeId(state, nodeId));
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    if (exportServiceComponentNodeIds.length > 0 && Number.isFinite(exportsServicesTotalByComponents) && exportsServicesTotalByComponents >= 0) {
        state.economy.exports_services_total_eur_m = exportsServicesTotalByComponents;
    }
    if (importServiceComponentNodeIds.length > 0 && Number.isFinite(importsServicesTotalByComponents) && importsServicesTotalByComponents >= 0) {
        state.economy.imports_services_total_eur_m = importsServicesTotalByComponents;
    }

    const gfcfComponentNodeIds = [
        'gdp_investment_gfcf_dwellings_eur_m',
        'gdp_investment_gfcf_other_structures_eur_m',
        'gdp_investment_gfcf_transport_equip_eur_m',
        'gdp_investment_gfcf_ict_equip_eur_m',
        'gdp_investment_gfcf_other_machinery_weapons_eur_m',
        'gdp_investment_gfcf_cultivated_biological_eur_m',
        'gdp_investment_gfcf_ip_products_eur_m',
        'gdp_investment_gfcf_other_eur_m'
    ].filter((nodeId) => knownNodeIds.has(nodeId));
    if (gfcfComponentNodeIds.length > 0) {
        const gfcfTotalByComponents = gfcfComponentNodeIds.reduce((sum, nodeId) => {
            const value = Number(getStateValueByNodeId(state, nodeId));
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);
        if (Number.isFinite(gfcfTotalByComponents)) {
            if (knownNodeIds.has('investment')) {
                state.economy.investment = gfcfTotalByComponents;
            }
        }
    }

    const exportsGoodsValue = Number(getStateValueByNodeId(state, 'exports_goods_total_eur_m'));
    const importsGoodsValue = Number(getStateValueByNodeId(state, 'imports_goods_total_eur_m'));
    if (Number.isFinite(exportsGoodsValue) && Number.isFinite(importsGoodsValue)) {
        state.economy.net_goods_trade_eur_m = exportsGoodsValue - importsGoodsValue;
    }

    const netGoodsTradeValue = Number(getStateValueByNodeId(state, 'net_goods_trade_eur_m'));
    const netServicesTradeValue = Number(getStateValueByNodeId(state, 'net_services_trade_eur_m'));
    if (Number.isFinite(netGoodsTradeValue) && Number.isFinite(netServicesTradeValue)) {
        state.economy.netExports = netGoodsTradeValue + netServicesTradeValue;
    }

    const previousGdp = Number(getStateValueByNodeId(state, 'gdp')) || 0;
    const consumptionValue = Number(getStateValueByNodeId(state, 'consumption')) || 0;
    const investmentValue = Number(getStateValueByNodeId(state, 'investment')) || 0;
    const netExportsValue = Number(getStateValueByNodeId(state, 'netExports')) || 0;
    const budgetEntries = computeBudgetEntries(state);
    const deterministicGovernmentDemand = computeGovernmentDemandFromCofog(state);
    const policyGovernmentDemand = calculateGovernmentDemand(state, budgetEntries);
    const governmentDemandValue = Number.isFinite(deterministicGovernmentDemand)
        ? deterministicGovernmentDemand
        : policyGovernmentDemand;
    const nextGdp = consumptionValue + investmentValue + governmentDemandValue + netExportsValue;

    state.economy.government_demand = Number.isFinite(governmentDemandValue) ? governmentDemandValue : 0;
    state.economy.gdp = Number.isFinite(nextGdp) ? nextGdp : 0;
    state.economy.gdpGrowth = computeAnnualizedGrowth(previousGdp, state.economy.gdp);

    const debtValue = getStateValueByNodeId(state, 'budget.debt');
    const safeDebt = Number.isFinite(debtValue) ? debtValue : 0;
    const safeGdp = Number.isFinite(state.economy.gdp) && state.economy.gdp > 0 ? state.economy.gdp : 0;
    const debtToGdp = safeGdp > 0 ? (safeDebt / safeGdp) * 100 : 0;
    state.economy.debt_to_gdp = Number.isFinite(debtToGdp) ? debtToGdp : 0;
}

function recomputeDerivedPopulationMetrics(state, options = {}) {
    if (!state?.population) return;
    const applyStockUpdate = options.applyStockUpdate !== false;

    const populationState = state.population;
    const currentPopulation = Math.max(0, Number(populationState.total) || 0);
    if (currentPopulation <= 0) return;

    const totalFertilityRate = Math.max(0, Number(populationState.total_fertility_rate) || 0);
    const fertilityToBirthRateFactor = Math.max(0, Number(populationState.fertility_to_birth_rate_factor) || 0);
    const crudeBirthRate = totalFertilityRate * fertilityToBirthRateFactor;
    const birthsAnnualRaw = (currentPopulation * crudeBirthRate) / 1000;

    const immigrationRate = Math.max(0, Number(populationState.immigration_rate_per_1000) || 0);
    const emigrationRate = Math.max(0, Number(populationState.emigration_rate_per_1000) || 0);
    const migrationInAnnualRaw = (currentPopulation * immigrationRate) / 1000;
    const migrationOutAnnualRaw = (currentPopulation * emigrationRate) / 1000;

    const strokeRate = Math.max(0, Number(populationState.stroke_mortality_rate_per_100k) || 0);
    const ischemicHeartRate = Math.max(0, Number(populationState.ischemic_heart_disease_mortality_rate_per_100k) || 0);
    const acuteMiRate = Math.max(0, Number(populationState.acute_myocardial_infarction_mortality_rate_per_100k) || 0);
    const respiratoryRate = Math.max(0, Number(populationState.respiratory_mortality_rate_per_100k) || 0);
    const lungCancerRate = Math.max(0, Number(populationState.lung_cancer_mortality_rate_per_100k) || 0);
    const colorectalCancerRate = Math.max(0, Number(populationState.colorectal_cancer_mortality_rate_per_100k) || 0);
    const covidRate = Math.max(0, Number(populationState.covid_mortality_rate_per_100k) || 0);
    const trafficRate = Math.max(0, Number(populationState.road_traffic_mortality_rate) || 0);
    const suicideRate = Math.max(0, Number(populationState.suicide_mortality_rate) || 0);
    const homicideRate = Math.max(0, Number(populationState.intentional_homicide_rate) || 0);
    const otherRate = Math.max(0, Number(populationState.other_mortality_rate_per_100k) || 0);

    const deathsStrokeRaw = (currentPopulation * strokeRate) / 100000;
    const deathsIschemicHeartRaw = (currentPopulation * ischemicHeartRate) / 100000;
    const deathsAcuteMiRaw = (currentPopulation * acuteMiRate) / 100000;
    const deathsRespiratoryRaw = (currentPopulation * respiratoryRate) / 100000;
    const deathsLungCancerRaw = (currentPopulation * lungCancerRate) / 100000;
    const deathsColorectalCancerRaw = (currentPopulation * colorectalCancerRate) / 100000;
    const deathsCovidRaw = (currentPopulation * covidRate) / 100000;
    const deathsTrafficRaw = (currentPopulation * trafficRate) / 100000;
    const deathsSuicideRaw = (currentPopulation * suicideRate) / 100000;
    const deathsHomicideRaw = (currentPopulation * homicideRate) / 100000;
    const deathsOtherRaw = (currentPopulation * otherRate) / 100000;

    const deathsStroke = Math.round(deathsStrokeRaw);
    const deathsIschemicHeart = Math.round(deathsIschemicHeartRaw);
    const deathsAcuteMi = Math.round(deathsAcuteMiRaw);
    const deathsCardiovascular = deathsStroke + deathsIschemicHeart + deathsAcuteMi;
    const deathsRespiratory = Math.round(deathsRespiratoryRaw);
    const deathsLungCancer = Math.round(deathsLungCancerRaw);
    const deathsColorectalCancer = Math.round(deathsColorectalCancerRaw);
    const deathsCovid = Math.round(deathsCovidRaw);
    const deathsTraffic = Math.round(deathsTrafficRaw);
    const deathsSuicide = Math.round(deathsSuicideRaw);
    const deathsHomicide = Math.round(deathsHomicideRaw);
    const deathsOther = Math.round(deathsOtherRaw);

    const deathsAnnual = deathsCardiovascular
        + deathsRespiratory
        + deathsLungCancer
        + deathsColorectalCancer
        + deathsCovid
        + deathsTraffic
        + deathsSuicide
        + deathsHomicide
        + deathsOther;

    const birthsAnnual = Math.round(birthsAnnualRaw);
    const migrationInAnnual = Math.round(migrationInAnnualRaw);
    const migrationOutAnnual = Math.round(migrationOutAnnualRaw);
    const naturalChangeAnnual = birthsAnnual - deathsAnnual;
    const netMigrationAnnual = migrationInAnnual - migrationOutAnnual;
    const populationChangeAnnual = naturalChangeAnnual + netMigrationAnnual;
    const nextPopulation = Math.max(0, Math.round(currentPopulation + (populationChangeAnnual / 12)));
    const populationForDerived = applyStockUpdate ? nextPopulation : currentPopulation;
    const crudeDeathRate = populationForDerived > 0 ? (deathsAnnual / populationForDerived) * 1000 : 0;
    const netMigrationRate = populationForDerived > 0 ? (netMigrationAnnual / populationForDerived) * 1000 : 0;
    const immigrationRateDerived = populationForDerived > 0 ? (migrationInAnnual / populationForDerived) * 1000 : 0;
    const emigrationRateDerived = populationForDerived > 0 ? (migrationOutAnnual / populationForDerived) * 1000 : 0;

    const landAreaKm2 = Math.max(1, Number(populationState.land_area_km2) || 0);
    const populationDensityImplied = populationForDerived / landAreaKm2;
    const averageHouseholdSize = Math.max(1.1, Number(populationState.average_household_size) || 0);
    const householdsTotal = Math.max(0, Math.round(populationForDerived / averageHouseholdSize));
    const housingStockTotal = Math.max(0, Math.round(Number(populationState.housing_stock_total) || 0));
    const vacantDwellings = Math.max(0, Math.round(Number(populationState.vacant_dwellings) || 0));
    const secondaryDwellings = Math.max(0, Math.round(Number(populationState.secondary_dwellings) || 0));
    const otherDwellingsResidual = Math.max(0, Math.round(Number(populationState.other_dwellings_residual) || 0));
    const occupiedDwellings = Math.max(0, Math.round(
        housingStockTotal - vacantDwellings - secondaryDwellings - otherDwellingsResidual
    ));
    const vacancyRatePercent = housingStockTotal > 0
        ? (vacantDwellings / housingStockTotal) * 100
        : 0;
    const ownerOccupiedSharePct = clamp(Number(populationState.owner_occupied_share) || 0, 0, 100);
    const ownerOccupiedDwellings = Math.max(0, Math.round(occupiedDwellings * (ownerOccupiedSharePct / 100)));
    const rentedDwellings = Math.max(0, occupiedDwellings - ownerOccupiedDwellings);

    populationState.crude_birth_rate_per_1000 = crudeBirthRate;
    populationState.crude_death_rate_per_1000 = crudeDeathRate;
    populationState.immigration_rate_per_1000 = immigrationRateDerived;
    populationState.emigration_rate_per_1000 = emigrationRateDerived;
    populationState.births_annual = birthsAnnual;
    populationState.deaths_annual = deathsAnnual;
    populationState.migration_in_annual = migrationInAnnual;
    populationState.migration_out_annual = migrationOutAnnual;
    populationState.natural_change_annual = naturalChangeAnnual;
    populationState.net_migration_annual = netMigrationAnnual;
    populationState.population_change_annual = populationChangeAnnual;
    populationState.deaths_stroke_annual = deathsStroke;
    populationState.deaths_ischemic_heart_disease_annual = deathsIschemicHeart;
    populationState.deaths_acute_myocardial_infarction_annual = deathsAcuteMi;
    populationState.deaths_cardiovascular_annual = deathsCardiovascular;
    populationState.deaths_respiratory_annual = deathsRespiratory;
    populationState.deaths_lung_cancer_annual = deathsLungCancer;
    populationState.deaths_colorectal_cancer_annual = deathsColorectalCancer;
    populationState.deaths_covid_annual = deathsCovid;
    populationState.deaths_traffic_annual = deathsTraffic;
    populationState.deaths_suicide_annual = deathsSuicide;
    populationState.deaths_homicide_annual = deathsHomicide;
    populationState.deaths_other_annual = deathsOther;
    populationState.net_migration_rate = netMigrationRate;
    populationState.population_density_implied = populationDensityImplied;
    populationState.population_density = populationDensityImplied;
    populationState.households_total = householdsTotal;
    populationState.occupied_dwellings = occupiedDwellings;
    populationState.vacancy_rate_percent = vacancyRatePercent;
    populationState.owner_occupied_dwellings = ownerOccupiedDwellings;
    populationState.rented_dwellings = rentedDwellings;
    if (applyStockUpdate) {
        populationState.total = nextPopulation;
    }
}

function calculateBudgetBreakdown(state) {
    ensureNodeRegistryReady();
    const entries = computeBudgetEntries(state);
    const revenueEntries = entries
        .filter((item) => item.revenueValue > 0)
        .map((item) => ({ policyId: item.policyId, value: item.revenueValue }));
    const costEntries = entries
        .filter((item) => item.costValue > 0)
        .map((item) => ({ policyId: item.policyId, value: item.costValue }));
    const fallbackIncome = revenueEntries.reduce((sum, item) => sum + item.value, 0);
    const fallbackExpenditure = costEntries.reduce((sum, item) => sum + item.value, 0);
    const incomeTotalNode = getStateValueByNodeId(state, 'budget.income');
    const expenditureTotalNode = getStateValueByNodeId(state, 'budget.expenditure');
    const incomeTotal = Number.isFinite(incomeTotalNode) ? incomeTotalNode : fallbackIncome;
    const expenditureTotal = Number.isFinite(expenditureTotalNode) ? expenditureTotalNode : fallbackExpenditure;

    return {
        income: buildBudgetBreakdown(revenueEntries, incomeTotal),
        expenditure: buildBudgetBreakdown(costEntries, expenditureTotal)
    };
}

function calculatePopulationMetrics(state) {
    const projected = projectOneStepRawMetrics(state);
    return {
        happiness: projected.happiness,
        health: projected.health,
        education: projected.education,
        safety: projected.safety,
        youthIndependence: projected.youthIndependence,
        rentBurden: projected.rentBurden
    };
}

function calculateEconomicIndicators(state) {
    const projected = projectOneStepRawMetrics(state);
    return {
        gdp: projected.gdp,
        government_demand: projected.government_demand,
        debt: state.budget.debt,
        gdpGrowth: projected.gdpGrowth,
        unemployment_rate: projected.unemployment_rate,
        inflation_consumer_prices: projected.inflation_consumer_prices
    };
}

