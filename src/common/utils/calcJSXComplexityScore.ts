import { JSXComplexityInfo } from 'src/interfaces/interfaces';

// Коэффициенты влияния различных признаков на JSX сложность
const ELEMENT_WEIGHT = 1; // каждый JSX-элемент = 1 балл
const DEPTH_WEIGHT = 2; // каждый уровень вложенности = 2 балла
const CONDITIONAL_WEIGHT = 1.5; // каждое условие (&& или ?) = 1.5 балла

export function calculateJSXComplexityScore(info: JSXComplexityInfo[]): number {
  return info.reduce((acc, info) => acc + info.totalScore, 0);
}
