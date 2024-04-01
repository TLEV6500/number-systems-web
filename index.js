import calculator from "./calculator.mjs";

const calc1 = new calculator(10, 2);

const calculators = [calc1];

const addCalc = () => {
  const lastCalc = calculators.at(-1);
  const newCalc = new calculator(lastCalc.fromBase, lastCalc.toBase);
  calculators.push(newCalc);
}