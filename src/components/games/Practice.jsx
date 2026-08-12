import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Home, RotateCcw } from "lucide-react";
import HandGestureDetector from "../quiz/HandGestureDetector";

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Custom hook for persistent practice state
const usePersistentPractice = () => {
  const [currentLetter, setCurrentLetter] = useState(() => {
    const saved = localStorage.getItem("practiceCurrentLetter");
    return saved || "A";
  });

  const [passedLetters, setPassedLetters] = useState(() => {
    const saved = localStorage.getItem("practicePassedLetters");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("practiceCurrentLetter", currentLetter);
  }, [currentLetter]);

  useEffect(() => {
    localStorage.setItem(
      "practicePassedLetters",
      JSON.stringify(Array.from(passedLetters)),
    );
  }, [passedLetters]);

  const reset = () => {
    setCurrentLetter("A");
    setPassedLetters(new Set());
    localStorage.removeItem("practiceCurrentLetter");
    localStorage.removeItem("practicePassedLetters");
  };

  return {
    currentLetter,
    setCurrentLetter,
    passedLetters,
    setPassedLetters,
    reset,
  };
};

const Practice = () => {
  const navigate = useNavigate();
  const {
    currentLetter,
    setCurrentLetter,
    passedLetters,
    setPassedLetters,
    reset,
  } = usePersistentPractice();
  const [cue, setCue] = useState(null);
  const [allComplete, setAllComplete] = useState(false);

  const cueRef = useRef(null);
  const lettersPassed = passedLetters.size;

  const showCue = (type, onComplete) => {
    if (cueRef.current) return;
    cueRef.current = type;
    setCue(type);
    setTimeout(() => {
      cueRef.current = null;
      setCue(null);
      onComplete?.();
    }, 1000);
  };

  const getNextUnpassedLetter = (current, passedSet) => {
    const idx = ALL_LETTERS.indexOf(current);
    for (let i = idx + 1; i < ALL_LETTERS.length; i++) {
      if (!passedSet.has(ALL_LETTERS[i])) return ALL_LETTERS[i];
    }
    for (let i = 0; i < idx; i++) {
      if (!passedSet.has(ALL_LETTERS[i])) return ALL_LETTERS[i];
    }
    return null;
  };

  const handleSuccess = () => {
    if (cueRef.current) return;

    const newPassedLetters = new Set([...passedLetters, currentLetter]);
    const nextLetter = getNextUnpassedLetter(currentLetter, newPassedLetters);

    setPassedLetters(newPassedLetters);

    showCue("pass", () => {
      if (nextLetter === null) {
        setAllComplete(true);
      } else {
        setCurrentLetter(nextLetter);
      }
    });
  };

  const handleFail = () => {
    showCue("fail");
  };

  const selectLetter = (letter) => {
    if (cueRef.current) return;
    if (passedLetters.has(letter)) return;
    setCurrentLetter(letter);
  };

  const saveProgress = () => {
    const progress = Math.round((lettersPassed / 26) * 100);
    localStorage.setItem("practiceProgress", progress.toString());
  };

  const handleHome = () => {
    saveProgress();
    navigate("/");
  };

  const handleReset = () => {
    reset();
    setAllComplete(false);
    setCue(null);
    cueRef.current = null;
  };

  const handlePracticeAgain = () => {
    handleReset();
  };

  if (allComplete) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-[#003A3A] via-[#007C8A] to-[#00BBBB] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">All Done!</h1>
          <p className="text-gray-500 mb-4">You signed all 26 letters!</p>
          <div className="text-5xl font-black text-[#00BBBB] mb-6">26/26</div>
          <div className="flex gap-3">
            <button
              onClick={handlePracticeAgain}
              className="flex-1 bg-[#00BBBB] hover:bg-[#009E9E] text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              Practice Again
            </button>
            <button
              onClick={handleHome}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003A3A] via-[#007C8A] to-[#00BBBB] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* === HEADER ROW === */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <div className="text-xs sm:text-sm opacity-70">Letters Passed</div>
            <div className="text-2xl sm:text-3xl font-black">
              {lettersPassed}/26
            </div>
          </div>

          <div className="flex gap-2">
            {/* Reset button */}
            <button
              onClick={handleReset}
              className="text-white hover:text-gray-300 transition p-2 hover:bg-white/10 rounded-lg"
              title="Reset progress"
            >
              <RotateCcw className="w-6 h-6 sm:w-6 sm:h-6" />
            </button>

            {/* Home button */}
            <button
              onClick={handleHome}
              className="text-white hover:text-gray-300 transition"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>

        {/* === REFERENCE IMAGE & KEYBOARD ROW === */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 items-start">
          {/* Reference Image */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
              <div className="text-white/70 text-xs mb-2 text-center">
                Reference: {currentLetter}
              </div>
              <img
                src={`/asl/${currentLetter}.png`}
                alt={`ASL sign for ${currentLetter}`}
                className="w-40 h-40 object-contain rounded-lg bg-white/5"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>

          {/* Letter Keyboard */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="grid grid-cols-8 sm:grid-cols-8 lg:grid-cols-9 gap-2">
              {ALL_LETTERS.map((letter) => (
                <button
                  key={letter}
                  onClick={() => selectLetter(letter)}
                  disabled={passedLetters.has(letter)}
                  className={`aspect-square rounded text-xs font-bold transition-all transform flex items-center justify-center
                    ${!passedLetters.has(letter) && "hover:scale-110"}
                    ${
                      currentLetter === letter
                        ? "bg-white text-[#004C4C] shadow-lg scale-110"
                        : passedLetters.has(letter)
                          ? "bg-green-400 text-white cursor-not-allowed opacity-80"
                          : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                >
                  <span className="text-sm">
                    {passedLetters.has(letter) ? "✓" : letter}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === CAMERA / FEEDBACK SECTION === */}
        <div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl"
          style={{ aspectRatio: "4/3" }}
        >
          {/* Camera — remounts for each letter */}
          <HandGestureDetector
            key={currentLetter}
            targetLetter={currentLetter}
            onSuccess={handleSuccess}
            onFail={handleFail}
            minimal={true}
          />

          {/* Feedback overlay — instant, no exit→enter gap */}
          <AnimatePresence>
            {cue && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className={`absolute inset-0 flex items-center justify-center
                            text-white text-7xl sm:text-8xl font-black ${
                              cue === "pass"
                                ? "bg-green-500/90"
                                : "bg-red-500/90"
                            }`}
              >
                {cue === "pass" ? "✓" : "✗"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === INFO TEXT === */}
        <div className="text-center text-white/70 text-xs sm:text-sm mt-4">
          {lettersPassed === 25
            ? `${26 - lettersPassed} letter left — almost there!`
            : passedLetters.has(currentLetter)
              ? "You've passed this letter! Select another."
              : "Show the sign for: " + currentLetter}
        </div>

        {/* === HOME BUTTON === */}
        <div className="text-center mt-6">
          <button
            onClick={handleHome}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20
                       text-white font-bold py-2 px-4 sm:py-3 sm:px-6
                       rounded-lg sm:rounded-xl transition-all transform hover:scale-105 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;
