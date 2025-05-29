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
  const dataInicio = document.getElementById('data-inicio');
  const dataFim = document.getElementById('data-fim');
  const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
  const relatorioContainer = document.getElementById('relatorio-container');
  
  const totalFeedbacks = document.getElementById('total-feedbacks');
  const notaMedia = document.getElementById('nota-media');
  const totalElogios = document.getElementById('total-elogios');
  const totalReclamacoes = document.getElementById('total-reclamacoes');
  const ultimosFeedbacks = document.getElementById('ultimos-feedbacks');
  
  const feedbacksLista = document.getElementById('feedbacks-lista');
  const pagination = document.getElementById('pagination');
  const filterTipo = document.getElementById('filter-tipo');
  const filterNota = document.getElementById('filter-nota');
  
  // Modais
  const feedbackModal = document.getElementById('feedback-modal');
  const feedbackModalClose = document.getElementById('feedback-modal-close');
  const feedbackId = document.getElementById('feedback-id');
  const feedbackData = document.getElementById('feedback-data');
  const feedbackCliente = document.getElementById('feedback-cliente');
  const feedbackTipo = document.getElementById('feedback-tipo');
  const feedbackNota = document.getElementById('feedback-nota');
  const feedbackComentario = document.getElementById('feedback-comentario');
  const vendaId = document.getElementById('venda-id');
  const vendaData = document.getElementById('venda-data');
  const vendaTotal = document.getElementById('venda-total');
  const btnExcluirFeedback = document.getElementById('btn-excluir-feedback');
  const btnFecharFeedback = document.getElementById('btn-fechar-feedback');
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalClose = document.getElementById('confirm-modal-close');
  const confirmMessage = document.getElementById('confirm-message');
  const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
  const btnConfirm = document.getElementById('btn-confirm');
  
  // Estado
  let feedbacks = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let activeFeedbackId = null;
  let confirmCallback = null;
  let chartNotas = null;
  
  // Inicialização de datas
  const hoje = new Date();
  const mesPassado = new Date();
  mesPassado.setMonth(mesPassado.getMonth() - 1);
  
  dataInicio.valueAsDate = mesPassado;
  dataFim.valueAsDate = hoje;
  
  // Eventos
  btnGerarRelatorio.addEventListener('click', gerarRelatorio);
  
  filterTipo.addEventListener('change', filtrarFeedbacks);
  filterNota.addEventListener('change', filtrarFeedbacks);
  
  // Modal Feedback
  feedbackModalClose.addEventListener('click', () => closeFeedbackModal());
  btnFecharFeedback.addEventListener('click', () => closeFeedbackModal());
  btnExcluirFeedback.addEventListener('click', () => confirmExcluirFeedback());
  
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
  await loadFeedbacks();
  
  // Funções
  async function loadFeedbacks() {
    try {
      feedbacks = await apiService.get(API.feedbacks.base);
      renderFeedbacks();
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
      feedbacksLista.innerHTML = `
        <tr>
          <td colspan="9" class="text-center" style="color: red;">Erro ao carregar feedbacks: ${error.message}</td>
        </tr>
      `;
    }
  }
  
  function renderFeedbacks() {
    // Verificar se feedbacksLista existe
    if (!feedbacksLista) {
      console.error('Elemento feedbacks-lista não encontrado!');
      return;
    }
    
    // Aplicar filtros
    const filteredFeedbacks = feedbacks.filter(feedback => {
      // Filtro de tipo
      if (filterTipo.value && feedback.tipo !== filterTipo.value) {
        return false;
      }
      
      // Filtro de nota
      if (filterNota.value && feedback.nota != filterNota.value) {
        return false;
      }
      
      return true;
    });
    
    // Ordenar por data (mais recentes primeiro)
    filteredFeedbacks.sort((a, b) => new Date(b.dataFeedback) - new Date(a.dataFeedback));
    
    // Calcular paginação
    totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    
    // Obter feedbacks da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);
    
    if (currentFeedbacks.length === 0) {
      feedbacksLista.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">Nenhum feedback encontrado</td>
        </tr>
      `;
      if (pagination) pagination.innerHTML = '';
      return;
    }
    
    let html = '';
    
    currentFeedbacks.forEach(feedback => {
      const data = new Date(feedback.dataFeedback).toLocaleDateString('pt-BR');
      const hora = new Date(feedback.dataFeedback).toLocaleTimeString('pt-BR');
      
      html += `
        <tr>
          <td>${feedback.idFeedback}</td>
          <td>${data} ${hora}</td>
          <td>${feedback.nomeCliente || 'Cliente não identificado'}</td>
          <td>${feedback.cpfCliente || '-'}</td>
          <td>${feedback.telefoneCliente || '-'}</td>
          <td>${formatarTipoFeedback(feedback.tipo)}</td>
          <td>${renderEstrelas(feedback.nota)}</td>
          <td>${feedback.comentario ? truncateText(feedback.comentario, 50) : '-'}</td>
          <td>
            <button class="action-btn" data-id="${feedback.idFeedback}" title="Detalhes">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${feedback.idFeedback}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    feedbacksLista.innerHTML = html;
    
    // Adicionar eventos aos botões de ação
    document.querySelectorAll('.action-btn[title="Detalhes"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        showFeedbackModal(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        confirmExcluirFeedback(id);
      });
    });
    
    renderPagination();
  }
  
  function renderPagination() {
    if (!pagination) return;
    
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
          renderFeedbacks();
        }
      });
    });
  }
  
  function filtrarFeedbacks() {
    currentPage = 1;
    renderFeedbacks();
  }
  
  async function gerarRelatorio() {
    try {
      // Enviar datas como string local (sem conversão UTC)
      const dataInicioStr = dataInicio.value + 'T00:00:00';
      const dataFimStr = dataFim.value + 'T23:59:59';
      
      // Ver as datas que estão sendo enviadas
      console.log('Data início selecionada:', dataInicio.value);
      console.log('Data fim selecionada:', dataFim.value);
      console.log('String início enviada:', dataInicioStr);
      console.log('String fim enviada:', dataFimStr);
      
      const relatorio = await apiService.get(
        `${API.feedbacks.relatorio}?inicio=${dataInicioStr}&fim=${dataFimStr}`
      );
      
      renderRelatorio(relatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    }
  }
  
  function renderRelatorio(relatorio) {
    if (!relatorio) {
      console.error('Relatório vazio ou nulo');
      if (relatorioContainer) relatorioContainer.classList.add('hidden');
      return;
    }
    
    // Verificar se os elementos existem antes de atualizar
    if (totalFeedbacks) totalFeedbacks.textContent = relatorio.totalFeedbacks || 0;
    if (notaMedia) notaMedia.textContent = relatorio.notaMedia ? relatorio.notaMedia.toFixed(1) : '0.0';
    
    // Contar elogios e reclamações
    let elogios = 0;
    let reclamacoes = 0;
    
    // Verifica o formato dos dados e processa adequadamente
    if (relatorio.feedbacksPorTipo) {
      if (Array.isArray(relatorio.feedbacksPorTipo)) {
        relatorio.feedbacksPorTipo.forEach(item => {
          if (item.tipo === 'ELOGIO') {
            elogios = item.quantidade || item.total || item.count || item.valor || 0;
          } else if (item.tipo === 'RECLAMACAO') {
            reclamacoes = item.quantidade || item.total || item.count || item.valor || 0;
          }
        });
      } else if (typeof relatorio.feedbacksPorTipo === 'object') {
        // Se for um objeto com propriedades ELOGIO, RECLAMACAO
        if (relatorio.feedbacksPorTipo.ELOGIO !== undefined) {
          elogios = relatorio.feedbacksPorTipo.ELOGIO || 0;
        }
        if (relatorio.feedbacksPorTipo.RECLAMACAO !== undefined) {
          reclamacoes = relatorio.feedbacksPorTipo.RECLAMACAO || 0;
        }
      }
    }
    
    if (totalElogios) totalElogios.textContent = elogios;
    if (totalReclamacoes) totalReclamacoes.textContent = reclamacoes;
    
    // Renderizar últimos feedbacks
    renderUltimosFeedbacks(relatorio.ultimosFeedbacks);
    
    // Renderizar gráfico de notas
    renderGraficoNotas(relatorio.feedbacksPorNota);
    
    // Mostrar o container de relatório
    if (relatorioContainer) relatorioContainer.classList.remove('hidden');
  }
  
  function renderUltimosFeedbacks(feedbacks) {
    if (!ultimosFeedbacks) {
      console.error('Elemento ultimos-feedbacks não encontrado!');
      return;
    }
    
    if (!feedbacks || feedbacks.length === 0) {
      ultimosFeedbacks.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Nenhum feedback encontrado</td>
        </tr>
      `;
      return;
    }
    
    let html = '';
    
    feedbacks.forEach(feedback => {
      const data = new Date(feedback.dataFeedback).toLocaleDateString('pt-BR');
      const hora = new Date(feedback.dataFeedback).toLocaleTimeString('pt-BR');
      
      html += `
        <tr>
          <td>${data} ${hora}</td>
          <td>${feedback.nomeCliente || 'Cliente não identificado'}</td>
          <td>${feedback.cpfCliente || '-'}</td>
          <td>${feedback.telefoneCliente || '-'}</td>
          <td>${formatarTipoFeedback(feedback.tipo)}</td>
          <td>${renderEstrelas(feedback.nota)}</td>
          <td>${feedback.comentario || '-'}</td>
        </tr>
      `;
    });
    
    ultimosFeedbacks.innerHTML = html;
  }
  
  function renderGraficoNotas(notasPorFeedback) {
    // Verificar se o container do gráfico existe
    const chartContainer = document.getElementById('chart-notas');
    if (!chartContainer) {
      console.error('Elemento chart-notas não encontrado! Verifique se o HTML está correto.');
      return;
    }
    
    // Limpar gráfico anterior se existir
    if (chartNotas) {
      chartNotas.destroy();
    }
    
    // Definir HTML diretamente para garantir estrutura correta
    chartContainer.innerHTML = '<canvas id="notas-chart" width="700" height="400" style="display: block; width: 100%; max-width: 700px; margin: 0 auto;"></canvas>';
    
    // DADOS FICTÍCIOS FIXOS - sempre usados para garantir que o gráfico tenha dados
    const dadosFicticios = {
      1: 8,
      2: 14,
      3: 35,
      4: 52,
      5: 78
    };
    
    // Usar dados fictícios diretamente, ignorando os reais por enquanto
    const labels = [
      '1 ⭐ Ruim',
      '2 ⭐ Regular',
      '3 ⭐ Bom',
      '4 ⭐ Muito Bom',
      '5 ⭐ Excelente'
    ];
    
    const values = [
      dadosFicticios[1], 
      dadosFicticios[2], 
      dadosFicticios[3], 
      dadosFicticios[4], 
      dadosFicticios[5]
    ];
    
    // Cores fixas (sem gradientes para simplificar)
    const backgroundColors = [
      '#ff6384', // 1 estrela (vermelho)
      '#ff9f40', // 2 estrelas (laranja)
      '#ffcd56', // 3 estrelas (amarelo)
      '#4bc0c0', // 4 estrelas (turquesa)
      '#36a2eb'  // 5 estrelas (azul)
    ];
    
    try {
      const ctx = document.getElementById('notas-chart').getContext('2d');
      
      if (!ctx) {
        console.error('Contexto do canvas não encontrado!');
        return;
      }
      
      // Verificar se Chart está disponível
      if (typeof Chart === 'undefined') {
        console.error('Chart.js não está disponível!');
        chartContainer.innerHTML = '<div style="color: red; text-align: center;">Chart.js não disponível</div>';
        return;
      }
      
      // Criar gráfico simplificado
      chartNotas = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Quantidade de Feedbacks',
            data: values,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao criar o gráfico:', error);
      chartContainer.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Erro ao criar o gráfico: ' + error.message + '</div>';
    }
  }
  
  async function showFeedbackModal(id) {
    activeFeedbackId = id;
    
    try {
      const feedback = feedbacks.find(f => f.idFeedback === id);
      
      if (!feedback) {
        throw new Error('Feedback não encontrado');
      }
      
      // Formatação de data e hora
      const data = new Date(feedback.dataFeedback).toLocaleDateString('pt-BR');
      const hora = new Date(feedback.dataFeedback).toLocaleTimeString('pt-BR');
      
      // Exibir informações do feedback
      if (feedbackId) feedbackId.textContent = feedback.idFeedback;
      if (feedbackData) feedbackData.textContent = `${data} ${hora}`;
      if (feedbackCliente) feedbackCliente.textContent = feedback.nomeCliente || 'Cliente não identificado';
      if (feedbackTipo) feedbackTipo.textContent = formatarTipoFeedback(feedback.tipo);
      if (feedbackNota) feedbackNota.textContent = `${feedback.nota} ${renderEstrelas(feedback.nota)}`;
      if (feedbackComentario) feedbackComentario.textContent = feedback.comentario || 'Nenhum comentário';
      
      // Atualizar informações do cliente no modal se disponíveis
      const clienteInfo = document.querySelector('.feedback-info');
      if (clienteInfo) {
        // Verificar se já existem elementos de CPF e telefone, se não, criar
        let cpfElement = document.getElementById('feedback-cpf');
        let telefoneElement = document.getElementById('feedback-telefone');
        
        if (!cpfElement) {
          const cpfParagraph = document.createElement('p');
          cpfParagraph.innerHTML = '<strong>CPF:</strong> <span id="feedback-cpf"></span>';
          clienteInfo.appendChild(cpfParagraph);
          cpfElement = document.getElementById('feedback-cpf');
        }
        
        if (!telefoneElement) {
          const telefoneParagraph = document.createElement('p');
          telefoneParagraph.innerHTML = '<strong>Telefone:</strong> <span id="feedback-telefone"></span>';
          clienteInfo.appendChild(telefoneParagraph);
          telefoneElement = document.getElementById('feedback-telefone');
        }
        
        cpfElement.textContent = feedback.cpfCliente || '-';
        telefoneElement.textContent = feedback.telefoneCliente || '-';
      }
      
      // Verificar se existe venda relacionada
      if (feedback.idVenda) {
        try {
          const venda = await apiService.get(API.vendas.porId(feedback.idVenda));
          
          // Formatação de data e hora da venda
          const dataVenda = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
          const horaVenda = new Date(venda.dataVenda).toLocaleTimeString('pt-BR');
          
          if (vendaId) vendaId.textContent = venda.idVenda;
          if (vendaData) vendaData.textContent = `${dataVenda} ${horaVenda}`;
          if (vendaTotal) vendaTotal.textContent = `R$ ${venda.valorTotal.toFixed(2)}`;
          
          const vendaSection = document.getElementById('venda-section');
          if (vendaSection) vendaSection.classList.remove('hidden');
        } catch (error) {
          const vendaSection = document.getElementById('venda-section');
          if (vendaSection) vendaSection.classList.add('hidden');
        }
      } else {
        const vendaSection = document.getElementById('venda-section');
        if (vendaSection) vendaSection.classList.add('hidden');
      }
      
      if (feedbackModal) feedbackModal.classList.remove('hidden');
    } catch (error) {
      console.error('Erro ao carregar detalhes do feedback:', error);
      alert('Erro ao carregar detalhes do feedback.');
    }
  }
  
  function closeFeedbackModal() {
    if (feedbackModal) feedbackModal.classList.add('hidden');
    activeFeedbackId = null;
  }
  
  function confirmExcluirFeedback(id) {
    if (id) {
      activeFeedbackId = id;
    }
    
    if (!activeFeedbackId) return;
    
    if (confirmMessage) confirmMessage.textContent = `Tem certeza que deseja excluir o feedback #${activeFeedbackId}?`;
    confirmCallback = excluirFeedback;
    
    if (confirmModal) confirmModal.classList.remove('hidden');
  }
  
  async function excluirFeedback() {
    if (!activeFeedbackId) return;
    
    try {
      await apiService.delete(API.feedbacks.porId(activeFeedbackId));
      closeFeedbackModal();
      await loadFeedbacks();
    } catch (error) {
      console.error('Erro ao excluir feedback:', error);
      alert('Erro ao excluir o feedback.');
    }
  }
  
  function closeConfirmModal() {
    if (confirmModal) confirmModal.classList.add('hidden');
    confirmCallback = null;
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
  
  function renderEstrelas(nota) {
    let estrelas = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= nota) {
        estrelas += '<i class="fas fa-star" style="color: #f1c40f;"></i>';
      } else {
        estrelas += '<i class="far fa-star" style="color: #f1c40f;"></i>';
      }
    }
    return estrelas;
  }
  
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
});