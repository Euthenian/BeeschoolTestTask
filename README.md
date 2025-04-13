# BeeschoolTestTask
Test task for hring process

# 🐝 Bee School — Feedback Integration Task

### 🎯 Objective:
Implement conditional feedback behavior inside the provided `MultipleChoiceQuiz.tsx` component using our existing `FeedbackModule`.

---

## ✅ Expected Logic:

- **Levels 1 & 2** → Show a local feedback message every **3 questions**
- **Levels 3 & 4** → Show a *placeholder AI-style feedback message* only **at the end of the quiz**

You do **not** need to connect to an external API — the module handles this logic internally.

---

## 🧠 Instructions

- Integrate the `<FeedbackModule />` where appropriate.
- Use values like `currentIndex`, `total`, and `currentWord.set` to trigger the feedback.
- Make sure the quiz flow **pauses when feedback is shown**, and resumes once `onFeedbackReady` is called.

---

## 🎧 Animations & Sounds

The quiz includes animations and sound effects (via Framer Motion and native audio).  
✅ These are already implemented.  
❌ You **do not need to change or implement** them.  
🛑 Please avoid breaking or removing them.

---

## 📁 Provided Files

- `MultipleChoiceQuiz.tsx`
- `FeedbackModule.tsx`
- Sample `vocabData.csv` with dummy quiz items for levels 1–4

---

## 🧪 What We’re Looking At

- Clear conditional logic
- Smooth integration of feedback
- Clean, readable, React/TypeScript code
- Respecting existing UX (animations, sounds, flow)

---

Feel free to leave helpful comments in your code.
