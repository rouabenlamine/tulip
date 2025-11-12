import { useState, useEffect } from "react";

export default function MoodTracker() {
  const [moods, setMoods] = useState({});
  const [selectedMood, setSelectedMood] = useState("");
  const [today, setToday] = useState("");
  const [message, setMessage] = useState("");
  
  const moodOptions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😡", label: "Angry" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😌", label: "Calm" },
    { emoji: "🥰", label: "Loved" },
    { emoji: "😕", label: "Confused" },
    { emoji: "😫", label: "Stressed" },
  ];

  const moodMessages = {
    Happy: "Keep shining! 🌞 You’re doing amazing.",
    Neutral: "A calm day is still progress 🌿",
    Sad: "It’s okay to feel down. Treat yourself gently 💖",
    Angry: "Take a deep breath — peace will find you 🌷",
    Excited: "That energy is contagious! 🌈",
    Tired: "Rest is productive too 🌙",
    Calm: "Peace looks good on you 🍃",
    Loved: "You are cherished and appreciated 💕",
    Confused: "Uncertainty is part of growth 🌱",
    Stressed: "Pause. You’re stronger than this 💫",
  };

  useEffect(() => {
    const stored = localStorage.getItem("mood_tracker_data");
    if (stored) setMoods(JSON.parse(stored));
    const todayStr = new Date().toLocaleDateString("en-CA");
    setToday(todayStr);
  }, []);

  useEffect(() => {
    localStorage.setItem("mood_tracker_data", JSON.stringify(moods));
  }, [moods]);

  const saveMood = () => {
    if (!selectedMood) return;
    const newMoods = { ...moods, [today]: selectedMood };
    setMoods(newMoods);
    setMessage(moodMessages[selectedMood]);
  };

  const deleteMood = (date) => {
    const updated = { ...moods };
    delete updated[date];
    setMoods(updated);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-pink-100 p-6 font-poppins">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 w-full max-w-3xl border border-green-100">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          🌞 Mood Tracker🌞
        </h1>

        {/* Mood Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {moodOptions.map((m) => (
            <button
              key={m.label}
              onClick={() => {
                setSelectedMood(m.label);
                setMessage(moodMessages[m.label]);
              }}
              className={`text-4xl transition-transform hover:scale-110 ${
                selectedMood === m.label ? "drop-shadow-lg" : ""
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        <button
          onClick={saveMood}
          className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm transition-all mb-4"
        >
          Save Mood
        </button>

        {/* Message */}
        {message && (
          <div className="text-center text-green-700 italic mb-6">
            {message}
          </div>
        )}

        {/* Mood History */}
        <div className="bg-[#fdfdf8] rounded-2xl p-4 border border-green-100 shadow-sm">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            🌸 Your Mood History
          </h2>
          {Object.keys(moods).length === 0 ? (
            <p className="text-green-600 italic">No moods recorded yet 🌿</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(moods)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([date, mood]) => (
                  <li
                    key={date}
                    className="flex justify-between items-center bg-green-50 rounded-lg px-4 py-2 shadow-sm"
                  >
                    <span className="text-green-700">
                      <b>{date}</b> — {mood} {moodOptions.find((m) => m.label === mood)?.emoji}
                    </span>
                    <button
                      onClick={() => deleteMood(date)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
