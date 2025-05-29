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

  // Elementos do dashboard
  const totalVendas = document.getElementById('total-vendas');
  const faturamento = document.getElementById('faturamento');
  const totalClientes = document.getElementById('total-clientes');
  const mediaFeedback = document.getElementById('media-feedback');
  const tabelaVendasRecentes = document.getElementById('vendas-recentes');
  const tabelaProdutosMaisVendidos = document.getElementById('produtos-mais-vendidos');
  const periodFilter = document.getElementById('period-filter');

  // Eventos
  periodFilter.addEventListener('change', () => {
    loadDashboardData(periodFilter.value);
  });

  // Funções
  async function loadDashboardData(period) {
    try {
      // Determinar datas para o período selecionado
      const hoje = new Date();
      let dataInicio = new Date();

      switch (period) {
        case 'today':
          dataInicio.setHours(0, 0, 0, 0);
          break;
        case 'week':
          dataInicio.setDate(hoje.getDate() - 7);
          break;
        case 'month':
          dataInicio.setMonth(hoje.getMonth() - 1);
          break;
        case 'year':
          dataInicio.setFullYear(hoje.getFullYear() - 1);
          break;
      }

      const dataInicioISO = dataInicio.toISOString();
      const dataFimISO = hoje.toISOString();

      // Carregar relatório de vendas
      const relatorioVendas = await apiService.get(
        `${API.vendas.relatorioPersonalizado}?inicio=${encodeURIComponent(dataInicioISO)}&fim=${encodeURIComponent(dataFimISO)}`
      );

      console.log('Relatório de vendas carregado:', relatorioVendas);

      // Atualizar estatísticas
      totalVendas.textContent = relatorioVendas.quantidadeVendas || 0;
      faturamento.textContent = `R$ ${relatorioVendas.faturamentoBruto?.toFixed(2) || '0.00'}`;

      // 🔧 CORREÇÃO: Carregar média de feedbacks COM FILTRO de período
      try {
        const mediaAvaliacoes = await apiService.get(
          `${API.feedbacks.mediaAvaliacoes}?inicio=${encodeURIComponent(dataInicioISO)}&fim=${encodeURIComponent(dataFimISO)}`
        );
        mediaFeedback.textContent = mediaAvaliacoes ? mediaAvaliacoes.toFixed(1) : '0.0';
      } catch (error) {
        console.error('Erro ao carregar média de feedbacks por período, usando fallback:', error);
        // Fallback: carregar média sem filtro
        try {
          const mediaAvaliacoes = await apiService.get(API.feedbacks.mediaAvaliacoes);
          mediaFeedback.textContent = mediaAvaliacoes ? mediaAvaliacoes.toFixed(1) : '0.0';
        } catch (fallbackError) {
          console.error('Erro no fallback de média de feedbacks:', fallbackError);
          mediaFeedback.textContent = '0.0';
        }
      }

      // 🔧 CORREÇÃO: Carregar total de clientes COM FILTRO de período
      try {
        console.log('🔍 Buscando clientes por período:', dataInicioISO, 'até', dataFimISO);

        const clientesPorPeriodo = await apiService.get(
          `${API.clientes.porPeriodo}?inicio=${encodeURIComponent(dataInicioISO)}&fim=${encodeURIComponent(dataFimISO)}`
        );

        console.log('✅ Clientes encontrados no período:', clientesPorPeriodo.length);
        totalClientes.textContent = clientesPorPeriodo.length || 0;

      } catch (error) {
        console.error('❌ Erro ao carregar clientes por período:', error);

        // 🔄 Fallback: Se o endpoint de período falhar, usar total geral
        try {
          console.log('🔄 Usando fallback - carregando todos os clientes');
          const clientes = await apiService.get(API.clientes.base);
          totalClientes.textContent = clientes.length || 0;
          console.log('✅ Fallback executado com sucesso:', clientes.length, 'clientes');
        } catch (fallbackError) {
          console.error('❌ Erro no fallback de clientes:', fallbackError);
          totalClientes.textContent = '0';
        }
      }

      // Carregar vendas recentes COM FILTRO de período
      try {
        const vendasPorPeriodo = await apiService.get(
          `${API.vendas.porPeriodo}?inicio=${encodeURIComponent(dataInicioISO)}&fim=${encodeURIComponent(dataFimISO)}`
        );

        // Ordenar por data mais recente e pegar apenas as 5 primeiras
        const vendasRecentes = vendasPorPeriodo
          .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
          .slice(0, 5);

        renderVendasRecentes(vendasRecentes);
      } catch (error) {
        console.error('Erro ao carregar vendas por período, usando fallback:', error);
        // Fallback: usar método que já existe
        try {
          const vendas = await apiService.get(API.vendas.base);
          const vendasRecentes = vendas
            .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
            .slice(0, 5);
          renderVendasRecentes(vendasRecentes);
        } catch (fallbackError) {
          console.error('Erro no fallback de vendas:', fallbackError);
          renderVendasRecentes([]);
        }
      }

      // Carregar produtos mais vendidos
      if (relatorioVendas.produtosMaisVendidos) {
        renderProdutosMaisVendidos(relatorioVendas.produtosMaisVendidos);
      }

      // Carregar relatório anual para obter dados mensais
      const anoAtual = hoje.getFullYear();
      console.log(`Carregando relatório anual para o ano: ${anoAtual}`);

      try {
        const relatorioAnual = await apiService.get(`${API.vendas.relatorioAnual}?ano=${anoAtual}`);
        console.log('Relatório anual carregado:', relatorioAnual);

        // Adicionar dados mock se não houver dados reais (para desenvolvimento)
        if (!relatorioAnual.vendasPorMes || (Array.isArray(relatorioAnual.vendasPorMes) && relatorioAnual.vendasPorMes.length === 0)) {
          console.log('Nenhum dado de vendas por mês encontrado, usando dados de exemplo');

          // Dados de exemplo para teste
          const dadosExemplo = gerarDadosExemplo();
          renderFaturamentoChart(dadosExemplo, relatorioVendas.lucroLiquido);
        } else {
          console.log('Dados de vendas por mês encontrados:', relatorioAnual.vendasPorMes);
          renderFaturamentoChart(relatorioAnual.vendasPorMes, relatorioVendas.lucroLiquido);
        }
      } catch (error) {
        console.error('Erro ao carregar relatório anual:', error);

        // Mostrar dados de exemplo se houver erro
        const dadosExemplo = gerarDadosExemplo();
        renderFaturamentoChart(dadosExemplo, relatorioVendas.lucroLiquido);
      }

      // Carregar funcionários para o dashboard
      await carregarFuncionariosDashboard();

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }

  // Função para gerar dados de exemplo para desenvolvimento
  function gerarDadosExemplo() {
    const dadosExemplo = [];
    for (let i = 1; i <= 12; i++) {
      // Gerar valores aleatórios para teste
      const faturamento = Math.floor(Math.random() * 10000) + 1000;
      const lucro = Math.floor(faturamento * 0.3);

      dadosExemplo.push({
        mes: i.toString(),
        faturamento: faturamento,
        lucro: lucro
      });
    }
    return dadosExemplo;
  }

  function renderVendasRecentes(vendas) {
    if (!vendas || vendas.length === 0) {
      tabelaVendasRecentes.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma venda encontrada</td></tr>';
      return;
    }

    let html = '';
    vendas.forEach(venda => {
      const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
      const hora = new Date(venda.dataVenda).toLocaleTimeString('pt-BR');

      html += `
        <tr>
          <td>${venda.idVenda}</td>
          <td>${data} ${hora}</td>
          <td>${venda.nomeCliente || 'Cliente não identificado'}</td>
          <td>R$ ${venda.valorTotal.toFixed(2)}</td>
          <td>${formatarFormaPagamento(venda.formaPagamento)}</td>
        </tr>
      `;
    });

    tabelaVendasRecentes.innerHTML = html;
  }

  function renderProdutosMaisVendidos(produtos) {
    if (!produtos || produtos.length === 0) {
      tabelaProdutosMaisVendidos.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum produto encontrado</td></tr>';
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

    tabelaProdutosMaisVendidos.innerHTML = html;
  }

  function renderFaturamentoChart(vendasPorMes, lucroTotal) {
    // Verificar se a biblioteca Chart.js está carregada
    if (typeof Chart === 'undefined') {
      console.error('Chart.js não está disponível. Verifique se a biblioteca foi carregada corretamente.');

      // Exibir mensagem no container do gráfico
      const chartContainer = document.getElementById('chart-faturamento');
      if (chartContainer) {
        chartContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 20px;">
          <p><i class="fas fa-exclamation-triangle" style="color: orange; font-size: 24px;"></i></p>
          <p>Não foi possível carregar o gráfico. Chart.js não está disponível.</p>
          <p>Verifique a conexão com a internet ou atualize a página.</p>
        </div>
      `;
      }
      return;
    }

    const ctx = document.getElementById('faturamento-chart').getContext('2d');

    // Converter o mapa para arrays para o Chart.js
    const meses = [];
    const valoresFaturamento = [];
    const valoresLucro = [];
    const quantidadeVendas = []; // Novo: quantidade de vendas por mês
    const quantidadeProdutos = []; // Novo: quantidade de produtos vendidos por mês
    const metasFaturamento = []; // Novo: metas mensais de faturamento

    
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril',
      'Maio', 'Junho', 'Julho', 'Agosto',
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Gerar metas de faturamento fictícias
    const gerarMetaMensal = (mes) => {
      const baseMeta = 12000;
      // Metas mais altas para fim de ano, férias, etc.
      const fatoresMes = [0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.2, 1.1, 1.2, 1.3, 1.5, 2.0];
      return baseMeta * fatoresMes[mes - 1];
    };

    // Gerar quantidade de vendas/produtos fictícias baseadas no faturamento
    const gerarQuantidadeVendas = (faturamento) => Math.floor(faturamento / 100);
    const gerarQuantidadeProdutos = (vendas) => Math.floor(vendas * 2.5);

    // Ordenar e preencher os dados
    if (Array.isArray(vendasPorMes)) {
      // Se vendasPorMes é um array de objetos (como { mes: "1", faturamento: 1000 })
      vendasPorMes.sort((a, b) => parseInt(a.mes) - parseInt(b.mes));
      vendasPorMes.forEach(item => {
        const mesNumero = parseInt(item.mes);
        meses.push(nomesMeses[mesNumero - 1]);
        valoresFaturamento.push(item.faturamento);

        // Calcular lucro (30% do faturamento como estimativa ou usar lucro real)
        if (item.lucro !== undefined) {
          valoresLucro.push(item.lucro);
        } else {
          valoresLucro.push(item.faturamento * 0.3);
        }

        // Adicionar novos dados
        metasFaturamento.push(gerarMetaMensal(mesNumero));

        // Usar quantidade real de vendas se disponível, senão estimar
        if (item.quantidadeVendas !== undefined) {
          quantidadeVendas.push(item.quantidadeVendas);
        } else {
          quantidadeVendas.push(gerarQuantidadeVendas(item.faturamento));
        }

        // Usar quantidade real de produtos se disponível, senão estimar
        if (item.quantidadeProdutos !== undefined) {
          quantidadeProdutos.push(item.quantidadeProdutos);
        } else {
          quantidadeProdutos.push(gerarQuantidadeProdutos(quantidadeVendas[quantidadeVendas.length - 1]));
        }
      });
    } else {
      // Se vendasPorMes é um objeto como { "1": 1000, "2": 1500, ... }
      Object.entries(vendasPorMes)
        .sort(([mesA], [mesB]) => parseInt(mesA) - parseInt(mesB))
        .forEach(([mes, valor]) => {
          const mesNumero = parseInt(mes);
          meses.push(nomesMeses[mesNumero - 1]);
          valoresFaturamento.push(valor);
          valoresLucro.push(valor * 0.3);

          // Adicionar novos dados
          metasFaturamento.push(gerarMetaMensal(mesNumero));
          const estimativaVendas = gerarQuantidadeVendas(valor);
          quantidadeVendas.push(estimativaVendas);
          quantidadeProdutos.push(gerarQuantidadeProdutos(estimativaVendas));
        });
    }

    // Calcular média móvel (3 meses) para faturamento
    const mediasMoveis = valoresFaturamento.map((valor, index, array) => {
      if (index < 2) return null; // Primeiros dois meses não têm média móvel
      return (array[index] + array[index - 1] + array[index - 2]) / 3;
    });

    if (window.faturamentoChart) {
      window.faturamentoChart.destroy();
    }

    window.faturamentoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Faturamento (R$)',
            data: valoresFaturamento,
            backgroundColor: 'rgba(68, 189, 50, 0.7)',
            borderColor: '#44bd32',
            borderWidth: 1,
            order: 2
          },
          {
            label: 'Lucro (R$)',
            data: valoresLucro,
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: '#3498db',
            borderWidth: 1,
            order: 3
          },
          {
            label: 'Meta de Faturamento (R$)',
            data: metasFaturamento,
            type: 'line',
            borderColor: '#e74c3c',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: '#e74c3c',
            tension: 0.2,
            order: 0
          },
          {
            label: 'Média Móvel (3 meses)',
            data: mediasMoveis,
            type: 'line',
            borderColor: 'rgba(155, 89, 182, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 1
          },
          {
            label: 'Quantidade de Vendas',
            data: quantidadeVendas,
            type: 'bar',
            backgroundColor: 'rgba(243, 156, 18, 0.7)',
            borderColor: '#f39c12',
            borderWidth: 1,
            hidden: true, // Inicialmente oculto, pode ser ativado pelo usuário
            yAxisID: 'y1',
            order: 4
          },
          {
            label: 'Produtos Vendidos',
            data: quantidadeProdutos,
            type: 'bar',
            backgroundColor: 'rgba(142, 68, 173, 0.7)',
            borderColor: '#8e44ad',
            borderWidth: 1,
            hidden: true, // Inicialmente oculto, pode ser ativado pelo usuário
            yAxisID: 'y1',
            order: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                let value = context.raw;
                if (label.includes('R$')) {
                  return `${label}: R$ ${value.toFixed(2)}`;
                } else {
                  return `${label}: ${value}`;
                }
              }
            }
          },
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              padding: 15
            },
            onClick: Chart.defaults.plugins.legend.onClick
          },
          title: {
            display: true,
            text: 'Desempenho Financeiro Mensal',
            font: {
              size: 16
            },
            padding: {
              top: 10,
              bottom: 30
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valores (R$)'
            },
            ticks: {
              callback: function (value) {
                return 'R$ ' + value.toFixed(2);
              }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Quantidade'
            },
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
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

  // Função para carregar os funcionários no dashboard
  async function carregarFuncionariosDashboard() {
    try {
      // Busca os funcionários mais recentes (limitado a 5)
      const funcionarios = await apiService.get(API.funcionarios.base);

      // Exibe apenas os primeiros 5 funcionários
      const dashboardFuncionarios = document.getElementById('dashboard-funcionarios');

      if (!dashboardFuncionarios) {
        console.error('Elemento dashboard-funcionarios não encontrado');
        return;
      }

      if (funcionarios.length === 0) {
        dashboardFuncionarios.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">Nenhum funcionário encontrado</td>
          </tr>
        `;
        return;
      }

      let html = '';
      // Pega apenas os primeiros 5 funcionários para o dashboard
      const funcionariosExibidos = funcionarios.slice(0, 5);

      funcionariosExibidos.forEach(funcionario => {
        html += `
          <tr>
            <td>${funcionario.nomeCompleto}</td>
            <td>${formatarCargo(funcionario.cargo)}</td>
            <td><span class="status ${getStatusClass(funcionario.status)}">${formatarStatus(funcionario.status)}</span></td>
          </tr>
        `;
      });

      dashboardFuncionarios.innerHTML = html;

    } catch (error) {
      console.error('Erro ao carregar funcionários para o dashboard:', error);
      const dashboardFuncionarios = document.getElementById('dashboard-funcionarios');
      if (dashboardFuncionarios) {
        dashboardFuncionarios.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">Erro ao carregar funcionários</td>
          </tr>
        `;
      }
    }
  }

  // Funções auxiliares para formatação de funcionários
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

  // Iniciar com período padrão
  loadDashboardData(periodFilter.value);
});