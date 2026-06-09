
/* ── SELECTORS ── */
const boxes        = document.querySelectorAll(".box");
const resetBtn     = document.querySelector("#reset-btn");
const newBtn       = document.querySelector("#new-btn");
const backBtn      = document.querySelector("#back-btn");
const homeBtn      = document.querySelector("#home-btn");
const undoBtn      = document.querySelector("#undo-btn");
const resultOverlay= document.querySelector("#result-overlay");
const msg          = document.querySelector("#msg");
const resultEmoji  = document.querySelector("#result-emoji");
const turnIndicator= document.querySelector("#turn-indicator");
const playerOInput = document.querySelector("#playerO");
const playerXInput = document.querySelector("#playerX");
const startBtn     = document.querySelector("#start-btn");
const aiToggle     = document.querySelector("#ai-toggle");
const aiDifficulty = document.querySelector("#ai-difficulty");
const diffBtns     = document.querySelectorAll(".diff-btn");
const landingScreen= document.querySelector("#landing-screen");
const gameScreen   = document.querySelector("#game-screen");
const scoreCardO   = document.querySelector("#score-card-o");
const scoreCardX   = document.querySelector("#score-card-x");
const roundLabel   = document.querySelector("#round-label");
 
/* Score display */
const nameOEl  = document.querySelector("#nameO");
const nameXEl  = document.querySelector("#nameX");
const scoreOEl = document.querySelector("#scoreO");
const scoreXEl = document.querySelector("#scoreX");
const miniNameO  = document.querySelector("#mini-nameO");
const miniNameX  = document.querySelector("#mini-nameX");
const miniScoreO = document.querySelector("#mini-scoreO");
const miniScoreX = document.querySelector("#mini-scoreX");
 
/* ── STATE ── */
let playerO    = "Player O";
let playerX    = "Player X";
let turnO      = true;
let count      = 0;
let winsO      = 0;
let winsX      = 0;
let roundNum   = 1;
let gameOver   = false;
let vsAI       = false;
let difficulty = "medium";
let moveHistory = [];  // [{index, symbol}]
 
/* ── WIN PATTERNS ── */
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];
 
/* ── SOUND (Web Audio) ── */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
 
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}
 
function playTone(freq, type = "sine", duration = 0.12, vol = 0.25) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(_) {}
}
 
function playMove()  { playTone(520, "sine", 0.1, 0.2); }
function playWin()   { [600, 750, 900].forEach((f, i) => setTimeout(() => playTone(f, "triangle", 0.2, 0.3), i * 120)); }
function playDraw()  { playTone(300, "sawtooth", 0.3, 0.15); }
function playUndo()  { playTone(400, "sine", 0.1, 0.15); }
 
/* ── AI DIFFICULTY SELECTOR ── */
aiToggle.addEventListener("change", () => {
  vsAI = aiToggle.checked;
  aiDifficulty.classList.toggle("hide", !vsAI);
  if (vsAI) playerXInput.value = "";
  playerXInput.placeholder = vsAI ? "🤖 AI Player" : "e.g. Bob";
  playerXInput.disabled = vsAI;
});
 
diffBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    diffBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    difficulty = btn.dataset.diff;
  });
});
 
/* ── START GAME ── */
startBtn.addEventListener("click", () => {
  playerO = playerOInput.value.trim() || "Player O";
  playerX = vsAI ? "🤖 AI" : (playerXInput.value.trim() || "Player X");
  winsO = winsX = 0;
  roundNum = 1;
  landingScreen.classList.add("hide");
  gameScreen.classList.remove("hide");
  updateScoreDisplay();
  startRound();
});
 
/* ── START / RESET A ROUND ── */
function startRound() {
  turnO = true;
  count = 0;
  gameOver = false;
  moveHistory = [];
  boxes.forEach(box => {
    box.innerText = "";
    box.disabled = false;
    box.classList.remove("win-box");
    box.style.background = "";
  });
  resultOverlay.classList.add("hide");
  roundLabel.innerText = `Round ${roundNum}`;
  updateTurnIndicator();
  updateActiveTurnCard();
}
 
/* ── BOX CLICK ── */
boxes.forEach(box => {
  box.addEventListener("click", () => {
    if (gameOver || box.innerText !== "") return;
    makeMove(box, turnO ? "⭕" : "❌");
 
    // AI move after short delay
    if (!gameOver && vsAI && !turnO) {
      boxes.forEach(b => b.disabled = true);
      setTimeout(() => {
        if (!gameOver) {
          const aiBox = getAIMove();
          if (aiBox) makeMove(aiBox, "❌");
          boxes.forEach(b => { if (!b.innerText) b.disabled = false; });
        }
      }, 400);
    }
  });
});
 
function makeMove(box, symbol) {
  box.innerText = symbol;
  box.disabled = true;
  box.classList.add("pop-in");
  setTimeout(() => box.classList.remove("pop-in"), 300);
  moveHistory.push({ index: parseInt(box.dataset.index), symbol });
  count++;
  playMove();
 
  const winner = checkWinner();
  if (!winner && count === 9) {
    gameDraw();
  } else if (!winner) {
    turnO = !turnO;
    updateTurnIndicator();
    updateActiveTurnCard();
  }
}
 
