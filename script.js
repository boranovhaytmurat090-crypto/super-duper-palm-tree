// EduPlay Core Application JavaScript

// 1. Core State Management
const STATE_KEY = "eduplay_user_state";
let appState = {
  completedGames: [],
  totalScore: 0,
  badges: []
};

let activeGame = null;
let soundEnabled = true;
let activeGameSession = {
  score: 0,
  isFinished: false,
  customData: {} // Holder for active game states (e.g. matching items, millionaire current question)
};

// Web Audio Synth Controller
class GameAudioSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    this.init();
    
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.error("Audio error:", e);
      }
    }, delay * 1000);
  }

  click() {
    this.playTone(800, "sine", 0.08);
  }

  success() {
    this.playTone(523.25, "triangle", 0.15, 0); // C5
    this.playTone(659.25, "triangle", 0.15, 0.08); // E5
    this.playTone(783.99, "triangle", 0.25, 0.16); // G5
  }

  fail() {
    this.playTone(220, "sawtooth", 0.3); // A3
    this.playTone(180, "sawtooth", 0.4, 0.1);
  }

  victory() {
    const tempo = 0.12;
    this.playTone(523.25, "sine", 0.15, 0); // C5
    this.playTone(523.25, "sine", 0.15, tempo);
    this.playTone(523.25, "sine", 0.15, tempo * 2);
    this.playTone(523.25, "sine", 0.3, tempo * 3);
    this.playTone(415.30, "sine", 0.3, tempo * 5); // Ab4
    this.playTone(466.16, "sine", 0.3, tempo * 7); // Bb4
    this.playTone(523.25, "sine", 0.6, tempo * 9); // C5
  }
}

const synth = new GameAudioSynth();

// 2. Confetti Particle System
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let confettiActive = false;
let confettiParticles = [];
const colors = ["#8a2be2", "#00f0ff", "#10b981", "#ffd700", "#ff5722"];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.r = Math.random() * 6 + 4;
    this.d = Math.random() * canvas.height;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.tilt = Math.random() * 10 - 5;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.02;
    this.tiltAngle = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = this.r;
    ctx.strokeStyle = this.color;
    ctx.moveTo(this.x + this.tilt + this.r / 2, this.y);
    ctx.lineTo(this.x + this.r, this.y + this.tilt + this.r / 2);
    ctx.stroke();
  }

  update() {
    this.tiltAngle += this.tiltAngleIncremental;
    this.y += (Math.cos(this.d) + 3 + this.r / 2) / 2;
    this.x += Math.sin(this.tiltAngle);
    this.tilt = Math.sin(this.tiltAngle - this.r / 2) * 5;
    return this.y < canvas.height;
  }
}

function startConfetti() {
  canvas.style.display = "block";
  confettiActive = true;
  resizeCanvas();
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
  requestAnimationFrame(confettiLoop);
  setTimeout(stopConfetti, 4000);
}

