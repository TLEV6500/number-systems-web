import { Converter } from "./calculator.mjs";


const calc1 = new Converter(10, 2);

const calculators = [calc1];

const addCalc = () => {
  const lastCalc = calculators.at(-1);
  const newCalc = new Converter(lastCalc.fromBase, lastCalc.toBase);
  calculators.push(newCalc);
}