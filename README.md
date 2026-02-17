# Frontend — Orders Control (Angular 21)

Frontend do CRUD baseado na **planilha de controle**, com:
- Login fake (por enquanto) + token em memória
- Listagem de pedidos (`/orders`)
- Create / Update (PATCH) / Delete
- Validações (Receita / Estadual) exibidas como: ✅ ok / ➖ pendente / ❌ problema
- Tema claro/escuro

> Backend já existe e expõe `/api/*`. Este README foca **apenas no front**.

---

## Requisitos

- Node.js LTS
- Angular CLI **21.1.4**
- Backend rodando em `http://localhost:3000`

---

## Como rodar

Instale dependências:

```bash
npm install

## Run script
ng serve --proxy-config proxy.conf.json