function stopConfetti() {
  confettiActive = false;
  setTimeout(() => {
    canvas.style.display = "none";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 1000);
}

function confettiLoop() {
  if (!confettiActive && confettiParticles.length === 0) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles = confettiParticles.filter(p => p.update());
  confettiParticles.forEach(p => p.draw());
  
  if (confettiActive && confettiParticles.length < 150) {
    confettiParticles.push(new ConfettiParticle());
  }
  requestAnimationFrame(confettiLoop);
}

// 3. Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let emoji = "ℹ️";
  if (type === "success") emoji = "✅";
  if (type === "error") emoji = "❌";
  
  toast.innerHTML = `<span>${emoji}</span> <p>${message}</p>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 4. State Management Actions
function loadState() {
  const stored = localStorage.getItem(STATE_KEY);
  if (stored) {
    try {
      appState = JSON.parse(stored);
    } catch (e) {
      console.error("State loading failed, resetting:", e);
    }
  }
  syncDashboard();
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(appState));
  syncDashboard();
}

function syncDashboard() {
  // Update Completed count
  document.querySelector("#stat-completed .stat-val").textContent = `${appState.completedGames.length} / 10`;
  // Update Total Score
  document.getElementById("total-score-display").textContent = appState.totalScore;
  // Update Badge Display
  const badgesCount = Math.floor(appState.completedGames.length / 2) + (appState.totalScore > 500 ? 1 : 0);
  document.getElementById("badges-count-display").textContent = badgesCount;

  // Badges lists
  const container = document.getElementById("badges-container");
  container.innerHTML = "";
  
  const badgesList = [
    { name: "Sartarosh", desc: "1-o'yin g'olibi", req: 1 },
    { name: "Yosh Dasturchi", desc: "3 ta o'yin tugallandi", req: 3 },
    { name: "Texnik Master", desc: "6 ta o'yin tugallandi", req: 6 },
    { name: "Kiber Chempion", desc: "Barcha 10 ta o'yin yutildi", req: 10 },
    { name: "Oltin Kalla", desc: "Jami 800+ ball", req: 800, scoreBased: true }
  ];

  badgesList.forEach(b => {
    const earned = b.scoreBased ? appState.totalScore >= b.req : appState.completedGames.length >= b.req;
    const badgeEl = document.createElement("div");
    badgeEl.className = `badge ${earned ? 'active' : ''}`;
    badgeEl.title = b.desc;
    badgeEl.innerHTML = `<span>${earned ? '🥇' : '🔒'}</span> ${b.name}`;
    container.appendChild(badgeEl);
  });

  // Render Game Grid
  renderGamesList();
}

function renderGamesList() {
  const grid = document.getElementById("games-list-grid");
  grid.innerHTML = "";
  
  gamesData.forEach((g, idx) => {
    const isCompleted = appState.completedGames.includes(g.id);
    const card = document.createElement("article");
    card.className = `game-card ${isCompleted ? 'completed' : ''}`;
    card.id = `game-card-${g.id}`;
    
    card.innerHTML = `
      <div class="card-top">
        <span class="card-index">${String(idx + 1).padStart(2, '0')}</span>
        <span class="difficulty-badge ${g.difficulty.toLowerCase() === 'oson' ? 'oson' : 'ortacha'}">${g.difficulty}</span>
      </div>
      <div class="card-middle">
        <span class="card-subtitle">${g.subtitle}</span>
        <h3>${g.title}</h3>
        <p class="card-desc">${g.description}</p>
      </div>
      <div class="card-bottom">
        <div class="card-points">🪙 +${g.points} ball</div>
        <button class="card-btn" onclick="openGame(${g.id})">
          ${isCompleted ? '🔄 Qayta o\'ynash' : '🕹️ O\'ynash'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 5. Game Overlay Controls
function openGame(gameId) {
  synth.click();
  const game = gamesData.find(g => g.id === gameId);
  if (!game) return;

  activeGame = game;
  activeGameSession = {
    score: game.points,
    isFinished: false,
    customData: {}
  };

  // Setup Overlay Elements
  document.getElementById("game-number-badge").textContent = String(game.id).padStart(2, '0');
  document.getElementById("active-game-title").textContent = game.title;
  document.getElementById("active-game-subtitle").textContent = game.subtitle;
  document.getElementById("active-game-reward").textContent = game.points;
  document.getElementById("active-game-desc").textContent = game.description;

  // Render Game Template
  const playArea = document.getElementById("game-play-area");
  playArea.innerHTML = "";
  
  // Dynamic Game Renders dispatcher
  gameRenderers[game.type](playArea, game.data);

  // Setup Buttons
  document.getElementById("check-answer-btn").style.display = "block";
  document.getElementById("next-game-btn").style.display = "none";
  document.getElementById("check-answer-btn").disabled = false;
  document.getElementById("game-instructions-panel").style.display = "block";

  // Open Overlay Modal
  const overlay = document.getElementById("game-zone-overlay");
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeActiveGame() {
  synth.click();
  const overlay = document.getElementById("game-zone-overlay");
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
  activeGame = null;
}

// Help Panel toggle
document.getElementById("help-btn").addEventListener("click", () => {
  synth.click();
  const panel = document.getElementById("game-instructions-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
});

// Close button listener
document.getElementById("close-game-btn").addEventListener("click", closeActiveGame);

// Check Answer Handler
document.getElementById("check-answer-btn").addEventListener("click", () => {
  if (!activeGame) return;
  synth.click();
  
  // Call game specific checker
  const isCorrect = gameCheckers[activeGame.type](activeGame.data);
  
  if (isCorrect) {
    synth.success();
    showToast("Ajoyib! Hamma javoblar to'g'ri!", "success");
    
    // Switch game buttons
    document.getElementById("check-answer-btn").style.display = "none";
    document.getElementById("next-game-btn").style.display = "block";
    activeGameSession.isFinished = true;
  } else {
    synth.fail();
    showToast("Kechirasiz, xatoliklar mavjud. Tekshirib qaytadan urinib ko'ring.", "error");
  }
});

// Finish Game Button Handler
document.getElementById("next-game-btn").addEventListener("click", () => {
  if (!activeGame || !activeGameSession.isFinished) return;
  
  // Play Fanfare
  synth.victory();
  startConfetti();
  
  // Save Progress
  if (!appState.completedGames.includes(activeGame.id)) {
    appState.completedGames.push(activeGame.id);
    appState.totalScore += activeGameSession.score;
    saveState();
  }
  
  showToast(`Tugallandi! Siz +${activeGameSession.score} ballni qo'lga kiritdingiz!`, "success");
  closeActiveGame();
});

// 6. Interactive Game Templates & Logic

const gameRenderers = {
  // Game 1: Matching
  matching: function(container, data) {
    const board = document.createElement("div");
    board.className = "matching-board";
    
    // Shuffle columns
    const lefts = [...data.pairs].sort(() => Math.random() - 0.5);
    const rights = [...data.pairs].sort(() => Math.random() - 0.5);
    
    const leftCol = document.createElement("div");
    leftCol.className = "matching-col";
    leftCol.id = "match-left-col";
    
    lefts.forEach(p => {
      const card = document.createElement("div");
      card.className = "matching-card";
      card.dataset.id = p.id;
      card.dataset.side = "left";
      card.textContent = p.left;
      card.addEventListener("click", () => handleMatchingClick(card));
      leftCol.appendChild(card);
    });

    const rightCol = document.createElement("div");
    rightCol.className = "matching-col";
    rightCol.id = "match-right-col";
    
    rights.forEach(p => {
      const card = document.createElement("div");
      card.className = "matching-card";
      card.dataset.id = p.id;
      card.dataset.side = "right";
      card.textContent = p.right;
      card.addEventListener("click", () => handleMatchingClick(card));
      rightCol.appendChild(card);
    });

    board.appendChild(leftCol);
    board.appendChild(rightCol);
    container.appendChild(board);

    activeGameSession.customData = {
      selectedLeft: null,
      selectedRight: null,
      matchedIds: []
    };
  },

  // Game 2: Sorting / Groups
  sorting: function(container, data) {
    const board = document.createElement("div");
    board.className = "sorting-board";
    
    // Cards Deck
    const deck = document.createElement("div");
    deck.className = "sorting-deck";
    deck.id = "sorting-deck";
    
    // Baskets
    const basketsDiv = document.createElement("div");
    basketsDiv.className = "sorting-baskets";
    
    data.categories.forEach((cat, idx) => {
      const basket = document.createElement("div");
      basket.className = "sorting-basket";
      basket.dataset.id = cat.id;
      basket.innerHTML = `
        <h4>${cat.name}</h4>
        <div class="basket-contents" id="basket-content-${cat.id}"></div>
      `;
      
      // Setup HTML5 Drag events
      basket.addEventListener("dragover", (e) => e.preventDefault());
      basket.addEventListener("dragenter", () => basket.classList.add("drag-over"));
      basket.addEventListener("dragleave", () => basket.classList.remove("drag-over"));
      basket.addEventListener("drop", (e) => {
        e.preventDefault();
        basket.classList.remove("drag-over");
        const itemId = e.dataTransfer.getData("text/plain");
        moveSortItem(itemId, cat.id);
      });

      basketsDiv.appendChild(basket);
    });

    // Populate Deck items (shuffled)
    const shuffledItems = [...data.items].sort(() => Math.random() - 0.5);
    shuffledItems.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "sort-item";
      itemEl.id = `sort-item-${item.id}`;
      itemEl.textContent = item.name;
      itemEl.draggable = true;
      itemEl.title = item.desc;
      
      itemEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", item.id);
        itemEl.classList.add("selected");
      });
      itemEl.addEventListener("dragend", () => {
        itemEl.classList.remove("selected");
      });
      
      // Mobile click-to-assign fallback
      itemEl.addEventListener("click", () => {
        synth.click();
        document.querySelectorAll(".sort-item").forEach(x => x.classList.remove("selected"));
        itemEl.classList.add("selected");
        activeGameSession.customData.selectedItemId = item.id;
      });

      deck.appendChild(itemEl);
    });

    // Add Mobile navigation helper
    const mobileHelper = document.createElement("div");
    mobileHelper.className = "mobile-sorting-actions";
    data.categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "secondary-btn";
      btn.textContent = `📂 ${cat.name.split(" ")[0]}ga qo'shish`;
      btn.addEventListener("click", () => {
        const selId = activeGameSession.customData.selectedItemId;
        if (selId) {
          moveSortItem(selId, cat.id);
          document.querySelectorAll(".sort-item").forEach(x => x.classList.remove("selected"));
          activeGameSession.customData.selectedItemId = null;
        } else {
          showToast("Avval yuqoridagi dasturlardan birini tanlang!", "info");
        }
      });
      mobileHelper.appendChild(btn);
    });

    board.appendChild(deck);
    board.appendChild(mobileHelper);
    board.appendChild(basketsDiv);
    container.appendChild(board);

    activeGameSession.customData = {
      assignments: {}, // item_id -> category_id
      selectedItemId: null
    };
  },

  // Game 3: Millionaire Quiz
  quiz: function(container, data) {
    const board = document.createElement("div");
    board.className = "quiz-board";
    
    const mainSection = document.createElement("div");
    mainSection.className = "quiz-main-section";
    
    // Question card
    const qCard = document.createElement("div");
    qCard.className = "quiz-question-card";
    qCard.id = "quiz-q-card";
    
    // Options grid
    const optGrid = document.createElement("div");
    optGrid.className = "quiz-options-grid";
    optGrid.id = "quiz-options-grid";
    
    mainSection.appendChild(qCard);
    mainSection.appendChild(optGrid);

    // Sidebar: Lifelines & Ladder
    const aside = document.createElement("aside");
    aside.className = "quiz-aside";
    
    const lifelines = document.createElement("div");
    lifelines.className = "lifelines-row";
    
    const l50 = document.createElement("button");
    l50.className = "lifeline-btn";
    l50.id = "lifeline-5050";
    l50.textContent = "50:50";
    l50.title = "Ikkita noto'g'ri javobni o'chirish";
    l50.addEventListener("click", () => useLifeline5050());

    const lAngel = document.createElement("button");
    lAngel.className = "lifeline-btn";
    lAngel.id = "lifeline-angel";
    lAngel.textContent = "🛡️";
    lAngel.title = "Farishta: To'g'ri javob sababini ko'rish";
    lAngel.addEventListener("click", () => useLifelineAngel());

    lifelines.appendChild(l50);
    lifelines.appendChild(lAngel);

    const ladder = document.createElement("div");
    ladder.className = "money-ladder";
    
    data.questions.forEach((_, idx) => {
      const step = document.createElement("div");
      step.className = `ladder-step ${idx === 0 ? 'active' : ''}`;
      step.id = `quiz-step-${idx}`;
      step.innerHTML = `<span>Qadam ${idx + 1}</span> <span>🪙 ${(idx + 1) * 30} ball</span>`;
      ladder.appendChild(step);
    });

    aside.appendChild(lifelines);
    aside.appendChild(ladder);

    board.appendChild(mainSection);
    board.appendChild(aside);
    container.appendChild(board);

    activeGameSession.customData = {
      qIndex: 0,
      selectedAnswer: null,
      used5050: false,
      usedAngel: false
    };

    loadQuizQuestion(0, data.questions);
    // Disable check btn since checking is handled interactively step-by-step
    document.getElementById("check-answer-btn").style.display = "none";
  },

  // Game 4: True or False
  true_false: function(container, data) {
    const board = document.createElement("div");
    board.className = "tf-board";
    
    const card = document.createElement("div");
    card.className = "tf-card";
    card.id = "tf-card-view";
    
    const actions = document.createElement("div");
    actions.className = "tf-actions";
    
    const btnTrue = document.createElement("button");
    btnTrue.className = "tf-btn btn-true";
    btnTrue.textContent = "✅ TO'G'RI (TRUE)";
    btnTrue.addEventListener("click", () => answerTF(true, data.statements));

    const btnFalse = document.createElement("button");
    btnFalse.className = "tf-btn btn-false";
    btnFalse.textContent = "❌ NOTO'G'RI (FALSE)";
    btnFalse.addEventListener("click", () => answerTF(false, data.statements));

    actions.appendChild(btnTrue);
    actions.appendChild(btnFalse);

    const progress = document.createElement("div");
    progress.className = "tf-progress";
    progress.id = "tf-progress-view";

    board.appendChild(progress);
    board.appendChild(card);
    board.appendChild(actions);
    container.appendChild(board);

    activeGameSession.customData = {
      sIndex: 0,
      correctCount: 0,
      statements: data.statements
    };

    loadTFStatement(0, data.statements);
    document.getElementById("check-answer-btn").style.display = "none";
  },

  // Game 5: Ordering Steps
  ordering: function(container, data) {
    const board = document.createElement("div");
    board.className = "ordering-board";
    board.id = "ordering-list-container";
    
    // Copy and shuffle array
    const items = [...data.items].sort(() => Math.random() - 0.5);
    
    activeGameSession.customData.items = items;
    renderOrderingList(board, items);
  },

  // Game 6: Crossword puzzle
  crossword: function(container, data) {
    const board = document.createElement("div");
    board.className = "crossword-board";
    
    // Grid Container
    const gridCont = document.createElement("div");
    gridCont.className = "crossword-grid-container";
    
    const grid = document.createElement("div");
    grid.className = "crossword-grid";
    grid.style.gridTemplateColumns = `repeat(${data.size}, 44px)`;
    grid.style.gridTemplateRows = `repeat(${data.size}, 44px)`;
    
    // Initialize empty grid representation
    const gridMatrix = Array(data.size).fill(null).map(() => Array(data.size).fill(null));
    
    // Map words on the matrix
    data.words.forEach((w, wordIdx) => {
      let curX = w.x - 1;
      let curY = w.y - 1;
      
      for (let i = 0; i < w.word.length; i++) {
        if (!gridMatrix[curY][curX]) {
          gridMatrix[curY][curX] = {
            char: w.word[i],
            number: i === 0 ? wordIdx + 1 : null,
            words: []
          };
        } else if (i === 0) {
          gridMatrix[curY][curX].number = wordIdx + 1;
        }
        gridMatrix[curY][curX].words.push(wordIdx);
        
        if (w.dir === "H") curX++;
        if (w.dir === "V") curY++;
      }
    });

    // Render cells
    for (let r = 0; r < data.size; r++) {
      for (let c = 0; c < data.size; c++) {
        const cell = document.createElement("div");
        const cellData = gridMatrix[r][c];
        
        if (!cellData) {
          cell.className = "cw-cell empty";
        } else {
          cell.className = "cw-cell active-input";
          cell.dataset.r = r;
          cell.dataset.c = c;
          
          if (cellData.number) {
            const num = document.createElement("span");
            num.className = "cell-number";
            num.textContent = cellData.number;
            cell.appendChild(num);
          }
          
          const input = document.createElement("input");
          input.maxLength = 1;
          input.dataset.target = cellData.char;
          
          // Auto tab-focus on keypress
          input.addEventListener("input", (e) => {
            if (e.target.value.length === 1) {
              focusNextCell(r, c, gridMatrix);
            }
          });
          
          cell.appendChild(input);
        }
        grid.appendChild(cell);
      }
    }
    gridCont.appendChild(grid);

    // Clues column
    const clues = document.createElement("div");
    clues.className = "crossword-clues";
    
    const hClues = document.createElement("div");
    hClues.className = "clues-section";
    hClues.innerHTML = "<h4>✍️ Yotiqchasiga (Horizontal):</h4><ul class='clues-list' id='cw-clues-h'></ul>";
    
    const vClues = document.createElement("div");
    vClues.className = "clues-section";
    vClues.innerHTML = "<h4>✍️ Tikiga (Vertical):</h4><ul class='clues-list' id='cw-clues-v'></ul>";
    
    clues.appendChild(hClues);
    clues.appendChild(vClues);

    board.appendChild(gridCont);
    board.appendChild(clues);
    container.appendChild(board);

    // Populate Clues
    data.words.forEach((w, idx) => {
      const li = document.createElement("li");
      li.textContent = `${idx + 1}. ${w.clue}`;
      if (w.dir === "H") {
        clues.querySelector("#cw-clues-h").appendChild(li);
      } else {
        clues.querySelector("#cw-clues-v").appendChild(li);
      }
    });
  },

  // Game 7: Fill in the Blanks
  blanks: function(container, data) {
    const board = document.createElement("div");
    board.className = "blanks-board";
    
    const para = document.createElement("div");
    para.className = "blanks-paragraph";
    
    // Parse text and replace {1}, {2} etc with dropzones
    let parsedText = data.text;
    Object.keys(data.blanks).forEach(key => {
      const zoneId = `zone-${key}`;
      parsedText = parsedText.replace(
        `{${key}}`,
        `<span class="blank-dropzone" id="${zoneId}" data-key="${key}">${data.blanks[key].placeholder}</span>`
      );
    });
    
    para.innerHTML = parsedText;
    board.appendChild(para);

    // Render draggable choice list
    const deck = document.createElement("div");
    deck.className = "blanks-choices";
    deck.id = "blanks-choices-deck";
    
    const shuffledChoices = [...data.choices].sort(() => Math.random() - 0.5);
    shuffledChoices.forEach((choice, idx) => {
      const card = document.createElement("div");
      card.className = "blank-choice-card";
      card.id = `blank-choice-${idx}`;
      card.textContent = choice;
      
      // Simple click to assign logic for high compatibility
      card.addEventListener("click", () => {
        synth.click();
        document.querySelectorAll(".blank-choice-card").forEach(x => x.classList.remove("selected"));
        card.classList.add("selected");
        activeGameSession.customData.selectedChoiceText = choice;
        activeGameSession.customData.selectedChoiceEl = card;
      });

      deck.appendChild(card);
    });

    board.appendChild(deck);
    container.appendChild(board);

    // Add click listeners to dropzones
    setTimeout(() => {
      document.querySelectorAll(".blank-dropzone").forEach(zone => {
        zone.addEventListener("click", () => {
          synth.click();
          const selText = activeGameSession.customData.selectedChoiceText;
          const selEl = activeGameSession.customData.selectedChoiceEl;
          
          if (selText && selEl) {
            // Drop word in
            zone.textContent = selText;
            zone.classList.add("filled");
            zone.dataset.value = selText;
            
            // Mark option as used
            selEl.classList.remove("selected");
            selEl.classList.add("used");
            activeGameSession.customData.selectedChoiceText = null;
            activeGameSession.customData.selectedChoiceEl = null;
          } else if (zone.classList.contains("filled")) {
            // Click to remove word from dropzone
            const val = zone.dataset.value;
            zone.textContent = data.blanks[zone.dataset.key].placeholder;
            zone.classList.remove("filled");
            zone.dataset.value = "";
            
            // Restore option card
            const usedEl = Array.from(document.querySelectorAll(".blank-choice-card.used"))
              .find(el => el.textContent === val);
            if (usedEl) usedEl.classList.remove("used");
          }
        });
      });
    }, 50);

    activeGameSession.customData = {
      selectedChoiceText: null,
      selectedChoiceEl: null
    };
  },

  // Game 8: Labeling Map Elements
  labeling: function(container, data) {
    const board = document.createElement("div");
    board.className = "labeling-board";
    
    // SVG Canvas
    const svgCont = document.createElement("div");
    svgCont.className = "network-svg-container";
    
    // Draw beautiful responsive SVG showing a network map
    svgCont.innerHTML = `
      <svg viewBox="0 0 500 400" width="450" height="350">
        <!-- Connection Lines -->
        <!-- Router to Switch -->
        <line x1="250" y1="80" x2="250" y2="200" stroke="#8a2be2" stroke-width="4" stroke-dasharray="8,4" />
        <!-- Switch to Server -->
        <line x1="250" y1="200" x2="100" y2="300" stroke="#8a2be2" stroke-width="3" />
        <!-- Switch to PC -->
        <line x1="250" y1="200" x2="250" y2="310" stroke="#8a2be2" stroke-width="3" />
        <!-- Switch to Printer -->
        <line x1="250" y1="200" x2="400" y2="300" stroke="#8a2be2" stroke-width="3" />

        <!-- Nodes representation (custom graphic details) -->
        <!-- Router details -->
        <rect x="220" y="30" width="60" height="30" rx="6" fill="#1e293b" stroke="#00f0ff" stroke-width="2"/>
        <text x="250" y="48" fill="#00f0ff" font-size="10" font-weight="bold" text-anchor="middle">ROUTER</text>

        <!-- Switch details -->
        <rect x="210" y="180" width="80" height="24" rx="4" fill="#1e293b" stroke="#8a2be2" stroke-width="2"/>
        <line x1="220" y1="192" x2="280" y2="192" stroke="#00f0ff" stroke-width="2" stroke-dasharray="2,2"/>

        <!-- Server details -->
        <rect x="70" y="270" width="60" height="70" rx="8" fill="#1e293b" stroke="#8a2be2" stroke-width="2"/>
        <rect x="80" y="280" width="10" height="10" fill="#00f0ff"/>
        <rect x="80" y="295" width="40" height="4" fill="#64748b"/>
        <rect x="80" y="305" width="40" height="4" fill="#64748b"/>

        <!-- PC details -->
        <rect x="225" y="290" width="50" height="35" rx="4" fill="#1e293b" stroke="#8a2be2" stroke-width="2"/>
        <line x1="240" y1="325" x2="260" y2="325" stroke="#8a2be2" stroke-width="4"/>
        <line x1="235" y1="335" x2="265" y2="335" stroke="#8a2be2" stroke-width="3"/>

        <!-- Printer details -->
        <rect x="370" y="285" width="60" height="40" rx="6" fill="#1e293b" stroke="#8a2be2" stroke-width="2"/>
        <rect x="385" y="278" width="30" height="10" fill="#64748b"/>
        <line x1="380" y1="315" x2="420" y2="315" stroke="#00f0ff" stroke-width="3"/>

        <!-- INTERACTIVE GLOWING TARGET HOTSPOTS -->
        ${data.nodes.map(n => `
          <g class="map-node-pulse" id="hotspot-group-${n.id}" onclick="selectHotspot('${n.id}')">
            <circle cx="${n.x * 5}" cy="${n.y * 4}" r="14" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" stroke-width="2" />
            <text x="${n.x * 5}" y="${n.y * 4 + 4}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">?</text>
          </g>
        `).join('')}
      </svg>
    `;

    // Dropdown selection list
    const selectorsDiv = document.createElement("div");
    selectorsDiv.className = "labeling-selectors";
    selectorsDiv.id = "labeling-selectors-pane";
    selectorsDiv.innerHTML = "<h4>🔍 Qurilmalarni aniqlash:</h4>";
    
    data.nodes.forEach(n => {
      const row = document.createElement("div");
      row.className = "selection-row";
      row.id = `selection-row-${n.id}`;
      
      const label = document.createElement("label");
      label.textContent = `Tugma (${n.x}%, ${n.y}%):`;
      
      const select = document.createElement("select");
      select.id = `select-${n.id}`;
      select.innerHTML = `
        <option value="">-- Qurilmani tanlang --</option>
        ${n.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
      `;
      
      select.addEventListener("change", (e) => {
        synth.click();
        const val = e.target.value;
        const group = document.getElementById(`hotspot-group-${n.id}`);
        const circle = group.querySelector("circle");
        const txt = group.querySelector("text");
        
        if (val) {
          circle.setAttribute("fill", "rgba(138, 43, 226, 0.45)");
          circle.setAttribute("stroke", "#8a2be2");
          txt.textContent = "✓";
        } else {
          circle.setAttribute("fill", "rgba(0, 240, 255, 0.25)");
          circle.setAttribute("stroke", "#00f0ff");
          txt.textContent = "?";
        }
      });

      row.appendChild(label);
      row.appendChild(select);
      selectorsDiv.appendChild(row);
    });

    board.appendChild(svgCont);
    board.appendChild(selectorsDiv);
    container.appendChild(board);
  },

  // Game 9: Code Bug / Tracing
  code_bug: function(container, data) {
    const board = document.createElement("div");
    board.className = "code-board";
    
    // CSS Code Editor Mock
    const windowMock = document.createElement("div");
    windowMock.className = "code-window";
    
    const wHeader = document.createElement("div");
    wHeader.className = "code-window-header";
    wHeader.innerHTML = `
      <div class="window-dots">
        <span class="window-dot red"></span>
        <span class="window-dot yellow"></span>
        <span class="window-dot green"></span>
      </div>
      <span class="window-title">EduPlay_Compiler.py</span>
      <span>⚡ Python 3.9</span>
    `;

    // Code styling
    let styledCode = data.code
      .replace(/x\s*=\s*(\d+)/g, 'x = <span class="code-number">$1</span>')
      .replace(/(\d+)\s*marta/g, '<span class="code-number">$1</span> marta')
      .replace(/(takrorla|marta)/g, '<span class="code-keyword">$1</span>')
      .replace(/(chop_et)/g, '<span class="code-func">$1</span>')
      .replace(/#\s*(.*)/g, '<span class="code-comment"># $1</span>');

    const wBody = document.createElement("div");
    wBody.className = "code-editor-area";
    wBody.innerHTML = styledCode;

    windowMock.appendChild(wHeader);
    windowMock.appendChild(wBody);

    const question = document.createElement("div");
    question.className = "code-question-text";
    question.textContent = data.question;

    const optGrid = document.createElement("div");
    optGrid.className = "quiz-options-grid";
    
    data.options.forEach((opt, idx) => {
      const btn = document.createElement("div");
      btn.className = "quiz-option";
      btn.innerHTML = `<span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span> <span>${opt}</span>`;
      btn.addEventListener("click", () => {
        synth.click();
        document.querySelectorAll(".quiz-option").forEach(x => x.classList.remove("correct"));
        btn.classList.add("correct"); // Visual selection highlight
        activeGameSession.customData.selectedAnswer = idx;
      });
      optGrid.appendChild(btn);
    });

    board.appendChild(windowMock);
    board.appendChild(question);
    board.appendChild(optGrid);
    container.appendChild(board);

    activeGameSession.customData = {
      selectedAnswer: null
    };
  },

  // Game 10: Word Search Grid
  word_search: function(container, data) {
    const board = document.createElement("div");
    board.className = "ws-board";
    
    // Grid structure
    const gridCont = document.createElement("div");
    gridCont.className = "ws-grid-container";
    
    const grid = document.createElement("div");
    grid.className = "ws-grid";
    
    data.grid.forEach((row, rIdx) => {
      row.forEach((char, cIdx) => {
        const cell = document.createElement("div");
        cell.className = "ws-cell";
        cell.dataset.r = rIdx;
        cell.dataset.c = cIdx;
        cell.textContent = char;
        
        cell.addEventListener("click", () => handleWordSearchClick(cell, rIdx, cIdx));
        
        grid.appendChild(cell);
      });
    });
    gridCont.appendChild(grid);

    // Words panel
    const pane = document.createElement("div");
    pane.className = "ws-info-panel";
    pane.innerHTML = "<h4>🔍 Topilishi kerak bo'lgan so'zlar:</h4>";
    
    const list = document.createElement("ul");
    list.className = "ws-word-list";
    
    data.words.forEach(w => {
      const li = document.createElement("li");
      li.className = "ws-word-item";
      li.id = `ws-word-${w.name}`;
      li.innerHTML = `<span>📚 ${w.name}</span> <span class="ws-word-status">Izlanmoqda...</span>`;
      list.appendChild(li);
    });
    pane.appendChild(list);

    board.appendChild(gridCont);
    board.appendChild(pane);
    container.appendChild(board);

    activeGameSession.customData = {
      selectedCoords: [], // array of [r, c] arrays
      foundWords: []
    };
  }
};

