import { BadRequestException, Injectable } from '@nestjs/common';
import {
  analyzeFunctions,
  countReactHooks,
  parseCodeToAstTree,
} from 'src/common/utils';
import { ParseFileResponse } from './types';

@Injectable()
export class FileService {
  parseFile(file: Express.Multer.File): ParseFileResponse {
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
      return {
        filename: file.originalname,
        ok: true,
        funcInfo: funcInfo,
        hooksInfo,
      };
    } catch (err) {
      throw new BadRequestException(`Ошибка парсинга AST: ${err.message}`);
    }
  }
}
