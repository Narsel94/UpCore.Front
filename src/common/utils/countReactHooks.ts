import traverse from '@babel/traverse';
import { HookInfo, HookInfoMap } from 'src/interfaces/interfaces';
import * as babelTypes from '@babel/types';
export function countReactHooks(ast: babelTypes.Node): HookInfoMap {
  // Объект для хранения информации о хуках
  const hookInfo = {};

  // Список стандартных React-хуков
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

  // Инициализируем структуру для каждого хука
  reactHooks.forEach((hook) => {
    hookInfo[hook] = { count: 0, depsCount: [] };
  });

  // Обходим AST
  traverse(ast, {
    // Ищем вызовы функций (CallExpression)
    CallExpression(path) {
      const { callee, arguments: args } = path.node;

      // Проверяем, является ли callee идентификатором
      if (callee.type === 'Identifier') {
        const hookName = callee.name;

        // Проверяем, является ли это React-хуком или кастомным хуком
        if (reactHooks.includes(hookName) || hookName.startsWith('use')) {
          // Инициализируем кастомный хук, если он еще не добавлен
          if (!hookInfo[hookName]) {
            hookInfo[hookName] = { count: 0, depsCount: [] };
          }

          // Увеличиваем счетчик вызовов
          hookInfo[hookName].count += 1;

          // Проверяем массив зависимостей (для хуков типа useEffect, useCallback, useMemo и кастомных)
          if (
            hookName === 'useEffect' ||
            hookName === 'useLayoutEffect' ||
            hookName === 'useCallback' ||
            hookName === 'useMemo' ||
            hookName.startsWith('use')
          ) {
            // Массив зависимостей обычно второй аргумент (args[1])
            const depsArray = args[1];
            let depsCount = 0;

            if (depsArray && depsArray.type === 'ArrayExpression') {
              depsCount = depsArray.elements.length;
            }

            hookInfo[hookName].depsCount.push(depsCount);
          } else {
            // Для хуков без зависимостей (например, useState, useRef) добавляем 0
            hookInfo[hookName].depsCount.push(0);
          }
        }
      }
    },
  });

  // Фильтруем хуки с нулевым количеством использований
  const filteredInfo: HookInfoMap = {};
  for (const [hook, info] of Object.entries(hookInfo)) {
    if ((info as HookInfo).count > 0) {
      filteredInfo[hook] = info as HookInfo;
    }
  }

  return filteredInfo;
}
