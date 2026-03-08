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
const ACCOUNTING_TARGET_BLOCKLIST = new Set([
    'income',
    'expenditure',
    'deficit',
    'debt'
]);

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
    const out = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
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
    const forbiddenColumns = ['base_cost', 'cost_slope', 'base_revenue', 'revenue_slope', 'gdp_scaled'];
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
            gdpScaled: true
        });
    }

    return parsedRows;
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
            min: row.min,
            max: row.max,
            baseCost: row.baseCost,
            costSlope: row.costSlope,
            baseRevenue: row.baseRevenue,
            revenueSlope: row.revenueSlope,
            gdpScaled: row.gdpScaled,
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
    assertNodeRegistryParity(parsedRows);
    rebuildNodeRegistryIndexes(parsedRows);
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
    const legacyHeader = ['source', 'target', 'weight', 'inertia'];
    const extendedRequired = [
        'source',
        'target',
        'sign',
        'weight',
        'inertia',
        'target_class',
        'causal_mechanism',
        'evidence_source',
        'evidence_strength',
        'bidirectional_pair_id',
        'status',
        'review_notes'
    ];

    const isLegacyFormat = normalizedHeader.length === legacyHeader.length
        && legacyHeader.every((column, index) => normalizedHeader[index] === column);

    const headerIndexByName = new Map();
    normalizedHeader.forEach((column, index) => {
        headerIndexByName.set(column, index);
    });
    const isExtendedFormat = extendedRequired.every((column) => headerIndexByName.has(column));

    if (!isLegacyFormat && !isExtendedFormat) {
        throw new Error(
            'Invalid CSV header. Expected legacy Source,Target,Weight,Inertia ' +
            'or extended source,target,sign,weight,inertia,target_class,causal_mechanism,' +
            'evidence_source,evidence_strength,bidirectional_pair_id,status,review_notes'
        );
    }

    const knownNodes = getKnownNodeIds();
    const seenPairs = new Set();
    const parsedEdges = [];
    const allowedStatus = new Set(['approved', 'in_review', 'rejected']);
    let approvedCount = 0;

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

        let source;
        let target;
        let weightRaw;
        let inertiaRaw;
        let status = 'approved';
        let parsedSign = null;

        if (isLegacyFormat) {
            [source, target, weightRaw, inertiaRaw] = row;
            source = String(source || '').trim();
            target = String(target || '').trim();
            weightRaw = String(weightRaw || '').trim();
            inertiaRaw = String(inertiaRaw || '').trim();
        } else {
            source = getCell(row, 'source');
            target = getCell(row, 'target');
            weightRaw = getCell(row, 'weight');
            inertiaRaw = getCell(row, 'inertia');
            const sign = getCell(row, 'sign').toLowerCase();
            const targetClass = getCell(row, 'target_class').toLowerCase();
            const evidenceStrength = getCell(row, 'evidence_strength').toLowerCase();
            status = getCell(row, 'status').toLowerCase();
            parsedSign = sign;
            const causalMechanism = getCell(row, 'causal_mechanism');
            const evidenceSource = getCell(row, 'evidence_source');

            if (!source) throw new Error(`Missing source on row ${i + 1}.`);
            if (!target) throw new Error(`Missing target on row ${i + 1}.`);
            if (!['positive', 'negative'].includes(sign)) {
                throw new Error(`Invalid sign "${sign}" on row ${i + 1}.`);
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
                throw new Error(`Invalid status "${status}" on row ${i + 1}.`);
            }
        }

        const weight = Number(weightRaw);
        const inertia = Number(inertiaRaw);
        const pairKey = `${source}->${target}`;

        if (!knownNodes.has(source)) throw new Error(`Unknown Source "${source}" on row ${i + 1}.`);
        if (!knownNodes.has(target)) throw new Error(`Unknown Target "${target}" on row ${i + 1}.`);
        if (ACCOUNTING_TARGET_BLOCKLIST.has(target)) {
            throw new Error(`Invalid Target "${target}" on row ${i + 1}. Accounting targets are forbidden in CSV.`);
        }
        if (source === target) throw new Error(`Self-link "${source}" on row ${i + 1} is not allowed.`);
        if (!Number.isFinite(weight)) throw new Error(`Invalid Weight "${weightRaw}" on row ${i + 1}.`);
        if (isExtendedFormat && parsedSign === 'positive' && !(weight > 0)) {
            throw new Error(`Sign/weight mismatch on row ${i + 1}: sign=positive requires weight > 0.`);
        }
        if (isExtendedFormat && parsedSign === 'negative' && !(weight < 0)) {
            throw new Error(`Sign/weight mismatch on row ${i + 1}: sign=negative requires weight < 0.`);
        }
        if (!Number.isInteger(inertia) || inertia < 1) throw new Error(`Invalid Inertia "${inertiaRaw}" on row ${i + 1}.`);
        if (seenPairs.has(pairKey)) throw new Error(`Duplicate edge "${pairKey}" on row ${i + 1}.`);

        seenPairs.add(pairKey);
        if (status !== 'approved') {
            continue;
        }
        if (policyNodeIdSet.has(target)) {
            throw new Error(`Invalid Target "${target}" on row ${i + 1}: policy nodes are exogenous and cannot have inbound edges.`);
        }
        approvedCount++;
        parsedEdges.push({
            source,
            target,
            weight,
            inertia,
            driver: `csv:${source}->${target}`
        });
    }

    if (isExtendedFormat && approvedCount === 0) {
        throw new Error('No approved edges available in relationships.csv. Set at least one row status to approved.');
    }

    return parsedEdges;
}

