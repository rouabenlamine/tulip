import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Trash2 } from "lucide-react";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState("Calm");
  const [images, setImages] = useState([]);

  const moods = {
    Happy: "from-yellow-100 to-yellow-200",
    Calm: "from-blue-100 to-blue-200",
    Romantic: "from-pink-100 to-pink-200",
    Tired: "from-purple-100 to-purple-200",
    Motivated: "from-green-100 to-green-200",
  };

  useEffect(() => {
    const saved = localStorage.getItem("journal_entries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("journal_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const draft = { selectedDate, title, text, mood, images };
    localStorage.setItem("journal_draft", JSON.stringify(draft));
  }, [selectedDate, title, text, mood, images]);

  useEffect(() => {
    const savedDraft = localStorage.getItem("journal_draft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setSelectedDate(draft.selectedDate || new Date().toISOString().split("T")[0]);
      setTitle(draft.title || "");
      setText(draft.text || "");
      setMood(draft.mood || "Calm");
      setImages(draft.images || []);
    }
  }, []);

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((imgs) => setImages([...images, ...imgs]));
  };

  const addEntry = () => {
    if (!text.trim()) return;
    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      title,
      text,
      mood,
      images,
    };
    setEntries([...entries, newEntry]);
    setTitle("");
    setText("");
    setMood("Calm");
    setImages([]);
    localStorage.removeItem("journal_draft");
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${moods[mood]} p-8 font-poppins transition-all`}
    >
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-blue-300 mb-6 text-center">
          🖋️ My Daily Journal 🖋️
        </h1>

        {/* Entry Form */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#fdfdf8] text-gray-700 placeholder-gray-400 shadow-sm"
            />
            <input
              type="text"
              placeholder="General idea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#fdfdf8] text-gray-700 placeholder-gray-400 shadow-sm"
            />
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#fdfdf8] text-gray-700 shadow-sm"
            >
              {Object.keys(moods).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Writing area */}
          <textarea
            placeholder="Express yourself here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 px-4 py-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#FFFDF5] text-gray-700 placeholder-gray-400 shadow-sm"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-green-200">
              <ImageIcon size={18} /> Add Photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddImage}
                className="hidden"
              />
            </label>
            <button
              onClick={addEntry}
              className="flex items-center bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              <Plus size={18} className="mr-1" /> Save Entry
            </button>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-green-200"
                />
              ))}
            </div>
          )}
        </div>

        {/* Entries List */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <p className="text-center text-blue-500 italic">
              No journal entries yet 🩵
            </p>
          ) : (
            entries
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-2xl shadow-sm p-6 bg-gradient-to-br ${moods[entry.mood]} border border-green-100`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-green-800">
                      {entry.title || "(No title)"}
                    </h2>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 mb-2">{entry.date}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.text}</p>
                  {entry.images && entry.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Journal"
                          className="w-24 h-24 object-cover rounded-lg border border-green-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
