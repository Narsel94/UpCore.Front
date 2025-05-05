export interface FunctionInfo {
  name: string | null; // Название функции (может быть анонимной)
  isWrappedInHook: boolean; // Находится ли функция внутри хука
  argumentCount: number; // Количество аргументов
  isAsync: boolean; // Является ли асинхронной
  localVariableCount: number; // Количество локальных переменных
  hasRecursiveCall: boolean; // Рекурсивна ли функция
  cyclomaticComplexity: number; // Цикломатическая сложность
  hasReturn: boolean; // Есть ли return
  returnType: string; // Тип возвращаемого значения
  maxNestingDepth: number; //Глубина вложенности;
  returnStatementCount: number; //Количество return;
}

export interface HookInfo {
  count: number;
  depsCount: number[];
  usesInnerHooks?: string[]; // массив хуков, которые вызывает этот хук внутри себя (если это кастомный хук)
}

export interface HookInfoMap {
  [key: string]: HookInfo;
}

export interface VariablesInfo {
  primitives: number;
  complex: number;
}

// Интерфейс для хранения информации о сложности JSX-разметки,
// возвращаемой из функции
export interface JSXComplexityInfo {
  name: string | null; // Имя функции (или null для анонимных)
  elementCount: number; // Общее количество JSX-элементов
  maxNestingDepth: number; // Максимальная глубина вложенности JSX
  conditionalCount: number; // Количество условных выражений внутри JSX
  totalScore: number; // Общая оценка сложности (рассчитывается по весам)
}
