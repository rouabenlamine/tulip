import { useState, useEffect } from "react";
import { RotateCcw, Eraser } from "lucide-react";

export default function Soduko() {
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errorCells, setErrorCells] = useState([]);
  const [numbersLeft, setNumbersLeft] = useState(Array(10).fill(9));
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generatePuzzle();
  }, [difficulty]);

  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, [startTime]);

  // 🎲 Generate Sudoku puzzle
  function generatePuzzle() {
    setLoading(true);
    setTimeout(() => {
      const board = generateSolvedBoard();
      const blanks =
        difficulty === "easy"
          ? 36
          : difficulty === "medium"
          ? 46
          : 53; // Hardest removes more

      const puzzleBoard = removeNumbers(board, blanks);
      setPuzzle(
        puzzleBoard.map((row, r) =>
          row.map((v, c) => ({
            value: v,
            fixed: v !== 0,
            row: r,
            col: c,
          }))
        )
      );
      setSolution(board);
      setNumbersLeft(countNumbers(puzzleBoard));
      setErrorCells([]);
      setStartTime(Date.now());
      setElapsed(0);
      setLoading(false);
    }, 300);
  }

  // ✅ Helpers
  function generateSolvedBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    solve(board);
    return board;
  }

  function solve(board) {
    const empty = findEmpty(board);
    if (!empty) return true;
    const [row, col] = empty;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of nums) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (solve(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  function findEmpty(board) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board[r][c] === 0) return [r, c];
    return null;
  }

  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++)
      if (board[row][i] === num || board[i][col] === num) return false;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++)
      for (let c = boxCol; c < boxCol + 3; c++)
        if (board[r][c] === num) return false;
    return true;
  }

  function removeNumbers(board, blanks) {
    const puzzle = board.map((row) => [...row]);
    let removed = 0;
    while (removed < blanks) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (puzzle[r][c] !== 0) {
        puzzle[r][c] = 0;
        removed++;
      }
    }
    return puzzle;
  }

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function countNumbers(p) {
    const counts = Array(10).fill(9);
    p.flat().forEach((v) => {
      if (v !== 0) counts[v]--;
    });
    return counts;
  }

  function handleSelect(row, col) {
    setSelectedCell({ row, col });
  }

  function handleInput(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const newPuzzle = puzzle.map((r) => r.map((c) => ({ ...c })));
    const cell = newPuzzle[row][col];
    if (cell.fixed) return;
    cell.value = num;

    const hasError = solution[row][col] !== num;
    const id = `${row}-${col}`;
    setPuzzle(newPuzzle);
    if (hasError) setErrorCells((prev) => [...new Set([...prev, id])]);
    else setErrorCells((prev) => prev.filter((e) => e !== id));

    setNumbersLeft(countNumbers(newPuzzle.map((r) => r.map((c) => c.value))));
  }

  function handleErase() {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const newPuzzle = puzzle.map((r) => r.map((c) => ({ ...c })));
    const cell = newPuzzle[row][col];
    if (cell.fixed) return;
    cell.value = 0;
    setPuzzle(newPuzzle);
    setErrorCells((prev) => prev.filter((e) => e !== `${row}-${col}`));
    setNumbersLeft(countNumbers(newPuzzle.map((r) => r.map((c) => c.value))));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-green-50 p-6 font-poppins">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-pink-100 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-pink-600 mb-2 text-center">
          🌷 Sudoku Challenge
        </h1>

        <div className="flex justify-between items-center mb-4 text-sm text-green-700">
          <div>
            <label className="mr-2 font-semibold text-pink-600">Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="border border-pink-200 rounded-md px-2 py-1 bg-pink-50"
            >
              <option value="easy">Easy 🌸</option>
              <option value="medium">Medium 🌿</option>
              <option value="hard">Hard 🌷</option>
            </select>
          </div>
          <p>
            ⏱ {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-pink-500 font-medium py-6">Generating puzzle...</p>
        ) : (
          <>
            <div className="grid grid-cols-9 border-4 border-pink-200 rounded-lg overflow-hidden mb-4">
              {puzzle.map((row, r) =>
                row.map((cell, c) => {
                  const id = `${r}-${c}`;
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const isError = errorCells.includes(id);
                  const thickBorder =
                    (c % 3 === 0 ? "border-l-2 " : "") +
                    (r % 3 === 0 ? "border-t-2 " : "") +
                    (c === 8 ? "border-r-2 " : "") +
                    (r === 8 ? "border-b-2 " : "");

                  return (
                    <div
                      key={id}
                      onClick={() => handleSelect(r, c)}
                      className={`w-10 h-10 flex items-center justify-center text-lg font-semibold cursor-pointer transition-all
                        ${cell.fixed ? "text-pink-500" : "text-gray-700"}
                        ${isSelected ? "bg-pink-100" : ""}
                        ${isError ? "bg-red-200" : ""}
                        border border-pink-100 ${thickBorder}`}
                    >
                      {cell.value !== 0 ? cell.value : ""}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleInput(num)}
                  className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full w-10 h-10 flex flex-col items-center justify-center text-sm font-semibold"
                >
                  {num}
                  <span className="text-[10px] text-gray-500">({numbersLeft[num]})</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleErase}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-all"
              >
                <Eraser size={18} /> Erase
              </button>
              <button
                onClick={generatePuzzle}
                className="flex items-center gap-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 rounded-lg text-pink-700 transition-all"
              >
                <RotateCcw size={18} /> New Game
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
