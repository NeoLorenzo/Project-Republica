// Restricted equation engine for edge contribution evaluation.
// Supports arithmetic expressions with a safe, explicit DSL.

const EDGE_EQUATION_ALLOWED_FUNCTIONS = new Map([
    ['abs', { minArgs: 1, maxArgs: 1 }],
    ['min', { minArgs: 2, maxArgs: Infinity }],
    ['max', { minArgs: 2, maxArgs: Infinity }],
    ['pow', { minArgs: 2, maxArgs: 2 }],
    ['sqrt', { minArgs: 1, maxArgs: 1 }],
    ['log', { minArgs: 1, maxArgs: 1 }],
    ['exp', { minArgs: 1, maxArgs: 1 }],
    ['clamp', { minArgs: 3, maxArgs: 3 }]
]);

const EDGE_EQUATION_ALLOWED_VARIABLES = new Set([
    'x',
    'x_raw',
    'x_min',
    'x_max',
    'target_min',
    'target_max'
]);

const edgeEquationCompileCache = new Map();

function edgeEquationIsDigit(ch) {
    return ch >= '0' && ch <= '9';
}

function edgeEquationIsAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
}

function edgeEquationTokenize(expressionText) {
    const expr = String(expressionText || '').trim();
    if (!expr) {
        throw new Error('Equation is empty.');
    }
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            i++;
            continue;
        }
        if (edgeEquationIsDigit(ch) || ch === '.') {
            let start = i;
            let seenDot = (ch === '.');
            i++;
            while (i < expr.length) {
                const next = expr[i];
                if (edgeEquationIsDigit(next)) {
                    i++;
                    continue;
                }
                if (next === '.' && !seenDot) {
                    seenDot = true;
                    i++;
                    continue;
                }
                if ((next === 'e' || next === 'E') && i + 1 < expr.length) {
                    const sign = expr[i + 1];
                    const hasSign = sign === '+' || sign === '-';
                    const digitIndex = hasSign ? i + 2 : i + 1;
                    if (digitIndex < expr.length && edgeEquationIsDigit(expr[digitIndex])) {
                        i = digitIndex + 1;
                        while (i < expr.length && edgeEquationIsDigit(expr[i])) i++;
                        continue;
                    }
                }
                break;
            }
            const raw = expr.slice(start, i);
            const numeric = Number(raw);
            if (!Number.isFinite(numeric)) {
                throw new Error(`Invalid numeric literal "${raw}".`);
            }
            tokens.push({ type: 'number', value: numeric, raw });
            continue;
        }
        if (edgeEquationIsAlpha(ch)) {
            let start = i;
            i++;
            while (i < expr.length) {
                const next = expr[i];
                if (edgeEquationIsAlpha(next) || edgeEquationIsDigit(next)) {
                    i++;
                    continue;
                }
                break;
            }
            const name = expr.slice(start, i);
            tokens.push({ type: 'identifier', value: name });
            continue;
        }
        if ('+-*/^(),'.includes(ch)) {
            tokens.push({ type: 'symbol', value: ch });
            i++;
            continue;
        }
        throw new Error(`Unexpected token "${ch}" at position ${i + 1}.`);
    }
    return tokens;
}

function createEdgeEquationParser(tokens) {
    let index = 0;

    function peek() {
        return tokens[index] || null;
    }

    function consume() {
        const token = tokens[index];
        index++;
        return token;
    }

    function expectSymbol(symbol) {
        const token = peek();
        if (!token || token.type !== 'symbol' || token.value !== symbol) {
            throw new Error(`Expected "${symbol}".`);
        }
        consume();
    }

    function parseExpression() {
        return parseAdditive();
    }

    function parseAdditive() {
        let node = parseMultiplicative();
        while (true) {
            const token = peek();
            if (!token || token.type !== 'symbol' || (token.value !== '+' && token.value !== '-')) {
                break;
            }
            const op = token.value;
            consume();
            const right = parseMultiplicative();
            node = { type: 'binary', op, left: node, right };
        }
        return node;
    }

    function parseMultiplicative() {
        let node = parsePower();
        while (true) {
            const token = peek();
            if (!token || token.type !== 'symbol' || (token.value !== '*' && token.value !== '/')) {
                break;
            }
            const op = token.value;
            consume();
            const right = parsePower();
            node = { type: 'binary', op, left: node, right };
        }
        return node;
    }

    function parsePower() {
        let node = parseUnary();
        const token = peek();
        if (token && token.type === 'symbol' && token.value === '^') {
            consume();
            const right = parsePower();
            node = { type: 'binary', op: '^', left: node, right };
        }
        return node;
    }

    function parseUnary() {
        const token = peek();
        if (token && token.type === 'symbol' && (token.value === '+' || token.value === '-')) {
            const op = token.value;
            consume();
            const value = parseUnary();
            if (op === '+') return value;
            return { type: 'unary', op: '-', value };
        }
        return parsePrimary();
    }

    function parseFunctionCall(name) {
        expectSymbol('(');
        const args = [];
        if (!(peek() && peek().type === 'symbol' && peek().value === ')')) {
            args.push(parseExpression());
            while (peek() && peek().type === 'symbol' && peek().value === ',') {
                consume();
                args.push(parseExpression());
            }
        }
        expectSymbol(')');

        const fn = EDGE_EQUATION_ALLOWED_FUNCTIONS.get(name);
        if (!fn) {
            throw new Error(`Function "${name}" is not allowed.`);
        }
        if (args.length < fn.minArgs || args.length > fn.maxArgs) {
            const range = fn.minArgs === fn.maxArgs
                ? `${fn.minArgs}`
                : `${fn.minArgs}..${fn.maxArgs === Infinity ? 'n' : fn.maxArgs}`;
            throw new Error(`Function "${name}" expects ${range} argument(s).`);
        }
        return { type: 'call', name, args };
    }

    function parsePrimary() {
        const token = peek();
        if (!token) throw new Error('Unexpected end of equation.');

        if (token.type === 'number') {
            consume();
            return { type: 'number', value: token.value };
        }

        if (token.type === 'identifier') {
            const name = token.value;
            consume();
            const next = peek();
            if (next && next.type === 'symbol' && next.value === '(') {
                return parseFunctionCall(name);
            }
            if (!EDGE_EQUATION_ALLOWED_VARIABLES.has(name)) {
                throw new Error(`Variable "${name}" is not allowed.`);
            }
            return { type: 'variable', name };
        }

        if (token.type === 'symbol' && token.value === '(') {
            consume();
            const node = parseExpression();
            expectSymbol(')');
            return node;
        }

        throw new Error(`Unexpected token "${token.value}".`);
    }

    const ast = parseExpression();
    if (index < tokens.length) {
        throw new Error(`Unexpected trailing token "${tokens[index].value}".`);
    }
    return ast;
}

