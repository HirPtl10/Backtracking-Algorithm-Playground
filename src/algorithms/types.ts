export type Problem = 'queens' | 'sudoku' | 'coloring' | 'maze';
export type EventType = 'CHECK'|'PLACE'|'INVALID'|'RECURSE'|'BACKTRACK'|'SOLUTION'|'DONE';
export interface AlgoEvent { type: EventType; message: string; row?: number; col?: number; value?: number|string; depth: number; board?: any; }
export interface RunMetrics { step: number; calls: number; states: number; choices: number; backtracks: number; maxDepth: number; solutions: number; elapsed: number; }
