// عناصر DOM
const gameBoard = document.getElementById("gameBoard")
const timerElement = document.getElementById("timer")
const movesElement = document.getElementById("moves")
const scoreElement = document.getElementById("score")
const hintsElement = document.getElementById("hints")
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

// الأصوات
const flipSound = document.getElementById("flipSound")
const matchSound = document.getElementById("matchSound")
const winSound = document.getElementById("winSound")
const hintSound = document.getElementById("hintSound")
const errorSound = document.getElementById("errorSound")

// إعدادات اللعبة
const settings = {
  difficulty: "medium",
  theme: "animals",
  soundEnabled: true,
  hints: 3,
  hintsUsed: 0,
}

// حالة اللعبة
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

// رموز البطاقات
const cardSymbols = {
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"],
  fruits: ["🍎", "🍌", "🍒", "🍓", "🍊", "🍋", "🍐", "🍑", "🍍", "🥝", "🥥", "🍇"],
  flags: ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇰🇷", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇧🇷", "🇿🇦"],
  emojis: ["😀", "😂", "😍", "😎", "🤔", "😴", "🥳", "😡", "🤯", "👻", "🤖", "👽"],
}

// تهيئة اللعبة
function initGame() {
  // إعادة تعيين حالة اللعبة
  resetGameState()

  // إنشاء البطاقات
  createCards()

  // تحديث واجهة المستخدم
  updateUI()

  // تحميل الإعدادات المحفوظة
  loadSettings()
}

// إعادة تعيين حالة اللعبة
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

// إنشاء البطاقات
function createCards() {
  // تحديد عدد الأزواج حسب الصعوبة
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

  // الحصول على الرموز حسب الموضوع
  const symbols = cardSymbols[settings.theme].slice(0, pairsCount)

  // إنشاء أزواج البطاقات
  let cards = []
  symbols.forEach((symbol) => {
    cards.push(symbol)
    cards.push(symbol)
  })

  // خلط البطاقات
  cards = shuffleArray(cards)

  // إنشاء عناصر البطاقات
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

  // تحديث تخطيط اللوحة حسب عدد البطاقات
  updateBoardLayout(pairsCount * 2)
}

