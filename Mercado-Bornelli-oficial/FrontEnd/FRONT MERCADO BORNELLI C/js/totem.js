document.addEventListener('DOMContentLoaded', () => {
  const screens = {
    welcome: document.getElementById('welcome-screen'),
    login: document.getElementById('login-screen'),
    shopping: document.getElementById('shopping-screen'),
    payment: document.getElementById('payment-screen'),
    processing: document.getElementById('processing-screen'),
    success: document.getElementById('success-screen'),
    feedback: document.getElementById('feedback-screen'),
    error: document.getElementById('error-screen')
  };

  // Elementos da interface
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const btnFinalizar = document.getElementById('btn-finalizar');
  const clientInfo = document.getElementById('client-info');
  const clientName = document.getElementById('client-name');
  const errorMessage = document.getElementById('error-message');
  const receiptModal = document.getElementById('receipt-modal');
  const receiptContent = document.getElementById('receipt-content');
  const cpfInput = document.getElementById('cpf');
  const feedbackComment = document.getElementById('feedback-comment');
  const cpfErrorMessage = document.getElementById('cpf-error-message');
  const btnVoltarWelcome = document.getElementById('btn-voltar-welcome');
  const headerBackLink = document.querySelector('header .btn.btn-secondary');

  // Estado do aplicativo
  let estado = {
    clienteAtual: null,
    carrinho: [],
    metodoPagemento: null,
    avaliacao: 0,
    comentarioFeedback: '',
    currentSale: null
  };

  // Mostrar tela ativa
  const showScreen = (screen) => {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
  };

  // Formatar CPF
  const formatCPF = (cpf) => {
    return cpf.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Validar CPF (básico: verifica se tem 11 dígitos)
  const isValidCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
  };

  // Configura input CPF com formatação
  const setupCPFInput = () => {
    if (cpfInput) {
      cpfInput.addEventListener('input', (e) => {
        e.target.value = formatCPF(e.target.value);
        if (cpfErrorMessage) cpfErrorMessage.classList.add('hidden');
      });
    }
  };

  // Função para mostrar erro e ir para tela de erro
  const showError = (message) => {
    if (errorMessage) errorMessage.textContent = message;
    showScreen(screens.error);
  };

  // Converte forma de pagamento para texto legível
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'PIX': return 'PIX';
      case 'CREDITO': return 'Cartão de Crédito';
      case 'DEBITO': return 'Cartão de Débito';
      default: return method;
    }
  };

  // 🔧 CORREÇÃO: Função para fechar modal
  const closeReceiptModal = () => {
    console.log('Função closeReceiptModal chamada');
    if (receiptModal) {
      receiptModal.classList.add('hidden');
      receiptModal.style.display = 'none';
      console.log('Modal fechado');
    } else {
      console.error('receiptModal não encontrado!');
    }
  };

  // Atualiza resumo do carrinho (quantidade e total)
  const updateCartSummary = () => {
    const totalItems = estado.carrinho.reduce((total, item) => total + item.quantidade, 0);
    const totalPrice = estado.carrinho.reduce((total, item) => total + item.subtotal, 0);

    cartCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
    cartTotal.textContent = totalPrice.toFixed(2);

    btnFinalizar.disabled = totalItems === 0;
  };

  // Adiciona item à interface carrinho
  const addCartItemDisplay = (item) => {
    emptyCartMessage.classList.add('hidden');

    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.dataset.id = item.idProduto;

    itemElement.innerHTML = `
      <div class="item-details">
        <h4>${item.produto.nomeProduto}</h4>
        <p>R$ ${item.precoUnitario.toFixed(2)}</p>
      </div>
      <div class="item-quantity">
        <button class="qty-btn minus" data-id="${item.idProduto}">-</button>
        <span class="quantity">${item.quantidade}</span>
        <button class="qty-btn plus" data-id="${item.idProduto}">+</button>
      </div>
      <div class="item-subtotal">
        R$ <span class="subtotal">${item.subtotal.toFixed(2)}</span>
      </div>
      <button class="remove-btn" data-id="${item.idProduto}">
        <i class="fas fa-trash"></i>
      </button>
    `;

    cartItems.appendChild(itemElement);

    // Eventos de controle de quantidade e remoção
    itemElement.querySelector('.minus').addEventListener('click', () => updateQuantity(item.idProduto, -1));
    itemElement.querySelector('.plus').addEventListener('click', () => updateQuantity(item.idProduto, 1));
    itemElement.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.idProduto));
  };

  // Atualiza item no carrinho na interface
  const updateCartItemDisplay = (item) => {
    const itemElement = document.querySelector(`.cart-item[data-id="${item.idProduto}"]`);
    if (itemElement) {
      itemElement.querySelector('.quantity').textContent = item.quantidade;
      itemElement.querySelector('.subtotal').textContent = item.subtotal.toFixed(2);
    }
  };

  // Atualiza quantidade item no carrinho
  const updateQuantity = (productId, change) => {
    const item = estado.carrinho.find(i => i.idProduto === productId);
    if (item) {
      const newQuantity = item.quantidade + change;

      if (newQuantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantidade = newQuantity;
        item.subtotal = item.precoUnitario * newQuantity;
        updateCartItemDisplay(item);
        updateCartSummary();
      }
    }
  };

  // Remove item do carrinho
  const removeFromCart = (productId) => {
    estado.carrinho = estado.carrinho.filter(i => i.idProduto !== productId);

    const itemElement = document.querySelector(`.cart-item[data-id="${productId}"]`);
    if (itemElement) itemElement.remove();

    if (estado.carrinho.length === 0) {
      emptyCartMessage.classList.remove('hidden');
    }

    updateCartSummary();
  };

  // Função para adicionar ao carrinho
  const addToCart = (product) => {
    // Verificamos se o produto tem todas as propriedades necessárias
    console.log('Adicionando produto ao carrinho:', product);

    if (!product || !product.idProduto) {
      console.error('Produto inválido:', product);
      alert('Erro ao adicionar produto ao carrinho: produto inválido');
      return;
    }

    const existingItem = estado.carrinho.find(i => i.idProduto === product.idProduto);

    if (existingItem) {
      existingItem.quantidade++;
      existingItem.subtotal = existingItem.precoUnitario * existingItem.quantidade;
      updateCartItemDisplay(existingItem);
    } else {
      const newItem = {
        idProduto: product.idProduto,
        quantidade: 1,
        precoUnitario: product.precoVenda,
        subtotal: product.precoVenda,
        produto: product
      };
      estado.carrinho.push(newItem);
      addCartItemDisplay(newItem);
    }

    // Verificamos se a atualização do carrinho foi bem-sucedida
    console.log('Carrinho após adição:', estado.carrinho);

    updateCartSummary();
  };

  // Busca cliente por CPF
  async function buscarClientePorCPF(cpf) {
    try {
      // Usamos a rota pública para clientes
      const response = await fetch(`/api/clientes/cpf/${cpf}`);

      if (!response.ok) {
        throw new Error('Cliente não encontrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw new Error('Cliente não encontrado');
    }
  }

  // Formulário login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cpf = cpfInput.value.trim();

      // Validação inicial do CPF
      if (!isValidCPF(cpf)) {
        if (cpfErrorMessage) {
          cpfErrorMessage.textContent = 'Por favor, digite um CPF válido (11 dígitos).';
          cpfErrorMessage.classList.remove('hidden');
        }
        cpfInput.value = '';
        return;
      }

      try {
        const cliente = await buscarClientePorCPF(cpf);
        estado.clienteAtual = cliente;
        clientName.textContent = cliente.nomeCompleto;
        clientInfo.classList.remove('hidden');
        if (cpfErrorMessage) cpfErrorMessage.classList.add('hidden');
        showScreen(screens.shopping);
      } catch (error) {
        if (cpfErrorMessage) {
          cpfErrorMessage.textContent = 'CPF não encontrado. Verifique e tente novamente.';
          cpfErrorMessage.classList.remove('hidden');
        }
        cpfInput.value = '';
      }
    });
  }

  // Botões de cliente sim/nao
  const btnClienteSim = document.getElementById('btn-cliente-sim');
  if (btnClienteSim) btnClienteSim.addEventListener('click', () => {
    showScreen(screens.login);
    setupCPFInput();
  });

  const btnClienteNao = document.getElementById('btn-cliente-nao');
  if (btnClienteNao) btnClienteNao.addEventListener('click', () => {
    estado.clienteAtual = null; // Permite venda sem cliente identificado
    clientInfo.classList.add('hidden');
    showScreen(screens.shopping);
  });

  // Botão voltar para a tela de boas-vindas (formulário de login)
  if (btnVoltarWelcome) {
    btnVoltarWelcome.addEventListener('click', () => {
      showScreen(screens.welcome);
      if (cpfInput) cpfInput.value = '';
      if (cpfErrorMessage) cpfErrorMessage.classList.add('hidden');
    });
  }

  // Link de voltar no cabeçalho
  if (headerBackLink) {
    headerBackLink.addEventListener('click', (e) => {
      // Se estamos na tela de boas-vindas, permitir o redirecionamento para index.html
      if (screens.welcome.classList.contains('hidden')) {
        // Se não estamos na tela de boas-vindas, prevenimos o padrão e mostramos a tela de boas-vindas
        e.preventDefault();
        showScreen(screens.welcome);
        if (cpfInput) cpfInput.value = '';
        if (cpfErrorMessage) cpfErrorMessage.classList.add('hidden');
      }
      // Se estamos na tela de boas-vindas, não fazemos nada e deixamos o link funcionar normalmente
    });
  }

  // Formulário código de barras
  const barcodeForm = document.getElementById('barcode-form');
  if (barcodeForm) {
    barcodeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const barcodeInput = document.getElementById('barcode-input');
      const barcode = barcodeInput.value.trim();

      try {
        // Usamos apenas o endpoint do totem
        const response = await fetch(`/api/totem/produtos/${barcode}`);
        if (!response.ok) {
          console.error(`Erro ao buscar produto: ${response.status}`);
          throw new Error('Produto não encontrado');
        }

        // Log da resposta em texto para debug
        const responseText = await response.text();
        console.log('Resposta do servidor (texto):', responseText);

        // Convertemos o texto de volta para JSON
        let produto;
        try {
          produto = JSON.parse(responseText);
        } catch (e) {
          console.error('Erro ao converter resposta para JSON:', e);
          throw new Error('Produto em formato inválido');
        }

        console.log('Produto encontrado:', produto);

        // Verifica se o produto tem os campos necessários
        if (!produto || !produto.idProduto || !produto.precoVenda) {
          console.error('Produto com formato inválido:', produto);
          throw new Error('Produto com formato inválido');
        }

        addToCart(produto);

        barcodeInput.value = '';
        document.getElementById('barcode-error').classList.add('hidden');
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        document.getElementById('barcode-error').classList.remove('hidden');
      }
    });
  }

  // Botão finalizar compra
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      showScreen(screens.payment);
    });
  }

  // Opções de pagamento
  const setupPaymentOptions = () => {
    document.querySelectorAll('.payment-option').forEach(option => {
      option.addEventListener('click', async () => {
        const paymentMethod = option.dataset.method;
        // Salvamos o método de pagamento no estado
        estado.metodoPagemento = paymentMethod;

        // Verificamos se há itens no carrinho antes de processar o pagamento
        if (estado.carrinho.length === 0) {
          alert('Adicione pelo menos um produto ao carrinho antes de finalizar a compra.');
          return;
        }

        // Verificamos como estão os itens do carrinho - debug
        console.log('Itens no carrinho:', estado.carrinho);

        // Mostramos uma confirmação antes de processar o pagamento
        const confirmText = getPaymentMethodText(paymentMethod);

        // Modal simples de confirmação
        if (confirm(`Confirmar pagamento via ${confirmText}?`)) {
          await processPayment(paymentMethod);
        }
      });
    });
  };

  // Processa pagamento
  const processPayment = async (paymentMethod) => {
    showScreen(screens.processing);

    try {
      // Verifica se há itens no carrinho
      if (estado.carrinho.length === 0) {
        showError("Não é possível finalizar compra com carrinho vazio.");
        return;
      }

      // Calcula o valor total
      const valorTotal = estado.carrinho.reduce((total, item) => total + item.subtotal, 0);

      // Prepara os itens para enviar ao backend
      const items = estado.carrinho.map(item => ({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario.toFixed(2), // Formato correto para BigDecimal: "60.00"
        subtotal: item.subtotal.toFixed(2) // Formato correto para BigDecimal: "60.00"
      }));

      // Construímos o objeto incluindo explicitamente o valorTotal formatado como decimal string
      const vendaDTO = {
        idCliente: estado.clienteAtual ? estado.clienteAtual.idCliente : null,
        formaPagamento: paymentMethod, // Enum: "PIX", "CREDITO", "DEBITO"
        itens: items,
        valorTotal: valorTotal.toFixed(2) // Enviar explicitamente como string formatada: "60.00"
      };

      console.log('Enviando venda para o servidor:', JSON.stringify(vendaDTO, null, 2));

      // Tentamos enviar a venda para o servidor
      const response = await fetch('/api/totem/vendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(vendaDTO)
      });

      // Tratamento de erro melhorado
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          console.error(`Erro na resposta do servidor (texto completo): ${errorText}`);
        } catch (e) {
          errorText = `Erro ${response.status}`;
        }
        throw new Error(`Erro ao salvar venda: ${response.status} - ${errorText}`);
      }

      // Obtenção da resposta
      let responseData;
      try {
        responseData = await response.json();
        console.log('Resposta do servidor:', responseData);
      } catch (e) {
        console.warn('Não foi possível ler a resposta como JSON, criando um objeto simulado', e);
        // Cria um objeto que contém as informações mínimas necessárias
        responseData = {
          idVenda: new Date().getTime(),
          dataVenda: new Date().toISOString(),
          formaPagamento: paymentMethod,
          valorTotal: valorTotal.toFixed(2),
          itens: estado.carrinho.map(item => ({
            idProduto: item.idProduto,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal,
            nomeProduto: item.produto ? item.produto.nomeProduto : 'Produto ' + item.idProduto
          }))
        };
      }

      estado.currentSale = responseData;
      console.log('Venda registrada com sucesso:', estado.currentSale);

      // Exibe sequência de mensagens na tela de sucesso
      showScreen(screens.success);
      const successScreen = screens.success;
      successScreen.innerHTML = `
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Pagamento concluído com sucesso!</h2>
      `;

      // Após 2 segundos, exibe "Emitindo cupom"
      setTimeout(() => {
        successScreen.innerHTML = `
          <div class="success-icon">
            <i class="fas fa-print"></i>
          </div>
          <h2>Emitindo cupom...</h2>
        `;

        // Após mais 2 segundos, exibe solicitação de feedback
        setTimeout(() => {
          successScreen.innerHTML = `
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Compra finalizada!</h2>
            <p>Deseja deixar um feedback sobre sua experiência?</p>
            <div class="buttons">
              <button id="btn-go-feedback" class="btn btn-primary">Sim, deixar feedback</button>
              <button id="btn-view-receipt" class="btn btn-secondary">
                <i class="fas fa-receipt"></i> Ver comprovante
              </button>
              <button id="btn-skip-finalizar" class="btn btn-secondary">Finalizar</button>
            </div>
          `;

          // Adiciona eventos aos botões
          const btnGoFeedback = document.getElementById('btn-go-feedback');
          const btnViewReceipt = document.getElementById('btn-view-receipt');
          const btnSkipFinalizar = document.getElementById('btn-skip-finalizar');

          if (btnGoFeedback) {
            btnGoFeedback.addEventListener('click', () => {
              showScreen(screens.feedback);
              setupRating();
            });
          }

          if (btnViewReceipt) {
            btnViewReceipt.addEventListener('click', () => {
              showReceipt();
            });
          }
          
          // Adicionamos um botão "Finalizar" para substituir o "Pular feedback"
          if (btnSkipFinalizar) {
            btnSkipFinalizar.addEventListener('click', () => {
              console.log('Botão finalizar clicado, reiniciando aplicativo');
              resetApp();
            });
          }
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Erro no processamento do pagamento:', error);
      showError(`Erro ao processar o pagamento: ${error.message}. Tente novamente ou contate o suporte.`);
    }
  };

  // Botão voltar para compras
  const btnVoltarShopping = document.getElementById('btn-voltar-shopping');
  if (btnVoltarShopping) btnVoltarShopping.addEventListener('click', () => {
    showScreen(screens.shopping);
  });

  // Setup avaliação por estrelas
  const setupRating = () => {
    const stars = document.querySelectorAll('.rating .fa-star');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        estado.avaliacao = rating;

        stars.forEach(s => {
          if (parseInt(s.dataset.rating) <= rating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });

        document.getElementById('btn-submit-feedback').disabled = rating === 0;
      });
    });
  };

  // Botão enviar feedback
  const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
  if (btnSubmitFeedback) {
    btnSubmitFeedback.addEventListener('click', async () => {
      if (estado.avaliacao === 0) return;

      const feedbackType = document.getElementById('feedback-type').value;
      const comment = document.getElementById('feedback-comment').value;

      const feedbackDTO = {
        idCliente: estado.clienteAtual ? estado.clienteAtual.idCliente : null,
        idVenda: estado.currentSale ? estado.currentSale.idVenda : null,
        tipo: feedbackType || 'ELOGIO',
        comentario: comment,
        nota: estado.avaliacao
      };

      try {
        // Mostrar tela de processamento enquanto envia o feedback
        showScreen(screens.processing);
        
        // Usamos apenas o endpoint do totem para feedback
        const response = await fetch('/api/totem/feedbacks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackDTO)
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar feedback');
        }

        console.log('Feedback enviado com sucesso!');
        
        // Mostra uma mensagem temporária de confirmação
        const successScreen = screens.success;
        showScreen(screens.success);
        successScreen.innerHTML = `
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Feedback enviado com sucesso!</h2>
          <p>Obrigado por sua avaliação.</p>
        `;
        
        // Após 2 segundos, reinicia o aplicativo
        setTimeout(() => {
          resetApp();
        }, 2000);
      } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        showError('Erro ao enviar feedback. Tente novamente.');
      }
    });
  }

  // 🔧 CORREÇÃO: Setup do modal
  const setupReceiptModal = () => {
    console.log('Configurando modal de comprovante...');
    
    if (!receiptModal) {
      console.error('Elemento receiptModal não encontrado!');
      return;
    }

    // Fecha o modal quando clica fora dele
    receiptModal.addEventListener('click', (e) => {
      console.log('Clique detectado no modal:', e.target);
      if (e.target === receiptModal) {
        console.log('Clique fora do modal - fechando');
        closeReceiptModal();
      }
    });

    console.log('Modal configurado com sucesso');
  };

  // 🔧 CORREÇÃO COMPLETA: Mostrar comprovante
  const showReceipt = () => {
    console.log('=== ABRINDO MODAL DE COMPROVANTE ===');
    
    if (!estado.currentSale) {
      console.error('Nenhuma venda atual encontrada!');
      return;
    }

    const modal = receiptModal;
    const content = receiptContent;
    
    if (!modal || !content) {
      console.error('Elementos do modal não encontrados!', { modal: !!modal, content: !!content });
      return;
    }

    const date = new Date(estado.currentSale.dataVenda);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');

    let html = `
      <div class="receipt-header">
        <h4>Mercado Bornelli</h4>
        <p>Data: ${formattedDate} - Hora: ${formattedTime}</p>
        <p>Venda #${estado.currentSale.idVenda}</p>
      </div>
      <div class="receipt-customer">
        ${estado.clienteAtual ? `<p>Cliente: ${estado.clienteAtual.nomeCompleto}</p>` : '<p>Cliente: Não identificado</p>'}
      </div>
      <div class="receipt-items">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qtd</th>
              <th>Valor</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    estado.currentSale.itens.forEach(item => {
      html += `
        <tr>
          <td>${item.nomeProduto}</td>
          <td>${item.quantidade}</td>
          <td>R$ ${item.precoUnitario.toFixed(2)}</td>
          <td>R$ ${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      <div class="receipt-total">
        <p>Total: R$ ${estado.currentSale.valorTotal.toFixed(2)}</p>
        <p>Forma de Pagamento: ${getPaymentMethodText(estado.currentSale.formaPagamento)}</p>
      </div>
      <div class="receipt-footer">
        <p>Obrigado por comprar no Mercado Bornelli!</p>
      </div>
      <div class="receipt-buttons">
        <button id="close-receipt" class="btn btn-primary" type="button">
          <i class="fas fa-times"></i> Fechar
        </button>
        <button id="print-receipt" class="btn btn-secondary" type="button">
          <i class="fas fa-print"></i> Imprimir
        </button>
      </div>
    `;

    console.log('Inserindo HTML no modal...');
    content.innerHTML = html;
    
    console.log('Removendo classe hidden...');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    console.log('Modal de comprovante aberto');
  };

  // Botão para voltar à tela inicial na tela de erro
  const btnVoltarErro = document.getElementById('btn-voltar-erro');
  if (btnVoltarErro) {
    btnVoltarErro.addEventListener('click', () => {
      resetApp();
    });
  }

  // Reseta app para estado inicial
  const resetApp = () => {
    console.log('Executando resetApp() - Reiniciando aplicativo');
    
    estado = {
      clienteAtual: null,
      carrinho: [],
      metodoPagemento: null,
      avaliacao: 0,
      comentarioFeedback: '',
      currentSale: null
    };

    cartItems.innerHTML = '';
    emptyCartMessage.classList.remove('hidden');
    document.querySelectorAll('.rating .fa-star').forEach(star => star.classList.remove('active'));
    
    if (document.getElementById('feedback-type')) {
      document.getElementById('feedback-type').value = '';
    }
    
    if (document.getElementById('feedback-comment')) {
      document.getElementById('feedback-comment').value = '';
    }
    
    if (clientName) {
      clientName.textContent = '';
    }
    
    if (clientInfo) {
      clientInfo.classList.add('hidden');
    }
    
    if (cpfInput) {
      cpfInput.value = '';
    }

    updateCartSummary();
    
    // Garantir que estamos mostrando a tela de boas-vindas
    console.log('Mostrando tela de boas-vindas');
    showScreen(screens.welcome);
    
    console.log('App reiniciado com sucesso');
  };

  // 🔧 DELEGAÇÃO DE EVENTOS GLOBAL
  document.addEventListener('click', (e) => {
    // Verificar se é o botão de fechar comprovante
    if (e.target && (e.target.id === 'close-receipt' || e.target.closest('#close-receipt'))) {
      console.log('=== DELEGAÇÃO: Botão fechar detectado ===');
      e.preventDefault();
      e.stopPropagation();
      closeReceiptModal();
      return;
    }
    
    // Verificar se é o botão de imprimir
    if (e.target && (e.target.id === 'print-receipt' || e.target.closest('#print-receipt'))) {
      console.log('=== DELEGAÇÃO: Botão imprimir detectado ===');
      e.preventDefault();
      e.stopPropagation();
      window.print();
      return;
    }
    
    // Outros botões dinâmicos
    if (e.target && (e.target.id === 'btn-skip-feedback' || e.target.id === 'btn-skip-finalizar')) {
      console.log('Botão finalizar/pular clicado via delegação!');
      resetApp();
    }
  });

  // Inicia aplicação mostrando tela inicial
  showScreen(screens.welcome);
  setupCPFInput();
  setupPaymentOptions();
  setupReceiptModal();

  // Expõe addToCart globalmente (p/ scanner ou testes)
  window.addToCart = addToCart;

  console.log('Totem de autoatendimento inicializado');
});