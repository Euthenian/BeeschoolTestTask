// FeedbackModule.tsx
"use client";
import React, { useEffect, useState } from "react";

interface FeedbackModuleProps {
  level: string; // 'easy' | 'medium' | 'hard'
  currentIndex: number;
  total: number;
  userAnswer: string;
  correctAnswer: string;
  onFeedbackReady: () => void;
}

const localFeedback = [
  "Nice try! Keep going!",
  "You're doing great, just a little mistake!",
  "Almost there! Check the meaning again.",
  "Don't give up! You'll get it next time.",
];

export default function FeedbackModule({
  level,
  currentIndex,
  total,
  userAnswer,
  correctAnswer,
  onFeedbackReady,
}: FeedbackModuleProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isEasy = level === "easy" || level === "beginner" || level === "young";
    const isHard = level === "hard" || level === "advanced";
    const isIntermediate = level === "medium" || level === "intermediate";

    const showFeedbackNow =
      (isEasy && (currentIndex + 1) % 3 === 0) ||
      ((isHard || isIntermediate) && currentIndex === total - 1);

    if (!showFeedbackNow) {
      onFeedbackReady();
      return;
    }

    if (isEasy) {
      const msg = localFeedback[Math.floor(Math.random() * localFeedback.length)];
      setFeedback(msg);
      setShow(true);
      const timer = setTimeout(() => onFeedbackReady(), 2000);
      return () => clearTimeout(timer);
    } else {
      const prompt = `The user completed an English vocabulary quiz.\n\nScore: N/A\nMistakes: ${
        userAnswer !== correctAnswer ? userAnswer : "None"
      }\n\nWrite a short motivational message in Japanese.`;

      fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFeedback(data.feedback || "🤖 頑張りました！次もがんばろう！");
          setShow(true);
          setTimeout(() => onFeedbackReady(), 3000);
        })
        .catch((err) => {
          console.error("AI feedback error:", err);
          setFeedback("⚠️ フィードバックを取得できませんでした。");
          setShow(true);
          setTimeout(() => onFeedbackReady(), 2000);
        });
    }
  }, [level, currentIndex, total, userAnswer, correctAnswer, onFeedbackReady]);

  if (!show) return null;

  return (
    <div style={{
      marginTop: 20,
      padding: 15,
      backgroundColor: "#fff9c4",
      borderRadius: 10,
      textAlign: "center",
    }}>
      <strong>💬 Feedback:</strong>
      <div style={{ marginTop: 5 }}>{feedback}</div>
    </div>
  );
}
