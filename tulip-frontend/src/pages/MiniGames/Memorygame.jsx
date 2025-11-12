// src/pages/MiniGames/Memorygame.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Star } from "lucide-react";

/*
 Memory Game
 - categories: animals, buildings, people, sports, nature, mixed
 - difficulties: easy / medium / hard / expert
 - modes: relax (no timer) / challenge (countdown)
 - best times saved in localStorage keyed by mode|difficulty|category
 - responsive grid that adapts to number of cards
 - pastel theme, gentle flip animation (CSS transform), and small UX touches
*/

const CATEGORY_SETS = {
  animals: ["🐶","🐱","🦊","🐼","🐻","🐸","🐵","🦁","🐯","🐰","🐨","🦄","🦉","🐧","🦋","🐢","🐝","🐙"],
  buildings: ["🏠","🏢","🏰","🏛️","🏗️","🏥","🏭","🗼","🗽","🕌","🏫","🏦","🏪","🕍","🏡","🏚️","🏯","🏘️"],
  people: ["👩","👨","🧑","👧","👦","🧓","👵","👴","👩‍🦰","👨‍🦱","👩‍🦳","🧑‍🦰","👶","🧑‍🦲","👩‍🦱","🧑‍🦳","🧑‍🦰","🧑‍🦱"],
  sports: ["⚽","🏀","🏈","⚾","🎾","🏐","🏓","🥊","🏸","🏒","🏹","🏑","⛳","🏋️‍♀️","🏄‍♂️","🚴‍♀️","🤿","🥏"],
  nature: ["🌷","🌿","🌸","🌻","🍄","🌺","🍀","🌼","🌵","🌊","🍁","🍃","🌴","🌱","☀️","☁️","🌙","🪴"],
  mixed: ["🌷","🐶","🏰","👨","⚽","🍀","🦋","🐙","🏐","🏕️","🍄","💮","🎨","🎬","🎧","🍓","🧸","🪁"]
};

const PALE_COLORS = ["#c16e7dff","#bc775fff","#dfc68aff","#98ce87ff","#7fa4ceff","#ab87d3ff","#a2e77fff","#e686a3ff"];

const DIFFICULTY_CONFIG = {
  easy:   { pairs: 6,  cols: 4, challengeSeconds: 180 },
  medium: { pairs: 8,  cols: 4, challengeSeconds: 120 },
  hard:   { pairs: 12, cols: 6, challengeSeconds: 90  },
  expert: { pairs: 18, cols: 6, challengeSeconds: 180 } // many pairs — really hard
};

function makeKey(mode, difficulty, category) {
  return `mem_best_${mode}_${difficulty}_${category}`;
}

