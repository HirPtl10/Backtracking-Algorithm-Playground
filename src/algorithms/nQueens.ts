import type { AlgoEvent } from './types';

/**
 * Place one queen in each row. A row is a recursion level, and each column is
 * a candidate choice at that level.
 */
export function* solveQueens(
  boardSize: number,
  findAllSolutions: boolean,
): Generator<AlgoEvent> {
  // queens[row] stores the column occupied by that row. -1 means empty.
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
    // Base case: all rows have a queen, so this is a complete solution.
    if (row === boardSize) {
      solutionsFound += 1;
      yield {
        type: 'SOLUTION',
        message: `Solution ${solutionsFound} found`,
        depth: row,
        board: [...queens],
      };

      // Returning true stops the search when only the first solution is wanted.
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

      // Choose: place a queen, then search the next row.
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

      // Undo: the deeper rows had no solution with this placement.
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

    // Every column was tried and none led to a solution.
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
