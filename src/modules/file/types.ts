import { FunctionInfo, HookInfoMap } from 'src/interfaces/interfaces';

export interface ParseFileResponse {
  filename: string;
  ok: boolean;
  funcInfo: FunctionInfo[];
  hooksInfo: HookInfoMap;
}
