import traverse from '@babel/traverse';
import {
  File,
  isJSXElement,
  isJSXFragment,
  isJSXExpressionContainer,
  isConditionalExpression,
  isLogicalExpression,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
} from '@babel/types';
import { JSXComplexityInfo } from 'src/interfaces/interfaces';

//Коэфициенты
const JSX_ELEMENTS = 1;
const JSX_CONDITIONALS = 1.5;
const JSX_DEPTH = 2;

// Главная функция, принимает AST-файл и возвращает список оценок JSX-комплексности
export function analyzeJSXReturnsComplexity(ast: File): JSXComplexityInfo[] {
  const results: JSXComplexityInfo[] = [];

  // Рекурсивно обходит JSX-дерево
  function traverseJSX(
    node: any,
    depth: number,
    ctx: { elements: number; conditionals: number; maxDepth: number },
  ) {
    if (isJSXElement(node) || isJSXFragment(node)) {
      ctx.elements++; // Считаем элемент
      ctx.maxDepth = Math.max(ctx.maxDepth, depth); // Обновляем максимальную вложенность

      const children = node.children || [];

      for (const child of children) {
        if (isJSXElement(child) || isJSXFragment(child)) {
          traverseJSX(child, depth + 1, ctx); // Рекурсивный обход JSX-детей
        } else if (isJSXExpressionContainer(child)) {
          const expr = child.expression;

          // Условные конструкции: тернарные или логические выражения
          if (isConditionalExpression(expr) || isLogicalExpression(expr)) {
            ctx.conditionals++;
          }

          traverseJSX(expr, depth + 1, ctx); // Обходим вложенный JSX внутри выражения
        }
      }
    }
  }

  // Извлекает имя функции (если есть)
  const extractName = (path: any): string | null => {
    const node = path.node;
    if ('id' in node && node.id?.type === 'Identifier') {
      return node.id.name;
    } else if (path.parentPath?.isVariableDeclarator()) {
      const id = path.parentPath.node.id;
      if (id.type === 'Identifier') return id.name;
    }
    return null;
  };

  // Обходим AST, ищем все типы функций
  traverse(ast, {
    FunctionDeclaration(path) {
      processFunction(path);
    },
    FunctionExpression(path) {
      processFunction(path);
    },
    ArrowFunctionExpression(path) {
      processFunction(path);
    },
  });

  // Обрабатывает каждую функцию и извлекает JSX из return
  function processFunction(
    path:
      | babel.NodePath<FunctionDeclaration>
      | babel.NodePath<FunctionExpression>
      | babel.NodePath<ArrowFunctionExpression>,
  ) {
    const name = extractName(path); // Получаем имя функции

    path.traverse({
      ReturnStatement(returnPath) {
        const arg = returnPath.node.argument;
        if (!arg) return;

        const ctx = {
          elements: 0,
          conditionals: 0,
          maxDepth: 0,
        };

        // Если возвращается JSX, запускаем анализ
        if (isJSXElement(arg) || isJSXFragment(arg)) {
          traverseJSX(arg, 1, ctx);

          // Вычисляем итоговую оценку: чем больше элементов, глубина и условий — тем сложнее
          const totalScore = Number(
            (
              ctx.elements * JSX_ELEMENTS +
              ctx.maxDepth * JSX_DEPTH +
              ctx.conditionals * JSX_CONDITIONALS
            ).toFixed(1),
          );

          // Добавляем результат
          results.push({
            name,
            elementCount: ctx.elements,
            maxNestingDepth: ctx.maxDepth,
            conditionalCount: ctx.conditionals,
            totalScore,
          });
        }
      },
    });
  }

  return results; // Возвращаем массив JSX-сложностей по каждой функции
}
