# Backtracking Algorithm Playground

**DAA course project**

An interactive React, TypeScript, and Vite DAA project for exploring N-Queens, Sudoku, graph coloring, and maze solving through real step-by-step backtracking events. Each readable solver is in its own file under `src/algorithms/`.

## Run

```bash
npm install
npm run dev
```

Choose a problem, configure its input, then use **Run**, **Pause/Resume**, **Step**, and **Reset**. Adjust the speed to inspect placements, rejected choices, and backtracks. Sudoku cells and maze walls are editable.

## Complexity

- **N-Queens:** O(N · N!) time, O(N) auxiliary space.
- **Sudoku:** O(9^E) worst-case time, O(E) recursion space; E is the number of empty cells. Uses the fewest-candidates-first heuristic.
- **Graph coloring:** O(K^V) time, O(V) auxiliary space; V vertices and K colors.
- **Maze:** O(R × C) time and auxiliary space; R rows and C columns.
