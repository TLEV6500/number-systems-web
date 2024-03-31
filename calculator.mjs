import { createHTMLTemplateInstance, editHTMLElement, getExistingHTMLElement, insertHTMLElement } from "./htmlInterface.mjs";

// Defining globals
let calcInstanceCounts = 0;
const CALCULATORINPUTIDS = new Set(['fromNumber', 'fromBase', 'toBase', 'toNumber']);
const SPECIALKEYS = new Set(['Backspace', 'Delete', 'Shift', 'Tab', 'Control']);
const isSpecialKey = (e) => e.ctrlKey || e.shiftKey || SPECIALKEYS.has(e.key);
const isValidSubmitKey = (e) => e.key === 'Enter' || e.key === 'Tab';

// DO: Check if Fn key inputs are ignored or not
// ADD: Visually indicate that the user needs to press enter if they still haven't for toBase and fromBase
function calcBaseInputHandler(e, id, calcInstance) {
  if (e.key === null || e.target.value === null || e.repeat) return;
  if (!isSpecialKey(e) && !isValidSubmitKey(e) && (e.key.search(/\d+/) === -1)) e.preventDefault();
  else if (isValidSubmitKey(e)) {
    console.log('calcBaseInputHandler>>', e.target.value);
    calcInstance[id] = e.target.value;
    calcInstance.convert();
  }
  return;
}

// FIX: Spaces and other invalid inputs for given base is still accepted and messes up calc
// FIX: Multi-digit hex numbers aren't converted correctly or at all.
function calcFromNumInputHandler(e, id, calcInstance) {
  if (e.key === null || e.target.value === null || e.repeat) return;
  const isValidInputNumber = e.key.search(calcInstance.numberPattern) !== -1;
  if (!isSpecialKey(e) && !isValidInputNumber) e.preventDefault();
  else if (isValidInputNumber) {
    console.log('calcFromNumInputHandler>>', e.target.value);
    calcInstance[id] = e.target.value;
    calcInstance.convert();
  }
}

function createCalculatorHTML(calcInstance) {
  const instance = createHTMLTemplateInstance(getExistingHTMLElement('#calculator_instance_template'));
  const target = getExistingHTMLElement('#calculator');
  const HTMLRef = { base: instance };
  for (const id of CALCULATORINPUTIDS) {
    HTMLRef[id] = getExistingHTMLElement(`#converter_${id}`, instance);
    HTMLRef[id].id += '_' + calcInstanceCounts;
    HTMLRef[id].value = calcInstance[id];
  }
  ++calcInstanceCounts;
  insertHTMLElement(instance, target, 2);
  return HTMLRef;
}

class calculator {
  constructor(fromBase, toBase) {
    this.id = calcInstanceCounts;
    this._fromNumber = '0';
    this._fromBase = fromBase + '';
    this._toBase = toBase + '';
    this._toNumber = '0';
    this.HTMLRef = createCalculatorHTML(this);
    this._numberPattern = '^\\d+$';
    this.#initializeEventListeners();
  }

  #initializeEventListeners() {
    // for (const id of CALCULATORINPUTIDS) {
    //   this.HTMLRef[id].addEventListener('keydown', (e) => calcFromNumInputHandler(e, id, this));
    //   this.HTMLRef[id].addEventListener('keyup', (e) => calcFromNumInputHandler(e, id, this));
    // }

    this.HTMLRef.fromBase.addEventListener('keydown', (e) => calcBaseInputHandler(e, 'fromBase', this));
    this.HTMLRef.toBase.addEventListener('keydown', (e) => calcBaseInputHandler(e, 'toBase', this));
    this.HTMLRef.fromNumber.addEventListener('keyup', (e) => calcFromNumInputHandler(e, 'fromNumber', this));
    return;
  }

  // Note: only use this function to update the four main props, not the setters themselves, to update both the model and the actual element values together.
  updateCalc(inputKey, inputVal) {
    this[inputKey] = inputVal;
    editHTMLElement(this.HTMLRef[inputKey], { value: inputVal });
    return [inputKey, inputVal];
  }

  digitsToLetter(d) {
    let x = Number(d);
    if (x < 10) return d;
    return String.fromCharCode('A'.charCodeAt(0) + x - 10);
  }

  letterToDigits(l) {
    let x = '' + l;
    if (x.length > 1) x = x[0];
    if (!!(Number(x.search(/\d+/)) + 1)) return Number(x);
    return x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }

  #inputPatternIfBase(base) {
    if (base <= 0 || base == 10) return '\\d+';
    const b = Number(base);
    if (b === 1) return '^1+$';
    else if (b < 10) return `^[0-${b - 1}]+$`;
    const l = this.digitsToLetter(b - 1);
    return `^[a-${l.toLowerCase()}A-${l}\d]+$`;
  }

  #convertDecToBaseN(num, base) {
    const b = Number(base);
    let q = Number(num);
    if (b === 10 || q === 0) return q.toString();
    let r = null;
    let ans = '';
    if (b === 1) ans = ans.padEnd(q, '1');
    else while (q >= 1) {
      r = q % b;
      q = Math.floor(q / b);
      ans = this.digitsToLetter(r) + ans;
    }
    return ans;
  }

  #convertBaseNToDec(num, base) {
    let n = '' + num;
    const b = Number(base);
    if (b === 10) return n;
    const len = n.length;
    if (b === 1) return len + '';
    let ans = '';
    ans = n.split('').reduce((acc, x, i) => {
      x = this.letterToDigits(x);
      return acc + x * Math.pow(b, len - 1 - i);
    }, 0).toString();
    return ans;
  }

  #unaryInputInitializer() {
    this.updateCalc('fromNumber', 1);
    this.updateCalc('toNumber', 1);
  }

  // FIX: Base-1 conversions in this.#convertDecToBaseN() enters infinite while loop, crashing the app
  convert({ fromNumber = this.fromNumber, fromBase = this.fromBase, toBase = this.toBase } = {}) {
    if (fromBase < 1 || toBase < 1) return null;
    let temp = this.#convertBaseNToDec(fromNumber, fromBase);
    if (toBase === '1' && fromNumber === '0') temp = 0;
    else if (toBase !== '10') temp = this.#convertDecToBaseN(temp, toBase);
    this.updateCalc('toNumber', temp);
    return temp;
  }

  set numberPattern(s) {
    this._numberPattern = s;
    this.HTMLRef.fromNumber.pattern = s;
  }
  get numberPattern() {
    return this._numberPattern;
  }
  set fromNumber(val) {
    this._fromNumber = val + '';
  }
  get fromNumber() {
    return this._fromNumber;
  }
  set fromBase(val) {
    this._fromBase = val + '';
    this.numberPattern = this.#inputPatternIfBase(val);
    if (this.fromBase === '1') this.#unaryInputInitializer();
    else if (Number(this.fromNumber) >= Number(this.fromBase)) this.updateCalc('fromNumber', 0);
  }
  get fromBase() {
    return this._fromBase;
  }
  set toBase(val) {
    this._toBase = val + '';
  }
  get toBase() {
    return this._toBase;
  }
  set toNumber(val) {
    this._toNumber = val + '';
  }
  get toNumber() {
    return this._toNumber;
  }
}

export default calculator;

/**
 To debug:
 * input constraint validation patterns not correct after base change
 * 
 */