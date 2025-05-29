document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn')
  const usernameInput = document.getElementById('username')
  const passwordInput = document.getElementById('password')
  const loginError = document.getElementById('login-error')
  const errorMessage = document.getElementById('error-message')

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      apiService.setAuthToken(token)
      window.location.href = 'index.html'
    }
  }

  const login = async () => {
    const username = usernameInput.value.trim()
    const password = passwordInput.value.trim()
    
    if (!username || !password) {
      showError('Preencha todos os campos')
      return
    }
    
    try {
      const loginData = { username, password }
      const response = await apiService.post(API.auth.login, loginData)
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', username)
      apiService.setAuthToken(response.token)
      
      window.location.href = 'index.html'
    } catch (error) {
      showError('Credenciais inválidas. Tente novamente.')
    }
  }

  const showError = (message) => {
    errorMessage.textContent = message
    loginError.classList.remove('hidden')
    
    setTimeout(() => {
      loginError.classList.add('hidden')
    }, 3000)
  }

  loginBtn.addEventListener('click', login)
  
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login()
  })
  
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') passwordInput.focus()
  })

  checkAuth()
})
