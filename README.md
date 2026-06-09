# 🎮 Tic Tac Toe

A clean, pretty Tic Tac Toe game built with vanilla HTML, CSS and JavaScript. Play against a friend or challenge the AI — three difficulty levels including an unbeatable Hard mode.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

- 👥 **2 Player mode** — play locally with a friend
- 🤖 **vs AI mode** — Easy, Medium, and Hard difficulty
- 🧠 **Unbeatable Hard AI** — uses Minimax algorithm with alpha-beta pruning
- ↩️ **Undo** — take back your last move
- 🏆 **Scoreboard** — tracks wins across rounds
- 🎊 **Confetti** on win
- 🔊 **Sound effects** — Web Audio API, no library needed
- 📱 **Responsive** — works on mobile and desktop

---

## 📁 Project Structure

```
tic-tac-toe/
├── index.html     # Structure and layout
├── style.css      # All styling
└── app.js         # Game logic, AI, sounds
```

---

## 🚀 How to Run Locally

No installation needed. Just:

1. Download or clone this repo
2. Open `index.html` in any browser

```bash
git clone https://github.com/Jiya022/tic-tac-toe.git
cd tic-tac-toe
# open index.html in your browser
```

---

## 🌐 Live Demo

👉 [Play here](https://jiya022.github.io/tic-tac-toe/)

---

## 🧠 How the AI Works

- **Easy** — picks a random empty cell
- **Medium** — 60% chance of best move, 40% random (feels human)
- **Hard** — full [Minimax](https://en.wikipedia.org/wiki/Minimax) with alpha-beta pruning. Cannot be beaten, only drawn.

---

## 🛠️ Built With

- Pure HTML, CSS, JavaScript — no frameworks, no libraries
- Web Audio API for sounds
- CSS animations for confetti and piece placement
