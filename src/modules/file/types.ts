import {
  FunctionInfo,
  HookInfoMap,
  VariablesInfo,
} from 'src/interfaces/interfaces';

export interface ParseFileResponse {
  filename: string;
  ok: boolean;
  funcInfo: FunctionInfo[];
  hooksInfo: HookInfoMap;
  variablesInfo: VariablesInfo;
}

export type AnyFileResponse = Record<string, any>;
