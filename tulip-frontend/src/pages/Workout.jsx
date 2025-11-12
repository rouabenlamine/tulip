import { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Dumbbell,
  Clock,
  Trash2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Moon,
} from "lucide-react";
import "./Workout.css";
/**
 * Workout page:
 * - create workouts
 * - add exercises with sets & timers
 * - save workouts and rest days to calendar
 * - auto-recalculate streak based on consecutive workout days
 */

export default function Workout() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem("workouts");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [newWorkoutName, setNewWorkoutName] = useState("");

  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState(3);
  const [newExerciseTime, setNewExerciseTime] = useState(30);

  const [runningExerciseId, setRunningExerciseId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const [streak, setStreak] = useState(() => {
    const s = localStorage.getItem("workoutStreak");
    return s ? Number(s) : 0;
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(() => {
    const saved = localStorage.getItem("workoutCalendar");
    return saved ? JSON.parse(saved) : {};
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("workoutCalendar", JSON.stringify(calendarData));
  }, [calendarData]);

  useEffect(() => {
    localStorage.setItem("workoutStreak", String(streak));
  }, [streak]);

  // Timer effect
  useEffect(() => {
    if (isRunning && runningExerciseId) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, runningExerciseId]);

  const selectedWorkout =
    workouts.find((w) => w.id === selectedWorkoutId) || null;

  // Workout management
  const addWorkout = () => {
    const name = newWorkoutName.trim();
    if (!name) return;
    const newW = { id: Date.now(), name, exercises: [], completed: false };
    setWorkouts((prev) => [...prev, newW]);
    setNewWorkoutName("");
    setSelectedWorkoutId(newW.id);
  };

  const deleteWorkout = (id) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    if (selectedWorkoutId === id) stopTimer();
  };

  const addExercise = () => {
    if (!selectedWorkoutId) return alert("Select a workout first");
    const name = newExerciseName.trim();
    if (!name) return;
    const newEx = {
      id: Date.now(),
      name,
      sets: Number(newExerciseSets),
      time: Number(newExerciseTime),
      done: false,
    };
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === selectedWorkoutId
          ? { ...w, exercises: [...w.exercises, newEx] }
          : w
      )
    );
    setNewExerciseName("");
    setNewExerciseSets(3);
    setNewExerciseTime(30);
  };

  const removeExercise = (workoutId, exerciseId) => {
    if (runningExerciseId === exerciseId) stopTimer();
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.filter((ex) => ex.id !== exerciseId),
            }
          : w
      )
    );
  };

  const toggleExerciseDone = (workoutId, exerciseId) => {
    setWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== workoutId) return w;
        const updatedExercises = w.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, done: !ex.done } : ex
        );
        const completed =
          updatedExercises.length > 0 &&
          updatedExercises.every((ex) => ex.done);
        return { ...w, exercises: updatedExercises, completed };
      })
    );
    if (runningExerciseId === exerciseId) stopTimer();
  };

  // Timer controls
  const startExerciseTimer = (exercise) => {
    if (!exercise) return;
    setRunningExerciseId(exercise.id);
    setTimeLeft(Number(exercise.time));
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => {
    if (runningExerciseId && timeLeft > 0) setIsRunning(true);
  };
  const resetTimer = (exercise) => {
    if (exercise) {
      setRunningExerciseId(exercise.id);
      setTimeLeft(Number(exercise.time));
      setIsRunning(false);
    } else if (runningExerciseId) {
      const w = workouts.find((w) =>
        w.exercises.some((ex) => ex.id === runningExerciseId)
      );
      const ex = w?.exercises.find((e) => e.id === runningExerciseId);
      if (ex) {
        setTimeLeft(Number(ex.time));
        setIsRunning(false);
      }
    }
  };
  const stopTimer = () => {
    setIsRunning(false);
    setRunningExerciseId(null);
    setTimeLeft(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ✅ Calendar + streak logic
  const markDay = (type) => {
    const key = selectedDate.toDateString();
    const prev = calendarData[key];
    const copy = { ...calendarData };

    // Toggle same type off
    if (prev === type) {
      delete copy[key];
    } else {
      copy[key] = type;
    }

    setCalendarData(copy);
    recalculateStreak(copy);
  };

  const recalculateStreak = (data) => {
    const workoutDates = Object.keys(data)
      .filter((d) => data[d] === "Workout")
      .map((d) => new Date(d).setHours(0, 0, 0, 0))
      .sort((a, b) => a - b);

    if (workoutDates.length === 0) {
      setStreak(0);
      return;
    }

    let longest = 1;
    let current = 1;

    for (let i = 1; i < workoutDates.length; i++) {
      const prev = workoutDates[i - 1];
      const curr = workoutDates[i];
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) current++;
      else current = 1;
      if (current > longest) longest = current;
    }
    setStreak(longest);
  };

  const getTileClassName = ({ date }) => {
  const key = date.toDateString();
  if (calendarData[key] === "Workout") return "tulip-green";
  if (calendarData[key] === "Rest") return "tulip-pink";
  return "";
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-100 flex flex-col items-center justify-start p-6 text-gray-800 gap-8">
      {/* Workout Planner */}
      <div className="bg-white/90 backdrop-blur-md border border-green-200 rounded-3xl shadow-xl p-6 w-full text-center max-w-3xl">
        <h1 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2 text-center">
          <Dumbbell /> Workout Planner <Dumbbell />
        </h1>

        <div className="mb-4 flex gap-2 flex-wrap">
          <input
            className="flex-1 px-3 py-2 border border-green-100 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-200 outline-none"
            placeholder="Create workout (e.g., Leg Day)"
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
          />
          <button
            onClick={addWorkout}
            className="bg-green-400 text-white px-3 py-3 rounded-lg"
          >
            <Plus size={16} /> Create
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {workouts.map((w) => (
            <div
              key={w.id}
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                selectedWorkoutId === w.id
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <button
                onClick={() => setSelectedWorkoutId(w.id)}
                className="font-medium"
              >
                {w.name} {w.completed ? "✅" : ""}
              </button>
              <button
                onClick={() => deleteWorkout(w.id)}
                title="Delete workout"
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {selectedWorkout ? (
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <h2 className="font-semibold text-green-800 mb-3">
              Exercises for {selectedWorkout.name}
            </h2>

            <div className="flex gap-2 mb-4 flex-wrap">
              <input
                className="flex-1 px-3 py-2 border border-green-100 rounded-lg bg-white"
                placeholder="Exercise name"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
              />
              <input
                type="number"
                min="1"
                className="w-20 px-2 py-1 border border-green-100 rounded-lg bg-white"
                value={newExerciseSets}
                onChange={(e) => setNewExerciseSets(Number(e.target.value))}
                placeholder="Sets"
              />
              <input
                type="number"
                min="5"
                className="w-24 px-2 py-1 border border-green-100 rounded-lg bg-white"
                value={newExerciseTime}
                onChange={(e) => setNewExerciseTime(Number(e.target.value))}
                placeholder="Seconds"
              />
              <button
                onClick={addExercise}
                className="bg-green-400 text-white px-3 py-1 rounded-lg"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {selectedWorkout.exercises.map((ex) => (
              <div
                key={ex.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  ex.done
                    ? "bg-green-100 border-green-200"
                    : "bg-white border-green-100"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{ex.name}</div>
                  <div className="text-sm text-gray-600">
                    {ex.sets} sets • {ex.time}s
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-700">
                    {runningExerciseId === ex.id
                      ? `${timeLeft}s`
                      : `${ex.time}s`}
                  </div>
                  {runningExerciseId === ex.id && isRunning ? (
                    <button
                      onClick={pauseTimer}
                      className="px-2 py-1 rounded bg-yellow-100"
                    >
                      <Pause size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (runningExerciseId !== ex.id) resetTimer(ex);
                        startExerciseTimer(ex);
                      }}
                      className="px-2 py-1 rounded bg-green-100"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => resetTimer(ex)}
                    className="px-2 py-1 rounded bg-blue-50"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() =>
                      toggleExerciseDone(selectedWorkout.id, ex.id)
                    }
                    className={`px-2 py-1 rounded ${
                      ex.done ? "bg-green-500 text-white" : "bg-green-100"
                    }`}
                  >
                    {ex.done ? "Undo" : "Done"}
                  </button>
                  <button
                    onClick={() => removeExercise(selectedWorkout.id, ex.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600 italic">
            Select or create a workout to add exercises
          </div>
        )}

        {runningExerciseId && (
          <div className="mt-4 text-center text-green-800 font-semibold text-lg bg-green-50 border border-green-100 rounded-xl py-2">
            Timer: {timeLeft}s {isRunning ? "(Running)" : "(Paused)"}
            <div className="mt-2 flex justify-center gap-2">
              <button
                onClick={pauseTimer}
                className="px-3 py-1 rounded bg-yellow-100"
              >
                Pause
              </button>
              <button
                onClick={resumeTimer}
                className="px-3 py-1 rounded bg-green-100"
              >
                Resume
              </button>
              <button
                onClick={() => resetTimer(null)}
                className="px-3 py-1 rounded bg-blue-50"
              >
                Reset
              </button>
              <button
                onClick={stopTimer}
                className="px-3 py-1 rounded bg-red-100"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-700 text-center">
          Workout streak:{" "}
          <span className="font-semibold text-green-700">{streak} days</span>
          <div>
            <button
              onClick={() => setStreak(0)}
              className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
            >
              Reset Streak
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white/90 backdrop-blur-md border border-green-100 rounded-3xl shadow-xl p-6 w-full max-w-md flex flex-col items-center">
        <h2 className="text-lg font-semibold text-green-700 mb-3">
          Workout Calendar
        </h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={getTileClassName}
          className="rounded-2xl border-none shadow-inner bg-green-50 p-2 [&_.react-calendar__tile]:rounded-xl [&_.react-calendar__tile]:transition-all [&_.react-calendar__tile]:duration-200"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => markDay("Workout")}
            className="bg-green-400 text-white px-3 py-2 rounded-lg"
          >
            Mark Workout
          </button>
          <button
            onClick={() => markDay("Rest")}
            className="bg-pink-400 text-white px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <Moon size={14} /> Rest
          </button>
        </div>
      </div>
    </div>
  );
}
