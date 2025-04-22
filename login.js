// DOM Elements
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const loginBox = document.querySelector(".login-box")
const registerBox = document.querySelector(".register-box")
const registerLink = document.getElementById("registerLink")
const loginLink = document.getElementById("loginLink")
const guestLoginBtn = document.getElementById("guestLoginBtn")

// User data storage
const users = JSON.parse(localStorage.getItem("memoryGameUsers")) || []

// Show register form
registerLink.addEventListener("click", (e) => {
  e.preventDefault()
  loginBox.classList.add("hidden")
  registerBox.classList.remove("hidden")
})

// Show login form
loginLink.addEventListener("click", (e) => {
  e.preventDefault()
  registerBox.classList.add("hidden")
  loginBox.classList.remove("hidden")
})

// Register new user
registerForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const username = document.getElementById("newUsername").value
  const email = document.getElementById("email").value
  const password = document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  // Validation
  if (password !== confirmPassword) {
    alert("كلمات المرور غير متطابقة")
    return
  }

  // Check if username already exists
  if (users.some((user) => user.username === username)) {
    alert("اسم المستخدم موجود بالفعل")
    return
  }

  // Create new user
  const newUser = {
    username,
    email,
    password, // In a real app, you should hash the password
    displayName: username,
    avatar: "1",
    settings: {
      difficulty: "medium",
      theme: "animals",
      hints: 3,
      soundEnabled: true,
      showTimer: true,
    },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: 0,
      totalScore: 0,
    },
  }

  // Add user to storage
  users.push(newUser)
  localStorage.setItem("memoryGameUsers", JSON.stringify(users))

  // Set current user
  localStorage.setItem("memoryGameCurrentUser", JSON.stringify(newUser))

  // Redirect to settings page
  window.location.href = "settings.html"
})

// Login user
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Find user
  const user = users.find((user) => user.username === username && user.password === password)

  if (user) {
    // Set current user
    localStorage.setItem("memoryGameCurrentUser", JSON.stringify(user))

    // Set remember me
    if (rememberMe) {
      localStorage.setItem("memoryGameRememberMe", username)
    } else {
      localStorage.removeItem("memoryGameRememberMe")
    }

    // Redirect to settings page
    window.location.href = "settings.html"
  } else {
    alert("اسم المستخدم أو كلمة المرور غير صحيحة")
  }
})

// Guest login
guestLoginBtn.addEventListener("click", () => {
  // Create guest user
  const guestUser = {
    username: "guest_" + Math.floor(Math.random() * 10000),
    displayName: "زائر",
    avatar: "1",
    isGuest: true,
    settings: {
      difficulty: "medium",
      theme: "animals",
      hints: 3,
      soundEnabled: true,
      showTimer: true,
    },
  }

  // Set current user
  localStorage.setItem("memoryGameCurrentUser", JSON.stringify(guestUser))

  // Redirect to game page directly
  window.location.href = "settings.html"
})

// Check for remembered user
window.addEventListener("load", () => {
  const rememberedUser = localStorage.getItem("memoryGameRememberMe")

  if (rememberedUser) {
    document.getElementById("username").value = rememberedUser
    document.getElementById("rememberMe").checked = true
  }

  // Check if user is already logged in
  const currentUser = localStorage.getItem("memoryGameCurrentUser")
  if (currentUser) {
    // Redirect to settings page
    window.location.href = "settings.html"
  }
})
