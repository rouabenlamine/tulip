import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  BookOpen,
  Gamepad2,
  PenLine,
  CloudSun,
  Flower2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [dailyMoment, setDailyMoment] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [reflection, setReflection] = useState("");
  const [quote, setQuote] = useState("");
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [weather, setWeather] = useState(null);
  const [mood, setMood] = useState("calm and centered 🌿");

  const challenges = [
    "Take a 5-minute walk outside 🌿",
    "Drink a full glass of water 💧",
    "Send a kind text to someone 💬",
    "Write one thing you’re grateful for ✨",
    "Stretch for 2 minutes 🧘‍♀️",
  ];

  const affirmations = [
    "I am growing gently, in my own time 🌷",
    "Peace begins within me.",
    "I am learning, healing, and becoming stronger each day.",
    "I choose calm over chaos.",
    "Even small steps move me forward 🌿",
  ];

  const reflections = [
    "What made you smile today?",
    "What’s one thing you’re proud of this week?",
    "Describe your current mood in one word.",
    "What do you want to let go of today?",
    "What are you most looking forward to?",
  ];

  const quotes = [
    "“The sun will rise, and we will try again.” ☀️",
    "“Breathe. You’re doing better than you think.” 💕",
    "“Bloom where you are planted.” 🌸",
    "“It’s a slow process, but quitting won’t speed it up.” 🌿",
  ];

  const greetings = [
    "Hello, Sunshine 🌞",
    "Hey, Bloom 🌷",
    "Welcome back, Star 🌟",
    "Good to see you, Dreamer ☁️",
    "Shining bright today, aren’t we? ✨",
  ];

  useEffect(() => {
    setDailyMoment(challenges[Math.floor(Math.random() * challenges.length)]);
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
    setReflection(reflections[Math.floor(Math.random() * reflections.length)]);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);

    const savedStreak = localStorage.getItem("tulip_streak");
    if (savedStreak) setStreak(parseInt(savedStreak));

    // 🌤️ Get weather info using geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const data = await res.json();
          const w = data.current_weather;
          if (w) {
            const description = getWeatherDescription(w.weathercode);
            setWeather({
              temp: w.temperature,
              desc: description,
            });
          }
        } catch (error) {
          console.error("Weather fetch failed", error);
        }
      });
    }
  }, []);

  const getWeatherDescription = (code) => {
    const map = {
      0: "Clear skies ☀️",
      1: "Mainly clear 🌤️",
      2: "Partly cloudy ⛅",
      3: "Overcast ☁️",
      45: "Foggy 🌫️",
      48: "Misty 🌁",
      51: "Light drizzle 💧",
      61: "Light rain 🌦️",
      63: "Rain showers 🌧️",
      71: "Snowfall ❄️",
      95: "Thunderstorms ⛈️",
    };
    return map[code] || "Lovely weather 🌸";
  };

  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("tulip_streak", newStreak);
  };

  const resetStreak = () => {
    setStreak(0);
    localStorage.removeItem("tulip_streak");
  };

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-start font-poppins p-6 overflow-x-hidden"
      style={{
        backgroundImage:
          "url('tulip-background.jpg')", 
                     // prevents zooming in too much
                backgroundRepeat: "no-repeat",   // avoid tiling
                backgroundPosition: "center top",// keeps it centered
                backgroundAttachment: "fixed",   // keeps it still when scrolling// 🌷 your original pastel background
      }}
    >
      {/* Greeting + Weather */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-6 mb-4 bg-white/70 rounded-2xl px-6 py-4 shadow"
      >
        <h1 className="text-3xl font-bold text-pink-300">{greeting}</h1>
        <p className="text-gray-600 italic">{date}</p>
        {weather && (
          <p className="text-green-700 text-sm mt-1">
            {weather.desc} — {Math.round(weather.temp)}°C
          </p>
        )}
      </motion.div>

      {/* Mood of the Day */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-pink-50 to-green-50 border border-pink-100 rounded-2xl p-5 text-center shadow-sm max-w-md w-full mb-6"
      >
        <h2 className="text-pink-700 font-semibold mb-1">💭 Mood of the Day</h2>
        <p className="text-green-800 mb-2">You’re feeling {mood}</p>
        <Link to="/mood" className="text-pink-600 hover:underline text-sm">
          Update your mood →
        </Link>
      </motion.div>

      {/* Daily Moment */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 border border-green-100 shadow-md rounded-2xl p-4 text-center max-w-lg w-full mb-6"
      >
        <h2 className="font-semibold text-green-700 mb-1">🌼 Daily Moment</h2>
        <p className="text-green-800">{dailyMoment}</p>
      </motion.div>

      {/* Quick Fun */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
      >
        <Link
          to="/minigames"
          className="bg-pink-100 hover:bg-pink-200 transition-all rounded-2xl p-4 text-center shadow-sm"
        >
          <Gamepad2 className="mx-auto text-pink-500" size={32} />
          <p className="text-pink-700 font-medium mt-2">Mini Games</p>
        </Link>
        <Link
          to="/journal"
          className="bg-green-100 hover:bg-green-200 transition-all rounded-2xl p-4 text-center shadow-sm"
        >
          <PenLine className="mx-auto text-green-500" size={32} />
          <p className="text-green-700 font-medium mt-2">Journal</p>
        </Link>
        <Link
          to="/mood"
          className="bg-yellow-100 hover:bg-yellow-200 transition-all rounded-2xl p-4 text-center shadow-sm"
        >
          <CloudSun className="mx-auto text-yellow-500" size={32} />
          <p className="text-yellow-700 font-medium mt-2">Mood Tracker</p>
        </Link>
      </motion.div>

      {/* Affirmation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-100 to-pink-100 border border-green-200 rounded-3xl p-6 text-center shadow-sm max-w-xl w-full mb-6"
      >
        <h2 className="font-semibold text-green-800 mb-2">💖 Today’s Affirmation</h2>
        <p className="text-lg text-green-900 italic">“{affirmation}”</p>
      </motion.div>

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/80 border border-pink-100 rounded-3xl p-6 max-w-xl w-full text-center shadow-sm mb-6"
      >
        <h2 className="font-semibold text-pink-700 mb-2">🪞 Reflection Prompt</h2>
        <p className="text-green-800 mb-3">{reflection}</p>
        <Link
          to="/journal"
          className="inline-block bg-blue-300 hover:bg-pink-400 text-white font-medium px-4 py-2 rounded-xl transition-all shadow"
        >
          Write it down ✍️
        </Link>
      </motion.div>

      {/* Streak Tracker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 border border-green-100 rounded-3xl p-6 text-center shadow-md max-w-sm w-full mb-6"
      >
        <h2 className="text-green-800 font-semibold mb-2">🔥 Daily Visit Streak</h2>
        <p className="text-2xl font-bold text-pink-600">{streak} days</p>
        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={incrementStreak}
            className="bg-green-200 hover:bg-green-300 px-3 py-1 rounded-xl text-green-800"
          >
            +1 Bloom
          </button>
          <button
            onClick={resetStreak}
            className="bg-pink-200 hover:bg-pink-300 px-3 py-1 rounded-xl text-pink-800"
          >
            Reset 🌱
          </button>
        </div>
      </motion.div>

      {/* Explore Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10"
      >
        <Link
          to="/prayers"
          className="bg-green-100 hover:bg-green-200 transition-all rounded-2xl p-4 text-center shadow-sm"
        >
          <Heart className="mx-auto text-green-500" size={32} />
          <p className="text-green-700 font-medium mt-2">Prayers</p>
        </Link>
        <Link
          to="/books"
          className="bg-pink-100 hover:bg-pink-200 transition-all rounded-2xl p-4 text-center shadow-sm"
        >
          <BookOpen className="mx-auto text-pink-500" size={32} />
          <p className="text-pink-700 font-medium mt-2">Books</p>
        </Link>
        <Link
          to="/workout"
          className="bg-yellow-100 hover:bg-yellow-200 transition-all rounded-2xl p-4 text-center shadow-sm"
        >
          <Flower2 className="mx-auto text-yellow-500" size={32} />
          <p className="text-yellow-700 font-medium mt-2">Workout</p>
        </Link>
      </motion.div>

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white/70 border border-pink-100 rounded-2xl p-5 text-center shadow-sm max-w-md w-full mb-6"
      >
        <Sparkles className="mx-auto text-pink-400 mb-2" />
        <p className="text-green-800 italic">{quote}</p>
      </motion.div>

      {/* Progress Garden */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mb-6"
      >
        <div className="w-32 h-32 bg-green-100 rounded-full mx-auto flex items-center justify-center shadow-inner">
          <Flower2 className="text-green-500" size={56} />
        </div>
        <p className="text-green-700 mt-2 text-sm italic">
          Your garden blooms with every visit 🌸
        </p>
      </motion.div>
    </div>
  );
}
 