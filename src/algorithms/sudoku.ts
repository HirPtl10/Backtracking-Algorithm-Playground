import type { AlgoEvent } from './types';

const SIZE = 9;
const BOX_SIZE = 3;

export function* solveSudoku(puzzle: number[][]): Generator<AlgoEvent> {
  const board = puzzle.map((row) => [...row]);
  let solutionFound = false;

  function isValid(row: number, column: number, value: number): boolean {
    for (let index = 0; index < SIZE; index += 1) {
      if (board[row][index] === value) return false;
      if (board[index][column] === value) return false;
    }

    const firstBoxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const firstBoxColumn = Math.floor(column / BOX_SIZE) * BOX_SIZE;

    for (let boxRow = firstBoxRow; boxRow < firstBoxRow + BOX_SIZE; boxRow += 1) {
      for (
        let boxColumn = firstBoxColumn;
        boxColumn < firstBoxColumn + BOX_SIZE;
        boxColumn += 1
      ) {
        if (board[boxRow][boxColumn] === value) return false;
      }
    }

    return true;
  }

  function candidatesFor(row: number, column: number): number[] {
    const candidates: number[] = [];
    for (let value = 1; value <= SIZE; value += 1) {
      if (isValid(row, column, value)) candidates.push(value);
    }
    return candidates;
  }

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const clue = board[row][column];
      if (clue === 0) continue;

      board[row][column] = 0;
      const validClue = isValid(row, column, clue);
      board[row][column] = clue;

      if (!validClue) {
        yield {
          type: 'DONE',
          message: `Invalid puzzle: duplicate ${clue} near row ${row + 1}, column ${column + 1}`,
          depth: 0,
          board: board.map((line) => [...line]),
        };
        return;
      }
    }
  }

  function* search(depth: number): Generator<AlgoEvent, boolean, unknown> {
    let selectedRow = -1;
    let selectedColumn = -1;
    let smallestCandidateCount = SIZE + 1;

    for (let row = 0; row < SIZE; row += 1) {
      for (let column = 0; column < SIZE; column += 1) {
        if (board[row][column] !== 0) continue;

        const candidateCount = candidatesFor(row, column).length;
        if (candidateCount < smallestCandidateCount) {
          smallestCandidateCount = candidateCount;
          selectedRow = row;
          selectedColumn = column;
        }
      }
    }

    if (selectedRow === -1) {
      solutionFound = true;
      yield {
        type: 'SOLUTION',
        message: 'Sudoku solved',
        depth,
        board: board.map((row) => [...row]),
      };
      return true;
    }

    if (smallestCandidateCount === 0) return false;

    for (let value = 1; value <= SIZE; value += 1) {
      yield {
        type: 'CHECK',
        row: selectedRow,
        col: selectedColumn,
        value,
        depth,
        message: `Try ${value} in row ${selectedRow + 1}, column ${selectedColumn + 1}`,
      };

      if (!isValid(selectedRow, selectedColumn, value)) {
        yield {
          type: 'INVALID',
          row: selectedRow,
          col: selectedColumn,
          value,
          depth,
          message: `${value} violates a row, column or box constraint`,
        };
        continue;
      }

      board[selectedRow][selectedColumn] = value;
      yield {
        type: 'PLACE',
        row: selectedRow,
        col: selectedColumn,
        value,
        depth: depth + 1,
        message: `Place ${value} at row ${selectedRow + 1}, column ${selectedColumn + 1}`,
        board: board.map((row) => [...row]),
      };
      yield {
        type: 'RECURSE',
        row: selectedRow,
        col: selectedColumn,
        depth: depth + 1,
        message: 'Recurse to the next constrained empty cell',
      };

      if (yield* search(depth + 1)) return true;

      board[selectedRow][selectedColumn] = 0;
      yield {
        type: 'BACKTRACK',
        row: selectedRow,
        col: selectedColumn,
        value,
        depth: depth + 1,
        message: `Undo ${value} at row ${selectedRow + 1}, column ${selectedColumn + 1}`,
        board: board.map((row) => [...row]),
      };
    }

    return false;
  }

  yield* search(0);
  yield {
    type: 'DONE',
    message: solutionFound ? 'Sudoku solved' : 'No solution exists for this puzzle',
    depth: 0,
    board: board.map((row) => [...row]),
  };
}
