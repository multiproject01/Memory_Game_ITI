// DOM Elements
const playerNameElement = document.getElementById("playerName")
const difficultySelect = document.getElementById("difficultySelect")
const themeSelect = document.getElementById("themeSelect")
const hintsCountInput = document.getElementById("hintsCount")
const soundToggle = document.getElementById("soundToggle")
const timerToggle = document.getElementById("timerToggle")
const avatarOptions = document.querySelectorAll(".avatar-option")
const displayNameInput = document.getElementById("displayName")
const saveSettingsBtn = document.getElementById("saveSettingsBtn")
const startGameBtn = document.getElementById("startGameBtn")
const logoutBtn = document.getElementById("logoutBtn")

// Get current user
const currentUser = JSON.parse(localStorage.getItem("memoryGameCurrentUser"))

// Check if user is logged in
if (!currentUser) {
  window.location.href = "index.html"
}

// Load user data
function loadUserData() {
  // Set player name
  playerNameElement.textContent = currentUser.displayName || currentUser.username

  // Set form values
  difficultySelect.value = currentUser.settings?.difficulty || "medium"
  themeSelect.value = currentUser.settings?.theme || "animals"
  hintsCountInput.value = currentUser.settings?.hints || 3
  soundToggle.checked = currentUser.settings?.soundEnabled !== false
  timerToggle.checked = currentUser.settings?.showTimer !== false
  displayNameInput.value = currentUser.displayName || currentUser.username

  // Set avatar
  const avatarId = currentUser.avatar || "1"
  avatarOptions.forEach((option) => {
    if (option.dataset.avatar === avatarId) {
      option.classList.add("selected")
    } else {
      option.classList.remove("selected")
    }
  })
}

// Save settings
function saveSettings() {
  // Get all users
  const users = JSON.parse(localStorage.getItem("memoryGameUsers")) || []

  // Update current user settings
  currentUser.settings = {
    difficulty: difficultySelect.value,
    theme: themeSelect.value,
    hints: Number.parseInt(hintsCountInput.value),
    soundEnabled: soundToggle.checked,
    showTimer: timerToggle.checked,
  }

  currentUser.displayName = displayNameInput.value

  // Get selected avatar
  const selectedAvatar = document.querySelector(".avatar-option.selected")
  if (selectedAvatar) {
    currentUser.avatar = selectedAvatar.dataset.avatar
  }

  // Update current user in localStorage
  localStorage.setItem("memoryGameCurrentUser", JSON.stringify(currentUser))

  // If not a guest, update user in users array
  if (!currentUser.isGuest) {
    const userIndex = users.findIndex((user) => user.username === currentUser.username)
    if (userIndex !== -1) {
      users[userIndex] = currentUser
      localStorage.setItem("memoryGameUsers", JSON.stringify(users))
    }
  }

  // Show success message
  alert("تم حفظ الإعدادات بنجاح")
}

// Avatar selection
avatarOptions.forEach((option) => {
  option.addEventListener("click", function () {
    avatarOptions.forEach((opt) => opt.classList.remove("selected"))
    this.classList.add("selected")
  })
})

// Save settings button
saveSettingsBtn.addEventListener("click", () => {
  saveSettings()
})

// Start game button
startGameBtn.addEventListener("click", () => {
  saveSettings()
  window.location.href = "game.html"
})

// Logout button
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("memoryGameCurrentUser")
  window.location.href = "index.html"
})

// Load user data on page load
window.addEventListener("load", loadUserData)
