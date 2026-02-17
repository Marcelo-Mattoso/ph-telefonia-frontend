export type ValidationState = 'ok' | 'pending' | 'problem';

export type OrderRow = {
  id: string;

  data: string;            // YYYY-MM-DD
  mes: string;             // ex: "2026-02" ou "Fev/2026"
  consultor: string;

  cpf: string;
  razaoSocial: string;
  cnpj: string;

  novoOuBase: 'NOVO' | 'BASE';
  produtoVendendo: string;
  operadora: string;

  portabilidade: boolean;
  numeroPortado?: string;
  numeroAPortar?: string;

  statusProcesso: string;
  planoUtilizado: string;

  // validações automáticas (front por enquanto)
  receita: ValidationState;
  estadual: ValidationState;

  // exclusão lógica
  isDeleted: boolean;
  updatedAt: string;
};
