import traverse from '@babel/traverse';
import * as babelTypes from '@babel/types';
import { VariablesInfo } from 'src/interfaces/interfaces';

export const countVariables = (ast: babelTypes.Node): VariablesInfo => {
  const variableCounts = {
    primitives: 0,
    complex: 0,
  };

  traverse(ast, {
    VariableDeclarator(path) {
      // Исключаем переменные, объявленные внутри функций
      if (path.findParent((p) => p.isFunction())) {
        return;
      }

      const { init } = path.node;

      if (!init) {
        variableCounts.primitives += 1;
        return;
      }

      // Исключаем функции и JSX
      const excludedTypes = new Set([
        'FunctionExpression',
        'ArrowFunctionExpression',
        'ClassExpression',
        'JSXElement',
        'JSXFragment',
      ]);

      if (excludedTypes.has(init.type)) {
        return;
      }

      switch (init.type) {
        case 'NumericLiteral':
        case 'StringLiteral':
        case 'BooleanLiteral':
        case 'NullLiteral':
        case 'BigIntLiteral':
        case 'TemplateLiteral':
          variableCounts.primitives += 1;
          break;

        case 'Identifier':
          if (init.name === 'undefined') {
            variableCounts.primitives += 1;
          } else {
            variableCounts.complex += 1;
          }
          break;

        case 'ObjectExpression':
        case 'ArrayExpression':
        case 'NewExpression':
        case 'CallExpression':
        case 'MemberExpression':
          variableCounts.complex += 1;
          break;

        default:
          variableCounts.complex += 1;
          break;
      }
    },
  });

  return variableCounts;
};
