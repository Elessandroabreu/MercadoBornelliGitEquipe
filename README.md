Principais Características:
🏪 Sistema de Gestão Comercial: Controle completo de clientes, produtos, fornecedores, funcionários e vendas
🔐 Segurança Robusta: Autenticação JWT com diferentes níveis de acesso (ADMIN/USER)
📱 APIs Flexíveis: Endpoints para sistema web, mobile e totems de autoatendimento
📊 Relatórios Completos: Dashboards de vendas, feedbacks e métricas de negócio
🗃️ Auditoria LGPD: Controle de acessos aos dados dos clientes
Tecnologias Utilizadas:

Spring Boot (framework principal)
Spring Security (autenticação/autorização)
JWT (tokens de acesso)
MySQL (banco de dados)
JPA/Hibernate (ORM)
Bean Validation (validações)

Estrutura do Sistema:

8 Controllers com +40 endpoints REST
8 Entidades principais com relacionamentos
8 DTOs para transferência de dados
8 Repositories com queries customizadas
Sistema de Security completo
Exception Handling centralizado

O sistema está pronto para produção e oferece uma base sólida para um mercado digital moderno com funcionalidades de e-commerce, gestão interna e compliance com regulamentações de dados.

# Sistema Mercado Bornelli - Explicação Completa

## 📋 **Visão Geral do Sistema**

Este é um sistema completo para gerenciamento de mercado/supermercado que inclui:
- **Gestão de Clientes, Fornecedores, Produtos e Funcionários**
- **Sistema de Vendas com controle de estoque**
- **Sistema de Feedback dos clientes**
- **Relatórios e dashboards**
- **Autenticação e autorização com JWT**
- **API REST completa**

---

## 🔧 **1. CONFIGURAÇÕES (Package: config)**

### **CorsConfig.java**
```java
// Configuração para permitir requisições de qualquer origem (CORS)
// Permite que frontend (React, Angular, etc) acesse a API
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    // Permite TODAS as origens, métodos e headers
    // Em produção, deveria ser mais restritivo
}
```

### **DataInitializer.java**
```java
// Cria dados iniciais quando a aplicação inicia
// Cria um usuário administrador padrão: admin/admin123
// Executa automaticamente no startup da aplicação
```

### **SecurityConfig.java**
```java
// Configuração principal de segurança da aplicação
// Define quais URLs são públicas e quais precisam de autenticação
// Configura JWT como método de autenticação
// URLs públicas: /api/auth/**, /api/consulta/**, /api/totem/**
// URLs protegidas: todas as outras (precisam de token JWT)
```

---

## 🎮 **2. CONTROLLERS (Package: controller)**

### **AuthController.java**
```java
// Gerencia autenticação e usuários
// POST /api/auth/login - Login do usuário
// POST /api/auth/cadastro - Cadastrar novo usuário (só ADMIN)
// GET /api/auth/users - Listar usuários (só ADMIN)
// PUT /api/auth/users/{id} - Atualizar usuário (só ADMIN)
// DELETE /api/auth/users/{id} - Excluir usuário (só ADMIN)
```

### **ClienteController.java**
```java
// Gerencia clientes do mercado
// GET /api/clientes - Listar todos os clientes
// GET /api/clientes/{id} - Buscar cliente por ID
// GET /api/clientes/cpf/{cpf} - Buscar cliente por CPF (público)
// POST /api/clientes - Cadastrar novo cliente
// PUT /api/clientes/{id} - Atualizar cliente
// DELETE /api/clientes/{id} - Excluir cliente (soft delete)
// GET /api/clientes/periodo - Buscar clientes por período de cadastro
// GET /api/clientes/{id}/acessos - Histórico de acessos do cliente
```

### **ConsultaController.java**
```java
// API pública para consulta de produtos (totem de consulta)
// GET /api/consulta/produto/{codigo} - Consultar produto por código de barras
// Usado por sistemas externos ou totems de consulta
```

### **FeedbackController.java**
```java
// Gerencia feedback/avaliações dos clientes
// GET /api/feedbacks - Listar todos os feedbacks
// POST /api/feedbacks - Cadastrar novo feedback
// GET /api/feedbacks/tipo/{tipo} - Buscar por tipo (ELOGIO, SUGESTAO, RECLAMACAO)
// GET /api/feedbacks/media-avaliacoes - Calcular média das avaliações
// GET /api/feedbacks/relatorio - Gerar relatório de feedbacks
```

