# Create Order - Documentação

## Visão Geral

O módulo de criação de orders foi desenvolvido com uma arquitetura modular e bem separada, seguindo os padrões do projeto. 

## Estrutura de Arquivos

```
src/app/
├── core/
│   ├── models/
│   │   └── create-order.model.ts        # Modelos e tipos
│   └── services/
│       └── create-order.service.ts      # Lógica de busca e operações
└── pages/
    └── create-order/
        ├── create-order.component.ts    # Componente principal
        ├── create-order.component.html  # Template
        └── create-order.component.css   # Estilos
```

## Como Funciona

### 1. **Fluxo de Criação de Order**

```
┌─────────────────────────────────────┐
│ Usuário na Lista de Orders          │
│ (CrudListComponent)                 │
└────────────┬────────────────────────┘
             │
             │ Clica em "Criar Order"
             ↓
┌─────────────────────────────────────┐
│ CreateOrderComponent                 │
│ - ETAPA 1: Campo CNPJ               │
│ - Usuário digita o CNPJ             │
└────────────┬────────────────────────┘
             │
             │ Clica em "Buscar CNPJ"
             ↓
┌─────────────────────────────────────┐
│ CreateOrderService.searchByCnpj()   │
│ - Faz requisição GET /api/orders/..│
│ - Se encontrar: retorna dados       │
│ - Se não: retorna vazio             │
└────────────┬────────────────────────┘
             │
        ┌────┴─────────┐
        │              │
      ENCONTROU       NÃO ENCONTROU
        │              │
        ↓              ↓
    ┌────────┐    ┌────────┐
    │PREENCH │    │VAZIO   │
    │IDOS    │    │MANUAL  │
    └────┬───┘    └────┬───┘
        │              │
        └──────┬───────┘
               │
               ↓
    ┌──────────────────────────┐
    │ ETAPA 2: Todos os campos  │
    │ - Usuário valida/ajusta   │
    │ - Clica em "Salvar Order" │
    └──────────────────────────┘
```

### 2. **Componente: CreateOrderComponent**

**Responsabilidades:**
- Gerenciar o estado do formulário
- Validar o CNPJ digitado
- Chamar o serviço para buscar dados
- Renderizar formulário progressivo
- Salvar a order criada
- Navegação

**Signals (Estado Reativo):**
```typescript
formState      // Estado atual (LOADING_CNPJ, READY, FILLED, ERROR)
formData       // Dados do formulário
cnpj           // Valor do campo CNPJ
showForm       // Mostrar/esconder resto do formulário
isSearching    // Indicação de busca em progresso
searchMessage  // Feedback da busca
saving         // Indicação de salvamento em progresso
formError      // Mensagens de erro
successMessage // Mensagens de sucesso
```

**Métodos Principais:**
```typescript
searchCnpj()           // Busca CNPJ e carrega dados
saveOrder()            // Salva a order criada
formatCnpj(value)      // Formata CNPJ: XX.XXX.XXX/XXXX-XX
updateFormData(...)    // Atualiza campos do formulário
cancel()               // Volta para a lista
```

### 3. **Serviço: CreateOrderService**

**Responsabilidades:**
- Comunicação com a API
- Busca de CNPJ
- Normalização de dados
- Criação de orders

**Métodos Públicos:**

#### `searchByCnpj(cnpj: string): Promise<CnpjSearchResult>`
Busca um CNPJ na base de dados.

**Parâmetros:**
- `cnpj` - String com CNPJ (pode ter formatação)

**Retorno:**
```typescript
{
  found: boolean,              // Se encontrou
  data?: Partial<CreateOrderFormData>,  // Dados (se encontrou)
  message?: string             // Mensagem de feedback
}
```

**Comportamento:**
- Valida se CNPJ tem 14 dígitos
- Faz GET para `/api/orders/search/{cnpj}`
- Se encontrar: retorna dados normalizados
- Se não encontrar: retorna objeto vazio pronto para preenchimento
- Se der erro 404: retorna vazio (CNPJ não existe)
- Outros erros: retorna mensagem de erro

#### `create(data: CreateOrderFormData): Promise<OrderRow>`
Cria uma nova order.

**Parâmetros:**
- `data` - Dados completos da order

### 4. **Modelo: create-order.model.ts**

```typescript
// Tipo que representa os dados do formulário
type CreateOrderFormData = Omit<OrderRow, 'id' | 'updatedAt' | 'isDeleted'>

// Resposta da busca de CNPJ
type CnpjSearchResult = {
  found: boolean
  data?: Partial<CreateOrderFormData>
  message?: string
}

// Estados do formulário
enum FormState {
  LOADING_CNPJ = 'loading_cnpj',  // Buscando CNPJ
  READY = 'ready',                 // Pronto para preenchimento
  FILLED = 'filled',               // Preenchido com dados da busca
  ERROR = 'error'                  // Erro na operação
}
```

## Campos do Formulário