function shuffleArray(a) {
  // Fisher-Yates
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Memorygame() {
  const [category, setCategory] = useState("nature");
  const [difficulty, setDifficulty] = useState("medium");
  const [mode, setMode] = useState("relax"); // relax | challenge
  const [started, setStarted] = useState(false);

  // runtime game states
  const [cards, setCards] = useState([]); // {id, pairId, emoji, color, matched}
  const [flipped, setFlipped] = useState([]); // indices currently flipped (max 2)
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [lock, setLock] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [bestTimes, setBestTimes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mem_best_times_v1") || "{}");
    } catch { return {}; }
  });
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);
  const tickRef = useRef(null);

  // Number of pairs and grid cols from difficulty
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

  // generate deck when pressing Start / New Game
  function generateDeck() {
    // pick emoji pool for category
    const pool = CATEGORY_SETS[category] || CATEGORY_SETS.mixed;
    // pick required number of unique emojis
    const chosen = shuffleArray(pool).slice(0, cfg.pairs);

    // create pair entries
    let deck = [];
    chosen.forEach((emoji, idx) => {
      const pairId = idx + 1;
      const cardA = { id: `${pairId}-a-${Date.now()}-${Math.random()}`, pairId, emoji, color: PALE_COLORS[(idx*1) % PALE_COLORS.length], matched: false };
      const cardB = { id: `${pairId}-b-${Date.now()}-${Math.random()}`, pairId, emoji, color: PALE_COLORS[(idx*3) % PALE_COLORS.length], matched: false };
      deck.push(cardA, cardB);
    });

    deck = shuffleArray(deck);
    setCards(deck);
    setFlipped([]);
    setMatchedIndices([]);
    setLock(false);
    setMessage("");
    setStarted(true);
    setRunning(true);
    setElapsed(0);

    if (mode === "challenge") {
      setTimeLeft(cfg.challengeSeconds);
    } else {
      setTimeLeft(0);
    }
  }

  // timer tick (elapsed & countdown)
  useEffect(() => {
    if (!running) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    tickRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      if (mode === "challenge") {
        setTimeLeft((t) => {
          if (t <= 1) {
            // time over
            clearInterval(tickRef.current);
            tickRef.current = null;
            setRunning(false);
            setMessage("⏰ Time's up! Try again.");
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    };
  }, [running, mode]);

  // watch matchedIndices
  useEffect(() => {
    if (!cards || cards.length === 0) return;
    if (matchedIndices.length > 0 && matchedIndices.length === cards.length) {
      // all matched => win
      setRunning(false);
      const timeUsed = mode === "challenge" ? (cfg.challengeSeconds - timeLeft) : elapsed;
      setMessage("🌟 You won! Nice job!");
      // store best time
      const key = makeKey(mode, difficulty, category);
      const prev = bestTimes[key];
      if (!prev || timeUsed < prev) {
        const next = { ...bestTimes, [key]: timeUsed };
        setBestTimes(next);
        try { localStorage.setItem("mem_best_times_v1", JSON.stringify(next)); } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIndices]);

  // flip logic
  function flipCard(index) {
    if (lock) return;
    if (!cards[index]) return;
    if (flipped.includes(index) || matchedIndices.includes(index)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLock(true);
      const [aIdx, bIdx] = nextFlipped;
      const a = cards[aIdx], b = cards[bIdx];
      if (a.pairId === b.pairId) {
        // matched
        setTimeout(() => {
          setMatchedIndices((m) => [...m, aIdx, bIdx]);
          setFlipped([]);
          setLock(false);
        }, 420);
      } else {
        // mismatch
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 700);
      }
    }
  }

  function restart() {
    generateDeck();
  }

  function stopGame() {
    setRunning(false);
    setMessage("Stopped");
  }

  // UI helpers
  const gridStyle = useMemo(() => {
    const cols = cfg.cols;
    return { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` };
  }, [cfg]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // best time display helper
  const bestKey = makeKey(mode, difficulty, category);
  const bestForThis = bestTimes[bestKey];

  // Start automatically when user presses Start button; regenerate deck only then
  // (But also regenerate when difficulty/category changed if already started)
  useEffect(() => {
    if (started) {
      // small debounce to avoid instant reset on quick select
      const t = setTimeout(() => generateDeck(), 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, category]);

  // initial unstarted state shows controls; when started show board & controls
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-white to-green-50 font-poppins">
      <div className="w-full max-w-6xl center bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-md border border-pink-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-pink-600">🌷 Memory Match</h2>
            <p className="text-sm text-green-700">Custom categories • many difficulties • challenge yourself</p>
          </div>

          <div className="flex gap-2 items-center">
            <div className="text-sm">
              <label className="mr-1 text-pink-600 font-medium">Mode</label>
              <select value={mode} onChange={(e)=>setMode(e.target.value)} className="rounded px-2 py-1 border border-pink-100 bg-green-600">
                <option value="relax">Relax</option>
                <option value="challenge">Challenge</option>
              </select>
            </div>

            <div className="text-sm">
              <label className="mr-1 text-pink-600 font-medium">Difficulty</label>
              <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="rounded px-2 py-1 border border-pink-100 bg-green-600">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="text-sm">
              <label className="mr-1 text-pink-600 font-medium">Category</label>
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="rounded px-2 py-1 border border-pink-100 bg-green-600">
                {Object.keys(CATEGORY_SETS).map(k=>(
                  <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>
                ))}
              </select>
            </div>

            <button
              onClick={()=> { if (!started) generateDeck(); else restart(); }}
              className="ml-2 px-3 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-pink-800 font-semibold shadow"
            >
              <RotateCcw size={20} className="inline-block mr-1" /> {started ? "New" : "Start"}
            </button>

            {started && (
              <button onClick={stopGame} className="px-3 py-2 rounded-full bg-green-100 hover:bg-green-200 text-green-800 font-medium ml-2">
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-green-700">
            {started ? (
              <>
                {mode === "challenge" ? <span className={timeLeft<=10 ? "text-red-500 font-semibold" : ""}>⏱ {timeLeft}s</span> : <span>⏱ {formatTime(elapsed)}</span>}
                <span className="ml-3">• Pairs: <strong>{cfg.pairs}</strong></span>
                <span className="ml-3">• Category: <strong>{category}</strong></span>
              </>
            ) : (
              <span className="italic text-pink-600">Choose options and press Start</span>
            )}
          </div>

          <div className="text-sm text-right">
            <div>Best ({mode}/{difficulty}/{category}): <strong className="text-pink-600">{bestForThis ? formatTime(bestForThis) : "—"}</strong></div>
            <div className="text-xs text-gray-500 mt-1">Tip: Expert pairs are a real brain workout 💪</div>
          </div>
        </div>

        {/* Game board */}
        <div className="w-full grid gap-4 mb-4" style={started ? gridStyle : undefined}>
            
          {started && cards.length > 0 ? (
            <div className="w-full h-full"  style={{ display: "grid", ...gridStyle }}>
              {cards.map((card, idx) => {
                const isFlipped = flipped.includes(idx) || matchedIndices.includes(idx);
                const isMatched = matchedIndices.includes(idx);
                return (
                  <div
                    key={card.id}
                    onClick={()=> flipCard(idx)}
                    className={`relative w-full aspect-square rounded-lg cursor-pointer select-none transition transform`}
                    style={{
                      perspective: 1000,
                      padding: 6,
                    }}
                  >
                    {/* card inner */}
                    <div
                      className="absolute inset-0 rounded-lg shadow-sm flex items-center justify-center text-2xl"
                      style={{
                        borderRadius: 12,
                        background: isFlipped ? card.color : "#9f5d6fff",
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(0deg)" : "rotateY(0deg)",
                        // we simulate flip by toggling front/back opacity to keep CSS simple
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: 26, opacity: isFlipped ? 1 : 0, transition: "opacity 260ms" }}>
                        {card.emoji}
                      </div>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: isFlipped ? 0 : 1, transition: "opacity 260ms" }}>
                        {/* Back of card */}
                        <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ background: "#d7a3b1ff" }}>
                          <div className="w-10 h-10 rounded-md" style={{ background: "rgba(255,255,255,0.5)" }} />
                        </div>
                      </div>

                      {/* matched overlay */}
                      {isMatched && (
                        <div style={{ position: "absolute", right: 6, top: 6 }}>
                          <Star size={14} className="text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // placeholder grid preview before start
            <div className="w-full grid grid-cols-4 gap-3 text-center text-gray-400 italic py-8 rounded-lg border border-dashed border-pink-100">
              <div>Press Start to play</div>
            </div>
          )}
        </div>

        {/* bottom controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 items-center">
            <button onClick={()=> { generateDeck(); }} className="px-3 py-2 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium">
              Shuffle / New Round
            </button>
            <button onClick={()=> { setStarted(false); setCards([]); setRunning(false); setMessage(""); }} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
              Exit
            </button>
          </div>

          <div className="text-sm text-right">
            {message && <div className="text-green-700 font-medium">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
