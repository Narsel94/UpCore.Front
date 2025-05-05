//Вес в итоговом подсчете (сумма === 1), могут быть адаптированы под разные типы
//например - ию - увеличить вес JSX,
//для бизнес-логики -  увеличит вес логики и т.д.
const LOGIC = 0.4;
const JSX = 0.3;
const HOOK = 0.2;
const SIZE = 0.1;

export interface UnifiedCognitiveComplexityArg {
  variables: number;
  jsx: number;
  hooks: number;
  functions: number;
}

export function calculateUnifiedCognitiveComplexity({
  variables,
  jsx,
  hooks,
  functions,
}: UnifiedCognitiveComplexityArg): number {
  const totalScore =
    functions * LOGIC + jsx * JSX + hooks * HOOK + variables * SIZE;

  return Number(totalScore.toFixed(2));
}