// خلط المصفوفة
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// تحديث تخطيط اللوحة
function updateBoardLayout(cardCount) {
  let cols, rows

  if (cardCount <= 12) {
    cols = 4
    rows = Math.ceil(cardCount / cols)
  } else {
    cols = 6
    rows = Math.ceil(cardCount / cols)
  }

  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
  gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`
}

// قلب البطاقة
function flipCard(card) {
  if (!gameState.canFlip || card.classList.contains("flipped") || card.classList.contains("matched")) {
    return
  }

  // بدء المؤقت إذا كانت هذه أول حركة
  if (!gameState.gameStarted) {
    startTimer()
    gameState.gameStarted = true
  }

  // قلب البطاقة
  card.classList.add("flipped")
  playSound("flip")

  // إضافة البطاقة إلى البطاقات المقلوبة
  gameState.flippedCards.push(card)

  // إذا كان هناك بطاقتين مقلوبتين، تحقق من التطابق
  if (gameState.flippedCards.length === 2) {
    checkForMatch()
  }

  // حفظ حالة اللعبة
  saveGameState()
}

// التحقق من التطابق
function checkForMatch() {
  gameState.moves++
  updateUI()

  const [card1, card2] = gameState.flippedCards

  if (card1.dataset.symbol === card2.dataset.symbol) {
    // تطابق ناجح
    handleMatch()
  } else {
    // عدم تطابق
    handleMismatch()
  }
}

// معالجة التطابق الناجح
function handleMatch() {
  gameState.matchedPairs++
  gameState.score += calculateScore()

  gameState.flippedCards.forEach((card) => {
    card.classList.add("matched")
  })

  playSound("match")
  gameState.flippedCards = []

  // التحقق من انتهاء اللعبة
  checkGameEnd()

  // حفظ حالة اللعبة
  saveGameState()
}

// معالجة عدم التطابق
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

// حساب النقاط
function calculateScore() {
  const baseScore = 100
  const timeBonus = Math.max(0, 200 - gameState.seconds)
  const movesPenalty = gameState.moves * 2

  return baseScore + timeBonus - movesPenalty
}

// التحقق من انتهاء اللعبة
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

// انتهاء اللعبة
function endGame() {
  // إيقاف المؤقت
  stopTimer()

  // تشغيل صوت الفوز
  playSound("win")

  // حساب التقييم
  const rating = calculateRating()

  // عرض النتائج
  showResults(rating)

  // حفظ النتيجة العالية
  saveHighScore()

  // مسح حالة اللعبة المحفوظة
  clearSavedGame()
}

// حساب التقييم
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

// عرض النتائج
function showResults(rating) {
  finalTimeElement.textContent = timerElement.textContent
  finalMovesElement.textContent = gameState.moves
  finalScoreElement.textContent = gameState.score
  finalRatingElement.textContent = rating

  resultModal.style.display = "flex"
}

// بدء المؤقت
function startTimer() {
  gameState.seconds = 0
  updateTimerDisplay()

  gameState.timer = setInterval(() => {
    gameState.seconds++
    updateTimerDisplay()
  }, 1000)
}

// إيقاف المؤقت
function stopTimer() {
  clearInterval(gameState.timer)
  gameState.timer = null
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
  const minutes = Math.floor(gameState.seconds / 60)
  const seconds = gameState.seconds % 60

  timerElement.textContent = `${padZero(minutes)}:${padZero(seconds)}`
}

// إضافة صفر للأرقام أقل من 10
function padZero(num) {
  return num < 10 ? `0${num}` : num
}

// تحديث واجهة المستخدم
function updateUI() {
  timerElement.textContent = `${padZero(Math.floor(gameState.seconds / 60))}:${padZero(gameState.seconds % 60)}`
  movesElement.textContent = gameState.moves
  scoreElement.textContent = gameState.score
  hintsElement.textContent = settings.hints - settings.hintsUsed
}

// تشغيل الصوت
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

  sound.currentTime = 0
  sound.play().catch((e) => console.log("Audio play error:", e))
}

// استخدام المساعدة
function useHint() {
  if (settings.hintsUsed >= settings.hints) return

  // العثور على أزواج غير متطابقة
  const unmatchedCards = Array.from(gameBoard.children).filter((card) => {
    return !card.classList.contains("matched") && !card.classList.contains("flipped")
  })

  // إنشاء خريطة للرموز
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

    // عرض الزوج لمدة ثانيتين
    pair.forEach((card) => {
      card.classList.add("hint")
      setTimeout(() => {
        card.classList.remove("hint")
      }, 2000)
    })
  }
}

// حفظ الإعدادات
function saveSettings() {
  localStorage.setItem("memoryGameSettings", JSON.stringify(settings))
}

// تحميل الإعدادات
function loadSettings() {
  const savedSettings = localStorage.getItem("memoryGameSettings")
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings)
      Object.assign(settings, parsedSettings)

      // تحديث واجهة اختيار الصعوبة والموضوع
      updateDifficultyUI()
      updateThemeUI()
    } catch (e) {
      console.error("Error loading settings:", e)
    }
  }
}

// تحديث واجهة اختيار الصعوبة
function updateDifficultyUI() {
  document.querySelectorAll(".difficulty-options button").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.dataset.difficulty === settings.difficulty) {
      btn.classList.add("active")
    }
  })
}

// تحديث واجهة اختيار الموضوع
function updateThemeUI() {
  document.querySelectorAll(".theme-options button").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.dataset.theme === settings.theme) {
      btn.classList.add("active")
    }
  })
}

// حفظ حالة اللعبة
function saveGameState() {
  if (!gameState.gameStarted) return

  const saveData = {
    cards: gameState.cards.map((card) => ({
      index: card.dataset.index,
      symbol: card.dataset.symbol,
      isFlipped: card.classList.contains("flipped"),
      isMatched: card.classList.contains("matched"),
    })),
    matchedPairs: gameState.matchedPairs,
    moves: gameState.moves,
    score: gameState.score,
    seconds: gameState.seconds,
    gameStarted: gameState.gameStarted,
    hintsUsed: settings.hintsUsed,
  }

  localStorage.setItem("memoryGameCurrentGame", JSON.stringify(saveData))
}

// تحميل حالة اللعبة المحفوظة
function loadSavedGame() {
  const savedGame = localStorage.getItem("memoryGameCurrentGame")
  if (savedGame) {
    try {
      const gameData = JSON.parse(savedGame)

      // التحقق من أن اللعبة المحفوظة ليست قديمة (أكثر من يوم)
      const oneDay = 24 * 60 * 60 * 1000
      if (new Date().getTime() - gameData.timestamp > oneDay) {
        localStorage.removeItem("memoryGameCurrentGame")
        return false
      }

      return gameData
    } catch (e) {
      console.error("Error loading saved game:", e)
      return false
    }
  }
  return false
}

// مسح اللعبة المحفوظة
function clearSavedGame() {
  localStorage.removeItem("memoryGameCurrentGame")
}

// حفظ النتيجة العالية
function saveHighScore() {
  const highScores = JSON.parse(localStorage.getItem("memoryGameHighScores")) || {
    easy: [],
    medium: [],
    hard: [],
  }

  const scoreData = {
    score: gameState.score,
    time: gameState.seconds,
    moves: gameState.moves,
    date: new Date().toLocaleDateString(),
    theme: settings.theme,
  }

  highScores[settings.difficulty].push(scoreData)

  // ترتيب النتائج من الأعلى للأقل
  highScores[settings.difficulty].sort((a, b) => b.score - a.score)

  // الاحتفاظ بأفضل 10 نتائج فقط
  highScores[settings.difficulty] = highScores[settings.difficulty].slice(0, 10)

  localStorage.setItem("memoryGameHighScores", JSON.stringify(highScores))
}

// معالجات الأحداث
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

// اختيار الصعوبة
document.querySelectorAll(".difficulty-options button").forEach((btn) => {
  btn.addEventListener("click", () => {
    settings.difficulty = btn.dataset.difficulty
    saveSettings()
    updateDifficultyUI()
    initGame()
  })
})

// اختيار الموضوع
document.querySelectorAll(".theme-options button").forEach((btn) => {
  btn.addEventListener("click", () => {
    settings.theme = btn.dataset.theme
    saveSettings()
    updateThemeUI()
    initGame()
  })
})

// تهيئة الأصوات
flipSound.src = \
'data:audio/wav;base64,UklGRpYHAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXIHAACAgICAgICAgICAgICAgICAgICAgICAgICBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG


```js file="sounds/match.mp3"
// This is a placeholder for the match sound file
// In a real implementation, you would use an actual MP3 file