// 7. Interactive Game Validation Mechanics
const gameCheckers = {
  // Game 1 Matching validation
  matching: function(data) {
    // Game completed if matched ids match data pairs length
    const matchedCount = activeGameSession.customData.matchedIds.length;
    return matchedCount === data.pairs.length;
  },

  // Game 2 Sorting validation
  sorting: function(data) {
    let allCorrect = true;
    const assignments = activeGameSession.customData.assignments;
    
    // Check that every item is correctly sorted
    data.items.forEach(item => {
      const assignedCat = assignments[item.id];
      const targetCat = `cat${item.category}`;
      const itemEl = document.getElementById(`sort-item-${item.id}`);
      
      if (assignedCat === targetCat) {
        if (itemEl) itemEl.style.borderColor = "var(--color-success)";
      } else {
        allCorrect = false;
        if (itemEl) {
          itemEl.style.borderColor = "var(--color-error)";
          // Return to deck if misplaced or just highlight
          itemEl.style.animation = "shake 0.4s ease";
        }
      }
    });

    const assignedCount = Object.keys(assignments).length;
    if (assignedCount < data.items.length) {
      showToast("Hamma dasturlarni guruhlarga joylashtiring!", "info");
      return false;
    }
    
    return allCorrect;
  },

  // Game 3 (Interactively validated, dynamic checker won't trigger standard checker)
  quiz: function(data) {
    return activeGameSession.isFinished;
  },

  // Game 4 (Interactively validated)
  true_false: function(data) {
    return activeGameSession.isFinished;
  },

  // Game 5: Ordering list check
  ordering: function(data) {
    const list = activeGameSession.customData.items;
    let allCorrect = true;
    
    list.forEach((item, idx) => {
      const el = document.getElementById(`ordering-card-${item.id}`);
      // The prefix integer is inside the text: e.g. "1. ..." -> index should be 0
      const correctIdx = parseInt(item.text.split(".")[0]) - 1;
      
      if (idx === correctIdx) {
        if (el) el.style.borderColor = "var(--color-success)";
      } else {
        allCorrect = false;
        if (el) el.style.borderColor = "var(--color-error)";
      }
    });

    return allCorrect;
  },

  // Game 6: Crossword Validation
  crossword: function(data) {
    let allCorrect = true;
    const cells = document.querySelectorAll(".cw-cell.active-input");
    
    cells.forEach(cell => {
      const input = cell.querySelector("input");
      const userChar = input.value.trim().toUpperCase();
      const targetChar = input.dataset.target.toUpperCase();
      
      if (userChar === targetChar) {
        cell.style.borderColor = "var(--color-success)";
      } else {
        allCorrect = false;
        cell.style.borderColor = "var(--color-error)";
        input.style.color = "var(--color-error)";
      }
    });

    return allCorrect;
  },

  // Game 7: Blanks validation
  blanks: function(data) {
    let allCorrect = true;
    const dropzones = document.querySelectorAll(".blank-dropzone");
    
    dropzones.forEach(zone => {
      const key = zone.dataset.key;
      const userVal = zone.dataset.value;
      const targetVal = data.blanks[key].answer;
      
      if (userVal === targetVal) {
        zone.style.borderColor = "var(--color-success)";
        zone.style.background = "rgba(16, 185, 129, 0.15)";
      } else {
        allCorrect = false;
        zone.style.borderColor = "var(--color-error)";
        zone.style.background = "rgba(239, 68, 68, 0.15)";
      }
    });

    // Check if all blaks filled
    let filledCount = 0;
    dropzones.forEach(z => { if (z.dataset.value) filledCount++; });
    if (filledCount < Object.keys(data.blanks).length) {
      showToast("Barcha bo'shliqlarni to'ldiring!", "info");
      return false;
    }

    return allCorrect;
  },

  // Game 8: Labeling Map validation
  labeling: function(data) {
    let allCorrect = true;
    
    data.nodes.forEach(n => {
      const select = document.getElementById(`select-${n.id}`);
      const row = document.getElementById(`selection-row-${n.id}`);
      const userVal = select.value;
      
      const group = document.getElementById(`hotspot-group-${n.id}`);
      const circle = group.querySelector("circle");
      
      if (userVal === n.name) {
        row.className = "selection-row correct";
        circle.setAttribute("fill", "rgba(16, 185, 129, 0.45)");
        circle.setAttribute("stroke", "#10b981");
        group.classList.add("correct-node");
      } else {
        allCorrect = false;
        row.className = "selection-row error";
        circle.setAttribute("fill", "rgba(239, 68, 68, 0.45)");
        circle.setAttribute("stroke", "#ef4444");
      }
    });

    return allCorrect;
  },

  // Game 9: Code Bug Tracing validation
  code_bug: function(data) {
    const selected = activeGameSession.customData.selectedAnswer;
    if (selected === null) {
      showToast("Javoblardan birini belgilang!", "info");
      return false;
    }

    const options = document.querySelectorAll(".quiz-option");
    
    if (selected === data.answer) {
      options[selected].className = "quiz-option correct";
      return true;
    } else {
      options[selected].className = "quiz-option incorrect";
      options[data.answer].className = "quiz-option correct";
      return false;
    }
  },

  // Game 10: Word Search Validation
  word_search: function(data) {
    return activeGameSession.customData.foundWords.length === data.words.length;
  }
};

