# Core Module

Estrutura organizada do módulo core com separação por responsabilidade.

## 📁 Estrutura de Pastas

```
core/
├── services/           # Serviços da aplicação
│   ├── auth.service.ts
│   ├── crud.service.ts
│   ├── order.service.ts
│   ├── validation.service.ts
│   └── index.ts
├── models/             # Tipos e interfaces
│   ├── item.model.ts
│   ├── order.model.ts
│   └── index.ts
├── interceptors/       # Interceptadores HTTP
│   ├── auth-token.interceptor.ts
│   ├── http-error.interceptor.ts
│   └── index.ts
├── guards/             # Guards de rota
│   ├── auth.guard.ts
│   └── index.ts
├── errors/             # Tipos de erro
│   ├── api-error.ts
│   └── index.ts
└── index.ts           # Arquivo central de exportações
```

## 🔄 Como Importar

### Opção 1: Importar diretamente do índice raiz (recomendado)
```typescript
import { AuthService, authGuard, OrderRow } from '@/app/core';
```

### Opção 2: Importar da subpasta específica
```typescript
import { AuthService } from '@/app/core/services';
import { authGuard } from '@/app/core/guards';
import type { OrderRow } from '@/app/core/models';
```

### Opção 3: Importar diretamente do arquivo
```typescript
import { AuthService } from '@/app/core/services/auth.service';
```

## 📋 Descrição dos Módulos

### Services
- **AuthService**: Gerenciamento de autenticação e token
- **CrudService**: Operações CRUD locais em localStorage
- **OrderService**: Serviço de pedidos via API
- **ValidationService**: Validações de CNPJ e dados

### Models
- **CrudItem**: Tipo para itens do CRUD
- **OrderRow**: Tipo para linhas de pedidos
- **ValidationState**: Tipo para estados de validação

### Interceptors
- **authTokenInterceptor**: Adiciona token JWT às requisições
- **httpErrorInterceptor**: Trata erros HTTP globalmente

### Guards
- **authGuard**: Protege rotas que requerem autenticação

### Errors
- **ApiError**: Tipo para erros de API
