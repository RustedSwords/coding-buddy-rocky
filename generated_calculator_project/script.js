// DOM References
const displayEl = document.getElementById('display');
const buttons = document.querySelectorAll('button');

// State variables
let currentInput = '';
let operator = null;
let previousValue = null;
let waitingForOperand = false;

// Format display value
function formatDisplay(value) {
  if (value === '') return '0';
  
  // Handle scientific notation for very large/small numbers
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  
  // Limit to 12 significant digits
  if (value.length > 12) {
    return num.toExponential(6);
  }
  
  // Handle decimals and truncate if needed
  const [integer, decimal] = value.split('.');
  if (integer && integer.length > 12) {
    return num.toExponential(6);
  }
  
  // Return formatted with commas for thousands
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Update the display UI
function updateDisplay() {
  displayEl.textContent = formatDisplay(currentInput);
}

// Error handling
function showError(message) {
  displayEl.textContent = message;
  displayEl.classList.add('error');
  setTimeout(() => {
    displayEl.classList.remove('error');
  }, 500);
}

// Calculate function with error handling
function calculate(a, b, op) {
  const num1 = parseFloat(a);
  const num2 = parseFloat(b);
  
  if (isNaN(num1) || isNaN(num2)) {
    throw new Error('Invalid input');
  }
  
  let result;
  switch (op) {
    case '+':
      result = num1 + num2;
      break;
    case '-':
      result = num1 - num2;
      break;
    case '*':
      result = num1 * num2;
      break;
    case '/':
      if (num2 === 0) {
        throw new Error('Div by zero');
      }
      result = num1 / num2;
      break;
    case '%':
      if (num2 === 0) {
        throw new Error('Div by zero');
      }
      result = num1 % num2;
      break;
    default:
      throw new Error('Invalid operator');
  }
  
  return result;
}

// Handle digit input
function handleDigit(digit) {
  if (digit === '.' && currentInput.includes('.')) {
    return;
  }
  
  if (waitingForOperand) {
    currentInput = digit;
    waitingForOperand = false;
  } else {
    if (currentInput === '0' && digit !== '.') {
      currentInput = digit;
    } else {
      currentInput += digit;
    }
  }
  
  // Limit length of input
  if (currentInput.length > 12) {
    currentInput = currentInput.slice(0, 12);
  }
  
  updateDisplay();
}

// Handle operator
function handleOperator(op) {
  if (currentInput === '' && previousValue === null) {
    return;
  }
  
  if (previousValue !== null && !waitingForOperand) {
    try {
      const result = calculate(previousValue, currentInput, operator);
      currentInput = String(result);
      previousValue = currentInput;
      updateDisplay();
    } catch (error) {
      showError('Error');
      clearAll();
      return;
    }
  } else {
    previousValue = currentInput;
  }
  
  operator = op;
  waitingForOperand = true;
}

// Handle equals
function handleEqual() {
  if (operator === null || currentInput === '' || previousValue === null) {
    return;
  }
  
  try {
    const result = calculate(previousValue, currentInput, operator);
    currentInput = String(result);
    updateDisplay();
    clearState();
  } catch (error) {
    showError('Error');
    clearAll();
  }
}

// Clear all state
function clearAll() {
  currentInput = '';
  operator = null;
  previousValue = null;
  waitingForOperand = false;
  updateDisplay();
}

// Clear only current input
function clearCurrent() {
  currentInput = '';
  updateDisplay();
}

// Backspace function
function backspace() {
  if (currentInput.length > 0) {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
  }
}

// Reset state after equals
function clearState() {
  currentInput = '';
  operator = null;
  previousValue = null;
  waitingForOperand = false;
}

// Handle button clicks
function setupButtonHandlers() {
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent focus from remaining on button
      
      const target = e.target;
      const value = target.getAttribute('data-value');
      const action = target.getAttribute('data-action');
      
      // Handle digit buttons (0-9)
      if (value && !isNaN(Number(value)) || value === '.') {
        handleDigit(value);
        return;
      }
      
      // Handle operator buttons
      if (value && ['+', '-', '*', '/', '%'].includes(value)) {
        handleOperator(value);
        return;
      }
      
      // Handle equals
      if (action === 'equals') {
        handleEqual();
        return;
      }
      
      // Handle clear (C)
      if (action === 'clear') {
        clearAll();
        return;
      }
      
      // Handle backspace
      if (action === 'backspace') {
        backspace();
        return;
      }
    });
  });
}

// Handle keyboard input
function setupKeyboardHandler() {
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // Prevent default behavior for certain keys to avoid scrolling
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
    }
    
    // Handle digits (0-9)
    if (!isNaN(Number(key)) && key !== ' ') {
      handleDigit(key);
      return;
    }
    
    // Handle decimal point
    if (key === '.') {
      handleDigit('.');
      return;
    }
    
    // Handle operators
    if (['+', '-', '*', '/', '%'].includes(key)) {
      handleOperator(key);
      return;
    }
    
    // Handle Enter key (equals)
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleEqual();
      return;
    }
    
    // Handle Backspace
    if (key === 'Backspace') {
      backspace();
      return;
    }
    
    // Handle Escape (clear all)
    if (key === 'Escape') {
      clearAll();
      return;
    }
  });
}

// Initialize calculator
function init() {
  updateDisplay();
  setupButtonHandlers();
  setupKeyboardHandler();
}

// Run initialization
init();
