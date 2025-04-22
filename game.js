// DOM Elements
const gameBoard = document.getElementById("gameBoard")
const timerElement = document.getElementById("timer")
const movesElement = document.getElementById("moves")
const scoreElement = document.getElementById("score")
const hintsElement = document.getElementById("hints")
const playerAvatarElement = document.getElementById("playerAvatar")
const playerDisplayNameElement = document.getElementById("playerDisplayName")
const settingsBtn = document.getElementById("settingsBtn")
const newGameBtn = document.getElementById("newGameBtn")
const helpBtn = document.getElementById("helpBtn")
const hintBtn = document.getElementById("hintBtn")
const instructionsModal = document.getElementById("instructionsModal")
const closeInstructions = document.getElementById("closeInstructions")
const resultModal = document.getElementById("resultModal")
const finalTimeElement = document.getElementById("finalTime")
const finalMovesElement = document.getElementById("finalMoves")
const finalScoreElement = document.getElementById("finalScore")
const finalRatingElement = document.getElementById("finalRating")
const playAgainBtn = document.getElementById("playAgainBtn")
const shareBtn = document.getElementById("shareBtn")

// Audio elements
const flipSound = document.getElementById("flipSound")
const matchSound = document.getElementById("matchSound")
const winSound = document.getElementById("winSound")
const hintSound = document.getElementById("hintSound")
const errorSound = document.getElementById("errorSound")

// Get current user
const currentUser = JSON.parse(localStorage.getItem("memoryGameCurrentUser"))

// Check if user is logged in
if (!currentUser) {
  window.location.href = "index.html"
}

// Game settings
const settings = {
  difficulty: currentUser.settings?.difficulty || "medium",
  theme: currentUser.settings?.theme || "animals",
  hints: currentUser.settings?.hints || 3,
  soundEnabled: currentUser.settings?.soundEnabled !== false,
  showTimer: currentUser.settings?.showTimer !== false,
  hintsUsed: 0,
}

// Game state
let gameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  score: 0,
  timer: null,
  seconds: 0,
  gameStarted: false,
  canFlip: true,
}

// Card symbols
const cardSymbols = {
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"],
  fruits: ["🍎", "🍌", "🍒", "🍓", "🍊", "🍋", "🍐", "🍑", "🍍", "🥝", "🥥", "🍇"],
  flags: ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇰🇷", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇧🇷", "🇿🇦"],
  emojis: ["😀", "😂", "😍", "😎", "🤔", "😴", "🥳", "😡", "🤯", "👻", "🤖", "👽"],
}

// Initialize game
function initGame() {
  // Reset game state
  resetGameState()

  // Create cards
  createCards()

  // Update UI
  updateUI()

  // Set player info
  setPlayerInfo()
}

// Reset game state
function resetGameState() {
  gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    score: 0,
    timer: null,
    seconds: 0,
    gameStarted: false,
    canFlip: true,
  }

  settings.hintsUsed = 0

  gameBoard.innerHTML = ""
}

// Set player info
function setPlayerInfo() {
  playerDisplayNameElement.textContent = currentUser.displayName || currentUser.username

  // Set avatar icon
  const avatarId = currentUser.avatar || "1"
  let avatarClass = "fa-user"

  switch (avatarId) {
    case "2":
      avatarClass = "fa-user-ninja"
      break
    case "3":
      avatarClass = "fa-user-astronaut"
      break
    case "4":
      avatarClass = "fa-user-graduate"
      break
    default:
      avatarClass = "fa-user"
  }

  playerAvatarElement.className = `fas ${avatarClass}`
}

// Create cards
function createCards() {
  // Determine pairs count based on difficulty
  let pairsCount
  switch (settings.difficulty) {
    case "easy":
      pairsCount = 6
      break
    case "medium":
      pairsCount = 8
      break
    case "hard":
      pairsCount = 12
      break
    default:
      pairsCount = 8
  }

  // Get symbols for the theme
  const symbols = cardSymbols[settings.theme].slice(0, pairsCount)

  // Create card pairs
  let cards = []
  symbols.forEach((symbol) => {
    cards.push(symbol)
    cards.push(symbol)
  })

  // Shuffle cards
  cards = shuffleArray(cards)

  // Create card elements
  cards.forEach((symbol, index) => {
    const card = document.createElement("div")
    card.className = "card"
    card.dataset.index = index
    card.dataset.symbol = symbol

    const back = document.createElement("div")
    back.className = "back"
    back.textContent = "?"

    const front = document.createElement("div")
    front.className = "front"
    front.textContent = symbol

    card.appendChild(back)
    card.appendChild(front)

    card.addEventListener("click", () => flipCard(card))

    gameBoard.appendChild(card)
    gameState.cards.push(card)
  })

  // Update board layout
  updateBoardLayout(pairsCount * 2)
}

// Shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Update board layout
function updateBoardLayout(cardCount) {
  let cols

  if (cardCount <= 12) {
    cols = 4
  } else {
    cols = 6
  }

  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
}

// Flip card
function flipCard(card) {
  if (!gameState.canFlip || card.classList.contains("flipped") || card.classList.contains("matched")) {
    return
  }

  // Start timer on first move
  if (!gameState.gameStarted) {
    startTimer()
    gameState.gameStarted = true
  }

  // Flip card
  card.classList.add("flipped")
  playSound("flip")

  // Add card to flipped cards
  gameState.flippedCards.push(card)

  // Check for match if two cards are flipped
  if (gameState.flippedCards.length === 2) {
    checkForMatch()
  }
}

// Check for match
function checkForMatch() {
  gameState.moves++
  updateUI()

  const [card1, card2] = gameState.flippedCards

  if (card1.dataset.symbol === card2.dataset.symbol) {
    // Match found
    handleMatch()
  } else {
    // No match
    handleMismatch()
  }
}

// Handle match
function handleMatch() {
  gameState.matchedPairs++
  gameState.score += calculateScore()

  gameState.flippedCards.forEach((card) => {
    card.classList.add("matched")
  })

  playSound("match")
  gameState.flippedCards = []

  // Check if game is complete
  checkGameEnd()
}

// Handle mismatch
function handleMismatch() {
  gameState.canFlip = false
  playSound("error")

  setTimeout(() => {
    gameState.flippedCards.forEach((card) => {
      card.classList.remove("flipped")
    })

    gameState.flippedCards = []
    gameState.canFlip = true
  }, 1000)
}

// Calculate score
function calculateScore() {
  const baseScore = 100
  const timeBonus = Math.max(0, 200 - gameState.seconds)
  const movesPenalty = gameState.moves * 2

  return baseScore + timeBonus - movesPenalty
}

// Check game end
function checkGameEnd() {
  let pairsCount
  switch (settings.difficulty) {
    case "easy":
      pairsCount = 6
      break
    case "medium":
      pairsCount = 8
      break
    case "hard":
      pairsCount = 12
      break
    default:
      pairsCount = 8
  }

  if (gameState.matchedPairs === pairsCount) {
    endGame()
  }
}

// End game
function endGame() {
  // Stop timer
  stopTimer()

  // Play win sound
  playSound("win")

  // Calculate rating
  const rating = calculateRating()

  // Show results
  showResults(rating)

  // Update user stats
  updateUserStats()
}

// Calculate rating
function calculateRating() {
  let pairsCount
  switch (settings.difficulty) {
    case "easy":
      pairsCount = 6
      break
    case "medium":
      pairsCount = 8
      break
    case "hard":
      pairsCount = 12
      break
    default:
      pairsCount = 8
  }

  const movesPerPair = gameState.moves / pairsCount
  const timePerPair = gameState.seconds / pairsCount

  if (movesPerPair <= 1.5 && timePerPair <= 5) return "⭐⭐⭐⭐⭐"
  if (movesPerPair <= 2 && timePerPair <= 7) return "⭐⭐⭐⭐"
  if (movesPerPair <= 2.5 && timePerPair <= 10) return "⭐⭐⭐"
  if (movesPerPair <= 3 && timePerPair <= 15) return "⭐⭐"
  return "⭐"
}

// Show results
function showResults(rating) {
  finalTimeElement.textContent = timerElement.textContent
  finalMovesElement.textContent = gameState.moves
  finalScoreElement.textContent = gameState.score
  finalRatingElement.textContent = rating

  resultModal.style.display = "flex"
}