function getEdgeKey(source, target) {
    return `${source}->${target}`;
}

function hasRequiredBudgetSign(weight, expectedSign) {
    if (expectedSign === 'positive') return weight > 0;
    if (expectedSign === 'negative') return weight < 0;
    return false;
}

function validateRequiredBudgetEdges(edges) {
    const edgeByKey = new Map(edges.map((edge) => [getEdgeKey(edge.source, edge.target), edge]));
    const requiredEdges = [];

    getPolicyFiscalRows().forEach((row) => {
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
    });

    requiredEdges.push(
        { source: 'tax_revenue', target: 'budget.income', expectedSign: 'positive' },
        { source: 'budget.income', target: 'budget.deficit', expectedSign: 'negative' },
        { source: 'budget.expenditure', target: 'budget.deficit', expectedSign: 'positive' },
        { source: 'budget.deficit', target: 'budget.debt', expectedSign: 'positive' }
    );

    requiredEdges.forEach((requiredEdge) => {
        const edgeKey = getEdgeKey(requiredEdge.source, requiredEdge.target);
        const edge = edgeByKey.get(edgeKey);
        if (!edge) {
            throw new Error(`Missing required budget edge "${edgeKey}".`);
        }
        if (!hasRequiredBudgetSign(edge.weight, requiredEdge.expectedSign)) {
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
        weight: edge.weight,
        inertia: edge.inertia,
        driver: edge.driver,
        direct: true,
        polarity: edge.weight >= 0 ? 'positive' : 'negative',
        magnitude: Math.abs(edge.weight)
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

function computeRawImpactSum(state, targetId, nodeSnapshot) {
    const inboundEdges = getInboundEdges(targetId);
    if (!inboundEdges.length) return 0;
    return inboundEdges.reduce((sum, edge) => {
        const sourceNorm = getNormalizedValueByNodeId(state, edge.source, nodeSnapshot);
        return sum + (edge.weight * sourceNorm);
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
        const magnitude = Math.abs(edge.weight);
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

function syncStateFromSimulation(state, previousGdpNorm) {
    if (!state?.simulation?.nodes) return;

    Object.entries(nodeConfigs).forEach(([nodeId, cfg]) => {
        const normValue = state.simulation.nodes[nodeId]?.current ?? cfg.baseValue;
        const rawValue = denormalizeWithRange(normValue, cfg.min, cfg.max);
        const row = nodeRegistryById.get(nodeId);
        if (row) {
            setValueAtPath(state, row.storagePath, rawValue);
        }
    });

    if (state.economy && state.simulation.nodes.gdp) {
        const currentGdp = state.economy.gdp;
        if (Number.isFinite(previousGdpNorm)) {
            const previousGdp = denormalizeWithRange(previousGdpNorm, nodeConfigs.gdp.min, nodeConfigs.gdp.max);
            const monthlyGrowth = previousGdp > 0 ? ((currentGdp - previousGdp) / previousGdp) : 0;
            state.economy.gdpGrowth = clamp(monthlyGrowth * 12, -0.1, 0.1);
        }
    }
}

function stepRelationshipSimulation(state) {
    ensureSimulationState(state);
    if (!state?.simulation?.nodes) return null;

    const previousGdpNorm = state.simulation.nodes.gdp?.current;
    const snapshot = {};
    Object.keys(state.simulation.nodes).forEach((nodeId) => {
        snapshot[nodeId] = { ...state.simulation.nodes[nodeId] };
    });

    const nextNodes = computeNextSimulationNodes(state, snapshot);
    state.simulation.nodes = nextNodes;
    syncStateFromSimulation(state, previousGdpNorm);
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

    const previousGdp = denormalizeWithRange(snapshot.gdp.current, nodeConfigs.gdp.min, nodeConfigs.gdp.max);
    const projectedGdp = raw.gdp;
    const monthlyGrowth = previousGdp > 0 ? ((projectedGdp - previousGdp) / previousGdp) : 0;
    raw.gdpGrowth = clamp(monthlyGrowth * 12, -0.1, 0.1);
    return raw;
}

function getCurrentGraphLinks(state) {
    const baseLinks = getGraphLinksFromRules();
    if (!state) return baseLinks;

    return baseLinks.map((link) => {
        const sourceNorm = getNormalizedValueByNodeId(state, link.source);
        const effectiveImpact = (Number.isFinite(sourceNorm) ? sourceNorm : 0) * link.weight;
        const effectiveMagnitude = Math.abs(effectiveImpact);

        return {
            ...link,
            baseWeight: link.weight,
            sourceNorm: Number.isFinite(sourceNorm) ? sourceNorm : 0,
            effectiveImpact,
            weight: effectiveImpact,
            magnitude: effectiveMagnitude,
            polarity: effectiveImpact > 0 ? 'positive' : (effectiveImpact < 0 ? 'negative' : 'neutral')
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
    const debtValue = getStateValueByNodeId(state, 'budget.debt');
    const gdpValue = getStateValueByNodeId(state, 'gdp');
    const safeDebt = Number.isFinite(debtValue) ? debtValue : 0;
    const safeGdp = Number.isFinite(gdpValue) && gdpValue > 0 ? gdpValue : 0;
    const debtToGdp = safeGdp > 0 ? (safeDebt / safeGdp) * 100 : 0;
    state.economy.debt_to_gdp = Number.isFinite(debtToGdp) ? debtToGdp : 0;
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
        debt: state.budget.debt,
        gdpGrowth: projected.gdpGrowth,
        unemployment_rate: projected.unemployment_rate,
        inflation_consumer_prices: projected.inflation_consumer_prices
    };
}

