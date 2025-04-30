import { parse } from '@babel/parser';

export function parseCodeToAstTree(code: string, filename = 'file.ts') {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const plugins = [];

  if (ext === '.ts' || ext === '.tsx') plugins.push('typescript');
  if (ext === '.jsx' || ext === '.tsx') plugins.push('jsx');

  const ast = parse(code, {
    // Поддержка ESM и CommonJS
    sourceType: 'module',
    plugins,
    // Разрешить import/export в любом месте
    allowImportExportEverywhere: true,
    sourceFilename: filename,
  });

  return { ast, ext };
}
