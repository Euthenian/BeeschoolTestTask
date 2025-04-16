"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import FeedbackModule from "@/components/FeedbackModule";

interface WordItem {
  id: number;
  word_en: string;
  word_jp: string;
  yomigana: string;
  set: number;
  image_name: string;
  img_file: string;
}

interface MultipleChoiceQuizProps {
  vocabData: WordItem[];
}

const crossVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: 0 },
  visible: {
    opacity: 1,
    scale: [0.5, 1.2, 0.9, 1.1, 1],
    rotate: [0, 20, -20, 20, 0],
    transition: { duration: 0.8, ease: "easeInOut" },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

const backgroundImages = ["bg3.png", "bg2.png", "bg5.png", "bg6.png"];

const wrongSoundPaths = [
  "/sounds/squeeze-toy-1.mp3",
  "/sounds/squeeze-toy-2.mp3",
  "/sounds/squeeze-toy-5.mp3",
];

const preloadSounds = () => {
  wrongSoundPaths.forEach((src) => {
    const audio = new Audio(src);
    audio.load();
  });
};

export default function MultipleChoiceQuiz({ vocabData }: MultipleChoiceQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWordJp, setSelectedWordJp] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [wrongOptionId, setWrongOptionId] = useState<number | null>(null);
  const [showYomigana, setShowYomigana] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timer, setTimer] = useState(8);
  const [remainingTime, setRemainingTime] = useState(timer);
  const [showSettings, setShowSettings] = useState(false);
  const [unlockedSets, setUnlockedSets] = useState<number[]>(() => {
    const saved = localStorage.getItem("unlockedSets");
    return saved ? JSON.parse(saved) : [1];
  });
  const [forceUnlock, setForceUnlock] = useState(false);
  const [selectedSet, setSelectedSet] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [lastChosenWord, setLastChosenWord] = useState<WordItem | null>(null);

 const filteredVocab = useMemo(() => {
    return vocabData.filter((word) => word.set === selectedSet);
  }, [vocabData, selectedSet]);

  useEffect(() => {
    const onFirstInteraction = () => {
      preloadSounds();
      window.removeEventListener("click", onFirstInteraction);
    };
    window.addEventListener("click", onFirstInteraction);
    return () => window.removeEventListener("click", onFirstInteraction);
  }, []);

  useEffect(() => {
    setWrongOptionId(null); // Clear wrong option when question index changes
  }, [currentIndex]);


  const currentWord = filteredVocab[currentIndex];

  const options = useMemo(
    () => shuffleArray([currentWord, ...getDistractors(filteredVocab, currentWord)]),
    [currentWord, filteredVocab]
  );

  useEffect(() => {
    if (!timerEnabled) return;
    setRemainingTime(timer);
    const countdown = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [currentWord, timer, timerEnabled]);

  useEffect(() => {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word_en);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }, [currentWord]);

  const handleChoice = (chosenWord: WordItem) => {
    if (answered) return;
    setSelectedWordJp(chosenWord.word_jp);
    setAnswered(true);
    // Save the user's response and the correct answer for feedback
    setUserAnswer(chosenWord.word_jp);
    setCorrectAnswer(currentWord.word_jp);
  
    if (chosenWord.word_jp === currentWord.word_jp) {
      const correctSound = new Audio("/sounds/magic-chime-02.mp3");
      correctSound.play();
      setScore((prev) => prev + 1);
      setShowStars(true);
    } else {
      setWrongOptionId(chosenWord.id);
      const randomSoundPath = wrongSoundPaths[Math.floor(Math.random() * wrongSoundPaths.length)];
      const wrongSound = new Audio(randomSoundPath);
      window.speechSynthesis.cancel();
      wrongSound.play().catch((error) => {
        console.error("Failed to play wrong answer sound:", error);
      });
    }
    // Conditional logic for different feedback levels:
    // 1. For levels 1-2 (easy) - every 3 questions
    // 2. For levels 3-4 (difficult) - only at the end of the quiz
    const isEasyLevel = currentWord.set === 1 || currentWord.set === 2;
    const isLastQuestion = currentIndex === filteredVocab.length - 1;
  
    if ((isEasyLevel && (currentIndex + 1) % 3 === 0) || 
        (!isEasyLevel && isLastQuestion)) {
      setShowFeedback(true);
      setLastChosenWord(chosenWord);
    } else {
      // If no feedback is needed, continue as usual
      setTimeout(() => {
        moveToNextStep(chosenWord);
      }, 2000);
    }
  };
  const moveToNextStep = (chosenWord: WordItem) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < filteredVocab.length) {
      setCurrentIndex(nextIndex);
    } else {
      const accuracy = (score + (chosenWord.word_jp === currentWord.word_jp ? 1 : 0)) / filteredVocab.length;
      const currentSet = currentWord.set;
      if (accuracy >= 0.8 && !unlockedSets.includes(currentSet + 1)) {
        const updated = [...unlockedSets, currentSet + 1];
        setUnlockedSets(updated);
        localStorage.setItem("unlockedSets", JSON.stringify(updated));
        alert(`🎉 セット${currentSet + 1}がアンロックされました！`);
      } else {
        alert(`クイズ終了！スコア: ${score + (chosenWord.word_jp === currentWord.word_jp ? 1 : 0)}/${filteredVocab.length}`);
      }
      setCurrentIndex(0);
      setScore(0);
    }
    setSelectedWordJp(null);
    setAnswered(false);
    setShowStars(false);
  };
  
  const handleFeedbackReady = () => {
    setShowFeedback(false);
    if (lastChosenWord) {
      moveToNextStep(lastChosenWord);
      setLastChosenWord(null);
    }
  };


  const handleTimeout = () => {
    if (!answered) {
      setWrongOptionId(null);
      setAnswered(true);
      setTimeout(() => {
        const accuracy = score / filteredVocab.length;
        const currentSet = currentWord.set;
        if (accuracy >= 0.8 && !unlockedSets.includes(currentSet + 1)) {
          const updated = [...unlockedSets, currentSet + 1];
          setUnlockedSets(updated);
          localStorage.setItem("unlockedSets", JSON.stringify(updated));
          alert(`🎉 セット${currentSet + 1}がアンロックされました！`);
        } else {
          alert(`クイズ終了！スコア: ${score}/${filteredVocab.length}`);
        }
        const nextIndex = currentIndex + 1;
        if (nextIndex < filteredVocab.length) {
          setCurrentIndex(nextIndex);
        } else {
          setCurrentIndex(0);
          setScore(0);
        }
        setAnswered(false);
        setShowStars(false);
        setWrongOptionId(null);
      }, 2000);
    }
  };

  const getBgImage = (index: number): string => {
    return backgroundImages[index % backgroundImages.length];
  };

  const StarAnimation = () => (
    <motion.div
      initial={{ opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 0, scale: 2, y: -80 }}
      transition={{ duration: 1.2 }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        fontSize: "40px",
        color: "#ffdf00",
        zIndex: 10,
      }}
    >
      ✨🌸🌟💮🌟🌸✨
    </motion.div>
  );

  if (!filteredVocab.length) {
    return <div>🚫 このセットには単語がありません。別のセットを選択してください。</div>;
  }


  return (
    <div style={{ backgroundColor: "#f0f1f3", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        {/* Blue Settings Button */}
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {showSettings ? "設定を隠す" : "⚙️ 設定を表示"}
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            {/* Show Furigana Button */}
            <div>
              <button
                onClick={() => setShowYomigana((prev) => !prev)}
                style={{
                  padding: "10px 20px",
                  fontSize: "1rem",
                  backgroundColor: showYomigana ? "#4caf50" : "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FontAwesomeIcon icon={showYomigana ? faEyeSlash : faEye} />
                <span>{showYomigana ? "ふりがなを非表示" : "ふりがなを表示"}</span>
              </button>
            </div>

            {/* Timer Settings */}
            <div>
              <label style={{ marginRight: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <FontAwesomeIcon icon={faClock} />
                タイマー:
              </label>
              <button
                onClick={() => setTimerEnabled((prev) => !prev)}
                style={{
                  marginRight: "10px",
                  padding: "6px 15px",
                  fontSize: "1rem",
                  backgroundColor: timerEnabled ? "#4caf50" : "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {timerEnabled ? "オン" : "オフ"}
              </button>

              <select
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                disabled={!timerEnabled}
                style={{
                  padding: "5px 10px",
                  fontSize: "1rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              >
                <option value={8}>8秒</option>
                <option value={5}>5秒</option>
                <option value={3}>3秒</option>
              </select>
            </div>

            {/* Force Unlock Toggle */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>🔓 強制アンロック:</label>
              <button
                onClick={() => {
                  setForceUnlock((prev) => !prev);
                  if (!forceUnlock) {
                    const allSets = Array.from(new Set(vocabData.map((word) => word.set)));
                    setUnlockedSets(allSets);
                    localStorage.setItem("unlockedSets", JSON.stringify(allSets));
                  } else {
                    setUnlockedSets([1]);
                    localStorage.setItem("unlockedSets", JSON.stringify([1]));
                  }
                }}
                style={{
                  marginRight: "10px",
                  padding: "6px 15px",
                  fontSize: "1rem",
                  backgroundColor: forceUnlock ? "#4caf50" : "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {forceUnlock ? "オン" : "オフ"}
              </button>
            </div>

            {/* Set Selector Dropdown */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>🗂 セット選択:</label>
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(Number(e.target.value))}
                style={{
                  padding: "5px 10px",
                  fontSize: "1rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              >
                {Array.from({ length: 4 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    セット {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      {showFeedback && (
        <FeedbackModule
          level={currentWord.set <= 2 ? "easy" : "hard"}
          currentIndex={currentIndex}
          total={filteredVocab.length}
          userAnswer={userAnswer}
          correctAnswer={correctAnswer}
          onFeedbackReady={handleFeedbackReady}
        />
      )}

      {timerEnabled && (
        <div style={{ textAlign: "center", marginBottom: "20px", fontSize: "1.5rem", color: "#f44336" }}>
          残り時間: {remainingTime}秒
        </div>
      )}

      {/* Original Quiz Content */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F9D6D1",
          color: "#ffffff",
          borderRadius: "8px",
          width: "calc(4 * 250px + 6 * 15px)",
          padding: "10px 20px",
          margin: "0 auto 20px",
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "3rem" }}>{currentWord.word_en}</h3>
        <button
          onClick={() => {
            const utterance = new SpeechSynthesisUtterance(currentWord.word_en);
            utterance.lang = "en-US";
            window.speechSynthesis.speak(utterance);
          }}
          style={{
            backgroundColor: "#F1A7A6",
            fontSize: "1.5rem",
            cursor: "pointer",
            borderRadius: "27%",
            padding: "8px",
            border: "none",
            color: "#ffffff",
            marginLeft: "10px",
          }}
          aria-label="Play English word"
        >
          <FontAwesomeIcon icon={faVolumeUp} />
        </button>
      </div>
      <h2 style={{ textAlign: "center" }}>日本語でなんと言いますか？</h2>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
        {options.map((option, index) => {
          const isFlipped = answered && selectedWordJp === option.word_jp && option.word_jp === currentWord.word_jp;
          return (
            <div key={option.id} style={{ position: "relative", width: 250, height: 180, margin: 15, perspective: 1000 }}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  cursor: answered ? "default" : "pointer",
                }}
                onClick={() => handleChoice(option)}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    backgroundImage: `url(/images/${getBgImage(index)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
                    color: "black",
                  }}
                >
                  <ruby>
                    {option.word_jp}
                    {showYomigana && <rt>{option.yomigana}</rt>}
                  </ruby>
                </div>
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    transform: "rotateY(180deg)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {option.word_jp === currentWord.word_jp && (
                    <img
                      src={`/images/${option.img_file}`}
                      alt={option.word_jp}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
              </motion.div>
              <AnimatePresence>
                {wrongOptionId === option.id && (
                  <motion.div
                    variants={crossVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 5,
                    }}
                  >
                    <span style={{ fontSize: "64px", color: "red" }}>❌</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showStars && selectedWordJp === option.word_jp && option.word_jp === currentWord.word_jp && <StarAnimation />}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", width: "80%", margin: "0 auto" }}>
        <div style={{ width: "100%", height: "20px", backgroundColor: "#e0e0e0", borderRadius: "10px", overflow: "hidden" }}>
          <div
            style={{
              width: `${((currentIndex + 1) / filteredVocab.length) * 100}%`,
              height: "100%",
              backgroundColor: "#4caf50",
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#B4C9B1",
            color: "#ffffff",
            borderRadius: "8px",
          }}
        >
          <span>Question {currentIndex + 1} of {filteredVocab.length}</span>
          <span>Score: {score}</span>
        </div>
      </div>
    </div>
  );
}

function getDistractors(allWords: WordItem[], target: WordItem): WordItem[] {
  return shuffleArray(allWords.filter(item => item.id !== target.id)).slice(0, 3);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
