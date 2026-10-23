import type { AlgoEvent } from './types';

const DIRECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export function createSampleMaze(): number[][] {
  const rows = 11;
  const columns = 15;
  const maze = Array.from({ length: rows }, () => Array(columns).fill(1));

  let seed = 86;
  const randomIndex = (limit: number): number => {
    seed = (seed * 16807) % 2147483647;
    return seed % limit;
  };

  const visited = new Set<string>(['1,1']);
  const stack: Array<[number, number]> = [[1, 1]];
  maze[1][1] = 0;

  while (stack.length > 0) {
    const [row, column] = stack[stack.length - 1];
    const possibleNeighbors: Array<[number, number]> = [
      [row, column + 2],
      [row + 2, column],
      [row, column - 2],
      [row - 2, column],
    ];
    const neighbors = possibleNeighbors.filter(
      ([nextRow, nextColumn]) =>
        nextRow > 0 &&
        nextRow < rows - 1 &&
        nextColumn > 0 &&
        nextColumn < columns - 1 &&
        !visited.has(`${nextRow},${nextColumn}`),
    );

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const [nextRow, nextColumn] = neighbors[randomIndex(neighbors.length)];
    maze[(row + nextRow) / 2][(column + nextColumn) / 2] = 0;
    maze[nextRow][nextColumn] = 0;
    visited.add(`${nextRow},${nextColumn}`);
    stack.push([nextRow, nextColumn]);
  }

  maze[0][0] = 0;
  maze[0][1] = 0;
  maze[10][13] = 0;
  maze[10][14] = 0;
  return maze;
}

export function* solveMaze(maze: number[][]): Generator<AlgoEvent> {
  const rows = maze.length;
  const columns = maze[0]?.length ?? 0;
  const path = new Set<string>();
  const visited = new Set<string>();
  let solutionFound = false;

  function* search(row: number, column: number, depth: number): Generator<AlgoEvent, boolean, unknown> {
    const key = `${row},${column}`;
    const outsideGrid = row < 0 || column < 0 || row >= rows || column >= columns;

    if (outsideGrid || maze[row][column] === 1 || visited.has(key)) return false;

    visited.add(key);
    path.add(key);
    yield {
      type: 'PLACE',
      row,
      col: column,
      depth,
      message: `Explore cell (${row + 1}, ${column + 1})`,
      board: [...path],
    };

    if (row === rows - 1 && column === columns - 1) {
      solutionFound = true;
      yield {
        type: 'SOLUTION',
        row,
        col: column,
        depth,
        message: 'Start-to-finish path found',
        board: [...path],
      };
      return true;
    }

    for (const [rowOffset, columnOffset] of DIRECTIONS) {
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      yield {
        type: 'CHECK',
        row: nextRow,
        col: nextColumn,
        depth,
        message: `Check cell (${nextRow + 1}, ${nextColumn + 1})`,
      };

      if (yield* search(nextRow, nextColumn, depth + 1)) return true;
    }

    path.delete(key);
    yield {
      type: 'BACKTRACK',
      row,
      col: column,
      depth,
      message: `Dead end · leave cell (${row + 1}, ${column + 1})`,
      board: [...path],
    };
    return false;
  }

  yield* search(0, 0, 1);
  yield {
    type: 'DONE',
    message: solutionFound ? 'Maze solved' : 'No path exists',
    depth: 0,
    board: [...path],
  };
}
