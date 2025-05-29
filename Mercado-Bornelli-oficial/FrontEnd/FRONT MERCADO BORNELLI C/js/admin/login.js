document.addEventListener('DOMContentLoaded', () => {
  // Verificar preferência do sistema para tema escuro
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Verificar se há preferência salva no localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Aplicar tema salvo ou o padrão (claro), independentemente da existência do botão
  if (savedTheme === 'dark' || (savedTheme === null && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Obter o botão de alternar tema, se existir
  const themeToggle = document.getElementById('theme-toggle');
  
  // Se o botão não existir, não prosseguir com o código relacionado ao botão
  if (!themeToggle) return;
  
  const themeIcon = themeToggle.querySelector('i');
  const themeText = themeToggle.querySelector('span');
  
  // Função para atualizar o botão com base no tema
  function updateThemeButton(isDark) {
    if (isDark) {
      themeIcon.className = 'fas fa-sun';
      themeText.textContent = 'Modo Claro';
    } else {
      themeIcon.className = 'fas fa-moon';
      themeText.textContent = 'Modo Escuro';
    }
  }
  
  // Atualizar o botão com base no tema atual
  const currentTheme = document.documentElement.getAttribute('data-theme');
  updateThemeButton(currentTheme === 'dark');
  
  // Adicionar evento ao botão de alternar tema
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      updateThemeButton(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      updateThemeButton(true);
    }
  });
});