function collectEdgeEquationVariables(ast, out = new Set()) {
    if (!ast || typeof ast !== 'object') return out;
    if (ast.type === 'variable') out.add(ast.name);
    if (ast.type === 'unary') collectEdgeEquationVariables(ast.value, out);
    if (ast.type === 'binary') {
        collectEdgeEquationVariables(ast.left, out);
        collectEdgeEquationVariables(ast.right, out);
    }
    if (ast.type === 'call') {
        ast.args.forEach((arg) => collectEdgeEquationVariables(arg, out));
    }
    return out;
}

function edgeEquationClamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
}

function ensureFiniteEquationValue(value, label) {
    if (!Number.isFinite(value)) {
        throw new Error(`${label} produced non-finite value.`);
    }
    return value;
}

function evaluateEdgeEquationAst(ast, context) {
    switch (ast.type) {
        case 'number':
            return ast.value;
        case 'variable': {
            const value = Number(context[ast.name]);
            if (!Number.isFinite(value)) {
                throw new Error(`Variable "${ast.name}" is missing or non-finite.`);
            }
            return value;
        }
        case 'unary': {
            const value = evaluateEdgeEquationAst(ast.value, context);
            return ast.op === '-' ? -value : value;
        }
        case 'binary': {
            const left = evaluateEdgeEquationAst(ast.left, context);
            const right = evaluateEdgeEquationAst(ast.right, context);
            if (ast.op === '+') return left + right;
            if (ast.op === '-') return left - right;
            if (ast.op === '*') return left * right;
            if (ast.op === '/') {
                if (Math.abs(right) <= 1e-12) {
                    throw new Error('Division by zero.');
                }
                return left / right;
            }
            if (ast.op === '^') {
                const value = Math.pow(left, right);
                return ensureFiniteEquationValue(value, 'pow');
            }
            throw new Error(`Unsupported operator "${ast.op}".`);
        }
        case 'call': {
            const args = ast.args.map((arg) => evaluateEdgeEquationAst(arg, context));
            if (ast.name === 'abs') return Math.abs(args[0]);
            if (ast.name === 'min') return Math.min(...args);
            if (ast.name === 'max') return Math.max(...args);
            if (ast.name === 'pow') return ensureFiniteEquationValue(Math.pow(args[0], args[1]), 'pow');
            if (ast.name === 'sqrt') {
                if (args[0] < 0) throw new Error('sqrt input must be >= 0.');
                return Math.sqrt(args[0]);
            }
            if (ast.name === 'log') {
                if (args[0] <= 0) throw new Error('log input must be > 0.');
                return Math.log(args[0]);
            }
            if (ast.name === 'exp') {
                return ensureFiniteEquationValue(Math.exp(args[0]), 'exp');
            }
            if (ast.name === 'clamp') {
                const minValue = Math.min(args[1], args[2]);
                const maxValue = Math.max(args[1], args[2]);
                return edgeEquationClamp(args[0], minValue, maxValue);
            }
            throw new Error(`Unsupported function "${ast.name}".`);
        }
        default:
            throw new Error(`Unsupported AST node "${ast.type}".`);
    }
}

function compileEdgeEquation(expressionText) {
    const expression = String(expressionText || '').trim();
    if (!expression) {
        throw new Error('Equation is empty.');
    }
    const cached = edgeEquationCompileCache.get(expression);
    if (cached) return cached;

    const tokens = edgeEquationTokenize(expression);
    const ast = createEdgeEquationParser(tokens);
    const variableNames = [...collectEdgeEquationVariables(ast)];
    const compiled = {
        expression,
        ast,
        variableNames
    };
    edgeEquationCompileCache.set(expression, compiled);
    return compiled;
}

function evaluateCompiledEdgeEquation(compiledEquation, context, equationLabel = 'equation') {
    if (!compiledEquation || !compiledEquation.ast) {
        throw new Error('Compiled equation is invalid.');
    }
    const value = evaluateEdgeEquationAst(compiledEquation.ast, context || {});
    if (!Number.isFinite(value)) {
        throw new Error(`${equationLabel} produced a non-finite result.`);
    }
    return value;
}
