import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const tulipTheme = {
  background: "linear-gradient(135deg, #fce8ec 0%, #f6fff3 100%)",
  cardBack: "#e4b5c7",
  suits: {
    spades: "#3b3b3b",
    clubs: "#3b3b3b",
    hearts: "#e46a85",
    diamonds: "#e46a85",
  },
};

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

function shuffle(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Solitaire() {
  const [deck, setDeck] = useState([]);
  const [tableau, setTableau] = useState([]);
  const [waste, setWaste] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newDeck = shuffle(createDeck());
    const newTableau = Array.from({ length: 7 }, (_, i) => newDeck.splice(0, i + 1));
    setDeck(newDeck);
    setTableau(newTableau);
    setWaste([]);
    setSelectedCard(null);
    setSelectedFrom(null);
  };

  const drawCard = () => {
    if (deck.length === 0 && waste.length > 0) {
      setDeck(shuffle(waste));
      setWaste([]);
      return;
    }

    if (deck.length > 0) {
      const newDeck = [...deck];
      const drawn = newDeck.pop();
      setDeck(newDeck);
      setWaste([...waste, drawn]);
    }
  };

  const handleCardClick = (card, fromType, colIndex = null) => {
    if (!selectedCard) {
      // select a card
      setSelectedCard(card);
      setSelectedFrom({ fromType, colIndex });
    } else {
      // move card
      if (selectedFrom.fromType === "tableau") {
        const newTableau = [...tableau];
        const fromCol = [...newTableau[selectedFrom.colIndex]];
        const toCol = colIndex !== null ? [...newTableau[colIndex]] : [];

        const topCard = fromCol[fromCol.length - 1];
        if (topCard === selectedCard && colIndex !== selectedFrom.colIndex) {
          fromCol.pop();
          toCol.push(topCard);
          newTableau[selectedFrom.colIndex] = fromCol;
          if (colIndex !== null) newTableau[colIndex] = toCol;
          setTableau(newTableau);
        }
      } else if (selectedFrom.fromType === "waste" && colIndex !== null) {
        // move from waste to tableau
        const newTableau = [...tableau];
        const toCol = [...newTableau[colIndex]];
        const newWaste = [...waste];

        const topWaste = newWaste[newWaste.length - 1];
        if (topWaste === selectedCard) {
          newWaste.pop();
          toCol.push(topWaste);
          newTableau[colIndex] = toCol;
          setWaste(newWaste);
          setTableau(newTableau);
        }
      }

      setSelectedCard(null);
      setSelectedFrom(null);
    }
  };

  const getSuitColor = (suit) => {
    if (suit === "♠") return tulipTheme.suits.spades;
    if (suit === "♣") return tulipTheme.suits.clubs;
    if (suit === "♥") return tulipTheme.suits.hearts;
    if (suit === "♦") return tulipTheme.suits.diamonds;
    return "#000";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 font-poppins"
      style={{
        background: tulipTheme.background,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <h1 className="text-3xl font-bold text-green-800 mb-4">🌷 Tulip Solitaire</h1>

      <div className="flex items-center gap-4 mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startNewGame}
          className="bg-pink-400 text-white px-4 py-2 rounded-xl shadow hover:bg-pink-500 transition"
        >
          New Game
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={drawCard}
          className="bg-green-400 text-white px-4 py-2 rounded-xl shadow hover:bg-green-500 transition"
        >
          Draw
        </motion.button>
      </div>

      {/* Waste Pile */}
      <div className="flex justify-center gap-2 mb-8">
        {waste.length > 0 ? (
          <motion.div
            onClick={() =>
              handleCardClick(waste[waste.length - 1], "waste")
            }
            className={`w-20 h-28 bg-white rounded-lg shadow flex items-center justify-center text-2xl font-bold cursor-pointer ${
              selectedCard === waste[waste.length - 1]
                ? "ring-4 ring-pink-400"
                : "hover:scale-105"
            }`}
            style={{
              border: "2px solid #f5a6b8",
              color: getSuitColor(waste[waste.length - 1].suit),
            }}
          >
            {waste[waste.length - 1].value}
            {waste[waste.length - 1].suit}
          </motion.div>
        ) : (
          <div
            className="w-20 h-28 rounded-lg shadow-inner border-2 border-dashed border-gray-300"
            style={{ backgroundColor: tulipTheme.cardBack }}
          ></div>
        )}
      </div>

      {/* Tableau */}
      <div className="grid grid-cols-7 gap-3">
        {tableau.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col items-center min-w-[80px]">
            {col.map((card, cardIndex) => (
              <motion.div
                key={cardIndex}
                onClick={() => handleCardClick(card, "tableau", colIndex)}
                className={`w-20 h-28 rounded-lg shadow-md border border-pink-200 flex items-center justify-center text-2xl font-bold mb-[-75px] cursor-pointer transition-transform ${
                  selectedCard === card ? "ring-4 ring-pink-400 scale-105" : "hover:scale-105"
                }`}
                style={{
                  zIndex: cardIndex,
                  backgroundColor: "white",
                  color: getSuitColor(card.suit),
                }}
              >
                {card.value}
                {card.suit}
              </motion.div>
            ))}
            {col.length === 0 && (
              <div
                onClick={() => handleCardClick(null, "tableau", colIndex)}
                className="w-20 h-28 rounded-lg border-2 border-dashed border-gray-300 mb-[-75px]"
                style={{ backgroundColor: tulipTheme.cardBack }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
 