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
  const clientesLista = document.getElementById('clientes-lista');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const btnNovoCliente = document.getElementById('btn-novo-cliente');
  const btnClientesExcluidos = document.getElementById('btn-clientes-excluidos');
  
  // Modais
  const clienteModal = document.getElementById('cliente-modal');
  const clienteModalTitle = document.getElementById('cliente-modal-title');
  const clienteModalClose = document.getElementById('cliente-modal-close');
  const clienteForm = document.getElementById('cliente-form');
  const clienteId = document.getElementById('cliente-id');
  const clienteNome = document.getElementById('cliente-nome');
  const clienteCpf = document.getElementById('cliente-cpf');
  const clienteEmail = document.getElementById('cliente-email');
  const clienteTelefone = document.getElementById('cliente-telefone');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnSalvar = document.getElementById('btn-salvar');
  
  const acessosModal = document.getElementById('acessos-modal');
  const acessosModalClose = document.getElementById('acessos-modal-close');
  const acessosClienteNome = document.getElementById('acessos-cliente-nome');
  const acessosLista = document.getElementById('acessos-lista');
  const btnFecharAcessos = document.getElementById('btn-fechar-acessos');
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalClose = document.getElementById('confirm-modal-close');
  const confirmMessage = document.getElementById('confirm-message');
  const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
  const btnConfirm = document.getElementById('btn-confirm');
  
  // Estado
  let clientes = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let activeClientId = null;
  let confirmCallback = null;
  let viewingDeleted = false;
  
  // Eventos
  btnNovoCliente.addEventListener('click', () => {
    showClienteModal(null);
  });
  
  btnClientesExcluidos.addEventListener('click', () => {
    viewingDeleted = !viewingDeleted;
    if (viewingDeleted) {
      btnClientesExcluidos.innerHTML = '<i class="fas fa-users"></i> Clientes Ativos';
      loadClientesExcluidos();
    } else {
      btnClientesExcluidos.innerHTML = '<i class="fas fa-trash"></i> Clientes Excluídos';
      loadClientes();
    }
  });
  
  btnSearch.addEventListener('click', () => {
    if (searchInput.value.trim()) {
      searchClientes(searchInput.value.trim());
    } else {
      loadClientes();
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });
  
  // Modal Cliente
  clienteModalClose.addEventListener('click', () => closeClienteModal());
  btnCancelar.addEventListener('click', () => closeClienteModal());
  btnSalvar.addEventListener('click', saveCliente);
  
  // Modal Acessos
  acessosModalClose.addEventListener('click', () => closeAcessosModal());
  btnFecharAcessos.addEventListener('click', () => closeAcessosModal());
  
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
  clienteCpf.addEventListener('input', (e) => {
    e.target.value = formatCpf(e.target.value);
  });
  
  // Formatação de telefone
  clienteTelefone.addEventListener('input', (e) => {
    e.target.value = formatTelefone(e.target.value);
  });
  
  // Carregar dados iniciais
  await loadClientes();
  
  // Funções
  async function loadClientes() {
    try {
      clientes = await apiService.get(API.clientes.base);
      renderClientes();
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }
  
  async function loadClientesExcluidos() {
    try {
      clientes = await apiService.get(API.clientes.excluidos);
      renderClientes();
    } catch (error) {
      console.error('Erro ao carregar clientes excluídos:', error);
    }
  }

  // FUNÇÃO DE BUSCA POR CPF OU NOME
  async function searchClientes(searchTerm) {
    try {
      // Remover formatação do CPF para busca
      const cleanCpf = searchTerm.replace(/\D/g, '');
      
      // Verificar se é um CPF (11 dígitos)
      if (cleanCpf.length === 11) {
        // Formatar CPF para o padrão esperado pela API
        const formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        
        try {
          // Buscar por CPF
          const response = await apiService.get(API.clientes.porCpf(formattedCpf));
          // Se encontrou por CPF, mostrar apenas esse cliente
          clientes = response ? [response] : [];
        } catch (error) {
          // Se não encontrou por CPF, tentar buscar por nome
          clientes = await apiService.get(API.clientes.porNome(searchTerm));
        }
      } else {
        // Se não é CPF, buscar por nome
        clientes = await apiService.get(API.clientes.porNome(searchTerm));
      }
      
      // Reset para primeira página ao buscar
      currentPage = 1;
      renderClientes();
      
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      clientes = [];
      renderClientes();
    }
  }
  
  function renderClientes() {
    // Calcular paginação
    totalPages = Math.ceil(clientes.length / itemsPerPage);
    
    // Obter clientes da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClientes = clientes.slice(startIndex, endIndex);
    
    if (currentClientes.length === 0) {
      clientesLista.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">Nenhum cliente encontrado</td>
        </tr>
      `;
      pagination.innerHTML = '';
      return;
    }
    
    let html = '';
    
    currentClientes.forEach(cliente => {
      html += `
        <tr>
          <td>${cliente.idCliente}</td>
          <td>${cliente.nomeCompleto}</td>
          <td>${cliente.cpf}</td>
          <td>${cliente.email || '-'}</td>
          <td>${cliente.telefone || '-'}</td>
          <td>
            ${viewingDeleted ? `
              <button class="action-btn restore-btn" data-id="${cliente.idCliente}" title="Restaurar">
                <i class="fas fa-trash-restore"></i>
              </button>
            ` : `
              <button class="action-btn edit-btn" data-id="${cliente.idCliente}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn" data-id="${cliente.idCliente}" title="Ver Acessos">
                <i class="fas fa-history"></i>
              </button>
              <button class="action-btn delete-btn" data-id="${cliente.idCliente}" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `}
          </td>
        </tr>
      `;
    });
    
    clientesLista.innerHTML = html;
    
    // Adicionar eventos aos botões de ação
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const cliente = clientes.find(c => c.idCliente === id);
        if (cliente) {
          showClienteModal(cliente);
        }
      });
    });
    
    document.querySelectorAll('.action-btn[title="Ver Acessos"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const cliente = clientes.find(c => c.idCliente === id);
        if (cliente) {
          showAcessosModal(cliente);
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
          renderClientes();
        }
      });
    });
  }
  
  // FUNÇÃO SALVAR CLIENTE CORRIGIDA
  async function saveCliente() {
    // Validação 1: Nome (obrigatório)
    if (!clienteNome.value.trim()) {
      alert('Adicione o nome completo do cliente.');
      clienteNome.focus();
      return;
    }

    // Validação 2: CPF (obrigatório)
    if (!clienteCpf.value.trim()) {
      alert('Adicione o CPF do cliente.');
      clienteCpf.focus();
      return;
    }

    // Validação 3: Formato do CPF
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(clienteCpf.value)) {
      alert('CPF deve estar no formato 000.000.000-00.');
      clienteCpf.focus();
      return;
    }

    // Validação 4: Telefone (obrigatório)
    if (!clienteTelefone.value.trim()) {
      alert('Adicione o telefone do cliente.');
      clienteTelefone.focus();
      return;
    }

    // Validação 5: Formato do telefone
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!telefoneRegex.test(clienteTelefone.value)) {
      alert('Telefone deve estar no formato (00) 00000-0000.');
      clienteTelefone.focus();
      return;
    }

    // Validação 6: Email (opcional, mas se preenchido deve ser válido)
    if (clienteEmail.value.trim() && !isValidEmail(clienteEmail.value.trim())) {
      alert('Digite um email válido.');
      clienteEmail.focus();
      return;
    }

    // Montar objeto para envio
    const formData = {
      nomeCompleto: clienteNome.value.trim(),
      cpf: clienteCpf.value.trim(),
      email: clienteEmail.value.trim() || null,
      telefone: clienteTelefone.value.trim()
    };

    try {
      let response;
      
      if (clienteId.value) {
        // Editar cliente existente
        response = await apiService.put(API.clientes.porId(clienteId.value), formData);
      } else {
        // Criar novo cliente
        response = await apiService.post(API.clientes.base, formData);
      }
      
      closeClienteModal();
      
      // Se estava em modo de busca, refazer a busca para atualizar
      if (searchInput.value.trim()) {
        searchClientes(searchInput.value.trim());
      } else {
        loadClientes();
      }
      
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      
      // Tratamento de erros específicos
      if (error.message && error.message.includes('409')) {
        alert('CPF ou email já cadastrados no sistema.');
      } else if (error.message && error.message.includes('400')) {
        alert('Erro de validação. Verifique se todos os campos obrigatórios estão preenchidos corretamente.');
      } else {
        alert('Erro ao salvar o cliente. Por favor, tente novamente.');
      }
    }
  }

  // Função auxiliar para validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showClienteModal(cliente) {
    clienteForm.reset();
    
    if (cliente) {
      clienteModalTitle.textContent = 'Editar Cliente';
      clienteId.value = cliente.idCliente;
      clienteNome.value = cliente.nomeCompleto;
      clienteCpf.value = cliente.cpf;
      clienteEmail.value = cliente.email || '';
      clienteTelefone.value = cliente.telefone || '';
    } else {
      clienteModalTitle.textContent = 'Novo Cliente';
      clienteId.value = '';
    }
    
    clienteModal.classList.remove('hidden');
  }
  
  function closeClienteModal() {
    clienteModal.classList.add('hidden');
  }
  
  async function showAcessosModal(cliente) {
    acessosClienteNome.textContent = cliente.nomeCompleto;
    acessosLista.innerHTML = '<tr><td colspan="3" class="text-center">Carregando...</td></tr>';
    acessosModal.classList.remove('hidden');
    
    try {
      const acessos = await apiService.get(API.clientes.acessos(cliente.idCliente));
      
      if (acessos.length === 0) {
        acessosLista.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum acesso registrado</td></tr>';
        return;
      }
      
      let html = '';
      
      acessos.forEach(acesso => {
        const data = new Date(acesso.dataHoraAcesso).toLocaleDateString('pt-BR');
        const hora = new Date(acesso.dataHoraAcesso).toLocaleTimeString('pt-BR');
        
        html += `
          <tr>
            <td>${data} ${hora}</td>
            <td>${acesso.acaoRealizada || '-'}</td>
            <td>${acesso.ipDispositivo || '-'}</td>
          </tr>
        `;
      });
      
      acessosLista.innerHTML = html;
    } catch (error) {
      console.error('Erro ao carregar acessos:', error);
      acessosLista.innerHTML = '<tr><td colspan="3" class="text-center">Erro ao carregar acessos</td></tr>';
    }
  }
  
  function closeAcessosModal() {
    acessosModal.classList.add('hidden');
  }
  
  function confirmDelete(id) {
    activeClientId = id;
    const cliente = clientes.find(c => c.idCliente === id);
    
    confirmMessage.textContent = `Tem certeza que deseja excluir o cliente "${cliente.nomeCompleto}"?`;
    confirmCallback = deleteCliente;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function deleteCliente() {
    if (!activeClientId) return;
    
    try {
      await apiService.delete(API.clientes.porId(activeClientId));
      loadClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir o cliente.');
    }
    
    activeClientId = null;
  }
  
  function confirmRestore(id) {
    activeClientId = id;
    const cliente = clientes.find(c => c.idCliente === id);
    
    confirmMessage.textContent = `Tem certeza que deseja restaurar o cliente "${cliente.nomeCompleto}"?`;
    confirmCallback = restoreCliente;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function restoreCliente() {
    if (!activeClientId) return;
    
    try {
      await apiService.patch(API.clientes.restaurar(activeClientId));
      loadClientesExcluidos();
    } catch (error) {
      console.error('Erro ao restaurar cliente:', error);
      alert('Erro ao restaurar o cliente.');
    }
    
    activeClientId = null;
  }
  
  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
    activeClientId = null;
  }
  
  function formatCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11);
    }
    
    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
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
});