/* ── UNDO ── */
undoBtn.addEventListener("click", () => {
  if (gameOver || moveHistory.length === 0) return;
 
  // If vs AI, undo 2 moves (player + AI)
  const movesToUndo = (vsAI && moveHistory.length >= 2) ? 2 : 1;
  for (let i = 0; i < movesToUndo; i++) {
    const last = moveHistory.pop();
    if (!last) break;
    boxes[last.index].innerText = "";
    boxes[last.index].disabled = false;
    count--;
  }
  turnO = true; // always back to player O's turn after undo
  playUndo();
  updateTurnIndicator();
  updateActiveTurnCard();
});
 
/* ── WINNER CHECK ── */
function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[b].innerText === boxes[c].innerText
    ) {
      showWinner(boxes[a].innerText, pattern);
      return true;
    }
  }
  return false;
}
 
function showWinner(symbol, pattern) {
  gameOver = true;
  const winnerName = symbol === "⭕" ? playerO : playerX;
 
  pattern.forEach(i => {
    boxes[i].classList.add("win-box");
    boxes[i].disabled = true;
  });
 
  if (symbol === "⭕") { winsO++; } else { winsX++; }
  updateScoreDisplay();
  playWin();
 
  setTimeout(() => {
    resultEmoji.innerText = "🏆";
    msg.innerText = `${winnerName} wins!`;
    updateMiniScore();
    spawnConfetti(30);
    resultOverlay.classList.remove("hide");
  }, 700);
}
 
function gameDraw() {
  gameOver = true;
  playDraw();
  setTimeout(() => {
    resultEmoji.innerText = "🤝";
    msg.innerText = "It's a draw!";
    updateMiniScore();
    resultOverlay.classList.remove("hide");
  }, 400);
}
 
/* ── SCOREBOARD ── */
function updateScoreDisplay() {
  nameOEl.innerText  = playerO;
  nameXEl.innerText  = playerX;
  scoreOEl.innerText = winsO;
  scoreXEl.innerText = winsX;
}
 
function updateMiniScore() {
  miniNameO.innerText  = playerO;
  miniNameX.innerText  = playerX;
  miniScoreO.innerText = winsO;
  miniScoreX.innerText = winsX;
}
 
function updateTurnIndicator() {
  const name = turnO ? playerO : playerX;
  const sym  = turnO ? "⭕" : "❌";
  turnIndicator.innerText = `${name}'s turn ${sym}`;
}
 
function updateActiveTurnCard() {
  scoreCardO.classList.toggle("active-turn", turnO);
  scoreCardX.classList.toggle("active-turn", !turnO);
}
 
/* ── BUTTONS ── */
newBtn.addEventListener("click", () => {
  roundNum++;
  startRound();
});
 
backBtn.addEventListener("click", goHome);
homeBtn.addEventListener("click", goHome);
 
function goHome() {
  resultOverlay.classList.add("hide");
  gameScreen.classList.add("hide");
  landingScreen.classList.remove("hide");
  playerXInput.disabled = false;
  playerXInput.placeholder = "e.g. Bob";
  aiToggle.checked = false;
  aiDifficulty.classList.add("hide");
  vsAI = false;
}
 
resetBtn.addEventListener("click", () => {
  winsO = winsX = 0;
  roundNum = 1;
  updateScoreDisplay();
  startRound();
});
 
/* ── AI LOGIC ── */
function getAIMove() {
  const available = [...boxes].filter(b => !b.innerText);
  if (!available.length) return null;
 
  if (difficulty === "easy") {
    return available[Math.floor(Math.random() * available.length)];
  }
 
  if (difficulty === "medium") {
    // 60% minimax, 40% random
    return Math.random() < 0.6 ? minimaxBox() : available[Math.floor(Math.random() * available.length)];
  }
 
  // Hard: always minimax
  return minimaxBox();
}
 
function getBoardState() {
  return [...boxes].map(b => b.innerText || null);
}
 
function minimaxBox() {
  const board = getBoardState();
  let bestScore = -Infinity;
  let bestIdx = null;
 
  board.forEach((cell, i) => {
    if (!cell) {
      board[i] = "❌";
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
  });
  return bestIdx !== null ? boxes[bestIdx] : null;
}
 
function minimax(board, depth, isMax, alpha, beta) {
  const result = evalBoard(board);
  if (result !== null) return result;
 
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "❌";
        best = Math.max(best, minimax(board, depth+1, false, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "⭕";
        best = Math.min(best, minimax(board, depth+1, true, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}
 
function evalBoard(board) {
  for (let [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a] === "❌" ? 10 : -10;
    }
  }
  if (board.every(c => c)) return 0;
  return null;
}
 
/* ── CONFETTI ── */
function spawnConfetti(n) {
  const container = document.querySelector("#confetti-container");
  container.innerHTML = "";
  const colors = ["#667eea","#f093fb","#f5576c","#fda085","#4facfe","#43e97b","#fa709a"];
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left: ${Math.random()*100}vw;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration: ${1.5 + Math.random()*2}s;
      animation-delay: ${Math.random()*0.8}s;
      transform: rotate(${Math.random()*360}deg);
    `;
    container.appendChild(el);
  }
}
 