### **FornecedorController.java**
```java
// Gerencia fornecedores
// GET /api/fornecedores - Listar fornecedores
// GET /api/fornecedores/cnpj?cnpj=XX.XXX.XXX/XXXX-XX - Buscar por CNPJ
// POST /api/fornecedores - Cadastrar fornecedor (só ADMIN)
// PUT /api/fornecedores/{id} - Atualizar fornecedor (só ADMIN)
// DELETE /api/fornecedores/{id} - Excluir fornecedor (só ADMIN)
```

### **FuncionarioController.java**
```java
// Gerencia funcionários (só ADMIN tem acesso)
// GET /api/funcionarios - Listar funcionários
// GET /api/funcionarios/cargo/{cargo} - Buscar por cargo
// POST /api/funcionarios - Cadastrar funcionário
// PUT /api/funcionarios/{id} - Atualizar funcionário
// DELETE /api/funcionarios/{id} - Excluir funcionário
```

### **ProdutoController.java**
```java
// Gerencia produtos do mercado
// GET /api/produtos - Listar produtos
// GET /api/produtos/codigo-barras/{codigo} - Buscar por código de barras
// GET /api/produtos/categoria/{categoria} - Buscar por categoria
// GET /api/produtos/estoque-baixo/{quantidade} - Produtos com estoque baixo
// POST /api/produtos - Cadastrar produto (só ADMIN)
// PATCH /api/produtos/{id}/estoque/{quantidade} - Atualizar estoque
```

### **TotemController.java**
```java
// API pública para totems de autoatendimento
// GET /api/totem/fornecedores/cnpj/{cnpj} - Consulta fornecedor
// GET /api/totem/produtos - Listar produtos
// POST /api/totem/vendas - Realizar venda no totem
// POST /api/totem/feedbacks - Registrar feedback no totem
```

### **VendaController.java**
```java
// Gerencia vendas
// GET /api/vendas - Listar vendas
// GET /api/vendas/cliente/{idCliente} - Vendas de um cliente
// GET /api/vendas/periodo - Vendas por período
// POST /api/vendas - Registrar nova venda
// GET /api/vendas/relatorio/mensal - Relatório mensal
// GET /api/vendas/relatorio/anual - Relatório anual
```

---

## 📦 **3. DTOs (Data Transfer Objects)**

### **Principais DTOs:**
```java
// ClienteDTO - Dados do cliente (nome, CPF, email, telefone)
// ProdutoDTO - Dados do produto (nome, código, categoria, preços, estoque)
// VendaDTO - Dados da venda (cliente, forma pagamento, itens, valor total)
// ItemVendaDTO - Item individual da venda (produto, quantidade, preço)
// FeedbackDTO - Avaliação do cliente (tipo, nota 1-5, comentário)
// FornecedorDTO - Dados do fornecedor (empresa, CNPJ, representante)
// FuncionarioDTO - Dados do funcionário (nome, CPF, cargo, salário)
// UsuarioDTO - Dados do usuário do sistema (username, perfis)
// LoginDTO - Dados de login (username, password)
// JwtResponseDTO - Resposta com token JWT após login
```

---

## 🗃️ **4. MODELS/ENTITIES (Package: model)**

### **Cliente.java**
```java
// Entidade que representa um cliente
// Campos: ID, nome, CPF, email, telefone, data de criação
// Relacionamentos: 
//   - OneToMany com Venda (um cliente pode ter várias vendas)
//   - OneToMany com Feedback (um cliente pode dar vários feedbacks)
//   - OneToMany com AcessoCliente (histórico de acessos)
// Soft Delete: campo 'excluido' ao invés de apagar fisicamente
```

### **Produto.java**
```java
// Entidade que representa um produto
// Campos: ID, nome, código de barras, categoria, estoque, preços
// Relacionamentos:
//   - ManyToOne com Fornecedor (um produto tem um fornecedor)
// Controle de estoque automático
```

### **Venda.java**
```java
// Entidade que representa uma venda
// Campos: ID, data, forma de pagamento, valor total
// Relacionamentos:
//   - ManyToOne com Cliente (uma venda pertence a um cliente)
//   - OneToMany com ItemVenda (uma venda tem vários itens)
//   - OneToOne com Feedback (uma venda pode ter um feedback)
// Enum FormaPagamento: PIX, CREDITO, DEBITO
```

