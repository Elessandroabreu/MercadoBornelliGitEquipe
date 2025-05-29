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
  const funcionariosLista = document.getElementById('funcionarios-lista');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const filterCargo = document.getElementById('filter-cargo');
  const filterStatus = document.getElementById('filter-status');
  const btnNovoFuncionario = document.getElementById('btn-novo-funcionario');
  const btnFuncionariosExcluidos = document.getElementById('btn-funcionarios-excluidos');
  
  // Modais
  const funcionarioModal = document.getElementById('funcionario-modal');
  const funcionarioModalTitle = document.getElementById('funcionario-modal-title');
  const funcionarioModalClose = document.getElementById('funcionario-modal-close');
  const funcionarioForm = document.getElementById('funcionario-form');
  const funcionarioId = document.getElementById('funcionario-id');
  const funcionarioNome = document.getElementById('funcionario-nome');
  const funcionarioCpf = document.getElementById('funcionario-cpf');
  const funcionarioEmail = document.getElementById('funcionario-email');
  const funcionarioTelefone = document.getElementById('funcionario-telefone');
  const funcionarioCargo = document.getElementById('funcionario-cargo');
  const funcionarioStatus = document.getElementById('funcionario-status');
  const funcionarioDataAdmissao = document.getElementById('funcionario-data-admissao');
  const funcionarioSalario = document.getElementById('funcionario-salario');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnSalvar = document.getElementById('btn-salvar');
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalClose = document.getElementById('confirm-modal-close');
  const confirmMessage = document.getElementById('confirm-message');
  const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
  const btnConfirm = document.getElementById('btn-confirm');
  
  // Estado
  let funcionarios = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let activeFuncionarioId = null;
  let confirmCallback = null;
  let viewingDeleted = false;
  
  // Eventos
  btnNovoFuncionario.addEventListener('click', () => {
    showFuncionarioModal(null);
  });
  
  btnFuncionariosExcluidos.addEventListener('click', () => {
    viewingDeleted = !viewingDeleted;
    if (viewingDeleted) {
      btnFuncionariosExcluidos.innerHTML = '<i class="fas fa-user-tie"></i> Funcionários Ativos';
      loadFuncionariosExcluidos();
    } else {
      btnFuncionariosExcluidos.innerHTML = '<i class="fas fa-trash"></i> Funcionários Excluídos';
      loadFuncionarios();
    }
  });
  
  btnSearch.addEventListener('click', () => {
    if (searchInput.value.trim()) {
      searchFuncionarios(searchInput.value.trim());
    } else {
      loadFuncionarios();
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });
  
  filterCargo.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);
  
  // Modal Funcionário
  funcionarioModalClose.addEventListener('click', () => closeFuncionarioModal());
  btnCancelar.addEventListener('click', () => closeFuncionarioModal());
  btnSalvar.addEventListener('click', saveFuncionario);
  
  // Modal Confirmação
  confirmModalClose.addEventListener('click', () => closeConfirmModal());
  btnCancelConfirm.addEventListener('click', () => closeConfirmModal());
  btnConfirm.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
    }
    closeConfirmModal();
  });
  
  // Formatação de CPF
  funcionarioCpf.addEventListener('input', (e) => {
    e.target.value = formatCpf(e.target.value);
  });
  
  // Formatação de telefone
  funcionarioTelefone.addEventListener('input', (e) => {
    e.target.value = formatTelefone(e.target.value);
  });
  
  // Inicialização da data de admissão para hoje
  funcionarioDataAdmissao.valueAsDate = new Date();
  
  // Carregar dados iniciais
  await loadFuncionarios();
  
  // Funções
  async function loadFuncionarios() {
    try {
      funcionarios = await apiService.get(API.funcionarios.base);
      renderFuncionarios();
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  }
  
  async function loadFuncionariosExcluidos() {
    try {
      funcionarios = await apiService.get(API.funcionarios.excluidos);
      renderFuncionarios();
    } catch (error) {
      console.error('Erro ao carregar funcionários excluídos:', error);
    }
  }
  
  function renderFuncionarios() {
    // Aplicar filtros
    const filteredFuncionarios = funcionarios.filter(funcionario => {
      // Filtro de cargo
      if (filterCargo.value && funcionario.cargo !== filterCargo.value) {
        return false;
      }
      
      // Filtro de status
      if (filterStatus.value && funcionario.status !== filterStatus.value) {
        return false;
      }
      
      return true;
    });
    
    // Calcular paginação
    totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage);
    
    // Obter funcionários da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFuncionarios = filteredFuncionarios.slice(startIndex, endIndex);
    
    if (currentFuncionarios.length === 0) {
      funcionariosLista.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">Nenhum funcionário encontrado</td>
        </tr>
      `;
      pagination.innerHTML = '';
      return;
    }
    
    let html = '';
    
    currentFuncionarios.forEach(funcionario => {
      html += `
        <tr>
          <td>${funcionario.idFuncionario}</td>
          <td>${funcionario.nomeCompleto}</td>
          <td>${funcionario.cpf}</td>
          <td>${funcionario.email || '-'}</td>
          <td>${funcionario.telefone || '-'}</td>
          <td>${formatarCargo(funcionario.cargo)}</td>
          <td><span class="status ${getStatusClass(funcionario.status)}">${formatarStatus(funcionario.status)}</span></td>
          <td>
            ${viewingDeleted ? `
              <button class="action-btn restore-btn" data-id="${funcionario.idFuncionario}" title="Restaurar">
                <i class="fas fa-trash-restore"></i>
              </button>
            ` : `
              <button class="action-btn edit-btn" data-id="${funcionario.idFuncionario}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete-btn" data-id="${funcionario.idFuncionario}" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `}
          </td>
        </tr>
      `;
    });
    
    funcionariosLista.innerHTML = html;
    
    // Adicionar eventos aos botões de ação
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const funcionario = funcionarios.find(f => f.idFuncionario === id);
        if (funcionario) {
          showFuncionarioModal(funcionario);
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
          renderFuncionarios();
        }
      });
    });
  }
  
  async function searchFuncionarios(query) {
    try {
      // Verificar se é um CPF
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (cpfRegex.test(query)) {
        try {
          const funcionarioPorCpf = await apiService.get(API.funcionarios.porCpf(query));
          funcionarios = [funcionarioPorCpf];
        } catch (error) {
          funcionarios = [];
        }
      } else {
        // Buscar por nome
        funcionarios = await apiService.get(API.funcionarios.porNome(query));
      }
      
      renderFuncionarios();
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      funcionarios = [];
      renderFuncionarios();
    }
  }
  
  function applyFilters() {
    renderFuncionarios();
  }
  
  function showFuncionarioModal(funcionario) {
    funcionarioForm.reset();
    funcionarioDataAdmissao.valueAsDate = new Date(); // Default para hoje
    
    if (funcionario) {
      funcionarioModalTitle.textContent = 'Editar Funcionário';
      funcionarioId.value = funcionario.idFuncionario;
      funcionarioNome.value = funcionario.nomeCompleto;
      funcionarioCpf.value = funcionario.cpf;
      funcionarioEmail.value = funcionario.email || '';
      funcionarioTelefone.value = funcionario.telefone || '';
      funcionarioCargo.value = funcionario.cargo;
      funcionarioStatus.value = funcionario.status;
      funcionarioDataAdmissao.value = formatarDataParaInput(funcionario.dataAdmissao);
      funcionarioSalario.value = funcionario.salario.toFixed(2);
    } else {
      funcionarioModalTitle.textContent = 'Novo Funcionário';
      funcionarioId.value = '';
      funcionarioStatus.value = 'ATIVO'; // Default para Ativo
    }
    
    funcionarioModal.classList.remove('hidden');
  }
  
  function closeFuncionarioModal() {
    funcionarioModal.classList.add('hidden');
  }
  
  async function saveFuncionario() {
  // Validação sequencial
  if (!funcionarioNome.value.trim()) {
    alert('Erro ao cadastrar funcionário. Digite o nome completo.');
    funcionarioNome.focus();
    return;
  }

  if (!funcionarioCpf.value.trim()) {
    alert('Digite o CPF do funcionário.');
    funcionarioCpf.focus();
    return;
  }

  // Validar formato do CPF
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!cpfRegex.test(funcionarioCpf.value)) {
    alert('Digite um CPF válido no formato 000.000.000-00.');
    funcionarioCpf.focus();
    return;
  }

  // Validar email (opcional, mas validado quando preenchido)
  if (funcionarioEmail.value.trim() && !isValidEmail(funcionarioEmail.value.trim())) {
    alert('Digite um email válido.');
    funcionarioEmail.focus();
    return;
  }

  if (!funcionarioTelefone.value.trim()) {
    alert('Digite o telefone do funcionário.');
    funcionarioTelefone.focus();
    return;
  }

  // Validar formato do telefone
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!telefoneRegex.test(funcionarioTelefone.value)) {
    alert('Digite um telefone válido no formato (00) 00000-0000.');
    funcionarioTelefone.focus();
    return;
  }

  if (!funcionarioCargo.value) {
    alert('Selecione o cargo do funcionário.');
    funcionarioCargo.focus();
    return;
  }

  if (!funcionarioStatus.value) {
    alert('Selecione o status do funcionário.');
    funcionarioStatus.focus();
    return;
  }

  if (!funcionarioDataAdmissao.value) {
    alert('Informe a data de admissão do funcionário.');
    funcionarioDataAdmissao.focus();
    return;
  }

  if (!funcionarioSalario.value || isNaN(parseFloat(funcionarioSalario.value)) || parseFloat(funcionarioSalario.value) <= 0) {
    alert('Digite um salário válido maior que zero.');
    funcionarioSalario.focus();
    return;
  }

  const formData = {
    nomeCompleto: funcionarioNome.value,
    cpf: funcionarioCpf.value,
    email: funcionarioEmail.value,
    telefone: funcionarioTelefone.value,
    cargo: funcionarioCargo.value,
    status: funcionarioStatus.value,
    dataAdmissao: funcionarioDataAdmissao.value,
    salario: parseFloat(funcionarioSalario.value) || 0
  };
  
  try {
    if (funcionarioId.value) {
      // Editar funcionário existente
      await apiService.put(API.funcionarios.porId(funcionarioId.value), formData);
    } else {
      // Criar novo funcionário
      await apiService.post(API.funcionarios.base, formData);
    }
    
    closeFuncionarioModal();
    loadFuncionarios();
  } catch (error) {
    console.error('Erro ao salvar funcionário:', error);
    alert('Erro ao salvar o funcionário. Verifique se o CPF não está duplicado.');
  }
}
 

// Função auxiliar para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function confirmDelete(id) {
  activeFuncionarioId = id;
  const funcionario = funcionarios.find(f => f.idFuncionario === id);
  
  confirmMessage.textContent = `Tem certeza que deseja excluir o funcionário "${funcionario.nomeCompleto}"?`;
  confirmCallback = deleteFuncionario;
  
  confirmModal.classList.remove('hidden');
}
  
  async function deleteFuncionario() {
    if (!activeFuncionarioId) return;
    
    try {
      await apiService.delete(API.funcionarios.porId(activeFuncionarioId));
      loadFuncionarios();
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      alert('Erro ao excluir o funcionário.');
    }
    
    activeFuncionarioId = null;
  }
  
  function confirmRestore(id) {
    activeFuncionarioId = id;
    const funcionario = funcionarios.find(f => f.idFuncionario === id);
    
    confirmMessage.textContent = `Tem certeza que deseja restaurar o funcionário "${funcionario.nomeCompleto}"?`;
    confirmCallback = restoreFuncionario;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function restoreFuncionario() {
    if (!activeFuncionarioId) return;
    
    try {
      await apiService.patch(API.funcionarios.restaurar(activeFuncionarioId));
      loadFuncionariosExcluidos();
    } catch (error) {
      console.error('Erro ao restaurar funcionário:', error);
      alert('Erro ao restaurar o funcionário.');
    }
    
    activeFuncionarioId = null;
  }
  
  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
    activeFuncionarioId = null;
  }
  
  // Funções auxiliares
  function formatCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11);
    }
    
    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    
    return cpf;
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
  
  function formatarCargo(cargo) {
    switch (cargo) {
      case 'GERENTE':
        return 'Gerente';
      case 'ATENDENTE':
        return 'Atendente';
      case 'CAIXA':
        return 'Caixa';
      case 'ESTOQUISTA':
        return 'Estoquista';
      case 'ADMIN':
        return 'Administrador';
      default:
        return cargo;
    }
  }
  
  function formatarStatus(status) {
    switch (status) {
      case 'ATIVO':
        return 'Ativo';
      case 'FERIAS':
        return 'Férias';
      case 'LICENCA':
        return 'Licença';
      default:
        return status;
    }
  }
  
  function getStatusClass(status) {
    switch (status) {
      case 'ATIVO':
        return 'status-active';
      case 'FERIAS':
        return 'status-pending';
      case 'LICENCA':
        return 'status-inactive';
      default:
        return '';
    }
  }
  
  function formatarDataParaInput(dataString) {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    return data.toISOString().split('T')[0];
  }
});