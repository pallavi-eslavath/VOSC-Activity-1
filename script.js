// Tic-Tac-Toe

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const boardEl = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const levelsEl = document.getElementById("levels");
const modeButtons = document.querySelectorAll("[data-mode]");
const levelButtons = document.querySelectorAll("[data-level]");
const cards = { X: document.getElementById("card-x"), O: document.getElementById("card-o") };
const labels = { X: document.getElementById("label-x"), O: document.getElementById("label-o") };
const scoreEls = {
  X: document.getElementById("score-x"),
  O: document.getElementById("score-o"),
  D: document.getElementById("score-d")
};

let scores = { X: 0, O: 0, D: 0 };
let mode = "pvp";
let level = "easy";
let board = Array(9).fill("");
let current = "X";
let starter = "X";
let gameOver = false;
let locked = false;

function save() {
  try { localStorage.setItem("ttt", JSON.stringify({ scores, mode, level })); } catch (e) {}
}
function load() {
  try {
    const data = JSON.parse(localStorage.getItem("ttt"));
    if (data) { scores = data.scores; mode = data.mode; level = data.level; }
  } catch (e) {}
}

function updateScreen() {
  modeButtons.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  levelButtons.forEach(b => b.classList.toggle("active", b.dataset.level === level));
  levelsEl.hidden = mode !== "cpu";
  labels.X.textContent = mode === "cpu" ? "You" : "Player X";
  labels.O.textContent = mode === "cpu" ? "Computer" : "Player O";
  scoreEls.X.textContent = scores.X;
  scoreEls.O.textContent = scores.O;
  scoreEls.D.textContent = scores.D;
}

function showTurn() {
  const name = current === "X"
    ? (mode === "cpu" ? "Your" : "Player X's")
    : (mode === "cpu" ? "Computer's" : "Player O's");
  statusText.textContent = `${name} turn`;
  boardEl.className = `board turn-${current.toLowerCase()}`;
  cards.X.classList.toggle("active", current === "X");
  cards.O.classList.toggle("active", current === "O");
}

function place(index) {
  board[index] = current;
  const cell = cells[index];
  cell.textContent = current;
  cell.classList.add(current.toLowerCase(), "pop");
  cell.disabled = true;

  const winLine = findWinner(board);
  if (winLine) {
    const who = mode === "cpu" ? (current === "X" ? "You win! 🎉" : "Computer wins!") : `Player ${current} wins! 🎉`;
    endGame(who, current, winLine);
  } else if (board.every(v => v !== "")) {
    endGame("It's a draw!", "D");
  } else {
    current = current === "X" ? "O" : "X";
    showTurn();
    if (mode === "cpu" && current === "O") computerTurn();
  }
}

function handleClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (gameOver || locked || board[index] !== "") return;
  place(index);
}

function computerTurn() {
  locked = true;
  setTimeout(() => {
    place(level === "hard" ? bestMove() : randomMove());
    locked = false;
  }, 500);
}

function findWinner(b) {
  return WIN_LINES.find(([x, y, z]) => b[x] !== "" && b[x] === b[y] && b[x] === b[z]);
}

function endGame(message, result, winLine) {
  gameOver = true;
  statusText.textContent = message;
  boardEl.className = "board over";
  cards.X.classList.remove("active");
  cards.O.classList.remove("active");
  scores[result]++;
  updateScreen();
  save();
  if (winLine) winLine.forEach(i => cells[i].classList.add("win"));
  cells.forEach(c => (c.disabled = true));
}

function newRound(flipStarter = true) {
  if (flipStarter) starter = starter === "X" ? "O" : "X";
  board = Array(9).fill("");
  current = starter;
  gameOver = false;
  locked = false;
  cells.forEach(c => { c.textContent = ""; c.disabled = false; c.className = "cell"; });
  showTurn();
  if (mode === "cpu" && current === "O") computerTurn();
}

function freshStart() {
  starter = "X";
  newRound(false);
}

function emptySquares(b) {
  return b.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
}

function randomMove() {
  const free = emptySquares(board);
  return free[Math.floor(Math.random() * free.length)];
}

function minimax(b, player, depth) {
  const line = findWinner(b);
  if (line) return b[line[0]] === "O" ? 10 - depth : depth - 10;
  const free = emptySquares(b);
  if (free.length === 0) return 0;

  const scoresList = free.map(i => {
    b[i] = player;
    const s = minimax(b, player === "O" ? "X" : "O", depth + 1);
    b[i] = "";
    return s;
  });
  return player === "O" ? Math.max(...scoresList) : Math.min(...scoresList);
}

function bestMove() {
  let best = -Infinity, move = null;
  emptySquares(board).forEach(i => {
    board[i] = "O";
    const s = minimax(board, "X", 1);
    board[i] = "";
    if (s > best) { best = s; move = i; }
  });
  return move;
}

cells.forEach(c => c.addEventListener("click", handleClick));
document.getElementById("restart").addEventListener("click", () => newRound(true));

document.getElementById("reset-scores").addEventListener("click", () => {
  scores = { X: 0, O: 0, D: 0 };
  updateScreen(); save(); freshStart();
});

modeButtons.forEach(b => b.addEventListener("click", () => {
  mode = b.dataset.mode;
  scores = { X: 0, O: 0, D: 0 };
  updateScreen(); save(); freshStart();
}));

levelButtons.forEach(b => b.addEventListener("click", () => {
  level = b.dataset.level;
  scores = { X: 0, O: 0, D: 0 };
  updateScreen(); save(); freshStart();
}));

load();
updateScreen();
freshStart();
