import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flower2, Home, Moon, Dumbbell, Book, Pencil, Clapperboard, Gamepad2 } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "Prayers", icon: <Moon size={20} />, path: "/prayers" },
    { name: "Workout", icon: <Dumbbell size={20} />, path: "/workout" },
    { name: "Mood", icon: <Flower2 size={20} />, path: "/mood" },
    { name: "Journal", icon: <Pencil size={20} />, path: "/journal" },
    { name: "Books", icon: <Book size={20} />, path: "/books" },
    { name: "SeriesMovies", icon: <Clapperboard size={20} />, path: "/SeriesMovies" },
    { name: "Mini Games", icon: <Gamepad2 size={20} />, path: "/MiniGames" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-60" : "w-16"
      } h-screen bg-white/60 backdrop-blur-lg shadow-lg transition-all duration-300 flex flex-col items-center p-4 fixed left-0 top-0 z-20`}
    >
      {/* 🌷 Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-pink-500 text-white rounded-full p-2 mb-6 shadow hover:bg-pink-500 transition-all"
      >
        <Flower2 size={24} />
      </button>

      {/* 🌼 Menu Items */}
      <nav className="flex flex-col gap-4 w-full">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-2 rounded-xl text-gray-700 hover:bg-pink-200 transition-all ${
              location.pathname === item.path ? "bg-pink-300 text-white shadow" : ""
            }`}
          >
            {item.icon}
            {isOpen && <span className="font-medium">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
