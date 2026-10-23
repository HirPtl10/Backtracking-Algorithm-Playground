import type { AlgoEvent } from './types';

export function* solveQueens(
  boardSize: number,
  findAllSolutions: boolean,
): Generator<AlgoEvent> {
  const queens = Array<number>(boardSize).fill(-1);
  let solutionsFound = 0;

  function isSafe(row: number, column: number): boolean {
    for (let previousRow = 0; previousRow < row; previousRow += 1) {
      const previousColumn = queens[previousRow];
      const sameColumn = previousColumn === column;
      const sameDiagonal =
        Math.abs(previousColumn - column) === row - previousRow;

      if (sameColumn || sameDiagonal) return false;
    }
    return true;
  }

  function* search(row: number): Generator<AlgoEvent, boolean, unknown> {
    if (row === boardSize) {
      solutionsFound += 1;
      yield {
        type: 'SOLUTION',
        message: `Solution ${solutionsFound} found`,
        depth: row,
        board: [...queens],
      };

      return !findAllSolutions;
    }

    for (let column = 0; column < boardSize; column += 1) {
      yield {
        type: 'CHECK',
        row,
        col: column,
        depth: row,
        message: `Check row ${row + 1}, column ${column + 1}`,
      };

      if (!isSafe(row, column)) {
        yield {
          type: 'INVALID',
          row,
          col: column,
          depth: row,
          message: `Column ${column + 1} conflicts with an earlier queen`,
        };
        continue;
      }

      queens[row] = column;
      yield {
        type: 'PLACE',
        row,
        col: column,
        depth: row + 1,
        message: `Place queen at row ${row + 1}, column ${column + 1}`,
        board: [...queens],
      };
      yield {
        type: 'RECURSE',
        row,
        col: column,
        depth: row + 1,
        message: `Recurse to row ${row + 2}`,
      };

      const stopAfterSolution = yield* search(row + 1);
      if (stopAfterSolution) return true;

      queens[row] = -1;
      yield {
        type: 'BACKTRACK',
        row,
        col: column,
        depth: row + 1,
        message: `Remove queen from row ${row + 1}, column ${column + 1}`,
        board: [...queens],
      };
    }

    return false;
  }

  yield* search(0);
  yield {
    type: 'DONE',
    message: `Search complete · ${solutionsFound} solution${solutionsFound === 1 ? '' : 's'}`,
    depth: 0,
    board: [...queens],
  };
}
