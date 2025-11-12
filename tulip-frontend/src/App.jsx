import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import PrayerTracker from "./pages/PrayerTracker";
import Workout from "./pages/Workout";
import MoodTracker from "./pages/MoodTracker";
import Journal from "./pages/Journal";
import Books from "./pages/Books";
import SeriesMovies from "./pages/SeriesMovies";
import MiniGames from "./pages/MiniGames";
import Memorygame from "./pages/MiniGames/Memorygame";
import Soduko from "./pages/MiniGames/Soduko";
import Pool from "./pages/MiniGames/Pool";
import Solitaire from "./pages/MiniGames/Solitaire";
console.log("App.jsx loaded");

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Use index instead of path="/" */}
          <Route index element={<Dashboard />} />
          <Route path="prayers" element={<PrayerTracker />} />
          <Route path="workout" element={<Workout />} />
          <Route path="mood" element={<MoodTracker />} />
          <Route path="journal" element={<Journal />} />
          <Route path="books" element={<Books />} />
          <Route path="minigames" element={<MiniGames />} />
          <Route path="SeriesMovies" element={<SeriesMovies />} />
          <Route path="minigames/memorygame" element={<Memorygame />} />
          <Route path="minigames/soduko" element={<Soduko />} />
          <Route path="minigames/pool" element={<Pool />} />
          <Route path="minigames/solitaire" element={<Solitaire />} />

        </Route>
      </Routes>
    </Router>
  );
}
