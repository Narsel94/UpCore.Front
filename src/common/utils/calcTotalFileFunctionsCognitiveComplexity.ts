import { FunctionInfo } from 'src/interfaces/interfaces';

// Коэффициенты влияния различных признаков на когнитивную сложность
const ASYNC_LOGIC = 0.5; // Надбавка за асинхронность
const RECURSIVE_LOGIC = 1; // Надбавка за рекурсию
const HOOK_WRAPPING = 0.2; // Надбавка за оборачивание в хук
const FUNC_COUT_COEF = 0.1; // Надбавка за позицию функции в списке (чем дальше — тем сложнее)

const LOCAL_VARIABLES_COEF = 0.1; // Вес локальных переменных
const ARGUMENTS_COUNT_COEF = 0.2; // Вес количества аргументов
const NESTING_DEPTH_COEF = 0.3; // вклад за максимальную вложенность
const RETURN_COUNT_COEF = 0.2; // вклад за количество return'ов
// Утилита для расчета значения по количеству и коэффициенту
const calcCountFactor = (count: number = 0, coef: number = 1) => {
  return count * coef;
};

// Основная функция для расчета суммарной когнитивной сложности всех функций в файле
export function calcTotalFileFunctionsCognitiveComplexity(
  functions: FunctionInfo[],
): number {
  let totalComplexity = 0;

  functions.forEach((fn, index) => {
    let base = fn.cyclomaticComplexity;
    let positionFactor = 1 + index * FUNC_COUT_COEF;

    let bonusFactor = 0;

    // Количество аргументов
    bonusFactor += calcCountFactor(fn.argumentCount, ARGUMENTS_COUNT_COEF);
    // Количество локальных переменных
    bonusFactor += calcCountFactor(fn.localVariableCount, LOCAL_VARIABLES_COEF);
    // Обернута ли в хук
    if (fn.isWrappedInHook) bonusFactor += HOOK_WRAPPING;
    // Асинхронность
    if (fn.isAsync) bonusFactor += ASYNC_LOGIC;
    // Рекурсия
    if (fn.hasRecursiveCall) bonusFactor += RECURSIVE_LOGIC;
    // Глубина вложенности
    bonusFactor += calcCountFactor(fn.maxNestingDepth, NESTING_DEPTH_COEF);
    // Количество return
    bonusFactor += calcCountFactor(fn.returnStatementCount, RETURN_COUNT_COEF);

    const effectiveComplexity = base * (positionFactor + bonusFactor);
    totalComplexity += effectiveComplexity;
  });

  return Number(totalComplexity.toFixed(1));
}
