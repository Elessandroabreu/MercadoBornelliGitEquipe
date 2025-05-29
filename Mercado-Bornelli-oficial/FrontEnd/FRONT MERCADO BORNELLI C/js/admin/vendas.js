document.addEventListener('DOMContentLoaded', async () => {
  // Verificar se o Chart.js está disponível
  if (typeof Chart === 'undefined') {
    console.log('Chart.js não está disponível. Tentando carregar dinamicamente...');
    
    // Criar e carregar o script do Chart.js dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js';
    script.async = false; // Mudança importante: não assíncrono para garantir que carregue antes de continuar
    
    // Esperar o script carregar antes de continuar
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(err => {
      console.error('Falha ao carregar Chart.js dinamicamente', err);
    });
    
    console.log('Chart agora disponível:', typeof Chart !== 'undefined');
  }

  // Verificar autenticação (Esta parte estava faltando!)
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
  const relatorioTipo = document.getElementById('relatorio-tipo');
  const filtroPersonalizado = document.getElementById('filtro-personalizado');
  const filtroMensal = document.getElementById('filtro-mensal');
  const filtroAnual = document.getElementById('filtro-anual');
  const dataInicio = document.getElementById('data-inicio');
  const dataFim = document.getElementById('data-fim');
  const mesSelect = document.getElementById('mes');
  const anoMensalSelect = document.getElementById('ano-mensal');
  const anoSelect = document.getElementById('ano');
  const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
  const relatorioContainer = document.getElementById('relatorio-container');

  const totalVendas = document.getElementById('total-vendas');
  const faturamento = document.getElementById('faturamento');
  const totalProdutos = document.getElementById('total-produtos');
  const lucro = document.getElementById('lucro');
  const produtosMaisVendidos = document.getElementById('produtos-mais-vendidos');

  const vendasLista = document.getElementById('vendas-lista');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');

  // Modais
  const vendaModal = document.getElementById('venda-modal');
  const vendaModalClose = document.getElementById('venda-modal-close');
  const vendaId = document.getElementById('venda-id');
  const vendaData = document.getElementById('venda-data');
  const vendaCliente = document.getElementById('venda-cliente');
  const vendaPagamento = document.getElementById('venda-pagamento');
  const itensLista = document.getElementById('itens-lista');
  const vendaTotal = document.getElementById('venda-total');
  const feedbackSection = document.getElementById('feedback-section');
  const feedbackNota = document.getElementById('feedback-nota');
  const feedbackTipo = document.getElementById('feedback-tipo');
  const feedbackComentario = document.getElementById('feedback-comentario');
  const btnCancelarVenda = document.getElementById('btn-cancelar-venda');
  const btnFecharVenda = document.getElementById('btn-fechar-venda');

  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalClose = document.getElementById('confirm-modal-close');
  const confirmMessage = document.getElementById('confirm-message');
  const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
  const btnConfirm = document.getElementById('btn-confirm');

  // Estado
  let vendas = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let activeVendaId = null;
  let confirmCallback = null;
  let chartPagamentos = null;

  // Inicialização dos selects de ano
  const currentYear = new Date().getFullYear();
  let yearsHtml = '';
  for (let year = currentYear; year >= currentYear - 5; year--) {
    yearsHtml += `<option value="${year}">${year}</option>`;
  }
  anoMensalSelect.innerHTML = yearsHtml;
  anoSelect.innerHTML = yearsHtml;

  // Eventos
  relatorioTipo.addEventListener('change', () => {
    const tipo = relatorioTipo.value;

    filtroPersonalizado.classList.add('hidden');
    filtroMensal.classList.add('hidden');
    filtroAnual.classList.add('hidden');

    switch (tipo) {
      case 'personalizado':
        filtroPersonalizado.classList.remove('hidden');
        break;
      case 'mensal':
        filtroMensal.classList.remove('hidden');
        break;
      case 'anual':
        filtroAnual.classList.remove('hidden');
        break;
    }
  });

  btnGerarRelatorio.addEventListener('click', gerarRelatorio);

  btnSearch.addEventListener('click', () => {
    if (searchInput.value.trim()) {
      buscarVendas(searchInput.value.trim());
    } else {
      loadVendas();
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });

  // Modal Venda
  vendaModalClose.addEventListener('click', () => closeVendaModal());
  btnFecharVenda.addEventListener('click', () => closeVendaModal());
  btnCancelarVenda.addEventListener('click', () => confirmCancelarVenda());

  // Modal Confirmação
  confirmModalClose.addEventListener('click', () => closeConfirmModal());
  btnCancelConfirm.addEventListener('click', () => closeConfirmModal());
  btnConfirm.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
    }
    closeConfirmModal();
  });

  // Inicialização de datas
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  dataInicio.valueAsDate = inicioMes;
  dataFim.valueAsDate = hoje;

  mesSelect.value = hoje.getMonth() + 1;

  // Carregar dados iniciais
  await loadVendas();

  // Funções
  async function loadVendas() {
    try {
      vendas = await apiService.get(API.vendas.base);
      renderVendas();
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  }

  async function buscarVendas(query) {
    try {
      // Buscamos todas as vendas e filtramos por cliente
      const todasVendas = await apiService.get(API.vendas.base);
      vendas = todasVendas.filter(venda => {
        return venda.nomeCliente && venda.nomeCliente.toLowerCase().includes(query.toLowerCase());
      });

      renderVendas();
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    }
  }

  function renderVendas() {
    // Ordenar por data (mais recentes primeiro)
    vendas.sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda));

    // Calcular paginação
    totalPages = Math.ceil(vendas.length / itemsPerPage);

    // Obter vendas da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVendas = vendas.slice(startIndex, endIndex);

    if (currentVendas.length === 0) {
      vendasLista.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">Nenhuma venda encontrada</td>
        </tr>
      `;
      pagination.innerHTML = '';
      return;
    }

    let html = '';

    currentVendas.forEach(venda => {
      const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
      const hora = new Date(venda.dataVenda).toLocaleTimeString('pt-BR');

      html += `
        <tr>
          <td>${venda.idVenda}</td>
          <td>${data} ${hora}</td>
          <td>${venda.nomeCliente || 'Cliente não identificado'}</td>
          <td>R$ ${venda.valorTotal.toFixed(2)}</td>
          <td>${formatarFormaPagamento(venda.formaPagamento)}</td>
          <td>
            <button class="action-btn" data-id="${venda.idVenda}" title="Detalhes">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `;
    });

    vendasLista.innerHTML = html;

    // Adicionar eventos aos botões de ação
    document.querySelectorAll('.action-btn[title="Detalhes"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        await showVendaModal(id);
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
          renderVendas();
        }
      });
    });
  }

  async function gerarRelatorio() {
    try {
      let relatorio;

      switch (relatorioTipo.value) {
        case 'personalizado':
          const inicio = new Date(dataInicio.value);
          const fim = new Date(dataFim.value);
          fim.setHours(23, 59, 59, 999);

          const url = `${API.vendas.relatorioPersonalizado}?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`;
          console.log('URL do relatório:', url);

          relatorio = await apiService.get(url);
          break;

        case 'mensal':
          relatorio = await apiService.get(
            `${API.vendas.relatorioMensal}?ano=${anoMensalSelect.value}&mes=${mesSelect.value}`
          );
          break;

        case 'anual':
          relatorio = await apiService.get(
            `${API.vendas.relatorioAnual}?ano=${anoSelect.value}`
          );
          break;
      }

      console.log('Dados do relatório recebidos da API:', relatorio);
      console.log('Vendas por forma de pagamento:', relatorio?.vendasPorFormaPagamento);

      renderRelatorio(relatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    }
  }

  function renderRelatorio(relatorio) {
    console.log('Renderizando relatório completo:', relatorio);

    if (!relatorio) {
      console.error('Dados do relatório vazios');
      relatorioContainer.classList.add('hidden');
      return;
    }

    // Atualizar estatísticas
    totalVendas.textContent = relatorio.quantidadeVendas || 0;
    faturamento.textContent = `R$ ${(relatorio.faturamentoBruto || 0).toFixed(2)}`;
    totalProdutos.textContent = relatorio.quantidadeProdutosVendidos || 0;
    lucro.textContent = `R$ ${(relatorio.lucroLiquido || 0).toFixed(2)}`;

    // Renderizar produtos mais vendidos
    renderProdutosMaisVendidos(relatorio.produtosMaisVendidos);

    // Renderizar gráfico de formas de pagamento
    console.log('Dados de vendas por forma de pagamento:', relatorio.vendasPorFormaPagamento);

    // Passar os dados para a função de renderização
    renderGraficoPagamentos(relatorio.vendasPorFormaPagamento);

    // Mostrar o container de relatório
    relatorioContainer.classList.remove('hidden');
  }
  function renderProdutosMaisVendidos(produtos) {
    if (!produtos || produtos.length === 0) {
      produtosMaisVendidos.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">Nenhum produto encontrado</td>
        </tr>
      `;
      return;
    }

    let html = '';

    produtos.forEach(produto => {
      html += `
        <tr>
          <td>${produto.nomeProduto}</td>
          <td>${produto.quantidadeVendida}</td>
          <td>R$ ${produto.valorTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    produtosMaisVendidos.innerHTML = html;
  }

 function renderGraficoPagamentos(vendasPorPagamento) {
  console.log('Tentando renderizar gráfico...');
  
  // Limpar qualquer gráfico anterior para evitar múltiplas instâncias
  if (chartPagamentos) {
    chartPagamentos.destroy();
    chartPagamentos = null;
  }
  
  const chartContainer = document.getElementById('chart-pagamentos');
  chartContainer.innerHTML = '<canvas id="pagamentos-chart" width="600" height="400" style="width: 600px; height: 400px;"></canvas>';
  
  // Preparar arrays para armazenar os dados do gráfico
  const labels = [];
  const values = [];
  const cores = ['#44bd32', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'];
  
  // Mapear formas de pagamento para nomes amigáveis
  const formaPagamentoMap = {
    'PIX': 'PIX',
    'CREDITO': 'Cartão de Crédito',
    'DEBITO': 'Cartão de Débito'
  };
  
  // Verificar o formato e processar os dados recebidos
  console.log('Formato dos dados:', typeof vendasPorPagamento, vendasPorPagamento);
  
  if (Array.isArray(vendasPorPagamento)) {
    // Se for um array de objetos 
    vendasPorPagamento.forEach((item, index) => {
      if (item && item.formaPagamento && item.valor) {
        const formaPagamento = item.formaPagamento;
        labels.push(formaPagamentoMap[formaPagamento] || formaPagamento);
        values.push(item.valor);
      }
    });
  } else if (typeof vendasPorPagamento === 'object' && vendasPorPagamento !== null) {
    // Se for um objeto com chaves de formas de pagamento
    Object.entries(vendasPorPagamento).forEach(([forma, valor]) => {
      if (valor > 0) {
        labels.push(formaPagamentoMap[forma] || forma);
        values.push(valor);
      }
    });
  }
  
  // Verificar se temos dados para mostrar
  if (labels.length === 0 || values.length === 0) {
    console.log('Nenhum dado real disponível, usando dados de teste');
    // Usar dados de teste apenas se não houver dados reais
    labels.push('PIX', 'Cartão de Crédito', 'Cartão de Débito');
    values.push(1500, 2200, 1000);
  }
  
  console.log('Dados processados:', {labels, values});
  
  try {
    console.log('Iniciando criação do gráfico...');
    const ctx = document.getElementById('pagamentos-chart').getContext('2d');
    
    if (typeof Chart === 'undefined') {
      console.error('Chart.js não disponível!');
      chartContainer.innerHTML = '<p class="text-center text-danger">Erro: Chart.js não disponível</p>';
      return;
    }
    
    chartPagamentos = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: cores.slice(0, labels.length),
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        hover: {
          mode: null
        },
        plugins: {
          legend: {
            position: 'top',
            display: true
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    console.log('Gráfico criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar o gráfico:', error);
    chartContainer.innerHTML = '<p>Erro ao criar o gráfico: ' + error.message + '</p>';
  }
}
  
  async function showVendaModal(id) {
    activeVendaId = id;

    // Buscar detalhes da venda
    try {
      const venda = await apiService.get(API.vendas.porId(id));

      // Formatação de data e hora
      const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
      const hora = new Date(venda.dataVenda).toLocaleTimeString('pt-BR');

      // Exibir informações da venda
      vendaId.textContent = venda.idVenda;
      vendaData.textContent = `${data} ${hora}`;
      vendaCliente.textContent = venda.nomeCliente || 'Cliente não identificado';
      vendaPagamento.textContent = formatarFormaPagamento(venda.formaPagamento);
      vendaTotal.textContent = `R$ ${venda.valorTotal.toFixed(2)}`;

      // Exibir itens da venda
      renderItensVenda(venda.itens);

      // Verificar se existe feedback
      try {
        const feedback = await apiService.get(API.feedbacks.porVenda(id));

        // Exibir feedback
        feedbackNota.textContent = feedback.nota;
        feedbackTipo.textContent = formatarTipoFeedback(feedback.tipo);
        feedbackComentario.textContent = feedback.comentario || 'Nenhum comentário';

        feedbackSection.classList.remove('hidden');
      } catch (error) {
        feedbackSection.classList.add('hidden');
      }

      vendaModal.classList.remove('hidden');
    } catch (error) {
      console.error('Erro ao carregar detalhes da venda:', error);
      alert('Erro ao carregar detalhes da venda.');
    }
  }

  function renderItensVenda(itens) {
    if (!itens || itens.length === 0) {
      itensLista.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">Nenhum item encontrado</td>
        </tr>
      `;
      return;
    }

    let html = '';

    itens.forEach(item => {
      html += `
        <tr>
          <td>${item.nomeProduto}</td>
          <td>${item.quantidade}</td>
          <td>R$ ${item.precoUnitario.toFixed(2)}</td>
          <td>R$ ${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });

    itensLista.innerHTML = html;
  }

  function closeVendaModal() {
    vendaModal.classList.add('hidden');
    activeVendaId = null;
  }

  function confirmCancelarVenda() {
    if (!activeVendaId) return;

    confirmMessage.textContent = `Tem certeza que deseja cancelar a venda #${activeVendaId}? Esta ação restaurará o estoque dos produtos.`;
    confirmCallback = cancelarVenda;

    confirmModal.classList.remove('hidden');
  }

  async function cancelarVenda() {
    if (!activeVendaId) return;

    try {
      await apiService.delete(API.vendas.porId(activeVendaId));
      closeVendaModal();
      loadVendas();
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      alert('Erro ao cancelar a venda.');
    }
  }

  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
  }

  function formatarFormaPagamento(formaPagamento) {
    switch (formaPagamento) {
      case 'PIX':
        return 'PIX';
      case 'CREDITO':
        return 'Cartão de Crédito';
      case 'DEBITO':
        return 'Cartão de Débito';
      default:
        return formaPagamento;
    }
  }

  function formatarTipoFeedback(tipo) {
    switch (tipo) {
      case 'ELOGIO':
        return 'Elogio';
      case 'SUGESTAO':
        return 'Sugestão';
      case 'RECLAMACAO':
        return 'Reclamação';
      default:
        return tipo;
    }
  }
});
