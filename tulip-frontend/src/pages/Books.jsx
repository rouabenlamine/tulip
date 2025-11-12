import { useState, useEffect } from "react";
import { Plus, Heart, Trash2, BookOpen } from "lucide-react";

export default function BooksTracker() {
  const [books, setBooks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newCover, setNewCover] = useState(null);
  const [newStatus, setNewStatus] = useState("Want to Read");
  const [sortBy, setSortBy] = useState("default");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("books_tracker_data");
    if (saved) setBooks(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("books_tracker_data", JSON.stringify(books));
  }, [books]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewCover(reader.result);
    reader.readAsDataURL(file);
  };

  const addBook = () => {
    if (!newTitle.trim()) return;
    const newBook = {
      id: Date.now(),
      title: newTitle,
      author: newAuthor,
      genre: newGenre,
      cover: newCover,
      rating: 0,
      status: newStatus,
    };
    setBooks([...books, newBook]);
    setNewTitle("");
    setNewAuthor("");
    setNewGenre("");
    setNewCover(null);
    setNewStatus("Want to Read");
  };

  const removeBook = (id) => {
    setBooks(books.filter((b) => b.id !== id));
  };

  const setRating = (id, rating) => {
    setBooks(
      books.map((b) => (b.id === id ? { ...b, rating } : b))
    );
  };

  const updateStatus = (id, status) => {
    setBooks(
      books.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === "genre") return a.genre.localeCompare(b.genre);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-pink-200 p-6 font-poppins">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 w-full max-w-4xl border border-green-100">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center flex items-center justify-center gap-2">
          📚 My Book Tracker 📚
        </h1>

        {/* Add Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <input
            type="text"
            placeholder="Book title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#fdfdf8] text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <input
            type="text"
            placeholder="Author..."
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            className="px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#fdfdf8] text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <input
            type="text"
            placeholder="Genre..."
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            className="px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 bg-[#fdfdf8] text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-green-200 bg-[#fdfdf8] text-gray-700 focus:ring-2 focus:ring-green-300 shadow-sm"
          >
            <option>Want to Read</option>
            <option>Reading</option>
            <option>Finished</option>
          </select>
          <label className="flex items-center justify-center bg-green-100 text-green-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-green-200 shadow-sm">
            Upload Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={addBook}
            className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all shadow-sm flex items-center justify-center"
          >
            <Plus size={18} className="mr-1" /> Add Book
          </button>
        </div>

        {/* Sorting */}
        <div className="flex justify-end mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-green-200 rounded-lg text-green-700 bg-green-50 focus:ring-2 focus:ring-green-300"
          >
            <option value="default">Sort by...</option>
            <option value="genre">Genre 🎭</option>
            <option value="rating">Rating 💕</option>
            <option value="status">Status 📖</option>
          </select>
        </div>

        {/* Book List */}
        {sortedBooks.length === 0 ? (
          <p className="text-green-700 text-center italic mb-4">
            No books added yet 🌷
          </p>
        ) : (
          <ul className="space-y-4">
            {sortedBooks.map((book) => (
              <li
                key={book.id}
                className="flex items-center gap-4 bg-[#fdfdf8] rounded-xl px-4 py-3 shadow-sm border border-green-100"
              >
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-16 h-16 rounded-lg object-cover border border-green-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-green-50 flex items-center justify-center text-green-400">
                    <BookOpen size={24} />
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-green-900">
                    {book.title}
                  </span>
                  <span className="text-sm text-green-600">
                    {book.author || "Unknown author"}
                  </span>
                  <span className="text-xs text-green-500 italic">
                    {book.genre || "No genre"} — {book.status}
                  </span>

                  {/* Rating Hearts */}
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button key={num} onClick={() => setRating(book.id, num)}>
                        <Heart
                          size={18}
                          className={`${
                            num <= book.rating
                              ? "fill-green-400 text-green-400"
                              : "text-green-200"
                          } transition-all`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Update Status */}
                  <div className="mt-2">
                    <select
                      value={book.status}
                      onChange={(e) => updateStatus(book.id, e.target.value)}
                      className="text-sm border border-green-200 rounded-lg px-2 py-1 bg-green-50 text-green-700 focus:ring-1 focus:ring-green-300"
                    >
                      <option>Want to Read</option>
                      <option>Reading</option>
                      <option>Finished</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => removeBook(book.id)}
                  className="text-green-400 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
