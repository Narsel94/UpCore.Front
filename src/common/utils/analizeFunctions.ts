import traverse, { NodePath } from '@babel/traverse';
import {
  File,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
} from '@babel/types';
import { FunctionInfo } from 'src/interfaces/interfaces';

const reactHooks = [
  'useEffect',
  'useLayoutEffect',
  'useCallback',
  'useMemo',
  'useReducer',
  'useTransition',
];

export function analyzeFunctions(ast: File): FunctionInfo[] {
  const functionInfo: FunctionInfo[] = [];

  const analyze = (
    path: NodePath<
      FunctionDeclaration | FunctionExpression | ArrowFunctionExpression
    >,
  ) => {
    const { node, scope } = path;

    // Имя функции
    let name: string | null = null;

    if ('id' in node && node.id && node.id.type === 'Identifier') {
      name = node.id.name;
    } else if (path.parentPath?.isVariableDeclarator()) {
      const parentNode = path.parentPath.node;
      if (parentNode.id.type === 'Identifier') {
        name = parentNode.id.name;
      }
    }

    // Проверяем, обернута ли функция хуком
    let isWrappedInHook = false;
    let parentPath = path.parentPath;
    while (parentPath) {
      if (parentPath.isCallExpression()) {
        const callee = parentPath.node.callee;
        if (
          (callee.type === 'Identifier' &&
            (reactHooks.includes(callee.name) ||
              callee.name.startsWith('use'))) ||
          (callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            (reactHooks.includes(callee.object.name) ||
              callee.object.name.startsWith('use')))
        ) {
          if (parentPath.node.arguments.some((arg) => arg === node)) {
            isWrappedInHook = true;
            break;
          }
        }
      }
      parentPath = parentPath.parentPath;
    }

    // Количество аргументов
    const argumentCount = node.params.length;

    // Асинхронная ли функция
    const isAsync = node.async;

    // Подсчет локальных переменных
    let localVariableCount = 0;
    const bindings = scope.getAllBindings();
    for (const bindingName in bindings) {
      const binding = bindings[bindingName];
      if (['var', 'let', 'const'].includes(binding.kind)) {
        if (binding.path.findParent((p) => p === path)) {
          localVariableCount++;
        }
      }
    }

    // Проверка рекурсии
    let hasRecursiveCall = false;
    if (name) {
      path.traverse({
        CallExpression(innerPath) {
          if (
            innerPath.node.callee.type === 'Identifier' &&
            innerPath.node.callee.name === name &&
            innerPath.scope.getBinding(name) === scope.getBinding(name)
          ) {
            hasRecursiveCall = true;
          }
        },
      });
    }

    // Цикломатическая сложность
    let cyclomaticComplexity = 1;
    path.traverse({
      IfStatement() {
        cyclomaticComplexity++;
      },
      ForStatement() {
        cyclomaticComplexity++;
      },
      WhileStatement() {
        cyclomaticComplexity++;
      },
      DoWhileStatement() {
        cyclomaticComplexity++;
      },
      SwitchCase() {
        cyclomaticComplexity++;
      },
      LogicalExpression() {
        cyclomaticComplexity++;
      },
      ConditionalExpression() {
        cyclomaticComplexity++;
      },
      TryStatement() {
        cyclomaticComplexity++;
      },
    });

    // Возвращаемое значение
    let hasReturn = false;
    let returnType = 'unknown';
    path.traverse({
      ReturnStatement(returnPath) {
        hasReturn = true;
        const arg = returnPath.node.argument;
        if (!arg) returnType = 'void';
        else {
          switch (arg.type) {
            case 'NumericLiteral':
              returnType = 'number';
              break;
            case 'StringLiteral':
              returnType = 'string';
              break;
            case 'BooleanLiteral':
              returnType = 'boolean';
              break;
            case 'NullLiteral':
              returnType = 'null';
              break;
            case 'ObjectExpression':
              returnType = 'object';
              break;
            case 'ArrayExpression':
              returnType = 'array';
              break;
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
              returnType = 'function';
              break;
            case 'JSXElement':
            case 'JSXFragment':
              returnType = 'jsx';
              break;
            case 'Identifier':
              returnType = arg.name === 'undefined' ? 'undefined' : 'reference';
              break;
            case 'CallExpression':
              returnType = 'call';
              break;
            case 'BinaryExpression':
              returnType =
                arg.left.type === 'CallExpression' &&
                arg.right.type === 'CallExpression'
                  ? 'number'
                  : 'complex';
              break;
            default:
              returnType = 'complex';
          }
        }
      },
    });

    return {
      name,
      isWrappedInHook,
      argumentCount,
      isAsync,
      localVariableCount,
      hasRecursiveCall,
      cyclomaticComplexity,
      hasReturn,
      returnType,
    };
  };

  traverse(ast, {
    FunctionDeclaration(path) {
      functionInfo.push(analyze(path));
    },
    FunctionExpression(path) {
      functionInfo.push(analyze(path));
    },
    ArrowFunctionExpression(path) {
      functionInfo.push(analyze(path));
    },
  });

  return functionInfo;
}
