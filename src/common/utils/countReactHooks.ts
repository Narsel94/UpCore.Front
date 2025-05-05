import traverse from '@babel/traverse';
import { HookInfo, HookInfoMap } from 'src/interfaces/interfaces';
import * as babelTypes from '@babel/types';

export function countReactHooks(ast: babelTypes.Node): HookInfoMap {
  const hookInfo: HookInfoMap = {};
  const hookCallMap: Record<string, Set<string>> = {};

  const reactHooks = [
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useTransition',
    'useDeferredValue',
    'useId',
    'useSyncExternalStore',
  ];

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name?.startsWith('use')) {
        const innerHooks = new Set<string>();
        path.traverse({
          CallExpression(innerPath) {
            const callee = innerPath.node.callee;
            if (callee.type === 'Identifier') {
              const innerName = callee.name;
              if (
                reactHooks.includes(innerName) ||
                innerName.startsWith('use')
              ) {
                innerHooks.add(innerName);
              }
            }
          },
        });

        if (innerHooks.size > 0) {
          hookCallMap[name] = innerHooks;
        }
      }
    },

    CallExpression(path) {
      const { callee, arguments: args } = path.node;

      if (callee.type === 'Identifier') {
        const hookName = callee.name;

        if (reactHooks.includes(hookName) || hookName.startsWith('use')) {
          hookInfo[hookName] ??= { count: 0, depsCount: [] };
          hookInfo[hookName].count += 1;

          const depsArray = args[1];
          let depsCount = 0;

          if (depsArray && depsArray.type === 'ArrayExpression') {
            depsCount = depsArray.elements.length;
          }

          hookInfo[hookName].depsCount.push(
            ['useEffect', 'useLayoutEffect', 'useCallback', 'useMemo'].includes(
              hookName,
            ) || hookName.startsWith('use')
              ? depsCount
              : 0,
          );
        }
      }
    },
  });

  // помечаем вложенные кастомные хуки
  for (const hook in hookCallMap) {
    const used = hookCallMap[hook];
    if (!hookInfo[hook]) continue;
    (hookInfo[hook] as HookInfo).usesInnerHooks = Array.from(used);
  }

  // фильтруем
  const filteredInfo: HookInfoMap = {};
  for (const [hook, info] of Object.entries(hookInfo)) {
    if (info.count > 0) {
      filteredInfo[hook] = info;
    }
  }

  return filteredInfo;
}
