// Pure TypeScript mathematical engine with zero external imports.
// Implements a full parser pipeline: Tokenizer -> Shunting-Yard -> RPN Evaluator.

export interface Token {
  type: 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'CONSTANT';
  value: string;
}

// ----------------------------------------------------
// Helper Math Functions
// ----------------------------------------------------

/**
 * Computes the factorial of a number.
 * Returns null if the number is negative or not an integer.
 */
export function factorial(n: number): number | null {
  if (n < 0 || !Number.isInteger(n)) return null;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    if (!isFinite(result)) return null; // Handle overflow
  }
  return result;
}

/**
 * Permutations: nPr = n! / (n-r)!
 */
export function nPr(n: number, r: number): number | string {
  if (n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) {
    return 'Error';
  }
  const nFact = factorial(n);
  const diffFact = factorial(n - r);
  if (nFact === null || diffFact === null) return 'Error';
  return nFact / diffFact;
}

/**
 * Combinations: nCr = n! / (r! * (n-r)!)
 */
export function nCr(n: number, r: number): number | string {
  if (n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) {
    return 'Error';
  }
  const nFact = factorial(n);
  const rFact = factorial(r);
  const diffFact = factorial(n - r);
  if (nFact === null || rFact === null || diffFact === null) return 'Error';
  return nFact / (rFact * diffFact);
}

/**
 * Calculates mean of a numerical array.
 */
export function mean(arr: number[]): number | string {
  if (arr.length === 0) return 'Error';
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

/**
 * Calculates sample variance of a numerical array.
 */
export function variance(arr: number[]): number | string {
  if (arr.length <= 1) return 'Error';
  const avg = mean(arr);
  if (typeof avg === 'string') return 'Error';
  const sumSqDiff = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0);
  return sumSqDiff / (arr.length - 1); // Sample variance (Bessel's correction)
}

/**
 * Calculates sample standard deviation of a numerical array.
 */
export function stdDev(arr: number[]): number | string {
  const v = variance(arr);
  if (typeof v === 'string') return 'Error';
  return Math.sqrt(v);
}

// ----------------------------------------------------
// Tokenizer & Parser Pipeline
// ----------------------------------------------------

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'sqrt', 'ln', 'log'
]);

const CONSTANTS = new Map<string, number>([
  ['π', Math.PI],
  ['pi', Math.PI],
  ['e', Math.E]
]);

// Operator Precedence and Associativity
const OPERATORS: Record<string, { precedence: number; rightAssociative: boolean }> = {
  '!': { precedence: 5, rightAssociative: false },
  '~': { precedence: 4, rightAssociative: true },  // Unary minus
  '^': { precedence: 4, rightAssociative: true },  // Power
  '*': { precedence: 3, rightAssociative: false },
  '/': { precedence: 3, rightAssociative: false },
  '+': { precedence: 2, rightAssociative: false },
  '-': { precedence: 2, rightAssociative: false },
};

/**
 * Preprocesses display expression strings into standard parsable terms.
 */
function preprocess(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/sin⁻¹/g, 'asin')
    .replace(/cos⁻¹/g, 'acos')
    .replace(/tan⁻¹/g, 'atan')
    .replace(/√/g, 'sqrt')
    .replace(/pi/g, 'π');
}

/**
 * Tokenizes the expression string.
 */
