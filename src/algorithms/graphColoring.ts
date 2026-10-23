import type { AlgoEvent } from './types';

export const GRAPH_EDGES: Array<[number, number]> = [
  [0, 1],
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 3],
  [2, 4],
  [3, 4],
];

export function* colorGraph(
  vertexCount: number,
  colorCount: number,
): Generator<AlgoEvent> {
  const colors = Array<number>(vertexCount).fill(-1);
  let solutionsFound = 0;

  function conflictsWithNeighbor(vertex: number, color: number): boolean {
    return GRAPH_EDGES.some(([first, second]) => {
      const neighbor = first === vertex ? second : second === vertex ? first : -1;
      return neighbor !== -1 && colors[neighbor] === color;
    });
  }

  function* search(vertex: number): Generator<AlgoEvent, boolean, unknown> {
    if (vertex === vertexCount) {
      solutionsFound += 1;
      yield {
        type: 'SOLUTION',
        message: 'Valid coloring found',
        depth: vertex,
        board: [...colors],
      };
      return true;
    }

    for (let color = 0; color < colorCount; color += 1) {
      yield {
        type: 'CHECK',
        row: vertex,
        col: color,
        depth: vertex,
        message: `Try color ${color + 1} on vertex ${vertex + 1}`,
      };

      if (conflictsWithNeighbor(vertex, color)) {
        yield {
          type: 'INVALID',
          row: vertex,
          col: color,
          depth: vertex,
          message: `Color ${color + 1} conflicts with an adjacent vertex`,
        };
        continue;
      }

      colors[vertex] = color;
      yield {
        type: 'PLACE',
        row: vertex,
        col: color,
        value: color,
        depth: vertex + 1,
        message: `Assign color ${color + 1} to vertex ${vertex + 1}`,
        board: [...colors],
      };

      if (yield* search(vertex + 1)) return true;

      colors[vertex] = -1;
      yield {
        type: 'BACKTRACK',
        row: vertex,
        col: color,
        depth: vertex + 1,
        message: `Remove color from vertex ${vertex + 1}`,
        board: [...colors],
      };
    }

    return false;
  }

  yield* search(0);
  yield {
    type: 'DONE',
    message: `Search complete · ${solutionsFound} solution${solutionsFound === 1 ? '' : 's'}`,
    depth: 0,
    board: [...colors],
  };
}
