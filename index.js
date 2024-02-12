function digitsToLetter(d) {
  let x = Number(d);
  if (x < 10) return d;
  return String.fromCharCode('A'.charCodeAt(0) + x - 10);
}

function letterToDigits(l) {
  let x = '' + l;
  if (x.length > 1) throw new Error(`Argument (${x}) to letterToDigits() must be a single character.`);
  if (!isNaN(Number(x))) return Number(x);
  return x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 10;
}

function inputPatternIfBase(base) {
  if (base < 10) return `[0-${base - 1}]\d+`;
  else if (base === 10) return '\d+';
  else {
    const l = digitsToLetter(base - 1);
    return `[a-${l.toLowerCase()}A-${l}]\w*|\d+`
  }
}

const calculatorHTML = {
  input: document.querySelector('#converter_fromNumber'),
  fromBase: document.querySelector('#converter_fromBase'),
  toBase: document.querySelector('#converter_toBase'),
  output: document.querySelector('#converter_toNumber'),
}

const keys = Object.keys(calculatorHTML);

const calculator = {
  _input: calculatorHTML.input.value,
  _fromBase: Number(calculatorHTML.fromBase.value),
  _toBase: Number(calculatorHTML.toBase.value),
  _output: null,
  _pattern: calculatorHTML.input.pattern,
  set pattern(base) {
    this._pattern = inputPatternIfBase(base);
  },
  set input(inputVal) {
    this._input = inputVal;
  },
  set fromBase(base) {
    calculator.pattern = base;
    calculatorHTML.input.pattern = calculator.pattern;
    this._fromBase = base;
  },
  set toBase(base) {
    this._toBase = base;
  },
  set output(outputVal) {
    this._output = outputVal;
  },
  get pattern() {
    return this._pattern;
  },
  get input() {
    return this._input;
  },
  get fromBase() {
    return this._fromBase;
  },
  get toBase() {
    return this._toBase;
  },
  get output() {
    return this._output;
  },
}

function convertDecToBaseN(num, base) {
  const b = Number(base);
  let q = Number(num);
  if (b === 10 || q === 0) return q.toString();
  let r = null;
  let ans = '';
  while (q >= 1) {
    r = q % b;
    q = Math.floor(q / b);
    ans = digitsToLetter(r) + ans;
  }
  return ans;
}

// TODO: Finalize error handling
function convertBaseNToDec(num, base) {
  num = '' + num;
  base = Number(base);
  if (base === 10) return num;
  const len = num.length;
  return num.split('').reduce((acc, x, i) => {
    x = letterToDigits(x);
    if (x >= base) throw new Error(`Number ${num} does not exist in base-${base}!`);
    return acc + x * Math.pow(base, len - 1 - i);
  }, 0).toString();
}

function calculateUsingSetValuesInCalculator(input = calculator.input, fromBase = calculator.fromBase, toBase = calculator.toBase) {
  if (fromBase < 1 || toBase < 1) return null;
  let temp = convertBaseNToDec(input, fromBase);
  if (toBase === 10) return temp;
  temp = convertDecToBaseN(temp, toBase);
  return temp;
}

function updateCalculator(key, val) {
  if ((key && val === null) || (key && val === undefined)) return val;
  if (key === 'fromBase') calculator.pattern = val;
  calculator[key] = val;
  return val;
}

function updateCalculatorHTML(key, val) {
  if ((key && val === null) || (key && val === undefined)) return val;
  calculator[key] = calculatorHTML[key].value = val;
  return val;
}

calculatorHTML.updateOutput = function updateOutputHTML(newVal) {
  return updateCalculatorHTML('output', newVal);
}

calculatorHTML.startCalc = () => {
  let val = calculateUsingSetValuesInCalculator();
  calculatorHTML.updateOutput(val);
  return val;
};

calculatorHTML.reCalc = (obj) => {
  const { input, fromBase, toBase } = obj;
  const output = calculateUsingSetValuesInCalculator(input, fromBase, toBase);
  obj.output = output;
  for (const key of keys) {
    updateCalculatorHTML(key, obj[key]);
  }
  return output;
};

// let obj = {};
function keyInputHandler(e, prop) {
  // if (keys.includes(prop)) obj[prop] = '' + e.target.value;
  if (e.key === "Enter") {
    let obj = {};
    obj[prop] = '' + e.target.value;
    calculatorHTML.reCalc(obj);
  }
  else if (prop === 'input') {
    if (e.target.value.search(calculator.pattern)) {
      updateCalculator(prop, '' + e.target.value);
    }
    else e.preventDefault();
  }
  else if (e.target.value.search(/\w+/)) {
    updateCalculator(prop, '' + e.target.value);
  }
}

for (const key of keys) {
  calculatorHTML[key].addEventListener('keyup', (e) => keyInputHandler(e, key));
}

calculatorHTML.startCalc();


/**
 * TO-DO's
 * Complete constraint validation for inputs
 * Add error listeners (or the like) for bad inputs
 * Dynamically change constraint validations for inputs depending on toBase (use only digits available for that base)
 * Implement polyfills for the different, built-in ways to do number conversion.
 * Refactor code
**/