### **ItemVenda.java**
```java
// Entidade que representa um item da venda
// Campos: quantidade, preço unitário, subtotal
// Relacionamentos:
//   - ManyToOne com Venda
//   - ManyToOne com Produto
// Calcula subtotal automaticamente (quantidade × preço)
```

### **Feedback.java**
```java
// Entidade que representa avaliação do cliente
// Campos: tipo, nota (1-5), comentário, data
// Enum TipoFeedback: ELOGIO, SUGESTAO, RECLAMACAO
// Relacionamentos:
//   - ManyToOne com Cliente
//   - OneToOne com Venda
```

### **Fornecedor.java**
```java
// Entidade que representa um fornecedor
// Campos: nome da empresa, CNPJ, representante, contatos
// Relacionamentos:
//   - OneToMany com Produto (um fornecedor fornece vários produtos)
```

### **Funcionario.java**
```java
// Entidade que representa um funcionário
// Campos: nome, CPF, cargo, status, data admissão, salário
// Enums: 
//   - Cargo: GERENTE, ATENDENTE, CAIXA, ESTOQUISTA, ADMIN
//   - Status: ATIVO, FERIAS, LICENCA
```

### **Usuario.java**
```java
// Entidade que representa usuário do sistema
// Campos: username, password (criptografada), perfis, ativo
// Enum PerfilUsuario: ADMIN, USER
// Controla acesso ao sistema
```

### **AcessoCliente.java**
```java
// Entidade que registra acessos aos dados do cliente
// Para auditoria/LGPD - registra quando e como cliente foi acessado
// Campos: data/hora, ação realizada, IP do dispositivo
```

---

## 🗄️ **5. REPOSITORIES (Package: repository)**

### **Funcionalidades dos Repositories:**
```java
// Cada repository extends JpaRepository<Entidade, TipoID>
// Métodos customizados usando @Query para:
//   - Buscar apenas registros não excluídos (soft delete)
//   - Buscar por períodos de data
//   - Buscar por campos específicos (CPF, CNPJ, etc)
//   - Gerar relatórios com agregações (COUNT, SUM, AVG)
//   - Buscar com relacionamentos (JOIN FETCH)

// Exemplos de queries customizadas:
// - findByDataVendaBetween() - vendas em período
// - findClientesPorPeriodo() - clientes cadastrados em período
// - mediaAvaliacoes() - média das notas dos feedbacks
// - findProdutosMaisVendidosPorPeriodo() - ranking de produtos
```

---

## 🔐 **6. SECURITY (Package: security)**

### **JwtUtils.java**
```java
// Utilitário para trabalhar com tokens JWT
// generateJwtToken() - Gera token após login
// validateJwtToken() - Valida se token é válido
// getUserNameFromJwtToken() - Extrai username do token
// Token expira em 24 horas (configurável)
```

### **AuthTokenFilter.java**
```java
// Filtro que intercepta todas as requisições
// Verifica se existe token JWT no header Authorization
// Se token válido, autentica automaticamente o usuário
// Formato esperado: "Authorization: Bearer <token>"
```

### **UserDetailsServiceImpl.java**
```java
// Implementação do Spring Security para carregar dados do usuário
// Busca usuário no banco pelo username
// Converte perfis da entidade Usuario para authorities do Spring
// Verifica se usuário está ativo
```

---

## ⚠️ **7. EXCEPTION HANDLING (Package: exception)**

### **GlobalExceptionHandler.java**
```java
// Manipula todas as exceções da aplicação de forma centralizada
// Tipos de erro tratados:
//   - ResourceNotFoundException (404) - Recurso não encontrado
//   - IllegalArgumentException (400) - Argumentos inválidos
//   - BadCredentialsException (401) - Credenciais inválidas
//   - AccessDeniedException (403) - Acesso negado
//   - MethodArgumentNotValidException (400) - Validação de campos
//   - Exception (500) - Erro interno do servidor

// Retorna respostas padronizadas com:
// - Status HTTP correto
// - Timestamp do erro
// - Mensagem descritiva
// - Detalhes de validação (quando aplicável)
```

### **ResourceNotFoundException.java**
```java
// Exceção customizada para quando um recurso não é encontrado
// Usado nos services quando busca por ID não retorna resultado
// Automaticamente retorna HTTP 404
```

---

## ⚙️ **8. CONFIGURAÇÕES (application.properties)**

