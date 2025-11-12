// src/pages/PrayerTracker.jsx
import { useState, useEffect } from "react";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PrayerTracker() {
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completed, setCompleted] = useState({}); // { "Mon May 12 2025": {Fajr:true,...}, ... }
  const [streak, setStreak] = useState(0);
  const [exemptDays, setExemptDays] = useState([]);

  // Load saved data
  useEffect(() => {
    const savedCompleted = JSON.parse(localStorage.getItem("prayerData")) || {};
    const savedExempt = JSON.parse(localStorage.getItem("exemptDays")) || [];
    setCompleted(savedCompleted);
    setExemptDays(savedExempt);
  }, []);

  // Save when changed
  useEffect(() => {
    localStorage.setItem("prayerData", JSON.stringify(completed));
    localStorage.setItem("exemptDays", JSON.stringify(exemptDays));
    // Recompute streak whenever records or exemptDays change
    setStreak(computeConsecutiveStreak(completed, exemptDays));
  }, [completed, exemptDays]);

  // Helper: check if a day's data marks all prayers done
  const isDayComplete = (dateKey) => {
    const dayData = completed[dateKey];
    if (!dayData) return false;
    return prayers.every((p) => !!dayData[p]);
  };

  // Compute consecutive streak that ends at today (today included if complete)
  function computeConsecutiveStreak(records, exemptArr) {
    const today = new Date();
    let count = 0;
    // iterate backwards day-by-day
    for (let i = 0; ; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toDateString();

      // If day is explicitly exempt, treat as break (you can change behavior if you want to ignore exempt)
      if (exemptArr.includes(key)) break;

      // If day is complete, increment and continue
      if (isDayComplete(key)) {
        count++;
        continue;
      }

      // if not complete -> stop counting
      break;
    }
    return count;
  }

  const togglePrayer = (name) => {
    const dateKey = selectedDate.toDateString();
    setCompleted((prev) => {
      const dateData = prev[dateKey] ? { ...prev[dateKey] } : {};
      dateData[name] = !dateData[name];
      const updated = { ...prev, [dateKey]: dateData };
      return updated;
    });
    // no direct setStreak here — streak recalculated in useEffect after state updates
  };

  const toggleExemptDay = () => {
    const dateKey = selectedDate.toDateString();
    setExemptDays((prev) =>
      prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey]
    );

    // When marking/unmarking exempt we also want to clear that day's prayer data (optional)
    setCompleted((prev) => {
      const updated = { ...prev };
      // keep data but you may want to clear it:
      // delete updated[dateKey];
      return updated;
    });
  };

  const resetDay = () => {
    const dateKey = selectedDate.toDateString();
    setCompleted((prev) => {
      const updated = { ...prev };
      delete updated[dateKey];
      return updated;
    });
  };

  // Tile classes for calendar
  const tileClassName = ({ date }) => {
    const key = date.toDateString();
    if (exemptDays.includes(key))
      return "bg-pink-200 text-pink-900 font-medium rounded-full";
    if (isDayComplete(key)) return "bg-green-200 text-green-900 font-medium rounded-full";
    return "";
  };

  // Today's (selectedDate) data
  const todayData = completed[selectedDate.toDateString()] || {};

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 p-6 text-gray-800 gap-10">
      {/* Prayer Card */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-white/40">
        <h1 className="text-2xl font-bold text-pink-600 mb-4 flex items-center justify-center gap-2">
          <Sparkles className="text-pink-500" /> Daily Prayer Tracker
        </h1>

        <p className="text-gray-600 mb-6">Select a date and track your prayers 🌙</p>

        {exemptDays.includes(selectedDate.toDateString()) ? (
          <div className="p-4 bg-pink-100 rounded-xl text-pink-700 font-medium mb-6">
            You are exempt from prayers on this day 🌸
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {prayers.map((p) => (
              <button
                key={p}
                onClick={() => togglePrayer(p)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border text-left transition-all ${
                  todayData[p]
                    ? "bg-pink-400 text-white border-pink-400"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-pink-100"
                }`}
              >
                <span className="font-medium">{p}</span>
                {todayData[p] && <CheckCircle2 className="text-white" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-semibold text-gray-700">
            🔥 Streak: <span className="text-pink-600">{streak} days</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={resetDay}
              className="bg-pink-200 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-300 transition-all"
            >
              Reset Day
            </button>

            <button
              onClick={toggleExemptDay}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                exemptDays.includes(selectedDate.toDateString())
                  ? "bg-pink-500 text-white"
                  : "bg-pink-300 text-white hover:bg-pink-400"
              }`}
            >
              <XCircle size={18} />
              {exemptDays.includes(selectedDate.toDateString()) ? "Unmark Exempt" : "Mark Exempt"}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40">
        <h2 className="text-xl font-semibold text-pink-600 mb-4 text-center">Calendar</h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName}
          className="rounded-lg border-none text-gray-700"
        />
      </div>
    </div>
  );
}
