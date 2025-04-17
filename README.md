# 🧪 Bee School – Task 2

### 🧑‍💻 Purpose
This second test task explores:
- Answer tracking and end-of-quiz summary logic
- Mascot-based feedback for wrong/right answers
- Progress bar animation and small UX touches

---

## 🎯 Features to Implement

### 1. ✅ Answer Tracking + Summary

Track each question’s result (correct / incorrect)

**At the end of the quiz**, show a summary table:
- Word in English
- User’s answer (JP)
- Correct answer
- ✅ or ❌ result icon

---

### 2. 🎭 Mascot Reaction (Animated or Static)

After each answer:
- 😊 Show happy face / mascot if correct
- 😢 🤖 Show sad / confused mascot if wrong

You may use:
- Emojis, **OR**
- Create / generate your own mascot image set in `/public/mascot/`  
  (e.g., `happy.png`, `sad.png`, `thinking.png`)

💡 Bonus: Use [Framer Motion](https://www.framer.com/motion/) to bounce or fade the mascot in/out.

> This shows your design sense — even simple images or emoji placement can tell a lot!

---

### 3. 🌟 XP Progress Upgrade

Improve the existing XP bar:
- Animate XP growth with smooth transitions
- Add optional “Level up” effect: 🌟 or 🎉
- Keep code modular so future add-ons (stars, badges, coins) are easy

---

## 📁 Suggested Folder Structure

```
public/
  └── mascot/
      ├── happy.png
      ├── sad.png
      └── thinking.png

src/
  └── components/
      ├── MultipleChoiceQuiz.tsx
      └── ProgressBar.tsx (optional)

README.md
```

---

## ✅ Deliverables

Submit by:
- Sending updated components (`MultipleChoiceQuiz.tsx`, etc.)
- OR linking to your GitHub repo / PR

Let us know if you have any questions!
