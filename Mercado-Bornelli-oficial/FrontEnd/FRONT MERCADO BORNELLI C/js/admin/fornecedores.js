document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  apiService.setAuthToken(token);
  
  // Atualizar nome do usuário
  const username = localStorage.getItem('auth_user');
  if (username) {
    document.getElementById('user-name').textContent = username;
  }
  
  // Configurar logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = 'login.html';
  });
  
  // Elementos
  const fornecedoresLista = document.getElementById('fornecedores-lista');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const btnNovoFornecedor = document.getElementById('btn-novo-fornecedor');
  const btnFornecedoresExcluidos = document.getElementById('btn-fornecedores-excluidos');
  
  // Modais
  const fornecedorModal = document.getElementById('fornecedor-modal');
  const fornecedorModalTitle = document.getElementById('fornecedor-modal-title');
  const fornecedorModalClose = document.getElementById('fornecedor-modal-close');
  const fornecedorForm = document.getElementById('fornecedor-form');
  const fornecedorId = document.getElementById('fornecedor-id');
  const fornecedorNome = document.getElementById('fornecedor-nome');
  const fornecedorCnpj = document.getElementById('fornecedor-cnpj');
  const fornecedorRepresentante = document.getElementById('fornecedor-representante');
  const fornecedorTelefone = document.getElementById('fornecedor-telefone');
  const fornecedorEmail = document.getElementById('fornecedor-email');
  const fornecedorProdutos = document.getElementById('fornecedor-produtos');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnSalvar = document.getElementById('btn-salvar');
  
  const produtosModal = document.getElementById('produtos-modal');
  const produtosModalClose = document.getElementById('produtos-modal-close');
  const produtosFornecedorNome = document.getElementById('produtos-fornecedor-nome');
  const produtosLista = document.getElementById('produtos-lista');
  const btnFecharProdutos = document.getElementById('btn-fechar-produtos');
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalClose = document.getElementById('confirm-modal-close');
  const confirmMessage = document.getElementById('confirm-message');
  const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
  const btnConfirm = document.getElementById('btn-confirm');
  
  // Estado
  let fornecedores = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let activeFornecedorId = null;
  let confirmCallback = null;
  let viewingDeleted = false;
  
  // Eventos
  btnNovoFornecedor.addEventListener('click', () => {
    showFornecedorModal(null);
  });
  
  btnFornecedoresExcluidos.addEventListener('click', () => {
    viewingDeleted = !viewingDeleted;
    if (viewingDeleted) {
      btnFornecedoresExcluidos.innerHTML = '<i class="fas fa-truck"></i> Fornecedores Ativos';
      loadFornecedoresExcluidos();
    } else {
      btnFornecedoresExcluidos.innerHTML = '<i class="fas fa-trash"></i> Fornecedores Excluídos';
      loadFornecedores();
    }
  });
  
  btnSearch.addEventListener('click', () => {
    if (searchInput.value.trim()) {
      searchFornecedores(searchInput.value.trim());
    } else {
      loadFornecedores();
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });
  
  // Modal Fornecedor
  fornecedorModalClose.addEventListener('click', () => closeFornecedorModal());
  btnCancelar.addEventListener('click', () => closeFornecedorModal());
  btnSalvar.addEventListener('click', saveFornecedor);
  
  // Modal Produtos
  produtosModalClose.addEventListener('click', () => closeProdutosModal());
  btnFecharProdutos.addEventListener('click', () => closeProdutosModal());
  
  // Modal Confirmação
  confirmModalClose.addEventListener('click', () => closeConfirmModal());
  btnCancelConfirm.addEventListener('click', () => closeConfirmModal());
  btnConfirm.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
    }
    closeConfirmModal();
  });
  
  // Formatação de CNPJ
  fornecedorCnpj.addEventListener('input', (e) => {
    e.target.value = formatCnpj(e.target.value);
  });
  
  // Formatação de telefone
  fornecedorTelefone.addEventListener('input', (e) => {
    e.target.value = formatTelefone(e.target.value);
  });
  
  // Carregar dados iniciais
  await loadFornecedores();
  
  // Funções
  async function loadFornecedores() {
    try {
      fornecedores = await apiService.get(API.fornecedores.base);
      renderFornecedores();
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  }
  
  async function loadFornecedoresExcluidos() {
    try {
      fornecedores = await apiService.get(API.fornecedores.excluidos);
      renderFornecedores();
    } catch (error) {
      console.error('Erro ao carregar fornecedores excluídos:', error);
    }
  }
  
  function renderFornecedores() {
    // Calcular paginação
    totalPages = Math.ceil(fornecedores.length / itemsPerPage);
    
    // Obter fornecedores da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFornecedores = fornecedores.slice(startIndex, endIndex);
    
    if (currentFornecedores.length === 0) {
      fornecedoresLista.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Nenhum fornecedor encontrado</td>
        </tr>
      `;
      pagination.innerHTML = '';
      return;
    }
    
    let html = '';
    
    currentFornecedores.forEach(fornecedor => {
      html += `
        <tr>
          <td>${fornecedor.idFornecedor}</td>
          <td>${fornecedor.nomeEmpresa}</td>
          <td>${fornecedor.cnpj}</td>
          <td>${fornecedor.nomeRepresentante || '-'}</td>
          <td>${fornecedor.telefone || '-'}</td>
          <td>${fornecedor.email || '-'}</td>
          <td>
            ${viewingDeleted ? `
              <button class="action-btn restore-btn" data-id="${fornecedor.idFornecedor}" title="Restaurar">
                <i class="fas fa-trash-restore"></i>
              </button>
            ` : `
              <button class="action-btn edit-btn" data-id="${fornecedor.idFornecedor}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn" data-id="${fornecedor.idFornecedor}" title="Ver Produtos">
                <i class="fas fa-box"></i>
              </button>
              <button class="action-btn delete-btn" data-id="${fornecedor.idFornecedor}" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `}
          </td>
        </tr>
      `;
    });
    
    fornecedoresLista.innerHTML = html;
    
    // Adicionar eventos aos botões de ação
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const fornecedor = fornecedores.find(f => f.idFornecedor === id);
        if (fornecedor) {
          showFornecedorModal(fornecedor);
        }
      });
    });
    
    document.querySelectorAll('.action-btn[title="Ver Produtos"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const fornecedor = fornecedores.find(f => f.idFornecedor === id);
        if (fornecedor) {
          showProdutosModal(fornecedor);
        }
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        confirmDelete(id);
      });
    });
    
    document.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        confirmRestore(id);
      });
    });
    
    renderPagination();
  }
  
  function renderPagination() {
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    
    let html = '';
    
    // Botão anterior
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Anterior</button>`;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // Botão próximo
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Próximo</button>`;
    
    pagination.innerHTML = html;
    
    // Adicionar eventos aos botões de paginação
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) {
          currentPage = parseInt(btn.dataset.page);
          renderFornecedores();
        }
      });
    });
  }
  
  async function searchFornecedores(query) {
  try {
    // Verificar se é um CNPJ
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (cnpjRegex.test(query)) {
      try {
        // Remover caracteres especiais do CNPJ
        const cnpjNumerico = query.replace(/\D/g, '');
        
        // Usar o endpoint com apenas números
        const endpoint = API.fornecedores.porCnpjNumerico ? 
                         API.fornecedores.porCnpjNumerico(cnpjNumerico) : 
                         `/api/fornecedores/cnpj-numerico/${cnpjNumerico}`;
                         
        console.log("Usando endpoint numérico:", endpoint);
        
        const fornecedorPorCnpj = await apiService.get(endpoint);
        fornecedores = [fornecedorPorCnpj];
      } catch (error) {
        console.error("Erro específico ao buscar por CNPJ:", error);
        fornecedores = [];
      }
    } else {
      // Buscar por nome
      fornecedores = await apiService.get(API.fornecedores.porNome(query));
    }
    
    renderFornecedores();
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    fornecedores = [];
    renderFornecedores();
  }
}
  
  function showFornecedorModal(fornecedor) {
    fornecedorForm.reset();
    
    if (fornecedor) {
      fornecedorModalTitle.textContent = 'Editar Fornecedor';
      fornecedorId.value = fornecedor.idFornecedor;
      fornecedorNome.value = fornecedor.nomeEmpresa;
      fornecedorCnpj.value = fornecedor.cnpj;
      fornecedorRepresentante.value = fornecedor.nomeRepresentante || '';
      fornecedorTelefone.value = fornecedor.telefone || '';
      fornecedorEmail.value = fornecedor.email || '';
      fornecedorProdutos.value = fornecedor.produtosFornecidos || '';
    } else {
      fornecedorModalTitle.textContent = 'Novo Fornecedor';
      fornecedorId.value = '';
    }
    
    fornecedorModal.classList.remove('hidden');
  }
  
  function closeFornecedorModal() {
    fornecedorModal.classList.add('hidden');
  }
  
  async function saveFornecedor() {
  // Validação sequencial
  if (!fornecedorNome.value.trim()) {
    alert('Erro ao cadastrar fornecedor. Digite o nome da empresa.');
    fornecedorNome.focus();
    return;
  }

  if (!fornecedorCnpj.value.trim()) {
    alert('Digite o CNPJ do fornecedor.');
    fornecedorCnpj.focus();
    return;
  }

  // Validar formato do CNPJ
  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  if (!cnpjRegex.test(fornecedorCnpj.value)) {
    alert('Digite um CNPJ válido no formato 00.000.000/0000-00.');
    fornecedorCnpj.focus();
    return;
  }

  if (!fornecedorRepresentante.value.trim()) {
    alert('Digite o nome do representante.');
    fornecedorRepresentante.focus();
    return;
  }

  if (!fornecedorTelefone.value.trim()) {
    alert('Digite o telefone do fornecedor.');
    fornecedorTelefone.focus();
    return;
  }

  // Validar formato do telefone
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!telefoneRegex.test(fornecedorTelefone.value)) {
    alert('Digite um telefone válido no formato (00) 00000-0000.');
    fornecedorTelefone.focus();
    return;
  }

  if (!fornecedorEmail.value.trim()) {
    alert('Digite o email do fornecedor.');
    fornecedorEmail.focus();
    return;
  }

  // Validar formato do email
  if (!isValidEmail(fornecedorEmail.value.trim())) {
    alert('Digite um email válido.');
    fornecedorEmail.focus();
    return;
  }

  if (!fornecedorProdutos.value.trim()) {
    alert('Informe os produtos fornecidos.');
    fornecedorProdutos.focus();
    return;
  }

  const formData = {
    nomeEmpresa: fornecedorNome.value,
    cnpj: fornecedorCnpj.value,
    nomeRepresentante: fornecedorRepresentante.value,
    telefone: fornecedorTelefone.value,
    email: fornecedorEmail.value,
    produtosFornecidos: fornecedorProdutos.value
  };
  
  try {
    if (fornecedorId.value) {
      // Editar fornecedor existente
      await apiService.put(`${API.fornecedores.porId(fornecedorId.value)}?dummy=1`, formData);
    } else {
      // Criar novo fornecedor
      await apiService.post(`${API.fornecedores.base}?dummy=1`, formData);
    }
    
    closeFornecedorModal();
    loadFornecedores();
  } catch (error) {
    console.error('Erro ao salvar fornecedor:', error);
    alert('Erro ao salvar o fornecedor. Verifique se o CNPJ não está duplicado.');
  }
}

// Função auxiliar para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

  async function showProdutosModal(fornecedor) {
    produtosFornecedorNome.textContent = fornecedor.nomeEmpresa;
    produtosLista.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';
    produtosModal.classList.remove('hidden');
    
    try {
      const produtos = await apiService.get(API.fornecedores.produtos(fornecedor.idFornecedor));
      
      if (produtos.length === 0) {
        produtosLista.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum produto encontrado</td></tr>';
        return;
      }
      
      let html = '';
      
      produtos.forEach(produto => {
        html += `
          <tr>
            <td>${produto.idProduto}</td>
            <td>${produto.nomeProduto}</td>
            <td>${produto.codigoBarras}</td>
            <td>${produto.categoria || '-'}</td>
            <td>R$ ${produto.precoCompra.toFixed(2)}</td>
          </tr>
        `;
      });
      
      produtosLista.innerHTML = html;
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      produtosLista.innerHTML = '<tr><td colspan="5" class="text-center">Erro ao carregar produtos</td></tr>';
    }
  }
  
  function closeProdutosModal() {
    produtosModal.classList.add('hidden');
  }
  
  function confirmDelete(id) {
    activeFornecedorId = id;
    const fornecedor = fornecedores.find(f => f.idFornecedor === id);
    
    confirmMessage.textContent = `Tem certeza que deseja excluir o fornecedor "${fornecedor.nomeEmpresa}"?`;
    confirmCallback = deleteFornecedor;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function deleteFornecedor() {
    if (!activeFornecedorId) return;
    
    try {
      await apiService.delete(`${API.fornecedores.porId(activeFornecedorId)}?dummy=1`);
      loadFornecedores();
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro ao excluir o fornecedor. Verifique se não há produtos vinculados a ele.');
    }
    
    activeFornecedorId = null;
  }
  
  function confirmRestore(id) {
    activeFornecedorId = id;
    const fornecedor = fornecedores.find(f => f.idFornecedor === id);
    
    confirmMessage.textContent = `Tem certeza que deseja restaurar o fornecedor "${fornecedor.nomeEmpresa}"?`;
    confirmCallback = restoreFornecedor;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function restoreFornecedor() {
    if (!activeFornecedorId) return;
    
    try {
      await apiService.patch(`${API.fornecedores.restaurar(activeFornecedorId)}?dummy=1`);
      loadFornecedoresExcluidos();
    } catch (error) {
      console.error('Erro ao restaurar fornecedor:', error);
      alert('Erro ao restaurar o fornecedor.');
    }
    
    activeFornecedorId = null;
  }
  
  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
    activeFornecedorId = null;
  }
  
  function formatCnpj(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length > 14) {
      cnpj = cnpj.substring(0, 14);
    }
    
    if (cnpj.length > 12) {
      cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    } else if (cnpj.length > 8) {
      cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    } else if (cnpj.length > 5) {
      cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cnpj.length > 2) {
      cnpj = cnpj.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    }
    
    return cnpj;
  }
  
  function formatTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    
    if (telefone.length > 11) {
      telefone = telefone.substring(0, 11);
    }
    
    if (telefone.length > 10) {
      telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length > 6) {
      telefone = telefone.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (telefone.length > 2) {
      telefone = telefone.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }
    
    return telefone;
  }
});