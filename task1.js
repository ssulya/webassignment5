// Task 1 · Option A · Higher or Lower
(() => {
// ---- constants (all numbers of the game) ----
const MAX_LIVES = 3;
const WIN_STREAK = 8;
const ITEMS = [
  { name: 'Wireless mouse', price: 25 },   { name: 'Mechanical keyboard', price: 90 },
  { name: 'Smartphone', price: 650 },      { name: 'Laptop', price: 1200 },
  { name: 'Headphones', price: 180 },      { name: 'Smart watch', price: 300 },
  { name: 'Tablet', price: 450 },          { name: 'Game console', price: 500 },
  { name: 'Webcam', price: 60 },           { name: '4K monitor', price: 400 },
  { name: 'USB flash drive', price: 12 },  { name: 'Power bank', price: 35 },
  { name: 'Bluetooth speaker', price: 75 },{ name: 'External SSD', price: 110 },
];

const $ = (id) => document.getElementById(id);
let lives, streak, current, next, gameOver;
let best = 0;

// whole number from min to max, both included
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickItem(exclude) {
  let item;
  do { item = ITEMS[randInt(0, ITEMS.length - 1)]; } while (item === exclude);
  return item;
}
function say(text, type) {
  const el = $('gameMsg');
  el.textContent = text;
  el.className = 'msg ' + type;           // ok | error | win | loss
}
function render() {
  $('lives').textContent = '❤'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
  $('streak').textContent = streak;
  $('best').textContent = best;
  $('curName').textContent = current.name;
  $('curPrice').textContent = '$' + current.price;
  $('nextName').textContent = next.name;
  $('nextPrice').textContent = '?';
  for (const b of document.querySelectorAll('[data-guess]')) b.disabled = gameOver;
}
function startGame() {
  lives = MAX_LIVES; streak = 0; gameOver = false;
  current = pickItem(null);
  next = pickItem(current);
  render();
  say('Is the next price higher or lower?', 'ok');
}
function guess(direction) {
  if (gameOver) { say('The game is over. Press Restart.', 'error'); return; }          // rejected
  if (direction !== 'higher' && direction !== 'lower') { say('Unknown move.', 'error'); return; }
  const right = (direction === 'higher' && next.price >= current.price) ||
                (direction === 'lower' && next.price <= current.price);               // equal = right
  const reveal = `${next.name} costs $${next.price} (${current.name}: $${current.price}). `;
  if (right) {
    streak++;
    if (streak > best) best = streak;
    if (streak === WIN_STREAK) {
      gameOver = true;
      render(); $('nextPrice').textContent = '$' + next.price;
      say(reveal + `You win with a streak of ${streak}!`, 'win');
      return;
    }
    say(reveal + 'Right!', 'ok');
  } else {
    lives--;
    streak = 0;
    if (lives === 0) {
      gameOver = true;
      render(); $('nextPrice').textContent = '$' + next.price;
      say(reveal + `Wrong. Game over. Best streak: ${best}.`, 'loss');
      return;
    }
    say(reveal + `Wrong! Lives left: ${lives}.`, 'error');
  }
  current = next;
  next = pickItem(current);
  render();
}

$('gameButtons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.id === 'restart') startGame();
  else guess(btn.dataset.guess);
});
startGame();
})();