### **Banco de Dados:**
```properties
# MySQL local na porta 3306
# Database: mercadobornelli (criado automaticamente)
# User: root / Password: root
# DDL: create-drop (recria banco a cada startup - apenas desenvolvimento!)
```

### **JWT:**
```properties
# Chave secreta para assinar tokens (Base64)
# Expiração: 24 horas (86400000 ms)
```

### **Outras Configurações:**
```properties
# Porta do servidor: 8080
# Timezone: America/Sao_Paulo
# Upload máximo: 10MB
# Logs: DEBUG para aplicação, ERROR para Hibernate
```

---

## 🔄 **9. FLUXOS PRINCIPAIS DO SISTEMA**

### **Fluxo de Autenticação:**
1. **Login**: POST /api/auth/login com {username, password}
2. **Validação**: Sistema verifica credenciais no banco
3. **Token**: Se válido, retorna JWT token
4. **Acesso**: Cliente inclui token no header das próximas requisições
5. **Validação**: Filtro valida token em cada requisição

### **Fluxo de Venda:**
1. **Produtos**: GET /api/produtos - lista produtos disponíveis
2. **Cliente**: GET /api/clientes/cpf/{cpf} - busca/valida cliente
3. **Venda**: POST /api/vendas - registra venda com itens
4. **Estoque**: Sistema atualiza estoque automaticamente
5. **Feedback**: Cliente pode dar feedback da venda

### **Fluxo de Totem (Autoatendimento):**
1. **Produtos**: GET /api/totem/produtos - lista produtos
2. **Consulta**: GET /api/totem/produtos/{codigo} - consulta preço
3. **Venda**: POST /api/totem/vendas - registra venda
4. **Feedback**: POST /api/totem/feedbacks - registra avaliação

---

## 🛡️ **10. SEGURANÇA E PERMISSÕES**

### **Perfis de Usuário:**
- **ADMIN**: Acesso total (CRUD completo, relatórios, usuários)
- **USER**: Acesso limitado (visualizar, criar vendas, alguns relatórios)

### **URLs Públicas (sem autenticação):**
- `/api/auth/login` - Login
- `/api/consulta/**` - Consulta de produtos
- `/api/totem/**` - Totem de autoatendimento
- `/api/clientes/cpf/**` - Busca cliente por CPF
- `/api/fornecedores/cnpj/**` - Busca fornecedor por CNPJ

### **URLs Protegidas:**
- Todas as outras precisam de token JWT válido
- Algumas operações são exclusivas de ADMIN (DELETE, criar usuários, etc)

---

## 📊 **11. FUNCIONALIDADES DE RELATÓRIO**

### **Relatórios de Venda:**
- Vendas por período
- Faturamento mensal/anual
- Produtos mais vendidos
- Vendas por forma de pagamento

### **Relatórios de Cliente:**
- Clientes cadastrados por período
- Histórico de acessos (LGPD)

### **Relatórios de Feedback:**
- Média de avaliações
- Feedbacks por tipo
- Distribuição de notas

---

## 🔍 **12. CARACTERÍSTICAS TÉCNICAS**

### **Padrões Utilizados:**
- **MVC** (Model-View-Controller)
- **DTO** (Data Transfer Object)
- **Repository Pattern**
- **Dependency Injection**
- **RESTful API**

### **Validações:**
- **Bean Validation** (@NotBlank, @Email, @Pattern)
- **Formatação automática** (CPF, CNPJ, telefone)
- **Soft Delete** (não apaga fisicamente os dados)

### **Auditoria:**
- **Timestamps automáticos** (criação/atualização)
- **Histórico de acessos** (LGPD compliance)
- **Logs detalhados** para debug

---

## 🚀 **Como Usar o Sistema**

### **1. Executar a Aplicação:**
```bash
# A aplicação roda na porta 8080
# Banco MySQL deve estar rodando na porta 3306
# Usuário padrão: admin / admin123
```

### **2. Fazer Login:**
```bash
POST http://localhost:8080/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### **3. Usar Token nas Requisições:**
```bash
Authorization: Bearer <token_recebido>
```

### **4. Testar Endpoints:**
```bash
# Listar produtos
GET http://localhost:8080/api/produtos

# Cadastrar cliente
POST http://localhost:8080/api/clientes
{
  "nomeCompleto": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999"
}
```

Este sistema oferece uma solução completa para gerenciamento de mercado com funcionalidades modernas, segurança robusta e APIs bem estruturadas para integração com diferentes tipos de clientes (web, mobile, totems).
