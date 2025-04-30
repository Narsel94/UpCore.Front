export interface FunctionInfo {
  name: string | null;
  isWrappedInHook: boolean;
  argumentCount: number;
  isAsync: boolean;
  localVariableCount: number;
  hasRecursiveCall: boolean;
  cyclomaticComplexity: number;
  hasReturn: boolean;
  returnType: string;
}

export interface HookInfo {
  count: number;
  depsCount: number[];
}

export interface HookInfoMap {
  [key: string]: HookInfo;
}