// 8. Individual Helper Handlers & Utilities

// Game 1 (Matching) helper click
function handleMatchingClick(card) {
  synth.click();
  const session = activeGameSession.customData;
  const side = card.dataset.side;
  
  if (card.classList.contains("matched")) return;

  if (side === "left") {
    document.querySelectorAll("#match-left-col .matching-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    session.selectedLeft = card;
  } else {
    document.querySelectorAll("#match-right-col .matching-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    session.selectedRight = card;
  }

  // Check matching pairing
  if (session.selectedLeft && session.selectedRight) {
    const leftId = session.selectedLeft.dataset.id;
    const rightId = session.selectedRight.dataset.id;

    if (leftId === rightId) {
      // It's a match!
      synth.success();
      session.selectedLeft.classList.remove("selected");
      session.selectedLeft.classList.add("matched");
      session.selectedRight.removeEventListener("click", () => {});
      session.selectedRight.classList.remove("selected");
      session.selectedRight.classList.add("matched");
      
      session.matchedIds.push(leftId);
      
      session.selectedLeft = null;
      session.selectedRight = null;
      
      // Auto trigger win if all done
      if (session.matchedIds.length === activeGame.data.pairs.length) {
        document.getElementById("check-answer-btn").click();
      }
    } else {
      // Wrong pairing!
      synth.fail();
      const tempLeft = session.selectedLeft;
      const tempRight = session.selectedRight;
      
      tempLeft.classList.add("error");
      tempRight.classList.add("error");
      
      session.selectedLeft = null;
      session.selectedRight = null;
      
      setTimeout(() => {
        tempLeft.classList.remove("selected", "error");
        tempRight.classList.remove("selected", "error");
      }, 500);
    }
  }
}

// Game 2 (Sorting) helper assignment
function moveSortItem(itemId, categoryId) {
  synth.click();
  const deck = document.getElementById("sorting-deck");
  const itemEl = document.getElementById(`sort-item-${itemId}`);
  const basketContent = document.getElementById(`basket-content-${categoryId}`);
  
  if (!itemEl) return;
  
  // Set position details in Session state
  activeGameSession.customData.assignments[itemId] = categoryId;
  
  // Visual move
  itemEl.remove();
  basketContent.appendChild(itemEl);
  itemEl.draggable = false; // Disable drag once sorted
}

// Game 3 (Millionaire Quiz) Helpers
function loadQuizQuestion(index, list) {
  const session = activeGameSession.customData;
  const q = list[index];
  session.selectedAnswer = null;

  // Active step highlight on ladder
  document.querySelectorAll(".ladder-step").forEach(s => s.classList.remove("active"));
  document.getElementById(`quiz-step-${index}`).classList.add("active");

  const card = document.getElementById("quiz-q-card");
  card.innerHTML = `
    <span class="tf-progress">SAVOL ${index + 1} / ${list.length}</span>
    <h3>${q.question}</h3>
  `;

  const grid = document.getElementById("quiz-options-grid");
  grid.innerHTML = "";
  
  q.options.forEach((opt, idx) => {
    const div = document.createElement("div");
    div.className = "quiz-option";
    div.id = `quiz-option-${idx}`;
    div.innerHTML = `<span class="quiz-option-letter">${String.fromCharCode(65 + idx)}:</span> <span>${opt}</span>`;
    
    div.addEventListener("click", () => {
      synth.click();
      document.querySelectorAll(".quiz-option").forEach(x => x.classList.remove("correct"));
      div.classList.add("correct"); // Select highlight
      session.selectedAnswer = idx;
      
      // Auto evaluate answer once selected
      setTimeout(() => evaluateQuizChoice(idx, q), 200);
    });
    
    grid.appendChild(div);
  });
}

function evaluateQuizChoice(userChoice, questionObj) {
  const session = activeGameSession.customData;
  const list = activeGame.data.questions;
  const optDiv = document.getElementById(`quiz-option-${userChoice}`);
  
  // Prevent double click
  document.querySelectorAll(".quiz-option").forEach(o => {
    o.style.pointerEvents = "none";
  });

  if (userChoice === questionObj.answer) {
    synth.success();
    optDiv.className = "quiz-option correct";
    
    // Complete ladder step
    document.getElementById(`quiz-step-${session.qIndex}`).classList.add("completed");
    
    setTimeout(() => {
      session.qIndex++;
      if (session.qIndex < list.length) {
        loadQuizQuestion(session.qIndex, list);
        showToast("To'g'ri javob! Keyingi bosqichga o'tdingiz.", "success");
      } else {
        // Complete game
        activeGameSession.isFinished = true;
        document.getElementById("check-answer-btn").style.display = "block";
        document.getElementById("check-answer-btn").click();
      }
    }, 1500);
  } else {
    synth.fail();
    optDiv.className = "quiz-option incorrect";
    document.getElementById(`quiz-option-${questionObj.answer}`).className = "quiz-option correct";
    
    showToast("Afsuski xato! O'yin qaytadan boshlanadi.", "error");
    setTimeout(() => {
      // Reset quiz
      session.qIndex = 0;
      loadQuizQuestion(0, list);
    }, 2000);
  }
}

function useLifeline5050() {
  if (activeGameSession.customData.used5050) return;
  synth.click();
  
  const qIndex = activeGameSession.customData.qIndex;
  const q = activeGame.data.questions[qIndex];
  const ans = q.answer;
  
  // Pick two random incorrect indices to hide
  let incorrects = [];
  q.options.forEach((_, idx) => {
    if (idx !== ans) incorrects.push(idx);
  });
  
  // Shuffle and pick 2
  incorrects.sort(() => Math.random() - 0.5);
  incorrects.slice(0, 2).forEach(idx => {
    const el = document.getElementById(`quiz-option-${idx}`);
    if (el) el.style.visibility = "hidden";
  });
  
  activeGameSession.customData.used5050 = true;
  document.getElementById("lifeline-5050").classList.add("used");
  showToast("50:50 yordam ishlatildi. 2 ta xato variant olib tashlandi.", "info");
}

function useLifelineAngel() {
  if (activeGameSession.customData.usedAngel) return;
  synth.click();
  
  const qIndex = activeGameSession.customData.qIndex;
  const q = activeGame.data.questions[qIndex];
  
  showToast(`Farishdaning tushuntirishi: "${q.explanation}"`, "success");
  
  activeGameSession.customData.usedAngel = true;
  document.getElementById("lifeline-angel").classList.add("used");
}

// Game 4: True / False helpers
function loadTFStatement(index, list) {
  const q = list[index];
  
  document.getElementById("tf-progress-view").textContent = `Fakt: ${index + 1} / ${list.length}`;
  const card = document.getElementById("tf-card-view");
  card.innerHTML = `<p>${q.text}</p>`;
}

function answerTF(userAnswer, list) {
  const session = activeGameSession.customData;
  const current = list[session.sIndex];
  
  if (userAnswer === current.isTrue) {
    synth.success();
    session.correctCount++;
    showToast(`To'g'ri! ${current.explanation}`, "success");
  } else {
    synth.fail();
    showToast(`Xato! Aslida: ${current.explanation}`, "error");
  }
  
  session.sIndex++;
  
  setTimeout(() => {
    if (session.sIndex < list.length) {
      loadTFStatement(session.sIndex, list);
    } else {
      // Completed T/F game
      activeGameSession.isFinished = true;
      document.getElementById("check-answer-btn").style.display = "block";
      document.getElementById("check-answer-btn").click();
    }
  }, 2000);
}

// Game 5: Ordering renderers
function renderOrderingList(container, list) {
  container.innerHTML = "";
  list.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "order-item-card";
    card.id = `ordering-card-${item.id}`;
    
    card.innerHTML = `
      <span class="order-card-text">${item.text}</span>
      <div class="order-actions">
        <button class="order-nav-btn" onclick="moveOrderStep(${idx}, -1)">▲</button>
        <button class="order-nav-btn" onclick="moveOrderStep(${idx}, 1)">▼</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function moveOrderStep(idx, direction) {
  synth.click();
  const list = activeGameSession.customData.items;
  const newIdx = idx + direction;
  
  if (newIdx < 0 || newIdx >= list.length) return;
  
  // Swap items in memory
  const temp = list[idx];
  list[idx] = list[newIdx];
  list[newIdx] = temp;
  
  // Re-render
  const container = document.getElementById("ordering-list-container");
  renderOrderingList(container, list);
}

// Game 6: Crossword Helper Auto-Tab Focus
function focusNextCell(r, c, gridMatrix) {
  // Simple check for horizontal next cell or vertical next cell
  let nextEl = document.querySelector(`.cw-cell[data-r="${r}"][data-c="${c + 1}"] input`);
  if (!nextEl) {
    nextEl = document.querySelector(`.cw-cell[data-r="${r + 1}"][data-c="${c}"] input`);
  }
  if (nextEl) nextEl.focus();
}

// Game 8 (Labeling SVG Hotspot click connector)
function selectHotspot(nodeId) {
  synth.click();
  
  // Remove all active states
  document.querySelectorAll(".map-node-pulse").forEach(g => g.classList.remove("active-node"));
  // Highlight active one
  const group = document.getElementById(`hotspot-group-${nodeId}`);
  if (group) group.classList.add("active-node");
  
  // Scroll to dropdown and focus it
  const select = document.getElementById(`select-${nodeId}`);
  const row = document.getElementById(`selection-row-${nodeId}`);
  
  if (select) {
    document.querySelectorAll(".selection-row").forEach(r => r.style.borderColor = "var(--color-primary)");
    row.style.borderColor = "var(--color-gold)";
    select.focus();
  }
}

// Game 10 (Word Search Grid logic)
function handleWordSearchClick(cell, r, c) {
  synth.click();
  const session = activeGameSession.customData;
  const wordList = activeGame.data.words;
  
  if (cell.classList.contains("found")) return;

  // Toggle selection
  cell.classList.toggle("selected");
  
  const isSelected = cell.classList.contains("selected");
  if (isSelected) {
    session.selectedCoords.push([r, c]);
  } else {
    session.selectedCoords = session.selectedCoords.filter(coords => !(coords[0] === r && coords[1] === c));
  }

  // Attempt to check if selected coordinates match any word sequence
  checkWordSearchMatch(session, wordList);
}

function checkWordSearchMatch(session, wordList) {
  // Match coordinates list to word lists
  wordList.forEach(w => {
    if (session.foundWords.includes(w.name)) return;
    
    // Check if the current selected coordinate length matches word length
    if (session.selectedCoords.length !== w.coords.length) return;
    
    // Match coords sets
    let allCoordsMatch = true;
    w.coords.forEach(coord => {
      const match = session.selectedCoords.find(sel => sel[0] === coord[0] && sel[1] === coord[1]);
      if (!match) allCoordsMatch = false;
    });

    if (allCoordsMatch) {
      // Correct word found!
      synth.success();
      session.foundWords.push(w.name);
      
      // Permanently mark cells
      w.coords.forEach(coord => {
        const cell = document.querySelector(`.ws-cell[data-r="${coord[0]}"][data-c="${coord[1]}"]`);
        cell.classList.remove("selected");
        cell.classList.add("found");
      });
      
      // Update word checklist UI
      const li = document.getElementById(`ws-word-${w.name}`);
      li.className = "ws-word-item found";
      li.querySelector(".ws-word-status").textContent = "✓ Topildi!";
      
      // Clear selection array
      session.selectedCoords = [];
      showToast(`Barakalla! "${w.name}" so'zini topdingiz!`, "success");
      
      // Check auto completion
      if (session.foundWords.length === wordList.length) {
        document.getElementById("check-answer-btn").click();
      }
    }
  });
}

// 9. Base System Setup and Buttons
document.getElementById("theme-toggle").addEventListener("click", () => {
  synth.click();
  document.body.classList.toggle("light-theme");
  document.body.classList.toggle("dark-theme");
  showToast("Veb-sayt mavzusi yangilandi!", "info");
});

document.getElementById("sound-toggle").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  document.body.classList.toggle("sound-on", soundEnabled);
  document.body.classList.toggle("sound-off", !soundEnabled);
  synth.click();
  showToast(soundEnabled ? "Ovozlar yoqildi! 🔊" : "Ovozlar o'chirildi! 🔇", "info");
});

document.getElementById("reset-progress").addEventListener("click", () => {
  synth.fail();
  if (confirm("Haqiqatan ham barcha yutuqlar, ballar va bajarilgan o'yinlar tarixini tozalab tashlamoqchimisiz?")) {
    appState = {
      completedGames: [],
      totalScore: 0,
      badges: []
    };
    saveState();
    showToast("Tizim yutuqlari tozalab yuborildi!", "info");
  }
});

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("sound-on");
  loadState();
});
