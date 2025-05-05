import { HookInfo, HookInfoMap } from 'src/interfaces/interfaces';

export function calcTotalHooksCognitiveComplexity(
  hooksInfo: HookInfoMap,
): number {
  const UPPER_LIMIT = 5;

  const COEF_FREQUENT = 1;
  const COEF_RARE = 1.2;
  const COEF_CUSTOM = 1.5;
  const COEF_CUSTOM_WITH_INNER = 2.0;

  const FREQUENT_STD_HOOKS = new Set([
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'useId',
    'useContext',
  ]);

  const ALL_STD_HOOKS = new Set([
    'useReducer',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useTransition',
    'useDeferredValue',
    'useId',
    'useSyncExternalStore',
  ]);

  let totalHooks = 0;
  let score = 0;

  for (const [hook, hookData] of Object.entries(hooksInfo)) {
    const { count, depsCount } = hookData as HookInfo & {
      usesInnerHooks?: string[];
    };
    totalHooks += count;

    let baseCoef = COEF_FREQUENT;
    if (!FREQUENT_STD_HOOKS.has(hook)) {
      baseCoef = ALL_STD_HOOKS.has(hook)
        ? COEF_RARE
        : (hookData as any).usesInnerHooks?.length
          ? COEF_CUSTOM_WITH_INNER
          : COEF_CUSTOM;
    }

    let depsScore = 0;
    for (const deps of depsCount) {
      depsScore += deps <= 1 ? 1 : 1 + (deps - 1) * 0.2;
    }

    score += count * baseCoef + depsScore;
  }

  const globalCoef =
    totalHooks > UPPER_LIMIT ? 1 + (totalHooks - UPPER_LIMIT) * 0.1 : 1;

  return Number((score * globalCoef).toFixed(2));
}
