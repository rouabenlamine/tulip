import React, { useRef, useEffect, useState } from "react";

/**
 * Tulip Pool v3
 * - Stick appears in front of the cue ball (aim direction)
 * - Classic green felt table with soft pink border
 * - Smooth drag & shot controls
 */

const TABLE_PADDING = 40;
const POCKET_RADIUS = 18;
const BALL_RADIUS = 10;
const FRICTION = 0.992;
const MIN_SPEED = 0.05;
const INITIAL_BALLS = 6;

export default function Pool() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(560);
  const [balls, setBalls] = useState([]);
  const ballsRef = useRef([]);
  const dragRef = useRef({});
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("pool_best_score") || 0));

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 100, 800);
      setWidth(w);
      setHeight(Math.round((w * 500) / 900));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Setup new game
  useEffect(() => {
    newGame();
    // eslint-disable-next-line
  }, [width, height]);

  function newGame() {
    const tableW = width - TABLE_PADDING * 2;
    const tableH = height - TABLE_PADDING * 2;
    const leftX = TABLE_PADDING + tableW * 0.18;
    const centerY = TABLE_PADDING + tableH / 2;

    const cue = { id: "cue", x: leftX, y: centerY, vx: 0, vy: 0, color: "#ffffff", isCue: true, sunk: false };

    const clusterX = TABLE_PADDING + tableW * 0.68;
    const clusterY = centerY;
    const palette = ["#FFA4B6", "#F8C471", "#A2E8C1", "#A0C3FF", "#E5A3FF", "#FFCE94"];
    const cluster = [];
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c <= r; c++) {
        if (idx >= INITIAL_BALLS) break;
        cluster.push({
          id: `b${idx}`,
          x: clusterX + r * 20,
          y: clusterY + (c - r / 2) * 22,
          vx: 0,
          vy: 0,
          color: palette[idx % palette.length],
          isCue: false,
          sunk: false,
        });
        idx++;
      }
    }

    const all = [cue, ...cluster];
    ballsRef.current = all;
    setBalls(all);
    setScore(0);
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    function drawTable() {
      ctx.clearRect(0, 0, width, height);
      const tx = TABLE_PADDING;
      const ty = TABLE_PADDING;
      const tw = width - TABLE_PADDING * 2;
      const th = height - TABLE_PADDING * 2;

      // Green felt
      const felt = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
      felt.addColorStop(0, "#4CAF50");
      felt.addColorStop(1, "#2E7D32");
      ctx.fillStyle = felt;
      ctx.fillRect(tx, ty, tw, th);

      // Pink border
      ctx.strokeStyle = "#FFC0CB";
      ctx.lineWidth = 14;
      ctx.strokeRect(tx - 6, ty - 6, tw + 12, th + 12);

      // Pockets
      const pockets = [
        [tx, ty], [tx + tw / 2, ty], [tx + tw, ty],
        [tx, ty + th], [tx + tw / 2, ty + th], [tx + tw, ty + th],
      ];
      ctx.fillStyle = "#444";
      pockets.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function physicsStep() {
      const list = ballsRef.current;

      list.forEach((b) => {
        if (b.sunk) return;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= FRICTION;
        b.vy *= FRICTION;
        if (Math.hypot(b.vx, b.vy) < MIN_SPEED) {
          b.vx = 0; b.vy = 0;
        }
      });

      const tx = TABLE_PADDING;
      const ty = TABLE_PADDING;
      const tw = width - TABLE_PADDING * 2;
      const th = height - TABLE_PADDING * 2;

      // wall collisions
      list.forEach((b) => {
        if (b.sunk) return;
        if (b.x - BALL_RADIUS < tx || b.x + BALL_RADIUS > tx + tw) {
          b.vx *= -0.9;
          b.x = Math.min(Math.max(b.x, tx + BALL_RADIUS), tx + tw - BALL_RADIUS);
        }
        if (b.y - BALL_RADIUS < ty || b.y + BALL_RADIUS > ty + th) {
          b.vy *= -0.9;
          b.y = Math.min(Math.max(b.y, ty + BALL_RADIUS), ty + th - BALL_RADIUS);
        }
      });

      // ball-ball collisions
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i], b = list[j];
          if (a.sunk || b.sunk) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = BALL_RADIUS * 2;
          if (dist > 0 && dist < minDist) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = (minDist - dist) / 2;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;

            // velocity swap (elastic)
            const va = a.vx * nx + a.vy * ny;
            const vb = b.vx * nx + b.vy * ny;
            const diff = va - vb;
            a.vx -= diff * nx;
            a.vy -= diff * ny;
            b.vx += diff * nx;
            b.vy += diff * ny;
          }
        }
      }

      // pocket check
      const pockets = [
        [tx, ty], [tx + tw / 2, ty], [tx + tw, ty],
        [tx, ty + th], [tx + tw / 2, ty + th], [tx + tw, ty + th],
      ];
      list.forEach((b) => {
        if (b.sunk) return;
        for (let [px, py] of pockets) {
          if (Math.hypot(px - b.x, py - b.y) < POCKET_RADIUS) {
            b.sunk = true;
            if (!b.isCue) {
              setScore((s) => {
                const n = s + 1;
                if (n > best) {
                  localStorage.setItem("pool_best_score", n);
                  setBest(n);
                }
                return n;
              });
            } else {
              setTimeout(() => {
                b.sunk = false;
                b.x = tx + tw * 0.18;
                b.y = ty + th / 2;
                b.vx = 0; b.vy = 0;
              }, 700);
            }
          }
        }
      });
    }

    function drawBalls() {
      const ctx = canvasRef.current.getContext("2d");
      const list = ballsRef.current;
      list.forEach((b) => {
        if (b.sunk) return;
        ctx.beginPath();
        ctx.fillStyle = b.color;
        ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.stroke();
      });
    }

    function drawCueStick() {
      if (!dragRef.current.start || !dragRef.current.current) return;
      const cue = ballsRef.current.find((b) => b.isCue);
      if (!cue) return;
      const s = dragRef.current.start;
      const c = dragRef.current.current;
      const dx = s.x - c.x, dy = s.y - c.y;
      const angle = Math.atan2(dy, dx);
      const ctx = canvasRef.current.getContext("2d");

      // stick in front of ball (toward shot)
      const stickLength = 250;
      const stickX1 = cue.x + Math.cos(angle) * BALL_RADIUS;
      const stickY1 = cue.y + Math.sin(angle) * BALL_RADIUS;
      const stickX2 = cue.x + Math.cos(angle) * (BALL_RADIUS + stickLength);
      const stickY2 = cue.y + Math.sin(angle) * (BALL_RADIUS + stickLength);

      ctx.strokeStyle = "#D97EA4";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(stickX1, stickY1);
      ctx.lineTo(stickX2, stickY2);
      ctx.stroke();
    }

    function loop() {
      drawTable();
      physicsStep();
      drawBalls();
      drawCueStick();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, best]);

  // input handling
  useEffect(() => {
    const canvas = canvasRef.current;
    const rect = () => canvas.getBoundingClientRect();

    const pos = (e) =>
      e.touches
        ? { x: e.touches[0].clientX - rect().left, y: e.touches[0].clientY - rect().top }
        : { x: e.clientX - rect().left, y: e.clientY - rect().top };

    const cue = () => ballsRef.current.find((b) => b.isCue);

    const onDown = (e) => {
      const p = pos(e);
      const cb = cue();
      if (Math.hypot(cb.x - p.x, cb.y - p.y) < 30) {
        dragRef.current.start = { ...p };
        dragRef.current.current = { ...p };
      }
    };
    const onMove = (e) => {
      if (dragRef.current.start) dragRef.current.current = pos(e);
    };
    const onUp = () => {
      if (!dragRef.current.start || !dragRef.current.current) return;
      const s = dragRef.current.start;
      const c = dragRef.current.current;
      const dx = s.x - c.x, dy = s.y - c.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const cb = cue();
      const power = Math.min(dist / 5, 18);
      cb.vx = Math.cos(angle) * power;
      cb.vy = Math.sin(angle) * power;
      dragRef.current = {};
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 font-poppins bg-gradient-to-br from-pink-50 via-white to-green-50">
      <div className="w-full max-w-4xl bg-white/80 p-4 rounded-2xl shadow-lg border border-pink-100 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-pink-600">🎱 Tulip Pool</h2>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-700">Score: <strong>{score}</strong></span>
          <span className="text-sm text-gray-700">Best: <strong>{best}</strong></span>
          <button onClick={() => newGame()} className="px-3 py-1 bg-pink-100 hover:bg-pink-200 rounded-full">
            New Game
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-2xl shadow-lg"
        style={{ background: "transparent", maxWidth: "100%", height: "auto" }}
      />
      <p className="mt-3 text-gray-500 text-sm">Click & drag the white ball to aim. Release to shoot 🎯</p>
    </div>
  );
}