export function tokenize(expr: string): Token[] | string {
  const preprocessed = preprocess(expr);
  const tokens: Token[] = [];
  let i = 0;

  while (i < preprocessed.length) {
    const char = preprocessed[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // 1. Numbers (including decimal point)
    if (/[0-9.]/.test(char)) {
      let numStr = '';
      let hasDot = false;
      while (i < preprocessed.length && /[0-9.]/.test(preprocessed[i])) {
        if (preprocessed[i] === '.') {
          if (hasDot) return 'Error'; // Multiple decimal points
          hasDot = true;
        }
        numStr += preprocessed[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // 2. Constants & Functions (letters + π)
    if (/[a-zA-Zπ]/.test(char)) {
      let wordStr = '';
      while (i < preprocessed.length && /[a-zA-Zπ0-9]/.test(preprocessed[i])) {
        // Allow numbers inside identifiers (e.g. none currently, but keeps it safe)
        wordStr += preprocessed[i];
        i++;
      }

      if (FUNCTIONS.has(wordStr)) {
        tokens.push({ type: 'FUNCTION', value: wordStr });
      } else if (CONSTANTS.has(wordStr)) {
        tokens.push({ type: 'CONSTANT', value: wordStr });
      } else {
        return 'Error'; // Unknown identifier
      }
      continue;
    }

    // 3. Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // 4. Operators & Factorial
    if (char === '+' || char === '-' || char === '*' || char === '/' || char === '^' || char === '!') {
      if (char === '-') {
        // Determine if unary minus:
        // Unary if first token OR previous token is an operator (except postfix !) or LPAREN
        let isUnary = false;
        if (tokens.length === 0) {
          isUnary = true;
        } else {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'LPAREN' || (prev.type === 'OPERATOR' && prev.value !== '!')) {
            isUnary = true;
          }
        }

        if (isUnary) {
          tokens.push({ type: 'OPERATOR', value: '~' }); // ~ represents unary minus
        } else {
          tokens.push({ type: 'OPERATOR', value: '-' });
        }
      } else {
        tokens.push({ type: 'OPERATOR', value: char });
      }
      i++;
      continue;
    }

    return 'Error'; // Invalid character
  }

  // 5. Implicit Multiplication Insertion
  // e.g. 2π -> 2 * π, 2(3) -> 2 * (3), (3)(4) -> (3) * (4), π e -> π * e, 5! 2 -> 5! * 2, pi sin(30) -> pi * sin(30)
  const processedTokens: Token[] = [];
  for (let k = 0; k < tokens.length; k++) {
    const curr = tokens[k];
    if (k > 0) {
      const prev = tokens[k - 1];
      const isPrevOperand = prev.type === 'NUMBER' || prev.type === 'CONSTANT' || prev.type === 'RPAREN' || (prev.type === 'OPERATOR' && prev.value === '!');
      const isCurrOperandOrStart = curr.type === 'NUMBER' || curr.type === 'CONSTANT' || curr.type === 'LPAREN' || curr.type === 'FUNCTION';

      if (isPrevOperand && isCurrOperandOrStart) {
        processedTokens.push({ type: 'OPERATOR', value: '*' });
      }
    }
    processedTokens.push(curr);
  }

  return processedTokens;
}

/**
 * Shunting-Yard Algorithm to convert Infix tokens to RPN (Postfix).
 */
export function shuntingYard(tokens: Token[]): Token[] | string {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER' || token.type === 'CONSTANT') {
      outputQueue.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'OPERATOR') {
      const op1 = token.value;
      const op1Data = OPERATORS[op1];

      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'FUNCTION') {
          outputQueue.push(operatorStack.pop()!);
          continue;
        }

        if (top.type === 'OPERATOR') {
          const op2 = top.value;
          const op2Data = OPERATORS[op2];
          const hasHigherPrec = op2Data.precedence > op1Data.precedence;
          const hasEqualPrecAndLeftAssoc = op2Data.precedence === op1Data.precedence && !op1Data.rightAssociative;

          if (hasHigherPrec || hasEqualPrecAndLeftAssoc) {
            outputQueue.push(operatorStack.pop()!);
            continue;
          }
        }
        break;
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundMatchingLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'LPAREN') {
          foundMatchingLparen = true;
          operatorStack.pop(); // Remove '('
          break;
        } else {
          outputQueue.push(operatorStack.pop()!);
        }
      }
      if (!foundMatchingLparen) return 'Error'; // Mismatched parentheses
      
      // If the top of the stack is a function, pop it onto the output queue
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      return 'Error'; // Mismatched parentheses
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Evaluates the RPN (Postfix) token stack.
 */
export function evaluateRPN(rpn: Token[]): number | string {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'CONSTANT') {
      const val = CONSTANTS.get(token.value);
      if (val === undefined) return 'Error';
      stack.push(val);
    } else if (token.type === 'OPERATOR') {
      const op = token.value;

      if (op === '~') {
        // Unary minus
        if (stack.length < 1) return 'Error';
        const a = stack.pop()!;
        stack.push(-a);
      } else if (op === '!') {
        // Factorial (postfix)
        if (stack.length < 1) return 'Error';
        const a = stack.pop()!;
        const fact = factorial(a);
        if (fact === null) return 'Error';
        stack.push(fact);
      } else {
        // Binary operator
        if (stack.length < 2) return 'Error';
        const b = stack.pop()!;
        const a = stack.pop()!;
        
        switch (op) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            if (b === 0) return 'Error'; // Division by zero
            stack.push(a / b);
            break;
          case '^':
            // Check for negative base with non-integer exponent
            if (a < 0 && !Number.isInteger(b)) return 'Error';
            // Check 0 to negative power (division by zero)
            if (a === 0 && b < 0) return 'Error';
            stack.push(Math.pow(a, b));
            break;
          default:
            return 'Error';
        }
      }
    } else if (token.type === 'FUNCTION') {
      if (stack.length < 1) return 'Error';
      const a = stack.pop()!;
      const fn = token.value;

      switch (fn) {
        case 'sin':
          stack.push(Math.sin(a * Math.PI / 180));
          break;
        case 'cos':
          stack.push(Math.cos(a * Math.PI / 180));
          break;
        case 'tan': {
          // Check division by zero (e.g. cos(90) = 0)
          const rad = a * Math.PI / 180;
          const cosVal = Math.cos(rad);
          if (Math.abs(cosVal) < 1e-15) return 'Error';
          stack.push(Math.sin(rad) / cosVal);
          break;
        }
        case 'asin':
          if (a < -1 || a > 1) return 'Error';
          stack.push(Math.asin(a) * 180 / Math.PI);
          break;
        case 'acos':
          if (a < -1 || a > 1) return 'Error';
          stack.push(Math.acos(a) * 180 / Math.PI);
          break;
        case 'atan':
          stack.push(Math.atan(a) * 180 / Math.PI);
          break;
        case 'sinh':
          stack.push(Math.sinh(a));
          break;
        case 'cosh':
          stack.push(Math.cosh(a));
          break;
        case 'tanh':
          stack.push(Math.tanh(a));
          break;
        case 'sqrt':
          if (a < 0) return 'Error'; // Negative square root
          stack.push(Math.sqrt(a));
          break;
        case 'ln':
          if (a <= 0) return 'Error';
          stack.push(Math.log(a));
          break;
        case 'log':
          if (a <= 0) return 'Error';
          stack.push(Math.log10(a));
          break;
        default:
          return 'Error';
      }
    }

    // Safety check after each step
    const topVal = stack[stack.length - 1];
    if (topVal !== undefined && (isNaN(topVal) || !isFinite(topVal))) {
      return 'Error';
    }
  }

  if (stack.length !== 1) return 'Error';
  
  // Float cleanup: round results to 10 significant figures to eliminate floating point noise
  const finalVal = stack[0];
  if (isNaN(finalVal) || !isFinite(finalVal)) return 'Error';
  
  // Format to 10 significant figures and parse back to number to strip trailing zeroes
  const cleaned = parseFloat(finalVal.toPrecision(10));
  return cleaned;
}

/**
 * Main evaluation pipeline for scientific calculator expressions.
 */
export function evaluate(expr: string): string {
  if (!expr || expr.trim() === '') return '0';

  // Basic balance bracket check before tokenizing to catch unmatched brackets early
  let balance = 0;
  for (const c of expr) {
    if (c === '(') balance++;
    if (c === ')') balance--;
    if (balance < 0) return 'Error';
  }
  if (balance !== 0) return 'Error';

  const tokens = tokenize(expr);
  if (typeof tokens === 'string') return tokens;

  const rpn = shuntingYard(tokens);
  if (typeof rpn === 'string') return rpn;

  const result = evaluateRPN(rpn);
  return result.toString();
}
