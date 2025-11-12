import { useState, useEffect } from "react";
import { Plus, Heart, Trash2, Edit2, CheckCircle } from "lucide-react";

export default function SeriesMovies() {
  const [activeTab, setActiveTab] = useState("series");
  const [items, setItems] = useState({ series: [], movies: [] });
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newCover, setNewCover] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("series_movies_data");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("series_movies_data", JSON.stringify(items));
  }, [items]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewCover(reader.result);
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    if (!newTitle.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newTitle,
      genre: newGenre,
      cover: newCover,
      rating: 0,
      watched: false,
      wishlist: true,
    };
    setItems({ ...items, [activeTab]: [...items[activeTab], newItem] });
    setNewTitle("");
    setNewGenre("");
    setNewCover(null);
  };

  const removeItem = (tab, id) => {
    setItems({
      ...items,
      [tab]: items[tab].filter((i) => i.id !== id),
    });
  };

  const toggleWatched = (tab, id) => {
    setItems({
      ...items,
      [tab]: items[tab].map((i) =>
        i.id === id ? { ...i, watched: !i.watched, wishlist: i.watched } : i
      ),
    });
  };

  const setRating = (tab, id, rating) => {
    setItems({
      ...items,
      [tab]: items[tab].map((i) =>
        i.id === id ? { ...i, rating } : i
      ),
    });
  };

  const startEdit = (id) => setEditingId(id);

  const saveEdit = (tab, id, updatedTitle, updatedGenre) => {
    setItems({
      ...items,
      [tab]: items[tab].map((i) =>
        i.id === id ? { ...i, title: updatedTitle, genre: updatedGenre } : i
      ),
    });
    setEditingId(null);
  };

  const sortedList = [...items[activeTab]].sort((a, b) => {
    if (sortBy === "genre") return a.genre.localeCompare(b.genre);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "watchStatus") return a.watched === b.watched ? 0 : a.watched ? -1 : 1;
    return 0;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-cream-100 to-pink-200 p-6 font-poppins">
      
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md p-8 w-full max-w-3xl border border-pink-100">
        <h1 className="text-2xl font-bold text-pink-600 mb-6 text-center">
           🍿 Series & Movies Tracker 🍿
        </h1>
      
       
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-6">
          {["series", "movies"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === tab
                  ? "bg-pink-300 text-white shadow-sm"
                  : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              }`}
            >
              {tab === "series" ? "📺 Series" : "🎥 Movies"}
            </button>
          ))}
        </div>

        {/* Add Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          <input
            type="text"
            placeholder="Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="px-4 py-2 rounded-lg border border-pink-200 bg-white text-gray-700 focus:ring-2 focus:ring-pink-200 col-span-2"
          />
          <input
            type="text"
            placeholder="Genre..."
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            className="px-4 py-2 rounded-lg border border-pink-200 bg-white text-gray-700 focus:ring-2 focus:ring-pink-200"
          />
          <label className="flex items-center justify-center bg-pink-100 text-pink-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-200">
            Upload Cover
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <button
            onClick={addItem}
            className="bg-pink-300 hover:bg-pink-400 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center col-span-full sm:col-span-1"
          >
            <Plus size={18} className="mr-1" /> Add
          </button>
        </div>

        {/* Sorting */}
        <div className="flex justify-end mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-pink-200 rounded-lg text-pink-700 bg-pink-50 focus:ring-2 focus:ring-pink-200"
          >
            <option value="default">Sort by...</option>
            <option value="genre">Genre 🎭</option>
            <option value="rating">Rating 💕</option>
            <option value="watchStatus">Watched / Wishlist 🌷</option>
          </select>
        </div>

        {/* List */}
        {sortedList.length === 0 ? (
          <p className="text-pink-600 text-center italic mb-4">
            No {activeTab} added yet 🌸
          </p>
        ) : (
          <ul className="space-y-3">
            {sortedList.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 shadow-sm border transition-all ${
                  item.watched
                    ? "bg-green-50 border-green-100"
                    : "bg-pink-50 border-pink-100"
                }`}
              >
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover border border-pink-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-pink-100 flex items-center justify-center text-pink-300 font-bold">
                    🎞️
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  {editingId === item.id ? (
                    <>
                      <input
                        defaultValue={item.title}
                        id={`title-${item.id}`}
                        className="border rounded px-2 py-1 mb-1 bg-[#fdfdf8] border-pink-200 text-gray-700"
                      />
                      <input
                        defaultValue={item.genre}
                        id={`genre-${item.id}`}
                        className="border rounded px-2 py-1 mb-1 bg-[#fdfdf8]  border-pink-200 text-gray-700"
                      />
                      <button
                        className="text-pink-500 text-sm mt-1"
                        onClick={() =>
                          saveEdit(
                            activeTab,
                            item.id,
                            document.getElementById(`title-${item.id}`).value,
                            document.getElementById(`genre-${item.id}`).value
                          )
                        }
                      >
                        Save ✅
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-pink-700">{item.title}</span>
                      <span className="text-sm text-pink-500 italic">{item.genre}</span>

                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button key={num} onClick={() => setRating(activeTab, item.id, num)}>
                            <Heart
                              size={18}
                              className={`${
                                num <= item.rating
                                  ? "fill-pink-400 text-pink-400"
                                  : "text-pink-200"
                              } transition-all`}
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => toggleWatched(activeTab, item.id)}
                    className={`transition ${
                      item.watched ? "text-green-400" : "text-pink-300 hover:text-green-400"
                    }`}
                  >
                    <CheckCircle size={20} />
                  </button>

                  <button
                    onClick={() => startEdit(item.id)}
                    className="text-pink-300  hover:text-pink-400 bg-[#fdfdf8] transition"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => removeItem(activeTab, item.id)}
                    className="text-pink-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
