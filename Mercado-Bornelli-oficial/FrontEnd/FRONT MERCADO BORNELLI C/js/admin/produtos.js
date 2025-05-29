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
  const produtosLista = document.getElementById('produtos-lista');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const filterCategoria = document.getElementById('filter-categoria');
  const filterFornecedor = document.getElementById('filter-fornecedor');
  const btnNovoProduto = document.getElementById('btn-novo-produto');
  const btnProdutosExcluidos = document.getElementById('btn-produtos-excluidos');
  const btnEstoqueBaixo = document.getElementById('btn-estoque-baixo');
  
  // Modais
  const produtoModal = document.getElementById('produto-modal');
  const produtoModalTitle = document.getElementById('produto-modal-title');
  const produtoModalClose = document.getElementById('produto-modal-close');
  const produtoForm = document.getElementById('produto-form');
  const produtoId = document.getElementById('produto-id');
  const produtoNome = document.getElementById('produto-nome');
  const produtoCodigo = document.getElementById('produto-codigo');
  const produtoCategoria = document.getElementById('produto-categoria');
  const produtoEstoque = document.getElementById('produto-estoque');
  const produtoPrecoCompra = document.getElementById('produto-preco-compra');
  const produtoPrecoVenda = document.getElementById('produto-preco-venda');
  const produtoFornecedor = document.getElementById('produto-fornecedor');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnSalvar = document.getElementById('btn-salvar');
  
  const estoqueModal = document.getElementById('estoque-modal');
  const estoqueModalClose = document.getElementById('estoque-modal-close');
  const estoqueProdutoNome = document.getElementById('estoque-produto-nome');
  const estoqueAtual = document.getElementById('estoque-atual');
  const estoqueQuantidade = document.getElementById('estoque-quantidade');
  const btnCancelarEstoque = document.getElementById('btn-cancelar-estoque');
  const btnAtualizarEstoque = document.getElementById('btn-atualizar-estoque');
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalClose = document.getElementById('confirm-modal-close');
  const confirmMessage = document.getElementById('confirm-message');
  const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
  const btnConfirm = document.getElementById('btn-confirm');
  
  // Estado
  let produtos = [];
  let fornecedores = [];
  let categorias = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let activeProductId = null;
  let confirmCallback = null;
  let viewingDeleted = false;
  
  // Eventos
  btnNovoProduto.addEventListener('click', () => {
    showProdutoModal(null);
  });
  
  btnProdutosExcluidos.addEventListener('click', () => {
    viewingDeleted = !viewingDeleted;
    if (viewingDeleted) {
      btnProdutosExcluidos.innerHTML = '<i class="fas fa-box"></i> Produtos Ativos';
      loadProdutosExcluidos();
    } else {
      btnProdutosExcluidos.innerHTML = '<i class="fas fa-trash"></i> Produtos Excluídos';
      loadProdutos();
    }
  });
  
  btnEstoqueBaixo.addEventListener('click', () => {
    loadProdutosEstoqueBaixo();
  });
  
  btnSearch.addEventListener('click', () => {
    if (searchInput.value.trim()) {
      searchProdutos(searchInput.value.trim());
    } else {
      loadProdutos();
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });
  
  filterCategoria.addEventListener('change', applyFilters);
  filterFornecedor.addEventListener('change', applyFilters);
  
  // Modal Produto
  produtoModalClose.addEventListener('click', () => closeProdutoModal());
  btnCancelar.addEventListener('click', () => closeProdutoModal());
  btnSalvar.addEventListener('click', saveProduto);
  
  // Modal Estoque
  estoqueModalClose.addEventListener('click', () => closeEstoqueModal());
  btnCancelarEstoque.addEventListener('click', () => closeEstoqueModal());
  btnAtualizarEstoque.addEventListener('click', updateEstoque);
  
  // Modal Confirmação
  confirmModalClose.addEventListener('click', () => closeConfirmModal());
  btnCancelConfirm.addEventListener('click', () => closeConfirmModal());
  btnConfirm.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
    }
    closeConfirmModal();
  });
  
  // Carregar dados iniciais
  await loadFornecedores();
  await loadProdutos();
  
  // Funções
  async function loadProdutos() {
    try {
      produtos = await apiService.get(API.produtos.base);
      updateCategorias();
      renderProdutos();
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }
  
  async function loadProdutosExcluidos() {
    try {
      produtos = await apiService.get(API.produtos.excluidos);
      renderProdutos();
    } catch (error) {
      console.error('Erro ao carregar produtos excluídos:', error);
    }
  }
  
  async function loadProdutosEstoqueBaixo() {
    try {
      produtos = await apiService.get(API.produtos.estoqueBaixo(10));
      renderProdutos();
    } catch (error) {
      console.error('Erro ao carregar produtos com estoque baixo:', error);
    }
  }
  
  async function loadFornecedores() {
    try {
      fornecedores = await apiService.get(API.fornecedores.base);
      populateFornecedoresSelect();
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  }
  
  function updateCategorias() {
    // Extrair categorias únicas dos produtos
    const categoriasSet = new Set();
    produtos.forEach(produto => {
      if (produto.categoria) {
        categoriasSet.add(produto.categoria);
      }
    });
    
    categorias = Array.from(categoriasSet).sort();
    populateCategoriasSelect();
  }
  
  function populateFornecedoresSelect() {
    let options = '<option value="">Selecione um fornecedor</option>';
    
    fornecedores.forEach(fornecedor => {
      options += `<option value="${fornecedor.idFornecedor}">${fornecedor.nomeEmpresa}</option>`;
    });
    
    produtoFornecedor.innerHTML = options;
    
    // Popular também o select de filtro
    options = '<option value="">Todos os fornecedores</option>';
    fornecedores.forEach(fornecedor => {
      options += `<option value="${fornecedor.idFornecedor}">${fornecedor.nomeEmpresa}</option>`;
    });
    filterFornecedor.innerHTML = options;
  }
  
  function populateCategoriasSelect() {
    let options = '<option value="">Todas as categorias</option>';
    
    categorias.forEach(categoria => {
      options += `<option value="${categoria}">${categoria}</option>`;
    });
    
    filterCategoria.innerHTML = options;
  }
  
  function renderProdutos() {
    // Aplicar filtros
    const filteredProdutos = produtos.filter(produto => {
      // Filtro de categoria
      if (filterCategoria.value && produto.categoria !== filterCategoria.value) {
        return false;
      }
      
      // Filtro de fornecedor
      if (filterFornecedor.value && produto.idFornecedor != filterFornecedor.value) {
        return false;
      }
      
      return true;
    });
    
    // Calcular paginação
    totalPages = Math.ceil(filteredProdutos.length / itemsPerPage);
    
    // Obter produtos da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProdutos = filteredProdutos.slice(startIndex, endIndex);
    
    if (currentProdutos.length === 0) {
      produtosLista.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">Nenhum produto encontrado</td>
        </tr>
      `;
      pagination.innerHTML = '';
      return;
    }
    
    let html = '';
    
    currentProdutos.forEach(produto => {
      html += `
        <tr>
          <td>${produto.idProduto}</td>
          <td>${produto.nomeProduto}</td>
          <td>${produto.codigoBarras}</td>
          <td>${produto.categoria || '-'}</td>
          <td>R$ ${produto.precoCompra.toFixed(2)}</td>
          <td>R$ ${produto.precoVenda.toFixed(2)}</td>
          <td>${produto.quantidadeEstoque} ${produto.quantidadeEstoque <= 10 ? '<span class="status status-pending">Baixo</span>' : ''}</td>
          <td>${produto.nomeFornecedor || '-'}</td>
          <td>
            ${viewingDeleted ? `
              <button class="action-btn restore-btn" data-id="${produto.idProduto}" title="Restaurar">
                <i class="fas fa-trash-restore"></i>
              </button>
            ` : `
              <button class="action-btn edit-btn" data-id="${produto.idProduto}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn" data-id="${produto.idProduto}" title="Atualizar Estoque">
                <i class="fas fa-boxes"></i>
              </button>
              <button class="action-btn delete-btn" data-id="${produto.idProduto}" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            `}
          </td>
        </tr>
      `;
    });
    
    produtosLista.innerHTML = html;
    
    // Adicionar eventos aos botões de ação
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const produto = produtos.find(p => p.idProduto === id);
        if (produto) {
          showProdutoModal(produto);
        }
      });
    });
    
    document.querySelectorAll('.action-btn[title="Atualizar Estoque"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const produto = produtos.find(p => p.idProduto === id);
        if (produto) {
          showEstoqueModal(produto);
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
          renderProdutos();
        }
      });
    });
  }
  
  async function searchProdutos(query) {
    try {
      // Tentar buscar pelo código de barras
      try {
        const produtoPorCodigo = await apiService.get(API.produtos.porCodigo(query));
        produtos = [produtoPorCodigo];
      } catch (error) {
        // Se não encontrar por código, buscar por nome
        produtos = await apiService.get(API.produtos.porNome(query));
      }
      
      renderProdutos();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      produtos = [];
      renderProdutos();
    }
  }
  
  function applyFilters() {
    renderProdutos();
  }
  
  function showProdutoModal(produto) {
    produtoForm.reset();
    
    if (produto) {
      produtoModalTitle.textContent = 'Editar Produto';
      produtoId.value = produto.idProduto;
      produtoNome.value = produto.nomeProduto;
      produtoCodigo.value = produto.codigoBarras;
      produtoCategoria.value = produto.categoria || '';
      produtoEstoque.value = produto.quantidadeEstoque;
      produtoPrecoCompra.value = produto.precoCompra;
      produtoPrecoVenda.value = produto.precoVenda;
      produtoFornecedor.value = produto.idFornecedor || '';
    } else {
      produtoModalTitle.textContent = 'Novo Produto';
      produtoId.value = '';
    }
    
    produtoModal.classList.remove('hidden');
  }
  
  function closeProdutoModal() {
    produtoModal.classList.add('hidden');
  }
  
  async function saveProduto() {
  // Validação sequencial
  if (!produtoNome.value.trim()) {
    alert('Erro ao cadastrar produto. Digite o nome do produto.');
    produtoNome.focus();
    return;
  }

  if (!produtoCodigo.value.trim()) {
    alert('Digite o código de barras.');
    produtoCodigo.focus();
    return;
  }

  if (!produtoCategoria.value.trim()) {
    alert('Digite a categoria do produto.');
    produtoCategoria.focus();
    return;
  }

  if (!produtoEstoque.value || isNaN(parseInt(produtoEstoque.value))) {
    alert('Digite a quantidade em estoque.');
    produtoEstoque.focus();
    return;
  }

  if (!produtoPrecoCompra.value || isNaN(parseFloat(produtoPrecoCompra.value)) || parseFloat(produtoPrecoCompra.value) <= 0) {
    alert('Digite um preço de compra válido.');
    produtoPrecoCompra.focus();
    return;
  }
  
  if (!produtoPrecoVenda.value || isNaN(parseFloat(produtoPrecoVenda.value)) || parseFloat(produtoPrecoVenda.value) <= 0) {
    alert('Digite um preço de venda válido.');
    produtoPrecoVenda.focus();
    return;
  }

  const formData = {
    nomeProduto: produtoNome.value,
    codigoBarras: produtoCodigo.value,
    categoria: produtoCategoria.value,
    quantidadeEstoque: parseInt(produtoEstoque.value) || 0,
    precoCompra: parseFloat(produtoPrecoCompra.value) || 0,
    precoVenda: parseFloat(produtoPrecoVenda.value) || 0,
    idFornecedor: produtoFornecedor.value || null
  };
  
  try {
    if (produtoId.value) {
      // Editar produto existente
      await apiService.put(API.produtos.porId(produtoId.value), formData);
    } else {
      // Criar novo produto
      await apiService.post(API.produtos.base, formData);
    }
    
    closeProdutoModal();
    loadProdutos();
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar o produto. Verifique se o código de barras não está duplicado.');
  }
}
  
  function showEstoqueModal(produto) {
    activeProductId = produto.idProduto;
    estoqueProdutoNome.textContent = produto.nomeProduto;
    estoqueAtual.textContent = produto.quantidadeEstoque;
    estoqueQuantidade.value = 0;
    
    estoqueModal.classList.remove('hidden');
  }
  
  function closeEstoqueModal() {
    estoqueModal.classList.add('hidden');
    activeProductId = null;
  }
  
  async function updateEstoque() {
    if (!activeProductId) return;
    
    const quantidade = parseInt(estoqueQuantidade.value) || 0;
    
    if (quantidade === 0) {
      closeEstoqueModal();
      return;
    }
    
    try {
      await apiService.patch(API.produtos.atualizarEstoque(activeProductId, quantidade));
      closeEstoqueModal();
      loadProdutos();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      alert('Erro ao atualizar o estoque.');
    }
  }
  
  function confirmDelete(id) {
    activeProductId = id;
    const produto = produtos.find(p => p.idProduto === id);
    
    confirmMessage.textContent = `Tem certeza que deseja excluir o produto "${produto.nomeProduto}"?`;
    confirmCallback = deleteProduto;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function deleteProduto() {
    if (!activeProductId) return;
    
    try {
      await apiService.delete(API.produtos.porId(activeProductId));
      loadProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir o produto.');
    }
    
    activeProductId = null;
  }
  
  function confirmRestore(id) {
    activeProductId = id;
    const produto = produtos.find(p => p.idProduto === id);
    
    confirmMessage.textContent = `Tem certeza que deseja restaurar o produto "${produto.nomeProduto}"?`;
    confirmCallback = restoreProduto;
    
    confirmModal.classList.remove('hidden');
  }
  
  async function restoreProduto() {
    if (!activeProductId) return;
    
    try {
      await apiService.patch(API.produtos.restaurar(activeProductId));
      loadProdutosExcluidos();
    } catch (error) {
      console.error('Erro ao restaurar produto:', error);
      alert('Erro ao restaurar o produto.');
    }
    
    activeProductId = null;
  }
  
  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
    activeProductId = null;
  }
});
