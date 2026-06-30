export interface CalcButtonConfig {
  label: string;      // Visual text displayed on the button
  value: string;      // String value appended or action triggered
  type: 'number' | 'operator' | 'function' | 'action' | 'accent';
}

// Top scrollable panel for scientific functions (only visible in Scientific mode)
export const SCIENTIFIC_KEYS: CalcButtonConfig[] = [
  { label: 'sin', value: 'sin(', type: 'function' },
  { label: 'cos', value: 'cos(', type: 'function' },
  { label: 'tan', value: 'tan(', type: 'function' },
  { label: 'sin⁻¹', value: 'asin(', type: 'function' },
  { label: 'cos⁻¹', value: 'acos(', type: 'function' },
  { label: 'tan⁻¹', value: 'atan(', type: 'function' },
  { label: 'sinh', value: 'sinh(', type: 'function' },
  { label: 'cosh', value: 'cosh(', type: 'function' },
  { label: 'tanh', value: 'tanh(', type: 'function' },
  { label: '√', value: '√(', type: 'function' },
  { label: 'ln', value: 'ln(', type: 'function' },
  { label: 'log', value: 'log(', type: 'function' },
  { label: 'x²', value: '^2', type: 'operator' },
  { label: '^', value: '^', type: 'operator' },
  { label: 'π', value: 'π', type: 'number' },
  { label: 'e', value: 'e', type: 'number' },
  { label: 'nPr', value: 'nPr', type: 'action' },
  { label: 'nCr', value: 'nCr', type: 'action' },
  { label: 'STAT', value: 'STAT', type: 'action' },
];

// Bottom standard grid for number and basic operators (displayed in both modes)
export const BASIC_KEYS_GRID: CalcButtonConfig[][] = [
  [
    { label: 'AC', value: 'AC', type: 'action' },
    { label: 'DEL', value: 'DEL', type: 'action' },
    { label: '(', value: '(', type: 'operator' },
    { label: ')', value: ')', type: 'operator' },
  ],
  [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '÷', value: '÷', type: 'operator' },
  ],
  [
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '×', value: '×', type: 'operator' },
  ],
  [
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '-', value: '-', type: 'operator' },
  ],
  [
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: '=', value: '=', type: 'accent' },
    { label: '+', value: '+', type: 'operator' },
  ],
];