### Etapa 1 - Busca CNPJ
- **CNPJ** (obrigatório) - Campo de entrada com auto-formatação

### Etapa 2 - Detalhes da Order
- **CNPJ** (readonly) - Mostra o CNPJ buscado
- **Razão Social*** - Nome da empresa
- **CPF** - CPF da pessoa responsável
- **Data** - Data da order
- **Mês** - Mês de referência (ex: Fev/2026)
- **Consultor** - Nome do consultor responsável
- **Novo ou Base** - Seletor (NOVO/BASE)
- **Produto Vendendo** - Qual produto está sendo vendido
- **Operadora** - Qual operadora
- **Status do Processo** - Status atual
- **Plano Utilizado** - Qual plano foi utilizado
- **Portabilidade** - Checkbox (mostra campos adicionais se ativo)
  - **Número Portado** - Número já portado
  - **Número a Portar** - Número que será portado
- **Validações** (read-only)
  - **Receita** - Badge com status (ok/pending/problem)
  - **Estadual** - Badge com status (ok/pending/problem)

## Endpoint Esperado do Backend

### Buscar CNPJ
```
GET /api/orders/search/{cnpj}

Resposta (200):
{
  "data": {
    "id": "...",
    "cnpj": "11.222.333/0001-81",
    "razaoSocial": "Empresa XYZ",
    "cpf": "123.456.789-00",
    ...
  }
}

Resposta (404):
{
  "error": "CNPJ not found"
}
```

### Criar Order
```
POST /api/orders

Body:
{
  "data": "2026-02-17",
  "mes": "02/2026",
  "consultor": "João Silva",
  "cpf": "123.456.789-00",
  "razaoSocial": "Empresa XYZ",
  "cnpj": "11.222.333/0001-81",
  ...
}

Resposta (201):
{
  "id": "... gerado pelo backend",
  "data": "2026-02-17",
  ...
}
```

## Como Usar

### 1. Acessar o Formulário
Na página de listagem de orders, clique no botão **"Criar Order"**

### 2. Buscar CNPJ
- Digite ou cole um CNPJ no campo
- O sistema auto-formata: `XX.XXX.XXX/XXXX-XX`
- Clique em "Buscar CNPJ"

### 3. Resultados Possíveis

**CNPJ Encontrado:**
- ✅ Mensagem: "CNPJ encontrado! Dados carregados."
- ✅ Os campos do formulário são preenchidos automaticamente
- ℹ️ Você pode revisar e ajustar os dados

**CNPJ Não Encontrado:**
- ℹ️ Mensagem: "CNPJ não encontrado. Preencha os dados manualmente."
- ℹ️ O formulário aparece vazio, pronto para preenchimento
- 📝 Preencha todos os dados necessários

### 4. Preencher/Validar Dados
- Revise todos os campos
- Para portabilidade, marque o checkbox para exibir os campos adicionais
- Clique em "Salvar Order"

### 5. Confirmação
- ✅ Se salvo com sucesso: será redirecionado para a lista em 2 segundos
- ❌ Se houver erro: mensagem aparecerá no topo do formulário

## Validações

### Cliente
- CNPJ: obrigatório e com 14 dígitos
- Razão Social: obrigatório após busca

### Servidor
- Validações adicionais devem estar implementadas no backend
- Validações automáticas: receita e estadual (badges)

## Estilos

O componente utiliza estilos responsivos:
- Desktop (> 768px): Layout padrão
- Mobile (≤ 768px): Botões em coluna cheia

Paleta de cores:
- Primário: #007bff (azul)
- Erro: #f8d7da (vermelho claro)
- Sucesso: #d4edda (verde claro)
- Informação: #d1ecf1 (azul claro)

## Rotas

```typescript
// Na lista de orders
GET / (com guard de autenticação)

// Para criar order
GET /create-order (com guard de autenticação)
```

## Integração com Guarda de Autenticação

Ambas as rotas estão protegidas pelo `authGuard`, garantindo que apenas usuários autenticados possam acessar.

## Tratamento de Erros

- **CNPJ inválido**: Mensagem de validação
- **CNPJ não encontrado**: Formulário vazio para preenchimento manual
- **Erro na busca**: Mensagem de erro específica
- **Erro ao salvar**: Mensagem de erro com detalhes

## Integração com Componentes Existentes

- **ShellComponent**: Container com navegação
- **ValidationBadgeComponent**: Badges de status (receita/estadual)

## Próximas Melhorias (Sugestões)

1. **Autocomplete de campos**: Ao digitar uma parte do nome, sugerir options
2. **Histórico de buscas**: Guardar últimos CNPJs buscados
3. **Importação em lote**: Carregar múltiplas orders via arquivo
4. **Cópia de order anterior**: Permitir duplicar uma order existente
5. **Validação extra**: Verificar se CPF/CNPJ são válidos (dígito verificador)
6. **Busca avançada**: Buscar por razão social, consultor, etc.
