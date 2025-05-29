const API_BASE_URL = '';

const API = {
  // Endpoints de autenticação
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    users: `${API_BASE_URL}/api/auth/users`
  },

  // Endpoints do totem
  totem: {
    produtos: `${API_BASE_URL}/api/totem/produtos`,
    produtosPorCategoria: (categoria) => `${API_BASE_URL}/api/totem/produtos/categoria/${categoria}`,
    produtoPorCodigo: (codigo) => `${API_BASE_URL}/api/totem/produtos/${codigo}`,
    vendas: `${API_BASE_URL}/api/totem/vendas`,
    fornecedorPorCnpj: (cnpj) => `${API_BASE_URL}/api/totem/fornecedores/cnpj/${encodeURIComponent(cnpj)}`,
    feedbacks: `${API_BASE_URL}/api/totem/feedbacks`
  },

  // Endpoints de consulta
  consulta: {
    produto: (codigo) => `${API_BASE_URL}/api/consulta/produto/${codigo}`
  },

  // Endpoints de administração
  produtos: {
    base: `${API_BASE_URL}/api/produtos`,
    porId: (id) => `${API_BASE_URL}/api/produtos/${id}`,
    porCodigo: (codigo) => `${API_BASE_URL}/api/produtos/codigo-barras/${codigo}`,
    porNome: (nome) => `${API_BASE_URL}/api/produtos/nome/${nome}`,
    porCategoria: (categoria) => `${API_BASE_URL}/api/produtos/categoria/${categoria}`,
    atualizarEstoque: (id, quantidade) => `${API_BASE_URL}/api/produtos/${id}/estoque/${quantidade}`,
    restaurar: (id) => `${API_BASE_URL}/api/produtos/${id}/restaurar`,
    excluidos: `${API_BASE_URL}/api/produtos/excluidos`,
    estoqueBaixo: (quantidade) => `${API_BASE_URL}/api/produtos/estoque-baixo/${quantidade}`
  },

  clientes: {
    base: `${API_BASE_URL}/api/clientes`,
    porId: (id) => `${API_BASE_URL}/api/clientes/${id}`,
    porCpf: (cpf) => `${API_BASE_URL}/api/clientes/cpf/${cpf}`,
    porNome: (nome) => `${API_BASE_URL}/api/clientes/nome/${nome}`,
    restaurar: (id) => `${API_BASE_URL}/api/clientes/${id}/restaurar`,
    excluidos: `${API_BASE_URL}/api/clientes/excluidos`,
    acessos: (id) => `${API_BASE_URL}/api/clientes/${id}/acessos`,
    // 🔧 NOVO: Endpoint para clientes por período
    porPeriodo: `${API_BASE_URL}/api/clientes/periodo`,
    countPorPeriodo: `${API_BASE_URL}/api/clientes/count-periodo`
  },

  vendas: {
    base: `${API_BASE_URL}/api/vendas`,
    porId: (id) => `${API_BASE_URL}/api/vendas/${id}`,
    porCliente: (idCliente) => `${API_BASE_URL}/api/vendas/cliente/${idCliente}`,
    porPeriodo: `${API_BASE_URL}/api/vendas/periodo`, // ✅ JÁ EXISTE
    relatorioMensal: `${API_BASE_URL}/api/vendas/relatorio/mensal`,
    relatorioAnual: `${API_BASE_URL}/api/vendas/relatorio/anual`,
    relatorioPersonalizado: `${API_BASE_URL}/api/vendas/relatorio/personalizado`
  },

  funcionarios: {
    base: `${API_BASE_URL}/api/funcionarios`,
    porId: (id) => `${API_BASE_URL}/api/funcionarios/${id}`,
    porCpf: (cpf) => `${API_BASE_URL}/api/funcionarios/cpf/${cpf}`,
    porNome: (nome) => `${API_BASE_URL}/api/funcionarios/nome/${nome}`,
    restaurar: (id) => `${API_BASE_URL}/api/funcionarios/${id}/restaurar`,
    excluidos: `${API_BASE_URL}/api/funcionarios/excluidos`
  },

  fornecedores: {
    base: `${API_BASE_URL}/api/fornecedores`,
    porId: (id) => `${API_BASE_URL}/api/fornecedores/${id}`,
    porCnpj: (cnpj) => `${API_BASE_URL}/api/fornecedores/cnpj?cnpj=${encodeURIComponent(cnpj)}`,
    porNome: (nome) => `${API_BASE_URL}/api/fornecedores/nome/${nome}`,
    restaurar: (id) => `${API_BASE_URL}/api/fornecedores/${id}/restaurar`,
    excluidos: `${API_BASE_URL}/api/fornecedores/excluidos`,
    produtos: (id) => `${API_BASE_URL}/api/fornecedores/${id}/produtos`
  },

  feedbacks: {
    base: `${API_BASE_URL}/api/feedbacks`,
    porId: (id) => `${API_BASE_URL}/api/feedbacks/${id}`,
    porVenda: (idVenda) => `${API_BASE_URL}/api/feedbacks/venda/${idVenda}`,
    porCliente: (idCliente) => `${API_BASE_URL}/api/feedbacks/cliente/${idCliente}`,
    porTipo: (tipo) => `${API_BASE_URL}/api/feedbacks/tipo/${tipo}`,
    porPeriodo: `${API_BASE_URL}/api/feedbacks/periodo`,
    mediaAvaliacoes: `${API_BASE_URL}/api/feedbacks/media-avaliacoes`, // ✅ JÁ EXISTE
    relatorio: `${API_BASE_URL}/api/feedbacks/relatorio`
  }
};

// Funções auxiliares para interagir com a API
const apiService = {
  headers: {
    'Content-Type': 'application/json'
  },

  setAuthToken: (token) => {
    if (token) {
      apiService.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiService.headers['Authorization'];
    }
  },

  get: async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: apiService.headers
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: apiService.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      throw error;
    }
  },

  put: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: apiService.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição PUT:', error);
      throw error;
    }
  },

  delete: async (url) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: apiService.headers
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Erro na requisição DELETE:', error);
      throw error;
    }
  },

  patch: async (url, data = null) => {
    try {
      const options = {
        method: 'PATCH',
        headers: apiService.headers
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Erro na requisição PATCH:', error);
      throw error;
    }
  }
};