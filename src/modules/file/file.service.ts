import { BadRequestException, Injectable } from '@nestjs/common';
import {
  analyzeFunctions,
  countReactHooks,
  countVariables,
  parseCodeToAstTree,
  calcTotalHooksCognitiveComplexity,
  calcTotalFileFunctionsCognitiveComplexity,
  calcVariablesCognitiveComplexity,
  analyzeJSXReturnsComplexity,
  calculateUnifiedCognitiveComplexity,
  calculateJSXComplexityScore,
} from 'src/common/utils';
import { AnyFileResponse } from './types';

@Injectable()
export class FileService {
  parseFile(file: Express.Multer.File): AnyFileResponse {
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    if (!ext || !['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
      throw new BadRequestException(
        'Поддерживаются только ts, tsx, js, jsx файлы',
      );
    }

    const code = file.buffer.toString('utf-8');

    try {
      const { ast } = parseCodeToAstTree(code, file.originalname);
      const funcInfo = analyzeFunctions(ast);
      const hooksInfo = countReactHooks(ast);
      const variablesInfo = countVariables(ast);
      const jsxInfo = analyzeJSXReturnsComplexity(ast);

      const detailedInfo = {
        functions: calcTotalFileFunctionsCognitiveComplexity(funcInfo),
        hooks: calcTotalHooksCognitiveComplexity(hooksInfo),
        jsx: calculateJSXComplexityScore(jsxInfo),
        variables:
          calcVariablesCognitiveComplexity(variablesInfo.primitives) +
          calcVariablesCognitiveComplexity(variablesInfo.complex, true),
      };

      return {
        totalComplexity: calculateUnifiedCognitiveComplexity(detailedInfo),
        detailedInfo,
        filename: file.originalname,
        ok: true,
        // funcComplexity: calcTotalFileFunctionsCognitiveComplexity(funcInfo),
        // hooksComplexity: calcTotalHooksCognitiveComplexity(hooksInfo),
        // jsxComplexity: analyzeJSXReturnsComplexity(ast),
        // variablesInfo: {
        //   primitive: calcVariablesCognitiveComplexity(variablesInfo.primitives),
        //   complex: calcVariablesCognitiveComplexity(
        //     variablesInfo.complex,
        //     true,
        //   ),
        // },
      };
    } catch (err) {
      throw new BadRequestException(`Ошибка парсинга AST: ${err.message}`);
    }
  }
}