// Update user stats
function updateUserStats() {
  if (currentUser.isGuest) return

  // Get all users
  const users = JSON.parse(localStorage.getItem("memoryGameUsers")) || []

  // Update current user stats
  if (!currentUser.stats) {
    currentUser.stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: 0,
      totalScore: 0,
    }
  }

  currentUser.stats.gamesPlayed++
  currentUser.stats.gamesWon++
  currentUser.stats.totalScore += gameState.score

  if (gameState.score > currentUser.stats.bestScore) {
    currentUser.stats.bestScore = gameState.score
  }

  // Update current user in localStorage
  localStorage.setItem("memoryGameCurrentUser", JSON.stringify(currentUser))

  // Update user in users array
  const userIndex = users.findIndex((user) => user.username === currentUser.username)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    localStorage.setItem("memoryGameUsers", JSON.stringify(users))
  }
}

// Start timer
function startTimer() {
  gameState.seconds = 0
  updateTimerDisplay()

  gameState.timer = setInterval(() => {
    gameState.seconds++
    updateTimerDisplay()
  }, 1000)
}

// Stop timer
function stopTimer() {
  clearInterval(gameState.timer)
  gameState.timer = null
}

// Update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(gameState.seconds / 60)
  const seconds = gameState.seconds % 60

  timerElement.textContent = `${padZero(minutes)}:${padZero(seconds)}`
}

// Pad zero for numbers less than 10
function padZero(num) {
  return num < 10 ? `0${num}` : num
}

// Update UI
function updateUI() {
  timerElement.textContent = `${padZero(Math.floor(gameState.seconds / 60))}:${padZero(gameState.seconds % 60)}`
  movesElement.textContent = gameState.moves
  scoreElement.textContent = gameState.score
  hintsElement.textContent = settings.hints - settings.hintsUsed
}

// Play sound
function playSound(type) {
  if (!settings.soundEnabled) return

  let sound
  switch (type) {
    case "flip":
      sound = flipSound
      break
    case "match":
      sound = matchSound
      break
    case "win":
      sound = winSound
      break
    case "hint":
      sound = hintSound
      break
    case "error":
      sound = errorSound
      break
    default:
      return
  }

  // Set audio source if not already set
  if (!sound.src) {
    // Use a simple beep sound as fallback
    sound.src = "data:audio/wav;base64,UklGRl9vT19TSU1QTEUAAAAA"
  }

  sound.currentTime = 0
  sound.play().catch((e) => console.log("Audio play error:", e))
}

// Use hint
function useHint() {
  if (settings.hintsUsed >= settings.hints) return

  // Find unmatched pairs
  const unmatchedCards = Array.from(gameBoard.children).filter((card) => {
    return !card.classList.contains("matched") && !card.classList.contains("flipped")
  })

  // Create symbol map
  const symbolMap = {}
  let pair = null

  unmatchedCards.forEach((card) => {
    const symbol = card.dataset.symbol
    if (symbolMap[symbol]) {
      pair = [symbolMap[symbol], card]
      return
    }
    symbolMap[symbol] = card
  })

  if (pair) {
    settings.hintsUsed++
    updateUI()
    playSound("hint")

    // Show pair for 2 seconds
    pair.forEach((card) => {
      card.classList.add("flipped")
    })

    setTimeout(() => {
      pair.forEach((card) => {
        if (!card.classList.contains("matched")) {
          card.classList.remove("flipped")
        }
      })
    }, 2000)
  }
}

// Event listeners
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html"
})

newGameBtn.addEventListener("click", initGame)

helpBtn.addEventListener("click", () => {
  instructionsModal.style.display = "flex"
})

closeInstructions.addEventListener("click", () => {
  instructionsModal.style.display = "none"
})

hintBtn.addEventListener("click", useHint)

playAgainBtn.addEventListener("click", () => {
  resultModal.style.display = "none"
  initGame()
})

shareBtn.addEventListener("click", () => {
  const shareText = `لقد أكملت لعبة الذاكرة بمستوى ${settings.difficulty} في ${timerElement.textContent} مع ${gameState.moves} حركات! النقاط: ${gameState.score}. هل يمكنك التغلب على هذا؟`

  if (navigator.share) {
    navigator
      .share({
        title: "نتيجة لعبة الذاكرة",
        text: shareText,
        url: window.location.href,
      })
      .catch((err) => {
        console.log("Error sharing:", err)
        alert(shareText)
      })
  } else {
    alert(shareText)
  }
})

// Initialize game when page loads
window.addEventListener("load", initGame)
