/** Events emitted by the algorithm generators and consumed by the visualizer. */
export type EventType =
  | 'CHECK'
  | 'PLACE'
  | 'INVALID'
  | 'RECURSE'
  | 'BACKTRACK'
  | 'SOLUTION'
  | 'DONE';

export type Problem = 'queens' | 'sudoku' | 'coloring' | 'maze';

export interface AlgoEvent {
  type: EventType;
  message: string;
  depth: number;
  row?: number;
  col?: number;
  value?: number | string;
  board?: unknown;
}

export interface RunMetrics {
  step: number;
  calls: number;
  states: number;
  choices: number;
  backtracks: number;
  maxDepth: number;
  solutions: number;
  elapsed: number;
}
