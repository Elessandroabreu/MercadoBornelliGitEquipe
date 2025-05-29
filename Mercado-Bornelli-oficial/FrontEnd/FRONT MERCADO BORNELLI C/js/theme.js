// Arquivo: js/theme.js

document.addEventListener('DOMContentLoaded', () => {
  console.log("Theme.js carregando...");
  
  // Verificar preferência do sistema para tema escuro
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Verificar se há preferência salva no localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Aplicar tema salvo ou o padrão (claro)
  if (savedTheme === 'dark' || (savedTheme === null && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    console.log("Tema escuro aplicado");
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    console.log("Tema claro aplicado");
  }
  
  // Obter o botão de alternar tema
  const themeToggle = document.getElementById('theme-toggle');
  console.log("Botão de tema encontrado:", themeToggle !== null);
  
  // Se o botão não existir, não prosseguir
  if (!themeToggle) return;
  
  // Encontrar os elementos dentro do botão
  const themeIcon = themeToggle.querySelector('i');
  const themeText = themeToggle.querySelector('span');
  
  // Função para atualizar a aparência do botão
  function updateThemeButton(isDark) {
    if (isDark) {
      themeIcon.className = 'fas fa-sun';
      if (themeText) themeText.textContent = 'Modo Claro';
    } else {
      themeIcon.className = 'fas fa-moon';
      if (themeText) themeText.textContent = 'Modo Escuro';
    }
  }
  
  // Atualizar o botão com base no tema atual
  const currentTheme = document.documentElement.getAttribute('data-theme');
  updateThemeButton(currentTheme === 'dark');
  
  // Adicionar evento ao botão de alternar tema
  themeToggle.addEventListener('click', () => {
    console.log("Botão de tema clicado");
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      updateThemeButton(false);
      console.log("Mudando para tema claro");
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      updateThemeButton(true);
      console.log("Mudando para tema escuro");
    }
  });
  
  console.log("Theme.js inicializado com sucesso");
});