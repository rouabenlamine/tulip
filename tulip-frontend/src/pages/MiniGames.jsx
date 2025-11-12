import { Link } from "react-router-dom";
import { Brain, Grid3X3, Gamepad, Spade } from "lucide-react";

export default function MiniGames() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-100 p-8  font-poppins">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-10 w-full max-w-3xl text-center border border-green-100">
        <h1 className="text-3xl font-bold text-pink-500 mb-4">
          🌸 Mini Games 🌸
        </h1>
        <p className="text-orange-600 mb-8">
          Relax, challenge yourself, or just have fun with these cute Tulip-style games 💕
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Sudoku */}
          <Link
            to="/minigames/soduko"
            className="flex flex-col items-center justify-center bg-pink-100 hover:bg-pink-200 rounded-2xl shadow-md p-6 transition-all border border-pink-200"
          >
            <Grid3X3 className="text-pink-600 mb-2" size={40} />
            <h2 className="text-lg font-semibold text-pink-700">Sudoku Challenge</h2>
            <p className="text-sm text-pink-600 mt-1">Solve pastel puzzles 🌷</p>
          </Link>

          {/* Memory Game */}
          <Link
            to="/minigames/memorygame"
            className="flex flex-col items-center justify-center bg-green-100 hover:bg-green-200 rounded-2xl shadow-md p-6 transition-all border border-green-200"
          >
            <Brain className="text-green-600 mb-2" size={40} />
            <h2 className="text-lg font-semibold text-green-700">Memory Match</h2>
            <p className="text-sm text-green-600 mt-1">Train your memory 🌼</p>
          </Link>
          <Link
            to="/minigames/pool"
            className="flex flex-col items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-2xl shadow-md p-6 transition-all border border-blue-200"
          >
            <Gamepad className="text-blue-600 mb-2" size={40} />
            <h2 className="text-lg font-semibold text-blue-700">Pool</h2>
            <p className="text-sm text-blue-600 mt-1">Play for the win 🎱 </p>
          </Link>
          <Link
            to="/minigames/solitaire"
            className="flex flex-col items-center justify-center bg-orange-100 hover:bg-orange-200 rounded-2xl shadow-md p-6 transition-all border border-orange-200"
          >
            <Spade className="text-orange-600 mb-2" size={40} />
            <h2 className="text-lg font-semibold text-orange-700">Solitaire</h2>
            <p className="text-sm text-orange-600 mt-1">Be ready to stack 🃏 </p>
          </Link>


        </div>

        
      </div>
    </div>
  );
}
